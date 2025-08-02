'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SituationsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to manage page
    router.replace('/situations/manage')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Weiterleitung...</p>
      </div>
    </div>
  )
}
