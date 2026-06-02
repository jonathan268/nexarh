import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr === "datetime('now')" || dateStr.length < 6) return null
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z'
  const d = new Date(normalized)
  if (isNaN(d.getTime())) return null
  return d
}

export function formatDate(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr)
  if (!d) return 'Récent'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function formatShortDate(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr)
  if (!d) return '-'
  return d.toLocaleDateString('fr-FR')
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()} FCFA`
}
