import { cn } from '../../lib/utils'

interface BadgeProps {
  variant: string
  className?: string
  children: React.ReactNode
}

export function Badge({ variant, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        `status-badge-${variant}`,
        className
      )}
    >
      {children}
    </span>
  )
}
