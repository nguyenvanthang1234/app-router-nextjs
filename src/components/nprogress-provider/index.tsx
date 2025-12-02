'use client'

import { Suspense } from 'react'
import { useNProgress } from 'src/hooks/useNProgress'

function NProgressHandler() {
  useNProgress()
  return null
}

export default function NProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <NProgressHandler />
      </Suspense>
      {children}
    </>
  )
}
