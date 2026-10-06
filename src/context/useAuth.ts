import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  /** True until Supabase has restored (or ruled out) a saved session */
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  /** Resolves to true when the user must confirm their email before a session exists */
  signUp: (email: string, password: string, redirectPath?: string) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** Current session and auth actions. Must be used inside <AuthProvider>. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
