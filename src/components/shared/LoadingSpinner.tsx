import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = 'Chargement...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="p-4 rounded-full bg-primaryLight">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <p className="mt-4 text-sm font-medium text-text-secondary">{message}</p>
    </div>
  )
}
