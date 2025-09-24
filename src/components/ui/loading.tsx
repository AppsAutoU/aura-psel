import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
}

export function LoadingPage({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Loading size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{text}</h1>
          <p className="text-sm text-gray-500 mt-2">Por favor, aguarde...</p>
        </div>
      </div>
    </div>
  )
}

export function LoadingButton({ 
  loading, 
  children, 
  className,
  ...props 
}: { 
  loading: boolean
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'relative px-4 py-2 rounded-md font-medium transition-all duration-200',
        'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
        'flex items-center justify-center space-x-2',
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && <Loading size="sm" />}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  )
}