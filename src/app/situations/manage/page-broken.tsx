'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/database'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export default function ManageSituationsPage() {
  const { user, userProfile } = useAuth()
  const [situations, setSituations] = useState<Tables<'situations'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && userProfile) {
      fetchSituations()
    }
  }, [user, userProfile])

  const fetchSituations = async () => {
    try {
      setLoading(true)
      
      let query = supabase.from('situations').select('*').order('created_at', { ascending: false })
      
      // Filter based on role and team
      if (userProfile?.role === 'trainer') {
        if (userProfile?.team_id) {
          query = query.or(`created_by.eq.${user?.id},team_id.eq.${userProfile.team_id}`)
        } else {
          query = query.eq('created_by', user?.id || '')
        }
      } else {
        if (userProfile?.team_id) {
          query = query.eq('team_id', userProfile.team_id)
        }
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setSituations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch situations')
    } finally {
      setLoading(false)
    }
  }

  const deleteSituation = async (id: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Situation löschen möchten?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('situations')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSituations(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete situation')
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Situationen verwalten
              </h1>
              <p className="mt-2 text-gray-600">
                Bearbeite oder lösche bestehende Quiz-Situationen
              </p>
            </div>
            <Link
              href="/situations/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Neue Situation erstellen
            </Link>
          </div>
            <Link
              href="/situations/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Neue Situation erstellen
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {situations.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Situationen gefunden
            </h3>
            <p className="text-gray-500 mb-4">
              Erstelle deine erste Quiz-Situation, um loszulegen.
            </p>
            <Link
              href="/situations/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Erste Situation erstellen
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {situations.length} Situation{situations.length !== 1 ? 'en' : ''} gefunden
              </h3>
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
                              situation.difficulty_level === 'einfach' ? 'bg-green-100 text-green-800' :
                              situation.difficulty_level === 'mittel' ? 'bg-yellow-100 text-yellow-800' :
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
                      
                      <p className="mt-2 text-sm text-gray-900 line-clamp-3">
                        {situation.question}
                      </p>
                      
                      <div className="mt-3 flex items-center text-sm text-gray-500 space-x-4">
                        <span>{situation.answer_count} Antworten</span>
                        <span>•</span>
                        <span>
                          Erstellt: {new Date(situation.created_at || '').toLocaleDateString('de-DE')}
                        </span>
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
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        title="Vorschau"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      
                      {userProfile?.role === 'trainer' && situation.created_by === user?.id && (
                        <>
                          <Link
                            href={`/situations/${situation.id}/edit`}
                            className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            title="Bearbeiten"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          
                          <button
                            onClick={() => deleteSituation(situation.id)}
                            className="inline-flex items-center p-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                            title="Löschen"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
