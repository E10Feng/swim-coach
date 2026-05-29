import { COACH_NAME } from '@/lib/coach'
import { createClient } from '@/lib/supabase/server'
import type { SessionInput, UserProfile } from '@/lib/types/database'
import { model } from './client'
import { executeSetsQuery, getSetsToolDeclaration, type GetSetsArgs } from './get-sets'

export interface GenerateSetResult {
  adapted_set_text: string
  coach_commentary: string
  base_set_id: string
}

function buildSystemPrompt(
  profile: UserProfile,
  sessionInput: SessionInput,
  recentBaseSetIds: string[]
): string {
  return `You are ${COACH_NAME}, an expert swim coach.

## Athlete Profile
- Experience level: ${profile.experience_level}
- Goal: ${profile.goal}
- Preferred strokes: ${profile.strokes.join(', ')}
- Typical session duration: ${profile.session_duration_min} min
- Pool format: ${profile.pool_format}
- Physical notes: ${profile.physical_notes ?? 'none'}

## Today's Session Request
- Duration: ${sessionInput.duration_min} minutes
- Energy level today: ${sessionInput.energy_level}
${sessionInput.focus_stroke ? `- Focus stroke: ${sessionInput.focus_stroke}` : ''}
${sessionInput.energy_system ? `- Desired energy system: ${sessionInput.energy_system}` : ''}
${sessionInput.technique_focus ? `- Technique focus: ${sessionInput.technique_focus}` : ''}
${sessionInput.free_text ? `- Athlete notes: ${sessionInput.free_text}` : ''}

## Instructions
1. Call the \`get_sets\` tool to find matching sets. Pass duration_min and duration_max within ±10 minutes of the requested duration.
2. From the results, pick the single best set for this athlete.
3. Adapt the set text for the athlete's level, limitations, and pool format.
4. Return ONLY a raw JSON object (no markdown fences):
{
  "adapted_set_text": "<full adapted set text>",
  "coach_commentary": "<1-3 sentences of coaching advice>"
}

${recentBaseSetIds.length > 0 ? `Sets recently given to this athlete (avoid repeating): ${recentBaseSetIds.join(', ')}` : ''}

Respond with the JSON object only. No extra text.`
}

export async function generateSet(
  profile: UserProfile,
  sessionInput: SessionInput,
  recentBaseSetIds: string[]
): Promise<GenerateSetResult> {
  const supabase = await createClient()
  const systemPrompt = buildSystemPrompt(profile, sessionInput, recentBaseSetIds)

  // First call — expect a function call
  const firstResponse = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
    tools: [{ functionDeclarations: [getSetsToolDeclaration] }],
  } as any)

  const functionCalls = firstResponse.response.functionCalls?.() ?? []
  if (functionCalls.length === 0) {
    throw new Error('No function call returned by Gemini')
  }

  const args = functionCalls[0].args as GetSetsArgs
  const sets = await executeSetsQuery(supabase, args, recentBaseSetIds)

  if (sets.length === 0) {
    throw new Error('No matching swim sets found in database')
  }

  const pickedSet = sets[0]

  // Second call — provide results, get final JSON
  const secondPrompt = `${systemPrompt}

The \`get_sets\` tool returned these sets:
${JSON.stringify(sets.slice(0, 5))}

Now pick the best one, adapt it, and return the JSON as instructed.`

  const secondResponse = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: secondPrompt }] }],
  } as any)

  const rawText = secondResponse.response.text()
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

  let parsed: { adapted_set_text: string; coach_commentary: string }
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Failed to parse Gemini JSON response: ${rawText}`)
  }

  if (!parsed.adapted_set_text || !parsed.coach_commentary) {
    throw new Error('Gemini response missing required fields')
  }

  return {
    adapted_set_text: parsed.adapted_set_text,
    coach_commentary: parsed.coach_commentary,
    base_set_id: pickedSet.id,
  }
}
