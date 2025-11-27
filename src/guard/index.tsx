import { ReactNode } from 'react'
import AuthGuard from 'src/guard/AuthGuard'
import GuestGuard from 'src/guard/GuestGuard'
import NoGuard from 'src/guard/NoGuard'
import FallbackSpinner from 'src/components/fall-back'

type GuardProps = {
  authGuard?: boolean
  guestGuard?: boolean
  children: ReactNode
}

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <GuestGuard fallback={<FallbackSpinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <NoGuard fallback={<FallbackSpinner />}>{children}</NoGuard>
  } else {
    return <AuthGuard fallback={<FallbackSpinner />}>{children}</AuthGuard>
  }
}

export default Guard
