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
import type { Formation } from '../../types/electron.d'

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState<Formation | null>(null)
  const [form, setForm] = useState({ name: '', description: '', duree: '', frais: '' })

  const fetchData = async () => {
    setLoading(true)
    const result = await window.electronAPI.formations.getAll()
    if (result.success) setFormations(result.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const resetForm = () => setForm({ name: '', description: '', duree: '', frais: '' })

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Le nom est requis'); return }
    const result = await window.electronAPI.formations.create({
      name: form.name, description: form.description || null,
      duree: form.duree || null, frais: parseFloat(form.frais) || 0
    })
    if (result.success) {
      toast.success('Formation créée'); setDialogOpen(false); resetForm(); fetchData()
    } else { toast.error(result.error) }
  }

  const handleEdit = async () => {
    if (!editItem || !editItem.name.trim()) { toast.error('Le nom est requis'); return }
    const result = await window.electronAPI.formations.update(editItem.id, {
      name: editItem.name, description: editItem.description,
      duree: editItem.duree, frais: editItem.frais, status: editItem.status
    })
    if (result.success) {
      toast.success('Formation modifiée'); setEditDialogOpen(false); setEditItem(null); fetchData()
    } else { toast.error(result.error) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await window.electronAPI.formations.delete(deleteId)
    if (result.success) { toast.success('Formation supprimée'); setDeleteId(null); fetchData() }
    else { toast.error(result.error) }
  }

  const columns = [
    { key: 'name', header: 'Nom', render: (f: Formation) => <span className="font-semibold">{f.name}</span> },
    { key: 'description', header: 'Description', render: (f: Formation) => f.description || '-' },
    { key: 'duree', header: 'Durée', render: (f: Formation) => f.duree || '-' },
    {
      key: 'frais', header: 'Frais', className: 'text-right',
      render: (f: Formation) => <span className="font-mono font-semibold">{f.frais.toLocaleString()} XAF</span>
    },
    {
      key: 'status', header: 'Statut', render: (f: Formation) => (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
          f.status === 'active' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
        }`}>{f.status === 'active' ? 'Active' : 'Inactive'}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', className: 'text-right',
      render: (f: Formation) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setEditItem(f); setEditDialogOpen(true) }}>
            <Pencil className="h-4 w-4 text-text-secondary" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(f.id)}>
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Formations"
        description="Gestion des formations proposées"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouvelle formation</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle formation</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Comptabilité avancée" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de la formation" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Durée</Label>
                    <Input value={form.duree} onChange={(e) => setForm({ ...form, duree: e.target.value })} placeholder="Ex: 3 mois" />
                  </div>
                  <div className="space-y-2">
                    <Label>Frais (XAF)</Label>
                    <Input type="number" min="0" value={form.frais} onChange={(e) => setForm({ ...form, frais: e.target.value })} placeholder="150000" />
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full"><Save className="h-4 w-4 mr-2" />Créer</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? <LoadingSpinner /> : formations.length === 0 ? (
        <EmptyState title="Aucune formation" description="Créez votre première formation"
          action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Nouvelle formation</Button>}
        />
      ) : <DataTable columns={columns} data={formations} />}

      <Dialog open={editDialogOpen} onOpenChange={(o) => { if (!o) setEditItem(null); setEditDialogOpen(o) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier la formation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={editItem?.name || ''} onChange={(e) => setEditItem((p) => p ? { ...p, name: e.target.value } : null)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editItem?.description || ''} onChange={(e) => setEditItem((p) => p ? { ...p, description: e.target.value } : null)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durée</Label>
                <Input value={editItem?.duree || ''} onChange={(e) => setEditItem((p) => p ? { ...p, duree: e.target.value } : null)} />
              </div>
              <div className="space-y-2">
                <Label>Frais (XAF)</Label>
                <Input type="number" min="0" value={editItem?.frais || ''} onChange={(e) => setEditItem((p) => p ? { ...p, frais: parseFloat(e.target.value) || 0 } : null)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <select value={editItem?.status || 'active'} onChange={(e) => setEditItem((p) => p ? { ...p, status: e.target.value } : null)}
                className="w-full h-10 rounded-lg border-2 border-border bg-white px-4 text-sm outline-none focus:border-primary">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Button onClick={handleEdit} className="w-full"><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null) }}
        title="Supprimer la formation" description="Êtes-vous sûr de vouloir supprimer cette formation ?"
        confirmLabel="Supprimer" variant="danger" onConfirm={handleDelete} />
    </div>
  )
}
