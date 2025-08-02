import React from 'react'
import { cn } from '@/lib/utils'

interface MobileContainerProps {
  children: React.ReactNode
  className?: string
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      'w-full max-w-sm sm:max-w-md mx-auto px-4 sm:px-0',
      className
    )}>
      {children}
    </div>
  )
}
