import { createAdminClient } from '@/lib/supabase/admin'
import type { SwimSet } from '@/lib/types/database'
import { toggleSetActive } from './sets/actions'

export default async function AdminSetsPage() {
  const supabase = createAdminClient()
  const { data: sets, error } = await supabase
    .from('sets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div>
        <p className="text-red-600">Failed to load sets: {error.message}</p>
      </div>
    )
  }

  const rows = (sets ?? []) as SwimSet[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Swim Sets</h1>
        <a
          href="/admin/sets/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Set
        </a>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-500">No sets yet. Add your first one.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Stroke', 'Energy', 'Diff', 'Min', 'Yards', 'Pool', 'Active', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((set) => (
                <tr key={set.id} className={set.is_active ? '' : 'opacity-50'}>
                  <td className="px-4 py-3 font-medium text-gray-900">{set.stroke}</td>
                  <td className="px-4 py-3 text-gray-700">{set.energy_system}</td>
                  <td className="px-4 py-3 text-gray-700">{set.difficulty}</td>
                  <td className="px-4 py-3 text-gray-700">{set.estimated_duration_min}</td>
                  <td className="px-4 py-3 text-gray-700">{set.estimated_distance_yards}</td>
                  <td className="px-4 py-3 text-gray-700">{set.pool_format}</td>
                  <td className="px-4 py-3">
                    <form action={toggleSetActive}>
                      <input type="hidden" name="id" value={set.id} />
                      <input type="hidden" name="is_active" value={String(!set.is_active)} />
                      <button
                        type="submit"
                        className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                          set.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {set.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/admin/sets/${set.id}/edit`} className="text-blue-600 hover:underline text-xs">
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
