import * as React from "react"

interface AlertProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive'
  className?: string
}

interface AlertTitleProps {
  children: React.ReactNode
  className?: string
}

interface AlertDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function Alert({ children, variant = 'default', className = '' }: AlertProps) {
  const baseClasses = "relative w-full rounded-lg border p-4"
  const variantClasses = variant === 'destructive' 
    ? "border-red-200 bg-red-50 text-red-900"
    : "border-blue-200 bg-blue-50 text-blue-900"

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} role="alert">
      {children}
    </div>
  )
}

export function AlertTitle({ children, className = '' }: AlertTitleProps) {
  return (
    <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`}>
      {children}
    </h5>
  )
}

export function AlertDescription({ children, className = '' }: AlertDescriptionProps) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
      {children}
    </div>
  )
}

