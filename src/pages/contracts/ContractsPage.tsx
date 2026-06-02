import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/ui/button'
import { Plus, AlertTriangle, Ban, Trash2, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'
import type { Contract, Employee } from '../../types/electron.d'

export default function ContractsPage() {
  const navigate = useNavigate()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [terminateId, setTerminateId] = useState<number | null>(null)
  const [terminateReason, setTerminateReason] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchContracts = async () => {
    setLoading(true)
    const [contractsRes, employeesRes] = await Promise.all([
      window.electronAPI.contracts.getAll(),
      window.electronAPI.employees.getAll()
    ])
    if (contractsRes.success) {
      setContracts(contractsRes.data)
    } else {
      toast.error(contractsRes.error)
    }
    if (employeesRes.success) {
      setEmployees(employeesRes.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const handleTerminate = async () => {
    if (!terminateId || !terminateReason.trim()) return
    const result = await window.electronAPI.contracts.terminate(terminateId, terminateReason)
    if (result.success) {
      toast.success('Contrat résilié avec succès')
      setTerminateId(null)
      setTerminateReason('')
      fetchContracts()
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await window.electronAPI.contracts.delete(deleteId)
    if (result.success) {
      toast.success('Contrat supprimé avec succès')
      setDeleteId(null)
      fetchContracts()
    } else {
      toast.error(result.error)
    }
  }

  const exportData = async () => {
    const result = await window.electronAPI.export.contracts()
    if (result.success) {
      toast.success('Export réussi')
    } else {
      toast.error(result.error)
    }
  }

  const getEmployeeName = (id: number) => {
    const emp = employees.find((e) => e.id === id)
    return emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${id}`
  }

  const columns = [
    {
      key: 'employeeId',
      header: 'Employé',
      render: (c: Contract) => (
        <span className="font-medium">{getEmployeeName(c.employeeId)}</span>
      )
    },
    {
      key: 'contractType',
      header: 'Type',
      render: (c: Contract) => (
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-primaryLight text-primary">
          {c.contractType}
        </span>
      )
    },
    { key: 'startDate', header: 'Date début' },
    { key: 'endDate', header: 'Date fin', render: (c: Contract) => c.endDate || 'N/A' },
    {
      key: 'grossSalary',
      header: 'Salaire brut',
      render: (c: Contract) => (
        <span className="font-mono font-medium">{c.grossSalary.toLocaleString()} XAF</span>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      render: (c: Contract) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={c.status} />
          {c.isExpiringSoon && c.status === 'actif' && (
            <span className="flex items-center text-xs text-warning font-medium">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Expire bientôt
            </span>
          )}
        </div>
      )
    },
    {
      key: 'documentPath',
      header: 'Document',
      render: (c: Contract) => (
        c.documentPath ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-successLight text-success">
            <FileText className="h-3 w-3" /> Document
          </span>
        ) : (
          <span className="text-text-muted text-sm">-</span>
        )
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (c: Contract) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/contracts/${c.id}/edit`)}>
            Modifier
          </Button>
          {c.status === 'actif' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setTerminateId(c.id); setTerminateReason('') }}>
                <Ban className="h-4 w-4 text-danger" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}>
                <Trash2 className="h-4 w-4 text-text-muted" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Contrats"
        description="Gestion des contrats des employés"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => navigate('/contracts/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contrat
            </Button>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : contracts.length === 0 ? (
        <EmptyState
          title="Aucun contrat"
          description="Créez votre premier contrat"
          action={
            <Button onClick={() => navigate('/contracts/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contrat
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={contracts} />
      )}

      <ConfirmDialog
        open={terminateId !== null}
        onOpenChange={(open) => { if (!open) setTerminateId(null) }}
        title="Résilier le contrat"
        description={
          <div className="space-y-3">
            <p>Êtes-vous sûr de vouloir résilier ce contrat ?</p>
            <input
              className="w-full px-3 py-2 rounded-xl border-2 border-border bg-white text-sm outline-none focus:border-primary transition-colors"
              placeholder="Motif de la résiliation *"
              value={terminateReason}
              onChange={(e) => setTerminateReason(e.target.value)}
              autoFocus
            />
          </div>
        }
        confirmLabel="Résilier"
        variant="danger"
        onConfirm={handleTerminate}
        disabled={!terminateReason.trim()}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Supprimer le contrat"
        description="Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
