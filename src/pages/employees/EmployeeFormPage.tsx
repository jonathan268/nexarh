import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import type { Department, Position } from '../../types/electron.d'

export default function EmployeeFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    nationalId: '',
    departmentId: '',
    positionId: '',
    hireDate: '',
    employmentType: 'CDI',
    baseSalary: '',
    bankAccount: ''
  })

  const [currentNumber, setCurrentNumber] = useState('')

  useEffect(() => {
    Promise.all([
      window.electronAPI.departments.getAll(),
      window.electronAPI.positions.getAll()
    ]).then(([deptRes, posRes]) => {
      if (deptRes.success) setDepartments(deptRes.data)
      if (posRes.success) setPositions(posRes.data)
    })

    if (isEditing) {
      setLoading(true)
      window.electronAPI.employees.getById(parseInt(id!)).then((result) => {
        if (result.success) {
          const e = result.data
          setCurrentNumber(e.employeeNumber)
          setForm({
            firstName: e.firstName,
            lastName: e.lastName,
            email: e.email || '',
            phone: e.phone || '',
            address: e.address || '',
            dateOfBirth: e.dateOfBirth || '',
            gender: e.gender || '',
            nationalId: e.nationalId || '',
            departmentId: e.departmentId?.toString() || '',
            positionId: e.positionId?.toString() || '',
            hireDate: e.hireDate,
            employmentType: e.employmentType,
            baseSalary: e.baseSalary.toString(),
            bankAccount: e.bankAccount || ''
          })
        } else {
          toast.error(result.error)
        }
        setLoading(false)
      })
    }
  }, [id, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const data = {
      ...form,
      email: form.email || null,
      nationalId: form.nationalId || null,
      bankAccount: form.bankAccount || null,
      phone: form.phone || null,
      address: form.address || null,
      dateOfBirth: form.dateOfBirth || null,
      departmentId: form.departmentId ? parseInt(form.departmentId) : null,
      positionId: form.positionId ? parseInt(form.positionId) : null,
      baseSalary: parseFloat(form.baseSalary)
    }

    const result = isEditing
      ? await window.electronAPI.employees.update(parseInt(id!), data)
      : await window.electronAPI.employees.create(data)

    if (result.success) {
      toast.success(isEditing ? 'Employé modifié avec succès' : 'Employé créé avec succès')
      navigate('/employees')
    } else {
      toast.error(result.error)
    }
    setSaving(false)
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
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
        title={isEditing ? 'Modifier un employé' : 'Nouvel employé'}
        description={isEditing ? 'Modifier les informations de l\'employé' : 'Ajouter un nouvel employé'}
        actions={
          <Button variant="outline" onClick={() => navigate('/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
            <div className="p-2 rounded-xl bg-primaryLight">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Informations personnelles</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {isEditing && (
              <div className="space-y-2">
                <Label>Matricule</Label>
                <Input value={currentNumber} readOnly className="bg-gray-50 text-gray-500" />
              </div>
            )}
            <div className={isEditing ? 'space-y-2' : 'space-y-2'}>
              <Label>Genre</Label>
              <Select value={form.gender} onValueChange={(v) => updateField('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prénom <span className="text-danger">*</span></Label>
              <Input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required placeholder="Jean" />
            </div>
            <div className="space-y-2">
              <Label>Date de naissance</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nom <span className="text-danger">*</span></Label>
              <Input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} required placeholder="Dupont" />
            </div>
            <div className="space-y-2">
              <Label>N° CNI</Label>
              <Input value={form.nationalId} onChange={(e) => updateField('nationalId', e.target.value)} placeholder="N° de pièce d'identité" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
            <div className="p-2 rounded-xl bg-blue-50">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Contact</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="jean.dupont@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+237 6XX XXX XXX" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Adresse complète" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
            <div className="p-2 rounded-xl bg-accent/10">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Emploi & Salaire</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Date d'embauche <span className="text-danger">*</span></Label>
              <Input type="date" value={form.hireDate} onChange={(e) => updateField('hireDate', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Type d'emploi</Label>
              <Select value={form.employmentType} onValueChange={(v) => updateField('employmentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Temps partiel">Temps partiel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Département</Label>
              <Select value={form.departmentId} onValueChange={(v) => updateField('departmentId', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Poste</Label>
              <Select value={form.positionId} onValueChange={(v) => updateField('positionId', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {positions.filter((p) => !form.departmentId || p.departmentId === parseInt(form.departmentId)).map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Salaire de base <span className="text-danger">*</span></Label>
              <Input type="number" min="0" step="0.01" value={form.baseSalary} onChange={(e) => updateField('baseSalary', e.target.value)} required placeholder="150000" />
            </div>
            <div className="space-y-2">
              <Label>Compte bancaire</Label>
              <Input value={form.bankAccount} onChange={(e) => updateField('bankAccount', e.target.value)} placeholder="Numéro de compte" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Enregistrer les modifications' : 'Créer l\'employé'}
          </Button>
        </div>
      </form>
    </div>
  )
}
