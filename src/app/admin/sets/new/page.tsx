'use client'

import { useActionState } from 'react'
import { createSet } from './actions'
import type { Stroke, EnergySystem, SetPoolFormat } from '@/lib/types/database'

const STROKES: Stroke[] = ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'IM', 'mixed']
const ENERGY_SYSTEMS: EnergySystem[] = ['aerobic', 'threshold', 'anaerobic', 'speed']
const POOL_FORMATS: SetPoolFormat[] = ['yards', 'meters', 'both']

export default function NewSetPage() {
  const [error, formAction, isPending] = useActionState(createSet, null)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900">
          ← Sets
        </a>
        <h1 className="text-2xl font-bold text-gray-900">New Set</h1>
      </div>

      <form action={formAction} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stroke</label>
            <select name="stroke" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select…</option>
              {STROKES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Energy System</label>
            <select name="energy_system" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select…</option>
              {ENERGY_SYSTEMS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty (1–5)</label>
            <input type="number" name="difficulty" min={1} max={5} defaultValue={3} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
            <input type="number" name="estimated_duration_min" min={1} defaultValue={45} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (yards)</label>
            <input type="number" name="estimated_distance_yards" min={1} defaultValue={2500} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pool Format</label>
            <select name="pool_format" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select…</option>
              {POOL_FORMATS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <select name="is_active" defaultValue="true" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technique Tags <span className="text-gray-400">(comma-separated)</span>
          </label>
          <input type="text" name="technique_tags" placeholder="catch, rotation, bilateral" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Set Text <span className="text-red-500">*</span>
          </label>
          <textarea name="set_text" rows={6} required placeholder="e.g. 10x100 on 1:30 freestyle @ aerobic pace" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coach Notes <span className="text-gray-400">(optional)</span>
          </label>
          <textarea name="coach_notes" rows={3} placeholder="Internal notes for AI context…" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors">
            {isPending ? 'Saving…' : 'Create Set'}
          </button>
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900 flex items-center">Cancel</a>
        </div>
      </form>
    </div>
  )
}
