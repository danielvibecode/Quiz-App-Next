'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { 
  PhotoIcon, 
  VideoCameraIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  InformationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

// Volleyball-spezifische Kategorien für MVP
const VOLLEYBALL_CATEGORIES = {
  'Blockspieler': {
    freezeDescription: 'Bei Ballkontakt des Zuspielers',
    contexts: ['In-System (Spieler vorne am Netz)', 'Medium (1-3 Meter laufen)', 'Out-of-System (weiter laufen)']
  },
  'Annahmespieler': {
    freezeDescription: '1 Meter nach Aufschlag',
    contexts: ['Einfacher Aufschlag', 'Harter Aufschlag', 'Sprungaufschlag', 'Float-Aufschlag']
  },
  'Abwehrspieler': {
    freezeDescription: 'Bei Ballkontakt des Angreifers',
    contexts: ['Ball über Block', 'Ball neben Block', 'Direkter Angriff', 'Tooling']
  },
  'Allgemein': {
    freezeDescription: 'Benutzerdefiniert',
    contexts: ['Grundlagen', 'Fortgeschritten', 'Wettkampf', 'Training']
  }
}

const DIFFICULTY_LEVELS = {
  'anfaenger': { label: 'Anfänger (3-4 Sekunden)', reactionTime: 4 },
  'fortgeschritten': { label: 'Fortgeschritten (2-3 Sekunden)', reactionTime: 3 },
  'profi': { label: 'Profi (Schnellreaktion)', reactionTime: 2 }
}

export default function CreateSituationPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    question: '',
    volleyball_category: '',
    difficulty_level: 'fortgeschritten',
    situation_context: '',
    answers: ['', ''],
    correct_answer: 0,
    explanation: '',
    image_url: '',
    media_type: 'image',
    is_info_only: false,
    answer_count: 2,
    freeze_point_seconds: null as number | null,
    freeze_description: '',
    expected_reaction_time: 3
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!user || !userProfile) {
        throw new Error('Must be logged in')
      }

      const { error: insertError } = await supabase
        .from('situations')
        .insert({
          question: formData.question,
          volleyball_category: formData.category || null,
          difficulty_level: formData.difficulty || null,
          answers: formData.answers,
          answer_count: formData.answers.length,
          correct_answer: formData.correctAnswer,
          explanation: formData.explanation || null,
          image_url: formData.imageUrl || '',
          created_by: user.id,
          team_id: userProfile.team_id
        })

      if (insertError) throw insertError

      router.push('/situations/manage')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create situation')
    } finally {
      setLoading(false)
    }
  }

  const addAnswer = () => {
    if (formData.answers.length < 4) {
      setFormData(prev => ({
        ...prev,
        answers: [...prev.answers, '']
      }))
    }
  }

  const removeAnswer = (index: number) => {
    if (formData.answers.length > 2) {
      setFormData(prev => ({
        ...prev,
        answers: prev.answers.filter((_, i) => i !== index),
        correctAnswer: prev.correctAnswer >= index ? Math.max(0, prev.correctAnswer - 1) : prev.correctAnswer
      }))
    }
  }

  const updateAnswer = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => i === index ? value : answer)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Zurück zum Dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Neue Situation erstellen
          </h1>
          <p className="mt-2 text-gray-600">
            Erstelle eine neue Quiz-Situation für dein Team
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Kategorie wählen</option>
                  <option value="Angriff">Angriff</option>
                  <option value="Block">Block</option>
                  <option value="Aufschlag">Aufschlag</option>
                  <option value="Annahme">Annahme</option>
                  <option value="Zuspiel">Zuspiel</option>
                  <option value="Abwehr">Abwehr</option>
                </select>
              </div>
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700">
                Frage *
              </label>
              <textarea
                required
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Was ist die beste Aktion in dieser Situation?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Antwortmöglichkeiten *
              </label>
              <div className="space-y-3">
                {formData.answers.map((answer, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => setFormData(prev => ({ ...prev, correctAnswer: index }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <input
                      type="text"
                      required
                      value={answer}
                      onChange={(e) => updateAnswer(index, e.target.value)}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Antwort ${index + 1}`}
                    />
                    {formData.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Entfernen
                      </button>
                    )}
                  </div>
                ))}
                {formData.answers.length < 4 && (
                  <button
                    type="button"
                    onClick={addAnswer}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    + Weitere Antwort hinzufügen
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Erklärung
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Erklärung der richtigen Antwort..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Schwierigkeit
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="einfach">Einfach</option>
                  <option value="mittel">Mittel</option>
                  <option value="schwer">Schwer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bild-URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com/volleyball-image.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Erstelle...' : 'Situation erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
