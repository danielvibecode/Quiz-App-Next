import React from 'react'
import { cn } from '@/lib/utils'

interface GradientBackgroundProps {
  children: React.ReactNode
  variant?: 'volleyball' | 'primary' | 'secondary'
  className?: string
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  variant = 'volleyball',
  className
}) => {
  const variants = {
    volleyball: `
      bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600
      relative overflow-hidden
      before:absolute before:inset-0 
      before:bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]
    `,
    primary: 'bg-gradient-to-br from-blue-400 to-blue-600',
    secondary: 'bg-gradient-to-br from-gray-400 to-gray-600'
  }

  return (
    <div className={cn(
      'min-h-screen relative',
      variants[variant],
      className
    )}>
      {children}
    </div>
  )
}
