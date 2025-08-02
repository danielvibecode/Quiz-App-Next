import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass-white' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-95
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-orange-500 to-orange-600
      hover:from-orange-600 hover:to-orange-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-orange-500
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200
      text-gray-900 shadow-md hover:shadow-lg
      focus:ring-gray-500
    `,
    'glass-white': `
      bg-white/90 backdrop-blur-sm
      hover:bg-white/95 hover:shadow-lg
      text-gray-800 shadow-md
      border border-white/30
      focus:ring-orange-500
    `,
    outline: `
      border-2 border-orange-500
      text-orange-600 hover:bg-orange-50
      focus:ring-orange-500
    `
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Lädt...
        </div>
      ) : (
        children
      )}
    </button>
  )
}
