import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SwimSet } from '@/lib/types/database'
import EditSetForm from './EditSetForm'

interface EditSetPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSetPage({ params }: EditSetPageProps) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const set = data as SwimSet

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900">
          ← Sets
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Edit Set</h1>
      </div>
      <EditSetForm set={set} />
    </div>
  )
}
