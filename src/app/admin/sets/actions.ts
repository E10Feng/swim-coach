'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function toggleSetActive(formData: FormData): Promise<void> {
  const id = formData.get('id')
  const isActive = formData.get('is_active') === 'true'

  if (typeof id !== 'string' || !id) {
    return
  }

  const supabase = createAdminClient()
  await supabase
    .from('sets')
    .update({ is_active: isActive })
    .eq('id', id)

  revalidatePath('/admin')
}
