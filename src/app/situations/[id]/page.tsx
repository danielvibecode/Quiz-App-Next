'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/database'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function SituationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [situation, setSituation] = useState<Tables<'situations'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchSituation()
    }
  }, [params.id])

  const fetchSituation = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('situations')
        .select('*')
        .eq('id', typeof params.id === 'string' ? parseInt(params.id, 10) : parseInt(params.id?.[0] || '0', 10))
        .single()
      
      if (error) throw error
      
      setSituation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch situation')
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

  if (error || !situation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Situation nicht gefunden</h2>
          <p className="text-gray-600 mb-4">{error || 'Die angeforderte Situation existiert nicht.'}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const answers = Array.isArray(situation.answers) ? situation.answers : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/situations/manage"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Zurück zur Übersicht
          </Link>
          <div className="mt-4 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {situation.title}
              </h1>
              <div className="mt-2 flex items-center space-x-3">
                {situation.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {situation.category}
                  </span>
                )}
                {situation.difficulty && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    situation.difficulty === 'einfach' ? 'bg-green-100 text-green-800' :
                    situation.difficulty === 'mittel' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {situation.difficulty}
                  </span>
                )}
              </div>
            </div>
            
            {userProfile?.role === 'trainer' && situation.created_by === user?.id && (
              <Link
                href={`/situations/${situation.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Bearbeiten
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Description */}
          {situation.description && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Beschreibung</h3>
              <p className="text-gray-700">{situation.description}</p>
            </div>
          )}

          {/* Media */}
          {(situation.image_url || situation.video_url) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Medien</h3>
              <div className="space-y-4">
                {situation.image_url && (
                  <div>
                    <img
                      src={situation.image_url}
                      alt={situation.title}
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}
                {situation.video_url && (
                  <div>
                    <video
                      src={situation.video_url}
                      controls
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Question and Answers */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Frage</h3>
            <p className="text-gray-900 mb-6">{situation.question}</p>
            
            <h4 className="text-md font-medium text-gray-900 mb-3">Antwortmöglichkeiten</h4>
            <div className="space-y-3">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${
                    index === situation.correct_answer
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium mr-3 ${
                      index === situation.correct_answer
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-gray-900">{typeof answer === 'string' ? answer : JSON.stringify(answer)}</span>
                    {index === situation.correct_answer && (
                      <span className="ml-auto text-green-600 text-sm font-medium">
                        ✓ Richtige Antwort
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {situation.explanation && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Erklärung</h3>
              <p className="text-gray-700">{situation.explanation}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Erstellt am:</span>{' '}
                {new Date(situation.created_at || '').toLocaleDateString('de-DE')}
              </div>
              <div>
                <span className="font-medium">Anzahl Antworten:</span>{' '}
                {situation.answer_count}
              </div>
              {situation.updated_at && (
                <div>
                  <span className="font-medium">Zuletzt bearbeitet:</span>{' '}
                  {new Date(situation.updated_at).toLocaleDateString('de-DE')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
