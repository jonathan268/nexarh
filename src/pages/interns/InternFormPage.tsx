import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

export default function InternFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    schoolName: '',
    studyLevel: '',
    specialty: '',
    type: 'academique',
    startDate: '',
    endDate: '',
    monthlyAllowance: '',
    mission: ''
  })

  useEffect(() => {
    if (isEditing) {
      setLoading(true)
      window.electronAPI.interns.getAll().then((result) => {
        if (result.success) {
          const i = result.data.find((i) => i.id === parseInt(id!))
          if (i) {
            setForm({
              firstName: i.firstName,
              lastName: i.lastName,
              email: i.email || '',
              phone: i.phone || '',
              schoolName: i.schoolName,
              studyLevel: i.studyLevel || '',
              specialty: i.specialty || '',
              type: i.type || 'academique',
              startDate: i.startDate,
              endDate: i.endDate,
              monthlyAllowance: i.monthlyAllowance.toString(),
              mission: i.mission || ''
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
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || null,
      phone: form.phone || null,
      schoolName: form.schoolName,
      studyLevel: form.studyLevel || null,
      specialty: form.specialty || null,
      type: form.type || 'academique',
      startDate: form.startDate,
      endDate: form.endDate,
      monthlyAllowance: parseFloat(form.monthlyAllowance) || 0,
      mission: form.mission || null
    }

    const result = isEditing
      ? await window.electronAPI.interns.update(parseInt(id!), data)
      : await window.electronAPI.interns.create(data)

    if (result.success) {
      toast.success(isEditing ? 'Stagiaire modifié avec succès' : 'Stagiaire créé avec succès')
      navigate('/interns')
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
        title={isEditing ? 'Modifier le stagiaire' : 'Nouveau stagiaire'}
        description={isEditing ? 'Modifier les informations du stagiaire' : 'Ajouter un nouveau stagiaire'}
        actions={
          <Button variant="outline" onClick={() => navigate('/interns')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
            <div className="p-2 rounded-xl bg-primaryLight">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Identité</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Niveau d'étude</Label>
              <Select value={form.studyLevel} onValueChange={(v) => updateField('studyLevel', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bac">Bac</SelectItem>
                  <SelectItem value="Bac+1">Bac+1</SelectItem>
                  <SelectItem value="Bac+2">Bac+2</SelectItem>
                  <SelectItem value="Bac+3">Bac+3 (Licence)</SelectItem>
                  <SelectItem value="Bac+4">Bac+4</SelectItem>
                  <SelectItem value="Bac+5">Bac+5 (Master)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prénom <span className="text-danger">*</span></Label>
              <Input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required placeholder="Marie" />
            </div>
            <div className="space-y-2">
              <Label>Spécialité</Label>
              <Input value={form.specialty} onChange={(e) => updateField('specialty', e.target.value)} placeholder="Informatique, Comptabilité..." />
            </div>
            <div className="space-y-2">
              <Label>Nom <span className="text-danger">*</span></Label>
              <Input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} required placeholder="Nkono" />
            </div>
            <div className="space-y-2">
              <Label>École <span className="text-danger">*</span></Label>
              <Input value={form.schoolName} onChange={(e) => updateField('schoolName', e.target.value)} required placeholder="Université de..." />
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
              <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="marie.nkono@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+237 6XX XXX XXX" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
            <div className="p-2 rounded-xl bg-accent/10">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Stage & Allocation</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Date de début <span className="text-danger">*</span></Label>
              <Input type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Date de fin <span className="text-danger">*</span></Label>
              <Input type="date" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Type de stage</Label>
              <Select value={form.type} onValueChange={(v) => updateField('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="academique">Académique</SelectItem>
                  <SelectItem value="professionnel">Professionnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Allocation mensuelle (XAF)</Label>
              <Input type="number" min="0" step="1000" value={form.monthlyAllowance} onChange={(e) => updateField('monthlyAllowance', e.target.value)} placeholder="50000" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Mission / Objectifs</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 rounded-xl border-2 border-border bg-white text-sm outline-none focus:border-primary transition-colors resize-y"
                value={form.mission}
                onChange={(e) => updateField('mission', e.target.value)}
                placeholder="Décrire la mission du stagiaire"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/interns')}>Annuler</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Enregistrer les modifications' : 'Créer le stagiaire'}
          </Button>
        </div>
      </form>
    </div>
  )
}
