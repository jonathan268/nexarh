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
import { Check, X, Plus, Trash2, Download, Calendar, List, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import type { LeaveRequest, Employee, LeaveType, EmployeeLeaveBalance } from '../../types/electron.d'

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false)
  const [allBalances, setAllBalances] = useState<EmployeeLeaveBalance[]>([])

  const exportData = async () => {
    const result = await window.electronAPI.export.leaves()
    if (result.success) {
      toast.success('Export réussi')
    } else {
      toast.error(result.error)
    }
  }

  const [form, setForm] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    totalDays: '',
    reason: ''
  })

  const fetchLeaves = async () => {
    setLoading(true)
    const [leavesRes, employeesRes, leaveTypesRes] = await Promise.all([
      window.electronAPI.leaves.getAll(),
      window.electronAPI.employees.getAll(),
      window.electronAPI.leaves.getLeaveTypes()
    ])
    if (leavesRes.success) setLeaves(leavesRes.data)
    if (employeesRes.success) setEmployees(employeesRes.data)
    if (leaveTypesRes.success) setLeaveTypes(leaveTypesRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleApprove = async (id: number) => {
    const result = await window.electronAPI.leaves.approve(id)
    if (result.success) {
      toast.success('Congé approuvé')
      fetchLeaves()
    } else {
      toast.error(result.error)
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt('Motif du refus :')
    if (!reason) return
    const result = await window.electronAPI.leaves.reject(id, reason)
    if (result.success) {
      toast.success('Congé refusé')
      fetchLeaves()
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await window.electronAPI.leaves.delete(deleteId)
    if (result.success) {
      toast.success('Demande supprimée')
      setDeleteId(null)
      fetchLeaves()
    } else {
      toast.error(result.error)
    }
  }

  const handleOpenBalances = async () => {
    const year = new Date().getFullYear()
    const result = await window.electronAPI.leaveBalance.getAll(year)
    if (result.success) {
      setAllBalances(result.data)
      setBalanceDialogOpen(true)
    } else {
      toast.error(result.error)
    }
  }

  const handleCreate = async () => {
    if (!form.employeeId || !form.leaveTypeId || !form.startDate || !form.endDate || !form.totalDays) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    const result = await window.electronAPI.leaves.create({
      employeeId: parseInt(form.employeeId),
      leaveTypeId: parseInt(form.leaveTypeId),
      startDate: form.startDate,
      endDate: form.endDate,
      totalDays: parseInt(form.totalDays),
      reason: form.reason || null
    })
    if (result.success) {
      toast.success('Demande de congé créée')
      setDialogOpen(false)
      setForm({ employeeId: '', leaveTypeId: '', startDate: '', endDate: '', totalDays: '', reason: '' })
      fetchLeaves()
    } else {
      toast.error(result.error)
    }
  }

  const getEmployeeName = (id: number) => {
    const emp = employees.find((e) => e.id === id)
    return emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${id}`
  }

  const getLeaveEmployeeIdsForDay = (day: number, month: number, year: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return leaves
      .filter(l => l.status === 'approuve' && dateStr >= l.startDate && dateStr <= l.endDate)
      .map(l => l.employeeId)
  }

  const renderCalendar = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const today = now.getDate()

    return (
      <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6">
        <h3 className="text-lg font-bold text-text-primary capitalize mb-4">{monthName}</h3>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-text-muted py-2">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(day => {
            const empIds = getLeaveEmployeeIdsForDay(day, month, year)
            const isToday = day === today
            return (
              <div
                key={day}
                className={`min-h-[80px] p-1 rounded-lg border text-xs ${
                  isToday ? 'border-primary bg-primaryLight' : 'border-border'
                }`}
              >
                <div className={`font-semibold mb-1 ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                  {day}
                </div>
                {empIds.map(id => (
                  <div key={id} className="text-[10px] leading-tight text-text-secondary truncate bg-warningLight rounded px-1 mb-0.5">
                    {getEmployeeName(id)}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const columns = [
    {
      key: 'employeeId',
      header: 'Employé',
      render: (l: LeaveRequest) => (
        <span className="font-medium">{getEmployeeName(l.employeeId)}</span>
      )
    },
    { key: 'startDate', header: 'Date début' },
    { key: 'endDate', header: 'Date fin' },
    { key: 'totalDays', header: 'Jours', render: (l: LeaveRequest) => <span className="font-semibold">{l.totalDays}j</span> },
    { key: 'reason', header: 'Motif', render: (l: LeaveRequest) => l.reason || '-' },
    { key: 'status', header: 'Statut', render: (l: LeaveRequest) => <StatusBadge status={l.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (l: LeaveRequest) => (
        <div className="flex items-center justify-end gap-1">
          {l.status === 'en_attente' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleApprove(l.id)}>
                <Check className="h-4 w-4 text-success" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleReject(l.id)}>
                <X className="h-4 w-4 text-danger" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(l.id)}>
            <Trash2 className="h-4 w-4 text-text-muted" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Congés"
        description="Gestion des demandes de congés et absences"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleOpenBalances}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Soldes
            </Button>
            <Button variant="secondary" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle demande de congé</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Employé *</Label>
                  <Select value={form.employeeId} onValueChange={(v) => setForm((f) => ({ ...f, employeeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.firstName} {emp.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type de congé *</Label>
                  <Select value={form.leaveTypeId} onValueChange={(v) => setForm((f) => ({ ...f, leaveTypeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((lt) => (
                        <SelectItem key={lt.id} value={lt.id.toString()}>
                          {lt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date début *</Label>
                    <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date fin *</Label>
                    <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nombre de jours *</Label>
                  <Input type="number" min="1" value={form.totalDays} onChange={(e) => setForm((f) => ({ ...f, totalDays: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Motif</Label>
                  <textarea
                    className="w-full min-h-[60px] px-3 py-2 rounded-xl border-2 border-border bg-white text-sm outline-none focus:border-primary transition-colors resize-y"
                    value={form.reason}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    placeholder="Motif de la demande"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la demande
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        }
      />

      <div className="flex gap-2 mb-4">
        <Button variant={viewMode === 'list' ? 'default' : 'secondary'} size="sm" onClick={() => setViewMode('list')}>
          <List className="h-4 w-4 mr-1" /> Liste
        </Button>
        <Button variant={viewMode === 'calendar' ? 'default' : 'secondary'} size="sm" onClick={() => setViewMode('calendar')}>
          <Calendar className="h-4 w-4 mr-1" /> Calendrier
        </Button>
      </div>

      {viewMode === 'calendar' ? (
        renderCalendar()
      ) : loading ? (
        <LoadingSpinner />
      ) : leaves.length === 0 ? (
        <EmptyState
          title="Aucune demande"
          description="Aucune demande de congé"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={leaves} />
      )}

      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Soldes de congés {new Date().getFullYear()}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 px-3 font-semibold text-text-primary">Employé</th>
                  {allBalances[0]?.balances.map(b => (
                    <th key={b.leaveTypeId} className="text-center py-2 px-3 font-semibold text-text-primary">{b.leaveTypeName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allBalances.map(emp => (
                  <tr key={emp.employeeId} className="border-b border-border hover:bg-background">
                    <td className="py-2 px-3 font-medium">{emp.employeeName}</td>
                    {emp.balances.map(b => (
                      <td key={b.leaveTypeId} className="text-center py-2 px-3">
                        <span className={b.daysRemaining <= 0 ? 'text-danger font-semibold' : ''}>
                          {b.daysUsed} / {b.daysAllocated}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                {allBalances.length === 0 && (
                  <tr>
                    <td colSpan={allBalances[0]?.balances.length + 1 || 1} className="text-center py-4 text-text-muted">
                      Aucun solde disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Supprimer la demande"
        description="Êtes-vous sûr de vouloir supprimer cette demande de congé ?"
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}
