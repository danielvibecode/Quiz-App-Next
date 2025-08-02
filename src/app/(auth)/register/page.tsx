'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { Button, Card, Input, GradientBackground, MobileContainer } from '@/components/ui'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'trainer' as 'trainer' | 'player',
    teamInviteCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.displayName) {
      toast.error('Bitte fülle alle Pflichtfelder aus')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwörter stimmen nicht überein')
      return false
    }

    if (formData.password.length < 6) {
      toast.error('Passwort muss mindestens 6 Zeichen lang sein')
      return false
    }

    if (formData.role === 'player' && !formData.teamInviteCode) {
      toast.error('Spieler benötigen einen Team-Einladungscode')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.displayName,
        formData.role
      )
      toast.success('Registrierung erfolgreich! Bitte bestätige deine E-Mail.')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Registrierung fehlgeschlagen: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GradientBackground 
      variant="volleyball" 
      className="flex items-center justify-center min-h-screen min-h-[100dvh] p-4 sm:p-6"
    >
      <MobileContainer className="w-full max-w-sm sm:max-w-md px-4 sm:px-0">
        <Card 
          color="glass" 
          className="backdrop-blur-lg bg-white/90 shadow-2xl p-6 sm:p-8"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl">🏐</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Volleyball Quiz
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Erstelle deinen Account
            </p>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Anzeigename *"
              id="displayName"
              name="displayName"
              type="text"
              required
              placeholder="Dein Name"
              value={formData.displayName}
              onChange={handleChange}
              disabled={isLoading}
              className="text-base"
            />

            <Input
              label="E-Mail-Adresse *"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="deine@email.de"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="text-base"
            />

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Passwort *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="
                    w-full p-4 pr-12
                    rounded-xl
                    border-0 
                    bg-white/80 
                    backdrop-blur-sm
                    shadow-md 
                    focus:shadow-lg
                    text-gray-800 
                    placeholder-gray-500
                    transition-all duration-200
                    focus:ring-2 focus:ring-orange-500 
                    focus:outline-none
                    min-h-[48px] 
                    text-base
                    transform
                    focus:-translate-y-0.5
                  "
                  placeholder="Mindestens 6 Zeichen"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center min-h-[44px]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Passwort bestätigen *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="
                    w-full p-4 pr-12
                    rounded-xl
                    border-0 
                    bg-white/80 
                    backdrop-blur-sm
                    shadow-md 
                    focus:shadow-lg
                    text-gray-800 
                    placeholder-gray-500
                    transition-all duration-200
                    focus:ring-2 focus:ring-orange-500 
                    focus:outline-none
                    min-h-[48px] 
                    text-base
                    transform
                    focus:-translate-y-0.5
                  "
                  placeholder="Passwort wiederholen"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center min-h-[44px]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rolle *
              </label>
              <div className="space-y-3">
                <div className="
                  flex items-center p-4 rounded-xl
                  bg-white/60 backdrop-blur-sm
                  border border-white/30
                  hover:bg-white/70 hover:shadow-md
                  transition-all duration-200
                  cursor-pointer
                ">
                  <input
                    id="role-trainer"
                    name="role"
                    type="radio"
                    value="trainer"
                    checked={formData.role === 'trainer'}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <label htmlFor="role-trainer" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                    Trainer (Team erstellen)
                  </label>
                </div>
                <div className="
                  flex items-center p-4 rounded-xl
                  bg-white/60 backdrop-blur-sm
                  border border-white/30
                  hover:bg-white/70 hover:shadow-md
                  transition-all duration-200
                  cursor-pointer
                ">
                  <input
                    id="role-player"
                    name="role"
                    type="radio"
                    value="player"
                    checked={formData.role === 'player'}
                    onChange={handleChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <label htmlFor="role-player" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                    Spieler (Team beitreten)
                  </label>
                </div>
              </div>
            </div>

            {formData.role === 'player' && (
              <div className="space-y-2">
                <label htmlFor="teamInviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Team-Einladungscode *
                </label>
                <input
                  id="teamInviteCode"
                  name="teamInviteCode"
                  type="text"
                  required
                  value={formData.teamInviteCode}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="
                    w-full p-4
                    rounded-xl
                    border-0 
                    bg-white/80 
                    backdrop-blur-sm
                    shadow-md 
                    focus:shadow-lg
                    text-gray-800 
                    placeholder-gray-500
                    transition-all duration-200
                    focus:ring-2 focus:ring-orange-500 
                    focus:outline-none
                    min-h-[48px] 
                    text-base
                    transform
                    focus:-translate-y-0.5
                    uppercase font-mono tracking-wider
                  "
                  placeholder="ABC123"
                  style={{ textTransform: 'uppercase' }}
                />
                <p className="text-xs text-gray-600 mt-2">
                  Frage deinen Trainer nach dem Einladungscode
                </p>
              </div>
            )}

            <Button 
              type="submit"
              variant="glass-white"
              size="lg" 
              className="w-full mt-6 sm:mt-8"
              disabled={isLoading}
              loading={isLoading}
            >
              Registrieren
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
              Bereits registriert?
            </p>
            <Link
              href="/login"
              className="
                text-orange-600 hover:text-orange-700 
                font-medium text-sm underline
                transition-colors duration-200
                min-h-[44px] flex items-center justify-center
                touch-manipulation
              "
            >
              Anmelden
            </Link>
          </div>
        </Card>
      </MobileContainer>
    </GradientBackground>
  )
}
