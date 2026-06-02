import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import StatusBadge from '../../components/shared/StatusBadge'
import { Button } from '../../components/ui/button'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import type { Apprenant } from '../../types/electron.d'

export default function ApprenantsPage() {
  const navigate = useNavigate()
  const [apprenants, setApprenants] = useState<Apprenant[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const result = await window.electronAPI.apprenants.getAll()
    if (result.success) setApprenants(result.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await window.electronAPI.apprenants.delete(deleteId)
    if (result.success) { toast.success('Apprenant supprimé'); setDeleteId(null); fetchData() }
    else { toast.error(result.error) }
  }

  const columns = [
    { key: 'matricule', header: 'Matricule' },
    {
      key: 'fullName', header: 'Nom complet',
      render: (a: Apprenant) => <span className="font-semibold">{a.nom} {a.prenom}</span>
    },
    { key: 'email', header: 'Email' },
    { key: 'telephone', header: 'Téléphone' },
    { key: 'niveauEtude', header: 'Niveau' },
    { key: 'status', header: 'Statut', render: (a: Apprenant) => <StatusBadge status={a.status} /> },
    {
      key: 'actions', header: 'Actions', className: 'text-right',
      render: (a: Apprenant) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/apprenants/${a.id}/edit`)}>
            <Pencil className="h-4 w-4 text-text-secondary" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(a.id)}>
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Apprenants"
        description="Gestion des apprenants et inscriptions aux formations"
        actions={
          <Button onClick={() => navigate('/apprenants/new')}>
            <Plus className="h-4 w-4 mr-2" />Nouvel apprenant
          </Button>
        }
      />

      {loading ? <LoadingSpinner /> : apprenants.length === 0 ? (
        <EmptyState title="Aucun apprenant" description="Ajoutez votre premier apprenant"
          action={<Button onClick={() => navigate('/apprenants/new')}><Plus className="h-4 w-4 mr-2" />Nouvel apprenant</Button>}
        />
      ) : <DataTable columns={columns} data={apprenants} />}

      <ConfirmDialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null) }}
        title="Supprimer l'apprenant" description="Êtes-vous sûr de vouloir supprimer cet apprenant ?"
        confirmLabel="Supprimer" variant="danger" onConfirm={handleDelete} />
    </div>
  )
}
