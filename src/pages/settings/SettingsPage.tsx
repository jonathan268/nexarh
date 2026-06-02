import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Save, Download, Upload, Loader2, Building2, Calculator, Database } from 'lucide-react'
import { toast } from 'sonner'
import type { CompanySettings } from '../../types/electron.d'

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.electronAPI.settings.get().then((result) => {
      if (result.success) {
        setSettings(result.data)
      } else {
        toast.error(result.error)
      }
      setLoading(false)
    })
  }, [])

  const updateField = (field: string, value: string | number) => {
    setSettings((prev) => prev ? { ...prev, [field]: value } : null)
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    const result = await window.electronAPI.settings.update(settings)
    if (result.success) {
      toast.success('Paramètres enregistrés')
    } else {
      toast.error(result.error)
    }
    setSaving(false)
  }

  const handleExport = async () => {
    const result = await window.electronAPI.backup.export()
    if (result.success) {
      toast.success(`Sauvegarde créée : ${result.data}`)
    } else {
      toast.error(result.error)
    }
  }

  const handleImport = async () => {
    const confirmed = window.confirm('Restaurer une sauvegarde remplacera toutes les données actuelles. L\'application va redémarrer. Continuer ?')
    if (!confirmed) return
    const result = await window.electronAPI.backup.import()
    if (result.success) {
      toast.success('Base de données restaurée avec succès. Redémarrage...')
      setTimeout(() => window.location.reload(), 2000)
    } else {
      toast.error(result.error)
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const sections = [
    {
      title: "Informations de l'entreprise",
      icon: Building2,
      iconBg: 'bg-primaryLight',
      iconColor: 'text-primary',
      fields: [
        { label: "Nom de l'entreprise *", key: 'companyName', type: 'text' },
        { label: 'Téléphone', key: 'companyPhone', type: 'text' },
        { label: 'Adresse', key: 'companyAddress', type: 'text' },
        { label: 'Email', key: 'companyEmail', type: 'email' },
        { label: 'NIU (Numéro d\'Identification Unique)', key: 'taxId', type: 'text' },
        { label: 'N° CNPS', key: 'cnpsNumber', type: 'text' }
      ]
    },
    {
      title: 'Configuration de paie',
      icon: Calculator,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      fields: [
        { label: 'Devise', key: 'currency', type: 'text' },
        { label: 'Heures par jour', key: 'workingHoursPerDay', type: 'number' },
        { label: 'Jours travaillés par mois', key: 'workingDaysPerMonth', type: 'number' },
        { label: 'Taux heures sup. (x salaire)', key: 'overtimeRate', type: 'number', step: '0.1' },
        { label: 'Forfait transport (XAF)', key: 'transportRate', type: 'number' },
        { label: 'Jour de paiement', key: 'payDay', type: 'number', helper: 'Jour du mois pour le paiement des salaires' }
        ]
    },
    {
      title: 'Taux et Taxes',
      icon: Calculator,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      fields: [
        { label: 'Plafond CNPS (XAF)', key: 'cnpsCeiling', type: 'number' },
        { label: 'Taux CNPS Employé', key: 'cnpsEmployeeRate', type: 'number', step: '0.001' },
        { label: 'Taux CNPS Employeur', key: 'cnpsEmployerRate', type: 'number', step: '0.001' },
        { label: 'Taux CFC', key: 'cfcRate', type: 'number', step: '0.001' },
        { label: 'Taux FNE', key: 'fneRate', type: 'number', step: '0.001' }
      ]
    }
  ]

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Configuration de l'entreprise"
        actions={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        }
      />

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
              <div className={`p-2 rounded-xl ${section.iconBg}`}>
                <section.icon className={`h-5 w-5 ${section.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">{section.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input
                    type={field.type}
                    step={field.step}
                    value={(settings as Record<string, unknown>)[field.key] as string | number}
                    onChange={(e) => updateField(field.key, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                  />
                  {field.helper && <p className="text-[10px] text-text-muted mt-0.5">{field.helper}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-border">
            <div className="p-2 rounded-xl bg-blue-50">
              <Database className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Sauvegarde & Restauration</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter la base de données
            </Button>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Restaurer une sauvegarde
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
