import { Badge } from '../ui/badge'

interface StatusBadgeProps {
  status: string
}

const statusLabels: Record<string, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
  suspendu: 'Suspendu',
  en_attente: 'En attente',
  approuve: 'Approuvé',
  refuse: 'Refusé',
  expire: 'Expiré',
  termine: 'Terminé',
  brouillon: 'Brouillon',
  valide: 'Validé',
  paye: 'Payé',
  resilie: 'Résilié'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={status}>
      {statusLabels[status] || status}
    </Badge>
  )
}
