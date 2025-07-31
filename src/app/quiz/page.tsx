'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/database'
import Link from 'next/link'
import { ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/outline'

export default function QuizPage() {
  const { userProfile } = useAuth()
  const [situations, setSituations] = useState<Tables<'situations'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userProfile?.team_id) {
      fetchSituations()
    }
  }, [userProfile])

  const fetchSituations = async () => {
    try {
      setLoading(true)
      
      if (!userProfile?.team_id) {
        throw new Error('No team found')
      }

      const { data, error } = await supabase
        .from('situations')
        .select('*')
        .eq('team_id', userProfile.team_id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setSituations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch situations')
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Zurück zum Dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Quiz starten
          </h1>
          <p className="mt-2 text-gray-600">
            Wähle Situationen aus, um ein Quiz zu starten
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {situations.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Situationen verfügbar
            </h3>
            <p className="text-gray-600 mb-4">
              Es sind noch keine Quiz-Situationen für dein Team erstellt worden.
            </p>
            {userProfile?.role === 'trainer' ? (
              <Link
                href="/situations/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Erste Situation erstellen
              </Link>
            ) : (
              <p className="text-sm text-gray-500">
                Bitte wende dich an deinen Trainer, um Situationen zu erstellen.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Start Options */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Schnellstart
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Alle Situationen ({situations.length})
                </button>
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Zufällige Auswahl (10)
                </button>
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Nach Schwierigkeit
                </button>
              </div>
            </div>

            {/* Situations List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Verfügbare Situationen ({situations.length})
                </h3>
                <p className="text-sm text-gray-500">
                  Wähle einzelne Situationen für ein individuelles Quiz
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {situations.map((situation) => (
                  <div key={situation.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900 truncate">
                            {situation.question}
                          </h4>
                          <div className="flex space-x-2">
                            {situation.volleyball_category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {situation.volleyball_category}
                              </span>
                            )}
                            {situation.difficulty_level && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                situation.difficulty_level === 'Einfach' ? 'bg-green-100 text-green-800' :
                                situation.difficulty_level === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {situation.difficulty_level}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {situation.explanation && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {situation.explanation}
                          </p>
                        )}
                        
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span>{situation.answer_count} Antworten</span>
                          {situation.image_url && (
                            <>
                              <span>•</span>
                              <span>📷 Bild</span>
                            </>
                          )}

                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/situations/${situation.id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Vorschau
                        </Link>
                        <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Quiz starten
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Options */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Filter-Optionen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Alle Kategorien</option>
                    <option value="Angriff">Angriff</option>
                    <option value="Block">Block</option>
                    <option value="Aufschlag">Aufschlag</option>
                    <option value="Annahme">Annahme</option>
                    <option value="Zuspiel">Zuspiel</option>
                    <option value="Abwehr">Abwehr</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schwierigkeit
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Alle Schwierigkeiten</option>
                    <option value="einfach">Einfach</option>
                    <option value="mittel">Mittel</option>
                    <option value="schwer">Schwer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anzahl Fragen
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                    <option value="5">5 Fragen</option>
                    <option value="10">10 Fragen</option>
                    <option value="15">15 Fragen</option>
                    <option value="20">20 Fragen</option>
                    <option value="all">Alle verfügbaren</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Gefiltertes Quiz starten
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
