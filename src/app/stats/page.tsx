'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface TeamStats {
  totalSituations: number
  totalQuizzes: number
  averageAccuracy: number
  activeMembers: number
  recentActivity: Array<{
    id: string
    type: 'quiz' | 'situation'
    title: string
    user: string
    date: string
    score?: number
  }>
}

export default function TeamStatsPage() {
  const { userProfile } = useAuth()
  const [stats, setStats] = useState<TeamStats>({
    totalSituations: 0,
    totalQuizzes: 0,
    averageAccuracy: 0,
    activeMembers: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userProfile?.team_id) {
      fetchTeamStats()
    }
  }, [userProfile])

  const fetchTeamStats = async () => {
    try {
      setLoading(true)
      
      if (!userProfile?.team_id) {
        throw new Error('No team found')
      }

      // Fetch situations count
      const { count: situationsCount } = await supabase
        .from('situations')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', userProfile.team_id)

      // Fetch quiz results count and average accuracy
      // Da 'quiz_results' nicht in den generierten Typen existiert, verwenden wir user_answers
      const { data: userAnswers } = await supabase
        .from('user_answers')
        .select('is_correct')
        .eq('team_id', userProfile.team_id)

      // Anzahl der beantworteten Quizfragen
      const quizCount = userAnswers?.length || 0

      // Fetch team members count
      const { count: membersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', userProfile.team_id)

      // Calculate average accuracy
      let averageAccuracy = 0
      if (userAnswers && userAnswers.length > 0) {
        const correctAnswers = userAnswers.filter(answer => answer.is_correct).length
        averageAccuracy = userAnswers.length > 0 ? (correctAnswers / userAnswers.length) * 100 : 0
      }

      // Fetch recent activity (simplified)
      const { data: recentSituations } = await supabase
        .from('situations')
        .select('id, question, created_at, user_profiles!situations_created_by_fkey(display_name)')
        .eq('team_id', userProfile.team_id)
        .order('created_at', { ascending: false })
        .limit(5)

      const recentActivity = (recentSituations || []).map(situation => ({
        id: situation.id.toString(),
        type: 'situation' as const,
        title: situation.question, // Fixed: title → question
        user: (situation.user_profiles as any)?.display_name || 'Unbekannt',
        date: situation.created_at || ''
      }))

      setStats({
        totalSituations: situationsCount || 0,
        totalQuizzes: quizCount,
        averageAccuracy: Math.round(averageAccuracy),
        activeMembers: membersCount || 0,
        recentActivity
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Team-Statistiken
          </h1>
          <p className="mt-2 text-gray-600">
            Überblick über die Fortschritte deines Teams
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📚</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Situationen
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalSituations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🎯</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Bearbeitete Quizzes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalQuizzes}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Durchschnittliche Genauigkeit
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.averageAccuracy}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Team-Mitglieder
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeMembers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Letzte Aktivitäten
            </h3>
          </div>
          
          {stats.recentActivity.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Noch keine Aktivitäten vorhanden
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'situation' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'situation' ? 'Neue Situation:' : 'Quiz bearbeitet:'} {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          von {activity.user}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Info */}
        {userProfile?.teams && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Team-Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Team-Name:</span>
                <p className="text-sm text-gray-900">{userProfile.teams.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Einladungscode:</span>
                <p className="text-sm text-gray-900 font-mono">{userProfile.teams.invite_code}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
