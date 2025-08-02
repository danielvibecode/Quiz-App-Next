import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          `w-full p-4
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
          focus:-translate-y-0.5`,
          error && 'ring-2 ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
