import { Suspense } from 'react'
import GenerateForm from './GenerateForm'

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Generate Today&apos;s Set</h1>
      <p className="mb-6 text-sm text-gray-500">
        Tell Coach Alex what you need for today&apos;s workout.
      </p>
      <Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
        <GenerateForm />
      </Suspense>
    </main>
  )
}
