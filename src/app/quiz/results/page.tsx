'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface QuizResult {
  id: string
  created_at: string
  situation_id: string
  selected_answer: number
  correct_answer: number
  is_correct: boolean
  response_time: number
  difficulty_level: string
  volleyball_category: string
  situations: {
    question: string
    answers: string[]
  }
}

interface ResultsStats {
  totalQuizzes: number
  correctAnswers: number
  averageResponseTime: number
  accuracyPercentage: number
  bestCategory: string
  recentStreak: number
}

export default function QuizResultsPage() {
  const { user, userProfile } = useAuth()
  const [results, setResults] = useState<QuizResult[]>([])
  const [stats, setStats] = useState<ResultsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all')

  useEffect(() => {
    if (user && userProfile) {
      fetchResults()
    }
  }, [user, userProfile])

  const fetchResults = async () => {
    try {
      setLoading(true)
      
      const { data: resultsData, error } = await supabase
        .from('quiz_results')
        .select(`
          *,
          situations (
            question,
            answers
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setResults(resultsData || [])
      calculateStats(resultsData || [])
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (resultsData: QuizResult[]) => {
    if (resultsData.length === 0) {
      setStats({
        totalQuizzes: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
        accuracyPercentage: 0,
        bestCategory: '',
        recentStreak: 0
      })
      return
    }

    const totalQuizzes = resultsData.length
    const correctAnswers = resultsData.filter(r => r.is_correct).length
    const averageResponseTime = resultsData.reduce((sum, r) => sum + r.response_time, 0) / totalQuizzes
    const accuracyPercentage = (correctAnswers / totalQuizzes) * 100

    // Find best category
    const categoryStats: { [key: string]: { correct: number, total: number } } = {}
    resultsData.forEach(result => {
      const category = result.volleyball_category
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

    // Calculate recent streak
    let recentStreak = 0
    for (let i = 0; i < resultsData.length; i++) {
      if (resultsData[i].is_correct) {
        recentStreak++
      } else {
        break
      }
    }

    setStats({
      totalQuizzes,
      correctAnswers,
      averageResponseTime,
      accuracyPercentage,
      bestCategory,
      recentStreak
    })
  }

  const filteredResults = results.filter(result => {
    if (filter === 'correct') return result.is_correct
    if (filter === 'incorrect') return !result.is_correct
    return true
  })

  const formatResponseTime = (time: number) => {
    return `${time.toFixed(1)}s`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'anfaenger': return 'bg-green-100 text-green-800'
      case 'fortgeschritten': return 'bg-yellow-100 text-yellow-800'
      case 'profi': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Ergebnisse...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Meine Quiz-Ergebnisse
              </h1>
              <p className="mt-2 text-gray-600">
                Übersicht über deine Quiz-Performance
              </p>
            </div>
            <Link
              href="/quiz"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Neues Quiz starten
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    {formatResponseTime(stats.averageResponseTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">{stats.recentStreak}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktuelle Serie</p>
                  <p className="text-sm text-gray-500">richtige Antworten</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Best Category */}
        {stats && stats.bestCategory && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <TrophyIcon className="h-8 w-8 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">Beste Kategorie</h3>
                  <p className="text-blue-100">Du bist besonders stark in: <strong>{stats.bestCategory}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Alle ({results.length})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'correct' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Richtig ({results.filter(r => r.is_correct).length})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'incorrect' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Falsch ({results.filter(r => !r.is_correct).length})
            </button>
          </div>
        </div>

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <TrophyIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {results.length === 0 ? 'Noch keine Quizzes gespielt' : 'Keine Ergebnisse für diesen Filter'}
            </h3>
            <p className="text-gray-600 mb-6">
              {results.length === 0 
                ? 'Starte dein erstes Quiz und sammle Erfahrungen!'
                : 'Versuche einen anderen Filter oder spiele mehr Quizzes.'
              }
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Quiz starten
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <li key={result.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          {result.is_correct ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.situations?.question}
                            </p>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(result.difficulty_level)}`}>
                                {result.volleyball_category}
                              </span>
                              <span className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {formatResponseTime(result.response_time)}
                              </span>
                              <span>
                                {new Date(result.created_at).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            Antwort: {String.fromCharCode(65 + result.selected_answer)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Richtig: {String.fromCharCode(65 + result.correct_answer)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
