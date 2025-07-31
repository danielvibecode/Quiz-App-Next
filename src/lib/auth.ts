import { createContext, useContext } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { Tables } from '@/types/database'

export type UserProfile = Tables<'user_profiles'> & {
  teams?: {
    id: string
    name: string
    invite_code: string
  } | null
}

export interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, role: 'trainer' | 'player') => Promise<void>
  signOut: () => Promise<void>
  joinTeam: (inviteCode: string) => Promise<void>
  createTeam: (teamName: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
