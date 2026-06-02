import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog'
import { Plus, Play, CheckCircle, Trash2, FileDown, UserPlus, Eye, Pencil, X, Download, Gift, CircleDollarSign } from 'lucide-react'
import { toast } from 'sonner'
import type { PayrollPeriod, Payslip, Employee } from '../../types/electron.d'
import EditPayslipDialog from '../../components/payroll/EditPayslipDialog'

export default function PayrollPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [payslipsDialog, setPayslipsDialog] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null)
  const [payslips, setPayslips] = useState<(Payslip & { employeeName?: string })[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [addPayslipDialog, setAddPayslipDialog] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [generatingPdf, setGeneratingPdf] = useState<number | null>(null)
  const [editPayslip, setEditPayslip] = useState<Payslip | null>(null)
  const [thirteenthMonthDialog, setThirteenthMonthDialog] = useState(false)
  const [thirteenthMonthData, setThirteenthMonthData] = useState<Array<{
    employeeId: number
    employeeName: string
    baseSalary: number
    monthsWorked: number
    thirteenthMonth: number
  }>>([])
  const [employerCosts, setEmployerCosts] = useState<{
    totalGross: number
    totalCnpsEmployer: number
    totalNet: number
    totalEmployeeDeductions: number
    totalEmployerCost: number
  } | null>(null)

  const exportData = async () => {
    const result = await window.electronAPI.export.payslips(selectedPeriod?.id)
    if (result.success) {
      toast.success('Export réussi')
    } else {
      toast.error(result.error)
    }
  }

  const fetchPeriods = async () => {
    setLoading(true)
    const [periodsRes, employeesRes] = await Promise.all([
      window.electronAPI.payroll.getPeriods(),
      window.electronAPI.employees.getAll()
    ])
    if (periodsRes.success) setPeriods(periodsRes.data)
    if (employeesRes.success) setEmployees(employeesRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPeriods()
  }, [])

  const createPeriod = async () => {
    const now = new Date()
    const result = await window.electronAPI.payroll.createPeriod({
      periodMonth: now.getMonth() + 1,
      periodYear: now.getFullYear()
    })
    if (result.success) {
      toast.success('Période créée avec succès')
      fetchPeriods()
    } else {
      toast.error(result.error)
    }
  }

  const runPayroll = async (periodId: number) => {
    toast.info('Calcul de la paie en cours...')
    const result = await window.electronAPI.payroll.runPayroll(periodId)
    if (result.success) {
      toast.success(`Paie calculée : ${result.data.totalEmployees} employés`)
      fetchPeriods()
    } else {
      toast.error(result.error)
    }
  }

  const runPayrollForEmployee = async () => {
    if (!selectedPeriod || !selectedEmployeeId) return
    toast.info('Génération de la fiche de paie...')
    const result = await window.electronAPI.payroll.runPayrollForEmployee(
      selectedPeriod.id,
      parseInt(selectedEmployeeId)
    )
    if (result.success) {
      toast.success('Fiche de paie générée')
      setAddPayslipDialog(false)
      setSelectedEmployeeId('')
      loadPayslips(selectedPeriod.id)
      fetchPeriods()
    } else {
      toast.error(result.error)
    }
  }

  const validatePeriod = async (periodId: number) => {
    const result = await window.electronAPI.payroll.validatePeriod(periodId)
    if (result.success) {
      toast.success('Période validée avec succès')
      fetchPeriods()
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await window.electronAPI.payroll.deletePeriod(deleteId)
    if (result.success) {
      toast.success('Période supprimée')
      setDeleteId(null)
      fetchPeriods()
    } else {
      toast.error(result.error)
    }
    setDeleteId(null)
  }

  const loadPayslips = async (periodId: number) => {
    const result = await window.electronAPI.payroll.getPayslips(periodId)
    if (result.success) {
      const enriched = result.data.map((p) => {
        const emp = employees.find((e) => e.id === p.employeeId)
        return {
          ...p,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${p.employeeId}`
        }
      })
      setPayslips(enriched)
    }
  }

  const openPayslips = (period: PayrollPeriod) => {
    setSelectedPeriod(period)
    loadPayslips(period.id)
    setPayslipsDialog(true)
  }

  const generatePdf = async (payslipId: number) => {
    setGeneratingPdf(payslipId)
    const result = await window.electronAPI.payroll.generatePayslipPdf(payslipId)
    if (result.success) {
      toast.success('PDF généré avec succès')
    } else {
      toast.error(result.error)
    }
    setGeneratingPdf(null)
  }

  const markAsPaid = async (periodId: number) => {
    const result = await window.electronAPI.payroll.markAsPaid(periodId)
    if (result.success) {
      toast.success('Période marquée comme payée')
      fetchPeriods()
    } else {
      toast.error(result.error)
    }
  }

  const generateBatchPdf = async (periodId: number) => {
    toast.info('Génération des PDFs en cours...')
    const result = await window.electronAPI.payroll.generateBatchPayslipPdf(periodId)
    if (result.success) {
      toast.success(`${result.data} PDF(s) généré(s) avec succès`)
    } else {
      toast.error(result.error)
    }
  }

  const loadThirteenthMonth = async () => {
    const year = new Date().getFullYear()
    const result = await window.electronAPI.payroll.calculateAllThirteenthMonth(year)
    if (result.success) {
      setThirteenthMonthData(result.data)
      setThirteenthMonthDialog(true)
    } else {
      toast.error(result.error)
    }
  }

  const loadEmployerCosts = async (periodId: number) => {
    const result = await window.electronAPI.payroll.getEmployerCosts(periodId)
    if (result.success) {
      setEmployerCosts(result.data)
    }
  }

  const openPayslipsWithCosts = (period: PayrollPeriod) => {
    setSelectedPeriod(period)
    loadPayslips(period.id)
    loadEmployerCosts(period.id)
    setPayslipsDialog(true)
  }

  const getEmployeeName = (id: number) => {
    const emp = employees.find((e) => e.id === id)
    return emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${id}`
  }

  const periodColumns = [
    {
      key: 'periodMonth',
      header: 'Période',
      render: (p: PayrollPeriod) => (
        <span className="font-semibold">{p.periodMonth.toString().padStart(2, '0')}/{p.periodYear}</span>
      )
    },
    {
      key: 'totalGross',
      header: 'Brut total',
      render: (p: PayrollPeriod) => (
        <span className="font-mono">{(p.totalGross || 0).toLocaleString()} XAF</span>
      )
    },
    {
      key: 'totalNet',
      header: 'Net total',
      render: (p: PayrollPeriod) => (
        <span className="font-mono font-semibold text-primary">{(p.totalNet || 0).toLocaleString()} XAF</span>
      )
    },
    { key: 'status', header: 'Statut', render: (p: PayrollPeriod) => <StatusBadge status={p.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (p: PayrollPeriod) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="secondary" size="sm" onClick={() => openPayslipsWithCosts(p)}>
            <Eye className="h-4 w-4 mr-1" /> Paiés
          </Button>
          {p.status === 'brouillon' && (
            <>
              <Button variant="secondary" size="sm" onClick={() => runPayroll(p.id)}>
                <Play className="h-4 w-4 mr-1" /> Calculer
              </Button>
              <Button variant="secondary" size="sm" onClick={() => validatePeriod(p.id)}>
                <CheckCircle className="h-4 w-4 mr-1" /> Valider
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </>
          )}
          {p.status === 'valide' && (
            <>
              <Button variant="secondary" size="sm" onClick={() => markAsPaid(p.id)}>
                <CheckCircle className="h-4 w-4 mr-1" /> Marquer payé
              </Button>
              <Button variant="secondary" size="sm" onClick={() => generateBatchPdf(p.id)}>
                <FileDown className="h-4 w-4 mr-1" /> PDFs
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  const payslipColumns = [
    {
      key: 'employeeName',
      header: 'Employé',
      render: (p: Payslip & { employeeName?: string }) => (
        <span className="font-medium">{p.employeeName}</span>
      )
    },
    {
      key: 'baseSalary',
      header: 'Salaire base',
      render: (p: Payslip) => <span className="font-mono">{p.baseSalary.toLocaleString()} XAF</span>
    },
    {
      key: 'grossSalary',
      header: 'Brut',
      render: (p: Payslip) => <span className="font-mono">{p.grossSalary.toLocaleString()} XAF</span>
    },
    {
      key: 'totalDeductions',
      header: 'Déductions',
      render: (p: Payslip) => <span className="font-mono text-danger">{p.totalDeductions.toLocaleString()} XAF</span>
    },
    {
      key: 'netSalary',
      header: 'Net à payer',
      render: (p: Payslip) => <span className="font-mono font-bold text-primary">{p.netSalary.toLocaleString()} XAF</span>
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p: Payslip) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditPayslip(p)}
          >
            <Pencil className="h-4 w-4 mr-1" /> Modifier
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => generatePdf(p.id)}
            disabled={generatingPdf === p.id}
          >
            <FileDown className="h-4 w-4 mr-1" />
            {generatingPdf === p.id ? '...' : 'PDF'}
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Paie"
        description="Gestion des périodes de paie et bulletins de salaire"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={loadThirteenthMonth}>
              <Gift className="h-4 w-4 mr-2" />
              13ème mois
            </Button>
            <Button variant="secondary" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={createPeriod}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle période
            </Button>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : periods.length === 0 ? (
        <EmptyState
          title="Aucune période de paie"
          description="Créez votre première période de paie"
          action={
            <Button onClick={createPeriod}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une période
            </Button>
          }
        />
      ) : (
        <DataTable columns={periodColumns} data={periods} />
      )}

      {/* Payslips dialog */}
      <Dialog open={payslipsDialog} onOpenChange={setPayslipsDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Fiches de paie - {selectedPeriod?.periodMonth.toString().padStart(2, '0')}/{selectedPeriod?.periodYear}
              </DialogTitle>
              {selectedPeriod?.status === 'brouillon' && (
                <Button variant="secondary" size="sm" onClick={() => setAddPayslipDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-1" /> Ajouter un employé
                </Button>
              )}
            </div>
          </DialogHeader>

          {payslips.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              {selectedPeriod?.status === 'brouillon'
                ? 'Aucune fiche de paie pour cette période. Cliquez sur "Calculer" dans la liste ou ajoutez un employé manuellement.'
                : 'Aucune fiche de paie générée pour cette période.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-border">
                    {payslipColumns.map((col) => (
                      <th key={col.key} className={`px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider ${col.className || ''}`}>
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payslips.map((p) => (
                    <tr key={p.id} className="bg-white hover:bg-primaryLight/30 transition-colors">
                      {payslipColumns.map((col) => (
                        <td key={col.key} className={`px-4 py-3 text-sm text-text-primary ${col.className || ''}`}>
                          {col.render ? col.render(p) : (p as any)[col.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {employerCosts && payslips.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-border">
              <h4 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">
                <CircleDollarSign className="h-4 w-4 inline mr-1" />
                Coûts employeur
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-text-secondary">Salaire brut total</p>
                  <p className="font-mono font-semibold">{employerCosts.totalGross.toLocaleString()} XAF</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">CNPS employeur</p>
                  <p className="font-mono font-semibold">{employerCosts.totalCnpsEmployer.toLocaleString()} XAF</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Déductions employé</p>
                  <p className="font-mono font-semibold">{employerCosts.totalEmployeeDeductions.toLocaleString()} XAF</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Net total</p>
                  <p className="font-mono font-semibold text-primary">{employerCosts.totalNet.toLocaleString()} XAF</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Coût total employeur</p>
                  <p className="font-mono font-bold text-danger">{employerCosts.totalEmployerCost.toLocaleString()} XAF</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add employee payslip dialog */}
      <Dialog open={addPayslipDialog} onOpenChange={setAddPayslipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un employé à la paie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employé *</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un employé" /></SelectTrigger>
                <SelectContent>
                  {employees.filter((e) => e.status === 'actif').map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runPayrollForEmployee} className="w-full" disabled={!selectedEmployeeId}>
              <Plus className="h-4 w-4 mr-2" />
              Générer la fiche de paie
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit payslip dialog */}
      {editPayslip && (
        <EditPayslipDialog
          open={editPayslip !== null}
          onOpenChange={(open) => { if (!open) setEditPayslip(null) }}
          payslip={editPayslip}
          employeeName={
            employees.find((e) => e.id === editPayslip.employeeId)
              ? `${employees.find((e) => e.id === editPayslip.employeeId)!.firstName} ${employees.find((e) => e.id === editPayslip.employeeId)!.lastName}`
              : `ID: ${editPayslip.employeeId}`
          }
          onSaved={() => {
            setEditPayslip(null)
            if (selectedPeriod) loadPayslips(selectedPeriod.id)
            fetchPeriods()
          }}
        />
      )}

      {/* 13ème mois dialog */}
      <Dialog open={thirteenthMonthDialog} onOpenChange={setThirteenthMonthDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>13ème mois {new Date().getFullYear()}</DialogTitle>
          </DialogHeader>
          {thirteenthMonthData.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              Aucun employé actif trouvé.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-border">
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Employé</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Salaire base</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Mois travaillés</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">13ème mois</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {thirteenthMonthData.map((d) => (
                    <tr key={d.employeeId} className="bg-white hover:bg-primaryLight/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">{d.employeeName}</td>
                      <td className="px-4 py-3 text-sm font-mono">{d.baseSalary.toLocaleString()} XAF</td>
                      <td className="px-4 py-3 text-sm">{d.monthsWorked}</td>
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-primary">{d.thirteenthMonth.toLocaleString()} XAF</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-border">
                    <td className="px-4 py-3 text-sm font-bold">Total</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-primary">
                      {thirteenthMonthData.reduce((s, d) => s + d.thirteenthMonth, 0).toLocaleString()} XAF
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Supprimer la période"
        description="Êtes-vous sûr de vouloir supprimer cette période de paie ? Toutes les fiches de paie associées seront également supprimées."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
