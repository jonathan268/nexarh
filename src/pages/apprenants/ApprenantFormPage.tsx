import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

export default function ApprenantFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    adresse: '', dateNaissance: '', niveauEtude: ''
  })

  useEffect(() => {
    if (isEditing) {
      setLoading(true)
      window.electronAPI.apprenants.getAll().then((result) => {
        if (result.success) {
          const a = result.data.find((a) => a.id === parseInt(id!))
          if (a) {
            setForm({
              nom: a.nom, prenom: a.prenom, email: a.email || '',
              telephone: a.telephone || '', adresse: a.adresse || '',
              dateNaissance: a.dateNaissance || '', niveauEtude: a.niveauEtude || ''
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
      nom: form.nom, prenom: form.prenom, email: form.email || null,
      telephone: form.telephone || null, adresse: form.adresse || null,
      dateNaissance: form.dateNaissance || null, niveauEtude: form.niveauEtude || null
    }
    const result = isEditing
      ? await window.electronAPI.apprenants.update(parseInt(id!), data)
      : await window.electronAPI.apprenants.create(data)
    if (result.success) {
      toast.success(isEditing ? 'Apprenant modifié' : 'Apprenant créé')
      navigate('/apprenants')
    } else { toast.error(result.error) }
    setSaving(false)
  }

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={isEditing ? 'Modifier l\'apprenant' : 'Nouvel apprenant'}
        description={isEditing ? 'Modifier les informations de l\'apprenant' : 'Ajouter un nouvel apprenant'}
        actions={<Button variant="outline" onClick={() => navigate('/apprenants')}><ArrowLeft className="h-4 w-4 mr-2" /> Retour</Button>}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
            <div className="p-2 rounded-xl bg-primaryLight">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary">Identité</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Nom <span className="text-danger">*</span></Label>
              <Input value={form.nom} onChange={(e) => updateField('nom', e.target.value)} required placeholder="Nkono" />
            </div>
            <div className="space-y-2">
              <Label>Prénom <span className="text-danger">*</span></Label>
              <Input value={form.prenom} onChange={(e) => updateField('prenom', e.target.value)} required placeholder="Marie" />
            </div>
            <div className="space-y-2">
              <Label>Date de naissance</Label>
              <Input type="date" value={form.dateNaissance} onChange={(e) => updateField('dateNaissance', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Niveau d'étude</Label>
              <Select value={form.niveauEtude} onValueChange={(v) => updateField('niveauEtude', v)}>
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
              <Input value={form.telephone} onChange={(e) => updateField('telephone', e.target.value)} placeholder="+237 6XX XXX XXX" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Adresse</Label>
              <Input value={form.adresse} onChange={(e) => updateField('adresse', e.target.value)} placeholder="Adresse complète" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/apprenants')}>Annuler</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Enregistrer' : 'Créer l\'apprenant'}
          </Button>
        </div>
      </form>
    </div>
  )
}
