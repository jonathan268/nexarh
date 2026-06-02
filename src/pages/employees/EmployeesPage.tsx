import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import SearchInput from '../../components/shared/SearchInput'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/ui/button'
import { Plus, Pencil, Trash2, Eye, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import type { Employee } from '../../types/electron.d'

export default function EmployeesPage() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const exportData = async () => {
    const result = await window.electronAPI.export.employees()
    if (result.success) {
      toast.success('Export réussi')
    } else {
      toast.error(result.error)
    }
  }

  const importEmployees = async () => {
    const result = await window.electronAPI.import.employees()
    if (result.success) {
      const { imported, errors } = result.data
      if (errors.length > 0) {
        toast.warning(`${imported} importé(s), ${errors.length} erreur(s)`)
      } else {
        toast.success(`${imported} employé(s) importé(s)`)
      }
      fetchEmployees()
    } else {
      toast.error(result.error)
    }
  }

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const result = await window.electronAPI.employees.getAll(search ? { search } : undefined)
    if (result.success) {
      setEmployees(result.data)
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }, [search])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await window.electronAPI.employees.delete(deleteId)
    if (result.success) {
      toast.success('Employé supprimé avec succès')
      fetchEmployees()
    } else {
      toast.error(result.error)
    }
    setDeleteId(null)
  }

  const columns = [
    { key: 'employeeNumber', header: 'Matricule' },
    {
      key: 'fullName',
      header: 'Nom & Prénom',
      render: (emp: Employee) => (
        <span className="font-semibold">{emp.firstName} {emp.lastName}</span>
      )
    },
    { key: 'email', header: 'Email' },
    {
      key: 'status',
      header: 'Statut',
      render: (emp: Employee) => <StatusBadge status={emp.status} />
    },
    {
      key: 'baseSalary',
      header: 'Salaire',
      render: (emp: Employee) => (
        <span className="font-mono font-semibold text-primary">
          {emp.baseSalary.toLocaleString()} XAF
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (emp: Employee) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/employees/${emp.id}`) }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/employees/${emp.id}/edit`) }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); setDeleteId(emp.id) }}
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Employés"
        description="Gérez tous les employés de l'entreprise"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={importEmployees}>
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
            <Button variant="secondary" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => navigate('/employees/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel employé
            </Button>
          </div>
        }
      />

      <div className="mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par nom, email, matricule..." />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : employees.length === 0 ? (
        <EmptyState
          title="Aucun employé"
          description="Commencez par ajouter votre premier employé"
          action={
            <Button onClick={() => navigate('/employees/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un employé
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={employees}
          onRowClick={(emp) => navigate(`/employees/${emp.id}`)}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Supprimer l'employé"
        description="Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
