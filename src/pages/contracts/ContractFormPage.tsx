import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft, Upload } from 'lucide-react'
import type { Employee } from '../../types/electron.d'

export default function ContractFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])

  const [form, setForm] = useState({
    employeeId: '',
    contractType: 'CDI',
    startDate: '',
    endDate: '',
    durationMonths: '',
    grossSalary: '',
    netSalary: '',
    notes: '',
    documentPath: ''
  })

  useEffect(() => {
    window.electronAPI.employees.getAll().then((result) => {
      if (result.success) setEmployees(result.data)
    })
  }, [])

  useEffect(() => {
    if (isEditing) {
      setLoading(true)
      window.electronAPI.contracts.getAll().then((result) => {
        if (result.success) {
          const c = result.data.find((c) => c.id === parseInt(id!))
          if (c) {
            setForm({
              employeeId: c.employeeId.toString(),
              contractType: c.contractType,
              startDate: c.startDate,
              endDate: c.endDate || '',
              durationMonths: c.durationMonths?.toString() || '',
              grossSalary: c.grossSalary.toString(),
              netSalary: c.netSalary?.toString() || '',
              notes: c.notes || '',
              documentPath: c.documentPath || ''
            })
          }
        }
        setLoading(false)
      })
    }
  }, [id, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const data: Record<string, unknown> = {
      employeeId: parseInt(form.employeeId),
      contractType: form.contractType,
      startDate: form.startDate,
      grossSalary: parseFloat(form.grossSalary),
      notes: form.notes || null
    }
    if (form.endDate) data.endDate = form.endDate
    if (form.durationMonths) data.durationMonths = parseInt(form.durationMonths)
    if (form.netSalary) data.netSalary = parseFloat(form.netSalary)
    if (form.documentPath) data.documentPath = form.documentPath

    const result = isEditing
      ? await window.electronAPI.contracts.update(parseInt(id!), data)
      : await window.electronAPI.contracts.create(data)

    if (result.success) {
      toast.success(isEditing ? 'Contrat modifié avec succès' : 'Contrat créé avec succès')
      navigate('/contracts')
    } else {
      toast.error(result.error)
    }
    setSaving(false)
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleUploadDocument = async () => {
    const result = await window.electronAPI.contracts.uploadDocument()
    if (result.success && result.data) {
      setForm((prev) => ({ ...prev, documentPath: result.data }))
      toast.success('Document ajouté avec succès')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={isEditing ? 'Modifier le contrat' : 'Nouveau contrat'}
        description={isEditing ? 'Modifier les informations du contrat' : 'Créer un nouveau contrat'}
        actions={
          <Button variant="outline" onClick={() => navigate('/contracts')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
            <div className="p-2 rounded-xl bg-primaryLight">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Informations du contrat</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Employé <span className="text-danger">*</span></Label>
              <Select value={form.employeeId} onValueChange={(v) => updateField('employeeId', v)} disabled={isEditing}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un employé" /></SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type de contrat <span className="text-danger">*</span></Label>
              <Select value={form.contractType} onValueChange={(v) => updateField('contractType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="CTT">CTT (Temporaire)</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date de début <span className="text-danger">*</span></Label>
              <Input type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input type="date" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Durée (mois)</Label>
              <Input type="number" min="1" value={form.durationMonths} onChange={(e) => updateField('durationMonths', e.target.value)} placeholder="12" />
            </div>
            <div className="space-y-2">
              <Label>Salaire brut <span className="text-danger">*</span></Label>
              <Input type="number" min="0" step="0.01" value={form.grossSalary} onChange={(e) => updateField('grossSalary', e.target.value)} required placeholder="300000" />
            </div>
            <div className="space-y-2">
              <Label>Salaire net</Label>
              <Input type="number" min="0" step="0.01" value={form.netSalary} onChange={(e) => updateField('netSalary', e.target.value)} placeholder="Optionnel" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Notes</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 rounded-xl border-2 border-border bg-white text-sm outline-none focus:border-primary transition-colors resize-y"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Notes ou commentaires sur le contrat"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
            <div className="p-2 rounded-xl bg-primaryLight">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Document</h3>
          </div>
          <div className="space-y-3">
            {form.documentPath && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="px-2 py-1 bg-successLight text-success rounded-lg text-xs font-medium">Document attaché</span>
                <span className="truncate max-w-[400px]">{form.documentPath.split('/').pop()}</span>
              </div>
            )}
            <Button type="button" variant="outline" onClick={handleUploadDocument}>
              <Upload className="h-4 w-4 mr-2" /> Parcourir...
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/contracts')}>Annuler</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Enregistrer les modifications' : 'Créer le contrat'}
          </Button>
        </div>
      </form>
    </div>
  )
}
