'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  PlusIcon, 
  ListBulletIcon, 
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, userProfile, signOut } = useAuth()
  const isTrainer = userProfile?.role === 'trainer'
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Erfolgreich abgemeldet')
    } catch (error) {
      toast.error('Fehler beim Abmelden')
    }
  }

  // MVP: Focus on Trainer Flow - simplified navigation
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: pathname === '/dashboard' },
    ...(isTrainer ? [
      { name: 'Situation erstellen', href: '/situations/create', icon: PlusIcon, current: pathname === '/situations/create' },
      { name: 'Situationen verwalten', href: '/situations', icon: ListBulletIcon, current: pathname === '/situations' },
    ] : [
      { name: 'Quiz spielen', href: '/quiz', icon: ListBulletIcon, current: pathname === '/quiz' },
    ]),
    { name: 'Statistiken', href: '/stats', icon: ChartBarIcon, current: pathname === '/stats' },
    { name: 'Team', href: '/team', icon: UserGroupIcon, current: pathname === '/team' },
  ]

  return (
    <>
      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <span className="text-2xl">🏐</span>
              <span className="ml-2 text-lg font-semibold text-gray-900">Volleyball Quiz</span>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-orange-100 border-orange-500 text-orange-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } group flex items-center pl-3 pr-4 py-2 border-l-4 text-sm font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {userProfile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">
                  {userProfile?.display_name || user?.email}
                </div>
                <div className="text-xs text-gray-500">
                  {userProfile?.role === 'trainer' ? 'Trainer' : 'Spieler'}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
            <span className="text-2xl">🏐</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">Volleyball Quiz</span>
          </div>
          
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-orange-100 border-r-2 border-orange-500 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Desktop User Profile */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {userProfile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium text-gray-700">
                    {userProfile?.display_name || user?.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {userProfile?.role === 'trainer' ? 'Trainer' : 'Spieler'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="mt-3 w-full flex items-center px-2 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-2 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl">🏐</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">Volleyball Quiz</span>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </>
  )
}

export default Navigation
