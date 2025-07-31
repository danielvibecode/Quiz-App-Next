'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-500">
          <span className="text-white text-2xl font-bold">🏐</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Volleyball Quiz App
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Interaktive Volleyball-Trainings-Quiz-Anwendung für Teams und Trainer
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="w-full flex justify-center py-2 px-4 border border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Registrieren
            </Link>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Features</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="mr-2">🏐</span>
                <span>Interaktive Volleyball-Quiz-Situationen</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">👥</span>
                <span>Team-Management für Trainer und Spieler</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📊</span>
                <span>Fortschritts-Tracking und Statistiken</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🎯</span>
                <span>Personalisierte Lernziele</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
