'use client'

import React, { useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthContext, UserProfile, AuthContextType } from '@/lib/auth'
import { Tables } from '@/types/database'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener...')
    setLoading(true)
    
    let initialAuthHandled = false
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', { 
          event, 
          sessionExists: !!session, 
          userId: session?.user?.id 
        })
        
        // Handle initial auth state
        if (!initialAuthHandled) {
          initialAuthHandled = true
          console.log('AuthProvider: Handling initial auth state...')
          
          setUser(session?.user ?? null)
          
          if (session?.user) {
            console.log('AuthProvider: User found in initial state, fetching profile...')
            await fetchUserProfile(session.user.id)
          } else {
            console.log('AuthProvider: No user in initial state')
            setUserProfile(null)
          }
          
          setLoading(false)
          console.log('AuthProvider: Initial setup complete')
          return
        }
        
        // Handle subsequent auth state changes
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('AuthProvider: User signed in, fetching profile...')
          await fetchUserProfile(session.user.id)
        } else {
          console.log('AuthProvider: User signed out')
          setUserProfile(null)
        }
      }
    )
    
    // Fallback: If auth state listener doesn't fire within 3 seconds
    const fallbackTimer = setTimeout(() => {
      if (!initialAuthHandled) {
        console.log('AuthProvider: Auth state listener timeout, assuming no session')
        initialAuthHandled = true
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    }, 3000)
    
    return () => {
      console.log('AuthProvider: Cleaning up auth listener')
      clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string): Promise<void> => {
    try {
      console.log('Fetching user profile for userId:', userId)
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('user_profiles')
        .select(`
          *,
          teams (
            id,
            name,
            invite_code
          )
        `)
        .eq('id', userId)
        .single()
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      )
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise])
      console.log('User profile query result:', { data, error })

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user profile doesn't exist
          console.warn('User profile not found for user:', userId)
          console.log('Attempting to create missing user profile...')
          
          // Try to create a basic user profile
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          if (currentUser) {
            const displayName = currentUser.email?.split('@')[0] || 'User'
            
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                id: userId,
                role: 'trainer',
                display_name: displayName
              })
              .select(`
                *,
                teams (
                  id,
                  name,
                  invite_code
                )
              `)
              .single()
            
            if (createError) {
              console.error('Failed to create user profile:', createError)
              await supabase.auth.signOut()
              setUser(null)
              setUserProfile(null)
              return
            }
            
            console.log('Successfully created user profile:', newProfile)
            setUserProfile(newProfile)
            return
          }
        } else {
          console.error('Database error fetching user profile:', {
            code: error.code,
            message: error.message,
          })
          setError(`Failed to load user profile: ${error.message}`)
          return
        }
      }

      setUserProfile(data)
      setError(null)
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    }
  }

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'trainer' | 'player'
  ): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: role,
          }
        }
      })
      
      if (error) throw error
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setUserProfile(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const joinTeam = async (inviteCode: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      if (!user) throw new Error('Must be logged in to join a team')
      
      // Find team by invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('invite_code', inviteCode)
        .single()
      
      if (teamError || !team) {
        throw new Error('Invalid invite code')
      }
      
      // Update user profile with team
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          team_id: team.id,
          role: 'player' // Players join teams
        })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      
      // Refresh user profile
      await fetchUserProfile(user.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join team'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (teamName: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      if (!user) throw new Error('Must be logged in to create a team')
      
      // Generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          invite_code: inviteCode,
          created_by: user.id
        })
        .select()
        .single()
      
      if (teamError) throw teamError
      
      // Update user profile with team and trainer role
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          team_id: team.id,
          role: 'trainer'
        })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      
      // Refresh user profile
      await fetchUserProfile(user.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create team'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    joinTeam,
    createTeam,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
