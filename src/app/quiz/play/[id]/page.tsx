'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/ui/DashboardLayout'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/types/database'
import toast from 'react-hot-toast'
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface QuizSession {
  situation: Tables<'situations'>
  currentAnswer: number | null
  startTime: number
  answered: boolean
  correct: boolean | null
  showExplanation: boolean
}

export default function QuizPlayerPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const params = useParams()
  const situationId = params.id as string

  const [session, setSession] = useState<QuizSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    if (situationId && user && userProfile) {
      loadSituation()
    }
  }, [situationId, user, userProfile])

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setTimerActive(false)
            handleTimeUp()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeLeft])

  const loadSituation = async () => {
    try {
      setLoading(true)
      
      const { data: situation, error } = await supabase
        .from('situations')
        .select('*')
        .eq('id', situationId)
        .single()

      if (error) throw error

      if (!situation) {
        toast.error('Situation nicht gefunden')
        router.push('/quiz')
        return
      }

      // Check if user has access to this situation
      if (situation.team_id !== userProfile?.team_id) {
        toast.error('Keine Berechtigung für diese Situation')
        router.push('/quiz')
        return
      }

      const newSession: QuizSession = {
        situation,
        currentAnswer: null,
        startTime: Date.now(),
        answered: false,
        correct: null,
        showExplanation: false
      }

      setSession(newSession)
      
      // Start timer based on difficulty
      const reactionTime = situation.expected_reaction_time || 3
      setTimeLeft(reactionTime)
      setTimerActive(true)

    } catch (error) {
      console.error('Error loading situation:', error)
      toast.error('Fehler beim Laden der Situation')
      router.push('/quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleTimeUp = () => {
    if (!session || session.answered) return
    
    setSession(prev => prev ? {
      ...prev,
      answered: true,
      correct: false,
      showExplanation: true
    } : null)
    
    toast.error('Zeit abgelaufen!')
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!session || session.answered) return

    setTimerActive(false)
    const isCorrect = answerIndex === session.situation.correct_answer
    const responseTime = (Date.now() - session.startTime) / 1000

    setSession(prev => prev ? {
      ...prev,
      currentAnswer: answerIndex,
      answered: true,
      correct: isCorrect,
      showExplanation: true
    } : null)

    // Save result to database
    saveQuizResult(answerIndex, isCorrect, responseTime)

    if (isCorrect) {
      toast.success('Richtig! 🎉')
    } else {
      toast.error('Leider falsch 😔')
    }
  }

  const saveQuizResult = async (answerIndex: number, isCorrect: boolean, responseTime: number) => {
    if (!session || !user || !userProfile) return

    try {
      const { error } = await supabase
        .from('quiz_results')
        .insert([{
          user_id: user.id,
          situation_id: session.situation.id,
          team_id: userProfile.team_id,
          selected_answer: answerIndex,
          correct_answer: session.situation.correct_answer,
          is_correct: isCorrect,
          response_time: responseTime,
          difficulty_level: session.situation.difficulty_level,
          volleyball_category: session.situation.volleyball_category
        }])

      if (error) throw error
    } catch (error) {
      console.error('Error saving quiz result:', error)
      // Don't show error to user, just log it
    }
  }

  const handleNextQuiz = () => {
    router.push('/quiz')
  }

  const handlePlayAgain = () => {
    if (!session) return
    
    const newSession: QuizSession = {
      ...session,
      currentAnswer: null,
      startTime: Date.now(),
      answered: false,
      correct: null,
      showExplanation: false
    }

    setSession(newSession)
    
    const reactionTime = session.situation.expected_reaction_time || 3
    setTimeLeft(reactionTime)
    setTimerActive(true)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Quiz...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Quiz konnte nicht geladen werden</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.situation.volleyball_category} Quiz
              </h1>
              <p className="text-sm text-gray-600">
                Schwierigkeit: {session.situation.difficulty_level}
              </p>
            </div>
            
            {/* Timer */}
            {timerActive && (
              <div className="flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-lg">
                <ClockIcon className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Situation Media */}
        {session.situation.image_url && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {session.situation.media_type === 'video' ? (
                <video 
                  src={session.situation.image_url} 
                  className="w-full h-64 object-cover"
                  controls
                  autoPlay={!session.answered}
                />
              ) : (
                <img 
                  src={session.situation.image_url} 
                  alt="Situation" 
                  className="w-full h-64 object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* Question */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {session.situation.question}
            </h2>
            
            {session.situation.situation_context && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Kontext:</strong> {session.situation.situation_context}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Answers */}
        <div className="mb-8">
          <div className="space-y-3">
            {session.situation.answers?.map((answer, index) => {
              let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 "
              
              if (!session.answered) {
                buttonClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
              } else {
                if (index === session.situation.correct_answer) {
                  buttonClass += "border-green-500 bg-green-50 text-green-800"
                } else if (index === session.currentAnswer && !session.correct) {
                  buttonClass += "border-red-500 bg-red-50 text-red-800"
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-600"
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={session.answered}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}. {answer}
                    </span>
                    {session.answered && (
                      <div className="flex-shrink-0 ml-4">
                        {index === session.situation.correct_answer ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : index === session.currentAnswer && !session.correct ? (
                          <XCircleIcon className="h-6 w-6 text-red-600" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Explanation */}
        {session.showExplanation && session.situation.explanation && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Erklärung
              </h3>
              <p className="text-gray-700">
                {session.situation.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {session.answered && (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handlePlayAgain}
              className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nochmal spielen
            </button>
            <button
              onClick={handleNextQuiz}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nächstes Quiz
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
