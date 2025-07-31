'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  PlusIcon, 
  ListBulletIcon, 
  ChartBarIcon,
  PlayIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/database'

interface DashboardStats {
  totalSituations: number
  completedQuizzes: number
  correctAnswers: number
  accuracy: number
}

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [situations, setSituations] = useState<Tables<'situations'>[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalSituations: 0,
    completedQuizzes: 0,
    correctAnswers: 0,
    accuracy: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isTrainer = userProfile?.role === 'trainer'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && userProfile) {
      fetchSituations()
    }
  }, [user, userProfile, authLoading, router])

  const fetchSituations = async () => {
    try {
      setLoading(true)
      
      let query = supabase.from('situations').select('*')
      
      // Filter based on role and team
      if (isTrainer) {
        // Trainers see their own situations and team situations
        if (userProfile?.team_id) {
          query = query.or(`created_by.eq.${user?.id},team_id.eq.${userProfile.team_id}`)
        } else {
          query = query.eq('created_by', user?.id || '')
        }
      } else {
        // Players see team situations
        if (userProfile?.team_id) {
          query = query.eq('team_id', userProfile.team_id)
        }
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching situations:', error)
        return
      }
      
      setSituations(data || [])
      
      // Calculate stats
      const totalSituations = data?.length || 0
      
      // TODO: Fetch user answers for more detailed stats
      setStats({
        totalSituations,
        completedQuizzes: 0, // Will be calculated from user_answers
        correctAnswers: 0,   // Will be calculated from user_answers
        accuracy: 0          // Will be calculated from user_answers
      })
      
    } catch (error) {
      console.error('Error in fetchSituations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold">
              Willkommen, {userProfile.display_name}! 🏐
            </h1>
            <p className="mt-2 text-primary-100">
              {isTrainer 
                ? 'Erstelle neue Quiz-Situationen und verfolge den Fortschritt deines Teams.'
                : 'Teste dein Volleyball-Wissen mit den Quiz-Situationen deines Trainers.'
              }
            </p>
            {userProfile.teams && (
              <p className="mt-1 text-sm text-primary-200">
                Team: {userProfile.teams.name}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-primary-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Situationen</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalSituations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PlayIcon className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Bearbeitet</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completedQuizzes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Richtige Antworten</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.correctAnswers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Genauigkeit</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.accuracy}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isTrainer ? (
              <>
                <Link
                  href="/situations/create"
                  className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <PlusIcon className="h-8 w-8 text-primary-500 group-hover:text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                        Neue Situation erstellen
                      </h3>
                      <p className="text-sm text-gray-500">
                        Lade ein Volleyball-Bild hoch und erstelle eine Quiz-Frage
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/situations/manage"
                  className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ListBulletIcon className="h-8 w-8 text-blue-500 group-hover:text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                        Situationen verwalten
                      </h3>
                      <p className="text-sm text-gray-500">
                        Bearbeite oder lösche bestehende Quiz-Situationen
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/stats"
                  className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-green-500 group-hover:text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
                        Team-Statistiken
                      </h3>
                      <p className="text-sm text-gray-500">
                        Verfolge den Fortschritt deines Teams
                      </p>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/quiz"
                  className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <PlayIcon className="h-8 w-8 text-primary-500 group-hover:text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                        Quiz starten
                      </h3>
                      <p className="text-sm text-gray-500">
                        Teste dein Volleyball-Wissen
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/my-progress"
                  className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-blue-500 group-hover:text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                        Mein Fortschritt
                      </h3>
                      <p className="text-sm text-gray-500">
                        Verfolge deine Leistung und Statistiken
                      </p>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Recent Situations Preview */}
          {situations.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {isTrainer ? 'Neueste Situationen' : 'Verfügbare Quiz-Situationen'}
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {situations.slice(0, 6).map((situation) => (
                    <div key={situation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-gray-900 truncate">{situation.question}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{situation.explanation}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {situation.volleyball_category || 'Allgemein'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {situation.difficulty_level || 'Mittel'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {situations.length > 6 && (
                  <div className="mt-4 text-center">
                    <Link
                      href={isTrainer ? "/situations/manage" : "/quiz"}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      Alle anzeigen ({situations.length} gesamt)
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
