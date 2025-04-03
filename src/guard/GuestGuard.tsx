"use client"

// ** Next
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'

// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Config
import { ACCESS_TOKEN, USER_DATA } from 'src/configs/auth'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

interface GuestGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const GuestGuard = (props: GuestGuardProps) => {
  const { children, fallback } = props

  // ** router
  const router = useRouter()
  // ** auth
  const authContext = useAuth()
  const pathName = usePathname()

  useEffect(() => {
 
    if (window.localStorage.getItem(ACCESS_TOKEN) && window.localStorage.getItem(USER_DATA)) {
      router.replace('/')
    }
  }, [pathName])

  if (authContext.loading || (!authContext.loading && authContext.user !== null)) {
    return fallback
  }

  return <>{children}</>
}

export default GuestGuard
