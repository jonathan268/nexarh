import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import StatusBadge from '../../components/shared/StatusBadge'
import { Button } from '../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog'
import { ClipboardList, Clock, UserCheck, UserX, Download, Filter } from 'lucide-react'
import { toast } from 'sonner'
import type { AttendanceRecord, MonthlyAttendanceSummary, Employee } from '../../types/electron.d'

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [summary, setSummary] = useState<MonthlyAttendanceSummary[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('summary')
  const [summaryDialog, setSummaryDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const fetchData = async () => {
    setLoading(true)
    const [empRes, summaryRes] = await Promise.all([
      window.electronAPI.employees.getAll({ status: 'actif' }),
      window.electronAPI.attendance.monthlySummary(month, year)
    ])
    if (empRes.success) setEmployees(empRes.data)
    if (summaryRes.success) setSummary(summaryRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [month, year])

  const handleCheckIn = async (employeeId: number) => {
    setCheckingIn(true)
    const result = await window.electronAPI.attendance.checkIn(employeeId)
    if (result.success) {
      toast.success('Pointage d\'entrée enregistré')
      fetchData()
    } else {
      toast.error(result.error)
    }
    setCheckingIn(false)
  }

  const handleCheckOut = async (employeeId: number) => {
    const result = await window.electronAPI.attendance.checkOut(employeeId)
    if (result.success) {
      toast.success('Pointage de sortie enregistré')
      fetchData()
    } else {
      toast.error(result.error)
    }
  }

  const summaryColumns = [
    { key: 'employeeName', header: 'Employé', render: (s: MonthlyAttendanceSummary) => <span className="font-medium">{s.employeeName}</span> },
    { key: 'present', header: 'Présences', render: (s: MonthlyAttendanceSummary) => <span className="font-mono text-green-600 font-semibold">{s.present}</span> },
    { key: 'absent', header: 'Absences', render: (s: MonthlyAttendanceSummary) => <span className="font-mono text-red-500 font-semibold">{s.absent}</span> },
    { key: 'late', header: 'Retards', render: (s: MonthlyAttendanceSummary) => <span className="font-mono text-orange-500 font-semibold">{s.late}</span> },
    { key: 'totalDays', header: 'Total jours', render: (s: MonthlyAttendanceSummary) => <span className="font-mono">{s.totalDays}</span> },
    { key: 'totalHours', header: 'Heures', render: (s: MonthlyAttendanceSummary) => <span className="font-mono">{s.totalHours.toFixed(1)}h</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s: MonthlyAttendanceSummary) => (
        <div className="flex gap-1 justify-end">
          <Button variant="secondary" size="sm" onClick={() => handleCheckIn(s.employeeId)} disabled={checkingIn}>
            <UserCheck className="h-4 w-4 mr-1" /> Entrée
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleCheckOut(s.employeeId)}>
            <UserX className="h-4 w-4 mr-1" /> Sortie
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Pointage"
        description="Gestion des présences et pointages"
        actions={
          <div className="flex gap-2">
            <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[year - 1, year, year + 1].map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="flex gap-2 mb-4">
        <Button variant={viewMode === 'summary' ? 'default' : 'secondary'} size="sm" onClick={() => setViewMode('summary')}>
          <ClipboardList className="h-4 w-4 mr-1" /> Résumé mensuel
        </Button>
        <Button variant={viewMode === 'list' ? 'default' : 'secondary'} size="sm" onClick={() => setViewMode('list')}>
          <Clock className="h-4 w-4 mr-1" /> Détails
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : viewMode === 'summary' ? (
        summary.length === 0 ? (
          <EmptyState title="Aucune donnée" description="Aucun pointage pour ce mois" />
        ) : (
          <DataTable columns={summaryColumns} data={summary} />
        )
      ) : (
        <div>
          {records.length === 0 ? (
            <EmptyState title="Aucun détail" description="Aucun pointage individuel" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-border">
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary">Employé</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary">Entrée</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary">Sortie</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary">Heures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map(r => (
                    <tr key={r.id} className="bg-white hover:bg-primaryLight/30">
                      <td className="px-4 py-3 text-sm font-medium">{r.employeeName}</td>
                      <td className="px-4 py-3 text-sm">{r.date}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-sm font-mono">{r.checkIn || '-'}</td>
                      <td className="px-4 py-3 text-sm font-mono">{r.checkOut || '-'}</td>
                      <td className="px-4 py-3 text-sm font-mono">{r.hoursWorked ? `${r.hoursWorked}h` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
