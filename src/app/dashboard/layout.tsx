'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <span className="text-2xl">🏐</span>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Volleyball Quiz
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                Dashboard
              </Link>
              
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-700">{userProfile.display_name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {userProfile.role}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}
