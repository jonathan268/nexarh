import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog'
import { Plus, Save, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatShortDate } from '../../lib/utils'
import type { Department } from '../../types/electron.d'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editDepartment, setEditDepartment] = useState<Department | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const fetchDepartments = async () => {
    setLoading(true)
    const result = await window.electronAPI.departments.getAll()
    if (result.success) {
      setDepartments(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Le nom est requis')
      return
    }
    const result = await window.electronAPI.departments.create({
      name: newName,
      description: newDescription
    })
    if (result.success) {
      toast.success('Département créé')
      setDialogOpen(false)
      setNewName('')
      setNewDescription('')
      fetchDepartments()
    } else {
      toast.error(result.error)
    }
  }

  const handleEdit = async () => {
    if (!editDepartment || !editDepartment.name.trim()) {
      toast.error('Le nom est requis')
      return
    }
    const result = await window.electronAPI.departments.update(editDepartment.id, {
      name: editDepartment.name,
      description: editDepartment.description
    })
    if (result.success) {
      toast.success('Département modifié')
      setEditDialogOpen(false)
      setEditDepartment(null)
      fetchDepartments()
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await window.electronAPI.departments.delete(deleteId)
    if (result.success) {
      toast.success('Département supprimé')
      setDeleteId(null)
      fetchDepartments()
    } else {
      toast.error(result.error)
    }
  }

  const columns = [
    { key: 'name', header: 'Nom', render: (d: Department) => <span className="font-semibold">{d.name}</span> },
    { key: 'description', header: 'Description', render: (d: Department) => d.description || <span className="text-text-muted italic">Aucune description</span> },
    { key: 'createdAt', header: 'Créé le', render: (d: Department) => <span className="text-sm text-text-secondary">{formatShortDate(d.createdAt)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (d: Department) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setEditDepartment(d); setEditDialogOpen(true) }}>
            <Pencil className="h-4 w-4 text-text-secondary" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(d.id)}>
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Départements"
        description="Gestion des départements et postes"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau département
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau département</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Ressources Humaines" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description du département" />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Créer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : departments.length === 0 ? (
        <EmptyState
          title="Aucun département"
          description="Créez votre premier département"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau département
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={departments} />
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le département</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={editDepartment?.name || ''}
                onChange={(e) => setEditDepartment((prev) => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Nom du département"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editDepartment?.description || ''}
                onChange={(e) => setEditDepartment((prev) => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Description du département"
              />
            </div>
            <Button onClick={handleEdit} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Supprimer le département"
        description="Êtes-vous sûr de vouloir supprimer ce département ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
