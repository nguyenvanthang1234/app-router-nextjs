'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 100,
  minimum: 0.08,
  easing: 'ease',
  speed: 500
})

export function useNProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Start progress when route changes
    NProgress.start()
    
    // Complete when navigation done
    const handleComplete = () => NProgress.done()
    
    // Complete after component mounts
    handleComplete()

    return () => {
      NProgress.done()
    }
  }, [pathname, searchParams])
}
