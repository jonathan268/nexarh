import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Plus, AlertTriangle, CheckCircle, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { addDays } from 'date-fns'
import type { Intern } from '../../types/electron.d'

export default function InternsPage() {
  const navigate = useNavigate()
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [completeId, setCompleteId] = useState<number | null>(null)
  const [completeNote, setCompleteNote] = useState('')

  const exportData = async () => {
    const result = await window.electronAPI.export.interns()
    if (result.success) {
      toast.success('Export réussi')
    } else {
      toast.error(result.error)
    }
  }

  const fetchInterns = async () => {
    setLoading(true)
    const result = await window.electronAPI.interns.getAll()
    if (result.success) {
      setInterns(result.data)
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInterns()
  }, [])

  const handleGenerateCertificate = async (internId: number) => {
    const result = await window.electronAPI.internPdf.generateCertificate(internId)
    if (result.success) {
      toast.success('Attestation générée avec succès')
    } else {
      toast.error(result.error)
    }
  }

  const handleComplete = async () => {
    if (!completeId || !completeNote) return
    const note = parseFloat(completeNote)
    if (isNaN(note) || note < 0 || note > 20) {
      toast.error('La note doit être entre 0 et 20')
      return
    }
    const result = await window.electronAPI.interns.complete(completeId, note)
    if (result.success) {
      toast.success('Stage terminé avec succès')
      setCompleteId(null)
      setCompleteNote('')
      fetchInterns()
    } else {
      toast.error(result.error)
    }
  }

  const columns = [
    { key: 'internNumber', header: 'Matricule' },
    {
      key: 'fullName',
      header: 'Nom complet',
      render: (i: Intern) => (
        <span className="font-semibold">{i.firstName} {i.lastName}</span>
      )
    },
    { key: 'schoolName', header: 'École' },
    { key: 'startDate', header: 'Début stage' },
    { key: 'endDate', header: 'Fin stage' },
    {
      key: 'allowance',
      header: 'Allocation',
      render: (i: Intern) => (
        <span className="font-mono">{(i.monthlyAllowance || 0).toLocaleString()} XAF</span>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      render: (i: Intern) => {
        const isEndingSoon = i.status === 'actif' && addDays(new Date(), 7) >= new Date(i.endDate)
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={i.status} />
            {isEndingSoon && (
              <span className="flex items-center text-xs text-warning font-medium">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Fin proche
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (i: Intern) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/interns/${i.id}/edit`)}>
            Modifier
          </Button>
          {i.status === 'actif' && (
            <Button variant="secondary" size="sm" onClick={() => { setCompleteId(i.id); setCompleteNote('') }}>
              <CheckCircle className="h-4 w-4 mr-1" /> Terminer
            </Button>
          )}
          {i.status === 'termine' && (
            <Button variant="secondary" size="sm" onClick={() => handleGenerateCertificate(i.id)}>
              <FileText className="h-4 w-4 mr-1" /> Certificat
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Stagiaires"
        description="Gestion des stagiaires et conventions"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => navigate('/interns/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau stagiaire
            </Button>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : interns.length === 0 ? (
        <EmptyState
          title="Aucun stagiaire"
          description="Ajoutez votre premier stagiaire"
          action={
            <Button onClick={() => navigate('/interns/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau stagiaire
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={interns} />
      )}

      <ConfirmDialog
        open={completeId !== null}
        onOpenChange={(open) => { if (!open) setCompleteId(null) }}
        title="Terminer le stage"
        description={
          <div className="space-y-3">
            <p>Attribuer une note d'évaluation (0-20) :</p>
            <Input
              type="number"
              min="0"
              max="20"
              step="0.5"
              placeholder="Note sur 20"
              value={completeNote}
              onChange={(e) => setCompleteNote(e.target.value)}
              autoFocus
            />
          </div>
        }
        confirmLabel="Terminer le stage"
        variant="primary"
        onConfirm={handleComplete}
        disabled={!completeNote}
      />
    </div>
  )
}
