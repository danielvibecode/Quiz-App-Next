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
    } catch (error) {
      console.error('Error fetching situations:', error)
      toast.error('Fehler beim Laden der Situationen')
    } finally {
      setLoading(false)
    }
  }

  const deleteSituation = async (id: string) => {
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
      toast.success('Situation erfolgreich gelöscht')
    } catch (error) {
      console.error('Error deleting situation:', error)
      toast.error('Fehler beim Löschen der Situation')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Lade Situationen...</span>
          </div>
        ) : situations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Noch keine Situationen erstellt
            </h3>
            <p className="text-gray-600 mb-6">
              Erstelle deine erste Quiz-Situation für dein Team.
            </p>
            <Link
              href="/situations/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Erste Situation erstellen
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {situations.map((situation) => (
                <li key={situation.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {situation.question}
                        </h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {situation.volleyball_category}
                          </span>
                          <span>{situation.difficulty_level}</span>
                          <span>{situation.answers?.length || 0} Antworten</span>
                          <span>Erstellt: {new Date(situation.created_at).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {/* TODO: Implement view */}}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Anzeigen"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {/* TODO: Implement edit */}}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Bearbeiten"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteSituation(situation.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Löschen"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
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
