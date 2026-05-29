'use client'

import { useSearchParams } from 'next/navigation'
import { generateSetAction } from './actions'

export default function GenerateForm() {
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error')

  return (
    <>
      {errorMsg && (
        <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
          {errorMsg}
        </div>
      )}

      <form action={generateSetAction} className="space-y-5">
        <div>
          <label htmlFor="duration_min" className="block text-sm font-medium mb-1">
            Session length (minutes)
          </label>
          <input
            id="duration_min"
            name="duration_min"
            type="number"
            min={15}
            max={120}
            step={5}
            defaultValue={searchParams.get('duration_min') ?? '45'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="energy_level" className="block text-sm font-medium mb-1">
            How do you feel today?
          </label>
          <select
            id="energy_level"
            name="energy_level"
            defaultValue={searchParams.get('energy_level') ?? 'moderate'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">Easy — recovery day</option>
            <option value="moderate">Moderate — normal effort</option>
            <option value="hard">Hard — push it</option>
          </select>
        </div>

        <div>
          <label htmlFor="focus_stroke" className="block text-sm font-medium mb-1">
            Focus stroke <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            id="focus_stroke"
            name="focus_stroke"
            defaultValue={searchParams.get('focus_stroke') ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No preference</option>
            <option value="freestyle">Freestyle</option>
            <option value="backstroke">Backstroke</option>
            <option value="breaststroke">Breaststroke</option>
            <option value="butterfly">Butterfly</option>
            <option value="IM">IM</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div>
          <label htmlFor="energy_system" className="block text-sm font-medium mb-1">
            Training focus <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            id="energy_system"
            name="energy_system"
            defaultValue={searchParams.get('energy_system') ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Let Coach Alex decide</option>
            <option value="aerobic">Aerobic — steady base</option>
            <option value="threshold">Threshold — race pace</option>
            <option value="anaerobic">Anaerobic — high intensity</option>
            <option value="speed">Speed — sprints</option>
          </select>
        </div>

        <div>
          <label htmlFor="technique_focus" className="block text-sm font-medium mb-1">
            Technique focus <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="technique_focus"
            name="technique_focus"
            type="text"
            placeholder="e.g. catch, flip turns, breathing"
            defaultValue={searchParams.get('technique_focus') ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="free_text" className="block text-sm font-medium mb-1">
            Anything else? <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="free_text"
            name="free_text"
            rows={3}
            placeholder="e.g. my shoulder is a bit sore, want something fun"
            defaultValue={searchParams.get('free_text') ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Generate My Set
        </button>
      </form>
    </>
  )
}
