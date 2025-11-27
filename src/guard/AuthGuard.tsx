'use client'

// ** Next Imports
import { usePathname, useRouter } from 'next/navigation'

// ** React Imports
import { ReactNode, ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18nConfig from 'src/app/i18nConfig'

// ** config
import { ACCESS_TOKEN, USER_DATA } from 'src/configs/auth'

// ** helpers
import { clearLocalUserData, clearTemporaryToken, getTemporaryToken } from 'src/helpers/storage'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'
import { createUrlQuery } from 'src/utils'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  // ** Props
  const { children, fallback } = props
  // ** State
  const [showFallback, setShowFallback] = useState(true)
  // ** auth
  const authContext = useAuth()

  // ** router
  const router = useRouter()
  const pathName = usePathname()
  const { i18n } = useTranslation()
  const currentLang = i18n.language
  const urlDefault = currentLang === i18nConfig.defaultLocale ? '/' : `/${currentLang}`
  const urlLogin = currentLang === i18nConfig.defaultLocale ? '/login' : `/${currentLang}/login`

  useEffect(() => {
    const { temporaryToken } = getTemporaryToken()

    if (
      authContext.user === null &&
      !window.localStorage.getItem(ACCESS_TOKEN) &&
      !window.localStorage.getItem(USER_DATA) &&
      !temporaryToken
    ) {
      if (pathName !== urlDefault && pathName !== urlLogin) {
        router.replace('/login' + '?' + createUrlQuery('returnUrl', pathName))
      } else {
        router.replace('/login')
      }
      authContext.setUser(null)
      clearLocalUserData()
    }
  }, [pathName])

  useEffect(() => {
    const handleUnload = () => {
      clearTemporaryToken()
    }
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      window.addEventListener('beforeunload', handleUnload)
    }
  }, [])

  useEffect(() => {
    // Chỉ hiển thị fallback trong lần đầu load
    if (!authContext.loading && authContext.user !== null) {
      setShowFallback(false)
    }
  }, [authContext.loading, authContext.user])

  if (authContext.loading) {
    return fallback
  }

  if (authContext.user === null && showFallback) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
