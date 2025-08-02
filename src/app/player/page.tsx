'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  PlayIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline'

interface PlayerStats {
  totalQuizzes: number
  correctAnswers: number
  accuracyPercentage: number
  averageResponseTime: number
  currentStreak: number
  bestCategory: string
  recentActivity: Array<{
    id: string
    created_at: string
    is_correct: boolean
    volleyball_category: string
    response_time: number
  }>
}

interface AvailableSituation {
  id: string
  question: string
  volleyball_category: string
  difficulty_level: string
  created_at: string
}

export default function PlayerDashboardPage() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [availableSituations, setAvailableSituations] = useState<AvailableSituation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && userProfile) {
      fetchPlayerData()
    }
  }, [user, userProfile])

  const fetchPlayerData = async () => {
    try {
      setLoading(true)
      
      // Fetch player stats
      await fetchPlayerStats()
      
      // Fetch available situations
      await fetchAvailableSituations()
      
    } catch (error) {
      console.error('Error fetching player data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayerStats = async () => {
    if (!user?.id) return

    const { data: results, error } = await supabase
      .from('quiz_results')
      .select(`
        *,
        situations!inner(
          volleyball_category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching stats:', error)
      return
    }

    if (!results || results.length === 0) {
      setStats({
        totalQuizzes: 0,
        correctAnswers: 0,
        accuracyPercentage: 0,
        averageResponseTime: 0,
        currentStreak: 0,
        bestCategory: '',
        recentActivity: []
      })
      return
    }

    const totalQuizzes = results.length
    const correctAnswers = results.filter(r => r.is_correct).length
    const accuracyPercentage = (correctAnswers / totalQuizzes) * 100
    const averageResponseTime = results.reduce((sum, r) => sum + (r.time_taken || 0), 0) / totalQuizzes

    // Calculate current streak
    let currentStreak = 0
    for (let i = 0; i < results.length; i++) {
      if (results[i].is_correct) {
        currentStreak++
      } else {
        break
      }
    }

    // Find best category
    const categoryStats: { [key: string]: { correct: number, total: number } } = {}
    results.forEach(result => {
      const category = result.situations?.volleyball_category || 'Unknown'
      if (!categoryStats[category]) {
        categoryStats[category] = { correct: 0, total: 0 }
      }
      categoryStats[category].total++
      if (result.is_correct) {
        categoryStats[category].correct++
      }
    })

    let bestCategory = ''
    let bestAccuracy = 0
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const accuracy = stats.correct / stats.total
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy
        bestCategory = category
      }
    })

    const recentActivity = results.slice(0, 5).map(result => ({
      id: result.id.toString(),
      created_at: result.created_at,
      is_correct: result.is_correct,
      volleyball_category: result.situations?.volleyball_category || 'Unknown',
      response_time: result.time_taken || 0
    }))

    setStats({
      totalQuizzes,
      correctAnswers,
      accuracyPercentage,
      averageResponseTime,
      currentStreak,
      bestCategory,
      recentActivity
    })
  }

  const fetchAvailableSituations = async () => {
    if (!userProfile?.team_id) return

    const { data: situations, error } = await supabase
      .from('situations')
      .select('id, question, volleyball_category, difficulty_level, created_at')
      .eq('team_id', userProfile.team_id)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching situations:', error)
      return
    }

    setAvailableSituations((situations || []).map(s => ({
      ...s,
      id: s.id.toString(),
      volleyball_category: s.volleyball_category || 'Unknown',
      difficulty_level: s.difficulty_level || 'Medium',
      created_at: s.created_at || new Date().toISOString()
    })))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'anfaenger': return 'bg-green-100 text-green-800'
      case 'fortgeschritten': return 'bg-yellow-100 text-yellow-800'
      case 'profi': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Guten Morgen'
    if (hour < 18) return 'Guten Tag'
    return 'Guten Abend'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {userProfile?.display_name || 'Spieler'}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Bereit für dein nächstes Volleyball-Quiz?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/quiz"
            className="group relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayIcon className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Quiz starten</h3>
                <p className="text-blue-100">Wähle eine Situation und spiele!</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <PlayIcon className="h-6 w-6" />
              </div>
            </div>
          </Link>

          <Link
            href="/quiz/results"
            className="group relative bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Meine Ergebnisse</h3>
                <p className="text-gray-600">Sieh deine Performance an</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <div className="bg-gray-100 rounded-full p-2">
                <ChartBarIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        {stats && stats.totalQuizzes > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Deine Statistiken</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrophyIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Gesamt Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Genauigkeit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.accuracyPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ø Reaktionszeit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageResponseTime.toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FireIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aktuelle Serie</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Category */}
            {stats.bestCategory && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="flex items-center">
                    <TrophyIcon className="h-6 w-6 mr-3" />
                    <div>
                      <h3 className="font-semibold">Deine Stärke</h3>
                      <p className="text-green-100">Du bist besonders gut in: <strong>{stats.bestCategory}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Available Situations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Verfügbare Quizzes</h2>
            <Link
              href="/quiz"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Alle anzeigen →
            </Link>
          </div>

          {availableSituations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-500 mb-4">
                <PlayIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Noch keine Quizzes verfügbar
              </h3>
              <p className="text-gray-600">
                Dein Trainer hat noch keine Situationen erstellt. Schau später nochmal vorbei!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableSituations.map((situation) => (
                <Link
                  key={situation.id}
                  href={`/quiz/play/${situation.id}`}
                  className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(situation.difficulty_level)}`}>
                      {situation.volleyball_category}
                    </span>
                    <PlayIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                    {situation.question}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Erstellt: {new Date(situation.created_at).toLocaleDateString('de-DE')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {stats && stats.recentActivity.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Letzte Aktivität</h2>
            <div className="bg-white rounded-lg shadow-sm">
              <ul className="divide-y divide-gray-200">
                {stats.recentActivity.map((activity) => (
                  <li key={activity.id} className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {activity.is_correct ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-red-500"></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.volleyball_category} Quiz
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{activity.is_correct ? 'Richtig' : 'Falsch'}</span>
                          <span>•</span>
                          <span>{activity.response_time.toFixed(1)}s</span>
                          <span>•</span>
                          <span>{new Date(activity.created_at).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
