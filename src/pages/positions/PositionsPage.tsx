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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog'
import { Plus, Save, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Position, Department } from '../../types/electron.d'

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editPosition, setEditPosition] = useState<Position | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDepartmentId, setNewDepartmentId] = useState('')
  const [newBaseSalary, setNewBaseSalary] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const [posResult, deptResult] = await Promise.all([
      window.electronAPI.positions.getAll(),
      window.electronAPI.departments.getAll()
    ])
    if (posResult.success) {
      setPositions(posResult.data)
    }
    if (deptResult.success) {
      setDepartments(deptResult.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error('Le titre est requis')
      return
    }
    const result = await window.electronAPI.positions.create({
      title: newTitle,
      departmentId: newDepartmentId ? Number(newDepartmentId) : undefined,
      baseSalary: Number(newBaseSalary) || 0
    })
    if (result.success) {
      toast.success('Poste créé')
      setDialogOpen(false)
      setNewTitle('')
      setNewDepartmentId('')
      setNewBaseSalary('')
      fetchData()
    } else {
      toast.error(result.error)
    }
  }

  const handleEdit = async () => {
    if (!editPosition || !editPosition.title.trim()) {
      toast.error('Le titre est requis')
      return
    }
    const result = await window.electronAPI.positions.update(editPosition.id, {
      title: editPosition.title,
      departmentId: editPosition.departmentId,
      baseSalary: editPosition.baseSalary
    })
    if (result.success) {
      toast.success('Poste modifié')
      setEditDialogOpen(false)
      setEditPosition(null)
      fetchData()
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await window.electronAPI.positions.delete(deleteId)
    if (result.success) {
      toast.success('Poste supprimé')
      setDeleteId(null)
      fetchData()
    } else {
      toast.error(result.error)
    }
  }

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('fr-FR').format(salary) + ' XAF'
  }

  const columns = [
    { key: 'title', header: 'Titre', render: (p: Position) => <span className="font-semibold">{p.title}</span> },
    { key: 'departmentName', header: 'Département', render: (p: Position) => p.departmentName || <span className="text-text-muted italic">Non assigné</span> },
    { key: 'baseSalary', header: 'Salaire de base', render: (p: Position) => formatSalary(p.baseSalary) },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (p: Position) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setEditPosition(p); setEditDialogOpen(true) }}>
            <Pencil className="h-4 w-4 text-text-secondary" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Postes"
        description="Gestion des postes et salaires"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau poste
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau poste</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Développeur Full Stack" />
                </div>
                <div className="space-y-2">
                  <Label>Département</Label>
                  <Select value={newDepartmentId} onValueChange={setNewDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Salaire de base *</Label>
                  <Input
                    type="number"
                    value={newBaseSalary}
                    onChange={(e) => setNewBaseSalary(e.target.value)}
                    placeholder="Ex: 500000"
                  />
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
      ) : positions.length === 0 ? (
        <EmptyState
          title="Aucun poste"
          description="Créez votre premier poste"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau poste
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={positions} />
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le poste</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                value={editPosition?.title || ''}
                onChange={(e) => setEditPosition((prev) => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="Titre du poste"
              />
            </div>
            <div className="space-y-2">
              <Label>Département</Label>
              <Select
                value={String(editPosition?.departmentId ?? '')}
                onValueChange={(val) => setEditPosition((prev) => prev ? { ...prev, departmentId: val ? Number(val) : null } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Salaire de base *</Label>
              <Input
                type="number"
                value={editPosition?.baseSalary ?? ''}
                onChange={(e) => setEditPosition((prev) => prev ? { ...prev, baseSalary: Number(e.target.value) } : null)}
                placeholder="Salaire de base"
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
        title="Supprimer le poste"
        description="Êtes-vous sûr de vouloir supprimer ce poste ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
