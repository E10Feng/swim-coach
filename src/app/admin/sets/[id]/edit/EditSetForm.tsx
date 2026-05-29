'use client'

import { useActionState } from 'react'
import { updateSet } from './actions'
import type { SwimSet, Stroke, EnergySystem, SetPoolFormat } from '@/lib/types/database'

const STROKES: Stroke[] = ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'IM', 'mixed']
const ENERGY_SYSTEMS: EnergySystem[] = ['aerobic', 'threshold', 'anaerobic', 'speed']
const POOL_FORMATS: SetPoolFormat[] = ['yards', 'meters', 'both']

interface EditSetFormProps {
  set: SwimSet
}

export default function EditSetForm({ set }: EditSetFormProps) {
  const [error, formAction, isPending] = useActionState(updateSet, null)

  return (
    <form action={formAction} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <input type="hidden" name="id" value={set.id} />

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stroke</label>
          <select name="stroke" defaultValue={set.stroke} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STROKES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Energy System</label>
          <select name="energy_system" defaultValue={set.energy_system} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {ENERGY_SYSTEMS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty (1–5)</label>
          <input type="number" name="difficulty" min={1} max={5} defaultValue={set.difficulty} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
          <input type="number" name="estimated_duration_min" min={1} defaultValue={set.estimated_duration_min} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (yards)</label>
          <input type="number" name="estimated_distance_yards" min={1} defaultValue={set.estimated_distance_yards} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pool Format</label>
          <select name="pool_format" defaultValue={set.pool_format} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {POOL_FORMATS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
          <select name="is_active" defaultValue={String(set.is_active)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Technique Tags <span className="text-gray-400">(comma-separated)</span>
        </label>
        <input type="text" name="technique_tags" defaultValue={(set.technique_tags ?? []).join(', ')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Set Text <span className="text-red-500">*</span>
        </label>
        <textarea name="set_text" rows={6} required defaultValue={set.set_text} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Coach Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea name="coach_notes" rows={3} defaultValue={set.coach_notes ?? ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors">
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900 flex items-center">Cancel</a>
      </div>
    </form>
  )
}
