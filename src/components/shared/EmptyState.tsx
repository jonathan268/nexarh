import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-border shadow-card">
      <div className="w-16 h-16 rounded-2xl bg-primaryLight flex items-center justify-center mb-5">
        <Inbox className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary mt-1 mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}
