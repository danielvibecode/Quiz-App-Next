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
    freeze_point_seconds: null as number | null,
    freeze_description: '',
    expected_reaction_time: 3
  })

  // File Upload Handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `situations/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      setFormData(prev => ({
        ...prev,
        image_url: data.publicUrl,
        media_type: file.type.startsWith('video/') ? 'video' : 'image'
      }))

      toast.success('Datei erfolgreich hochgeladen!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Fehler beim Hochladen der Datei')
    } finally {
      setUploading(false)
    }
  }

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userProfile) return

    setLoading(true)
    try {
      // Validierung
      if (!formData.question.trim()) {
        toast.error('Bitte geben Sie eine Frage ein')
        return
      }

      if (!formData.volleyball_category) {
        toast.error('Bitte wählen Sie eine Kategorie')
        return
      }

      if (formData.answers.some(answer => !answer.trim())) {
        toast.error('Bitte füllen Sie alle Antworten aus')
        return
      }

      // Situation in Datenbank speichern
      const situationData = {
        question: formData.question,
        volleyball_category: formData.volleyball_category,
        difficulty_level: formData.difficulty_level,
        situation_context: formData.situation_context,
        correct_answer: formData.correct_answer,
        explanation: formData.explanation,
        image_url: formData.image_url,
        media_type: formData.media_type,
        is_info_only: formData.is_info_only,
        freeze_point_seconds: formData.freeze_point_seconds,
        freeze_description: formData.freeze_description,
        expected_reaction_time: formData.expected_reaction_time,
        created_by: user.id,
        team_id: userProfile.team_id,
        answers: formData.answers
      }

      const { error: insertError } = await supabase
        .from('situations')
        .insert([situationData])

      if (insertError) throw insertError

      toast.success('Situation erfolgreich erstellt!')
      router.push('/situations/manage')
    } catch (error) {
      console.error('Error creating situation:', error)
      toast.error('Fehler beim Erstellen der Situation')
    } finally {
      setLoading(false)
    }
  }

  // Answer Management
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
        correct_answer: prev.correct_answer >= index ? Math.max(0, prev.correct_answer - 1) : prev.correct_answer
      }))
    }
  }

  const updateAnswer = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => i === index ? value : answer)
    }))
  }

  // Category Change Handler
  const handleCategoryChange = (category: string) => {
    const categoryData = VOLLEYBALL_CATEGORIES[category as keyof typeof VOLLEYBALL_CATEGORIES]
    setFormData(prev => ({
      ...prev,
      volleyball_category: category,
      freeze_description: categoryData?.freezeDescription || '',
      situation_context: ''
    }))
  }

  // Difficulty Change Handler
  const handleDifficultyChange = (difficulty: string) => {
    const difficultyData = DIFFICULTY_LEVELS[difficulty as keyof typeof DIFFICULTY_LEVELS]
    setFormData(prev => ({
      ...prev,
      difficulty_level: difficulty,
      expected_reaction_time: difficultyData?.reactionTime || 3
    }))
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Zurück zum Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Neue Situation erstellen
          </h1>
          <p className="mt-2 text-gray-600">
            Erstelle eine neue Quiz-Situation für dein Team
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Kategorie & Schwierigkeit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volleyball Kategorie *
                </label>
                <select
                  value={formData.volleyball_category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Kategorie wählen</option>
                  {Object.keys(VOLLEYBALL_CATEGORIES).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schwierigkeitsgrad
                </label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                    <option key={key} value={key}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Situationskontext */}
            {formData.volleyball_category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Situationskontext
                </label>
                <select
                  value={formData.situation_context}
                  onChange={(e) => setFormData(prev => ({ ...prev, situation_context: e.target.value }))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Kontext wählen (optional)</option>
                  {VOLLEYBALL_CATEGORIES[formData.volleyball_category as keyof typeof VOLLEYBALL_CATEGORIES]?.contexts.map(context => (
                    <option key={context} value={context}>
                      {context}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Frage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frage *
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                rows={3}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Was ist die beste Aktion in dieser Situation?"
                required
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bild oder Video hochladen
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {formData.image_url ? (
                    <div className="mb-4">
                      {formData.media_type === 'video' ? (
                        <video src={formData.image_url} className="mx-auto h-32 w-auto" controls />
                      ) : (
                        <img src={formData.image_url} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded" />
                      )}
                    </div>
                  ) : (
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>{formData.image_url ? 'Datei ändern' : 'Datei hochladen'}</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, MP4 bis zu 10MB</p>
                  {uploading && <p className="text-sm text-blue-600">Wird hochgeladen...</p>}
                </div>
              </div>
            </div>

            {/* Antworten */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Antwortmöglichkeiten *
                </label>
                <button
                  type="button"
                  onClick={addAnswer}
                  disabled={formData.answers.length >= 4}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusCircleIcon className="h-4 w-4 mr-1" />
                  Antwort hinzufügen
                </button>
              </div>

              <div className="space-y-3">
                {formData.answers.map((answer, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={formData.correct_answer === index}
                        onChange={() => setFormData(prev => ({ ...prev, correct_answer: index }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => updateAnswer(index, e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Antwort ${index + 1}`}
                        required
                      />
                    </div>
                    {formData.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <MinusCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Wählen Sie die richtige Antwort durch Anklicken des Radiobuttons aus.
              </p>
            </div>

            {/* Erklärung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Erklärung (optional)
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                rows={3}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Warum ist diese Antwort richtig? Zusätzliche Erklärungen..."
              />
            </div>

            {/* Freeze Point */}
            {formData.volleyball_category && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Video Freeze Point</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {formData.freeze_description}
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Freeze Point (Sekunden)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.freeze_point_seconds || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      freeze_point_seconds: e.target.value ? parseFloat(e.target.value) : null 
                    }))}
                    className="w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. 2.5"
                  />
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird erstellt...' : 'Situation erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
