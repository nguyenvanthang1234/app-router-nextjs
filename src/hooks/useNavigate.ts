'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import NProgress from 'nprogress'

/**
 * Custom hook for navigation with loading feedback
 * Solves the issue of delay and needing to click twice
 */
export function useNavigate() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  const push = useCallback(
    (href: string) => {
      // Start loading indicator
      NProgress.start()
      setIsNavigating(true)

      // Use transition for smoother navigation
      startTransition(() => {
        router.push(href)
        
        // Complete after a short delay to ensure navigation started
        setTimeout(() => {
          NProgress.done()
          setIsNavigating(false)
        }, 300)
      })
    },
    [router]
  )

  const replace = useCallback(
    (href: string) => {
      NProgress.start()
      setIsNavigating(true)

      startTransition(() => {
        router.replace(href)
        
        setTimeout(() => {
          NProgress.done()
          setIsNavigating(false)
        }, 300)
      })
    },
    [router]
  )

  return {
    push,
    replace,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
    prefetch: router.prefetch,
    isNavigating: isPending || isNavigating
  }
}
