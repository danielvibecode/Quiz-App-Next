import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  color?: 'white' | 'glass' | 'gray'
  className?: string
}

export const Card: React.FC<CardProps> = ({
  children,
  color = 'white',
  className
}) => {
  const variants = {
    white: 'bg-white shadow-lg',
    glass: 'bg-white/90 backdrop-blur-lg shadow-2xl border border-white/30',
    gray: 'bg-gray-50 shadow-md'
  }

  return (
    <div className={cn(
      'rounded-2xl p-6',
      variants[color],
      className
    )}>
      {children}
    </div>
  )
}
