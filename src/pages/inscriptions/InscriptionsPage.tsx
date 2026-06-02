import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/shared/DataTable'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog'
import { Plus, FileText, Award, Wallet, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Inscription, Formation, Apprenant, PaiementFormation } from '../../types/electron.d'

export default function InscriptionsPage() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [apprenants, setApprenants] = useState<Apprenant[]>([])
  const [loading, setLoading] = useState(true)

  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null)
  const [paiements, setPaiements] = useState<PaiementFormation[]>([])
  const [selectedPaiementId, setSelectedPaiementId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [newForm, setNewForm] = useState({
    apprenantId: '', formationId: '', dateInscription: new Date().toISOString().split('T')[0],
    frais: '', montantPaye: '', creneau: '09H-12H', notes: '', dateFin: ''
  })

  const [paymentForm, setPaymentForm] = useState({
    montant: '', datePaiement: new Date().toISOString().split('T')[0],
    modePaiement: 'especes', reference: '', notes: ''
  })

  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [inscResult, formResult, appResult] = await Promise.all([
      window.electronAPI.inscriptions.getAll(),
      window.electronAPI.formations.getAll(),
      window.electronAPI.apprenants.getAll()
    ])
    if (inscResult.success) setInscriptions(inscResult.data)
    if (formResult.success) setFormations(formResult.data)
    if (appResult.success) setApprenants(appResult.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleCreateInscription = async () => {
    if (!newForm.apprenantId || !newForm.formationId) {
      toast.error('Veuillez sélectionner un apprenant et une formation')
      return
    }
    setSaving(true)
    const frais = parseFloat(newForm.frais) || 0
    const montantPaye = parseFloat(newForm.montantPaye) || 0
    const result = await window.electronAPI.inscriptions.create({
      apprenantId: parseInt(newForm.apprenantId),
      formationId: parseInt(newForm.formationId),
      dateInscription: newForm.dateInscription,
      frais, montantPaye,
      creneau: newForm.creneau || '09H-12H',
      notes: newForm.notes || null,
      dateFin: newForm.dateFin || null
    })
    if (result.success) {
      toast.success('Inscription créée avec succès')
      setNewDialogOpen(false)
      setNewForm({ apprenantId: '', formationId: '', dateInscription: new Date().toISOString().split('T')[0], frais: '', montantPaye: '', creneau: '09H-12H', notes: '', dateFin: '' })
      fetchData()
    } else { toast.error(result.error) }
    setSaving(false)
  }

  const handleAddPayment = async () => {
    if (!selectedInscription || !paymentForm.montant) {
      toast.error('Le montant est requis')
      return
    }
    setSaving(true)
    const result = await window.electronAPI.paiements.create({
      inscriptionId: selectedInscription.id,
      montant: parseFloat(paymentForm.montant),
      datePaiement: paymentForm.datePaiement,
      modePaiement: paymentForm.modePaiement,
      reference: paymentForm.reference || null,
      notes: paymentForm.notes || null
    })
    if (result.success) {
      toast.success('Paiement enregistré')
      setPaymentDialogOpen(false)
      setPaymentForm({ montant: '', datePaiement: new Date().toISOString().split('T')[0], modePaiement: 'especes', reference: '', notes: '' })
      fetchData()
    } else { toast.error(result.error) }
    setSaving(false)
  }

  const handleMarkCompleted = async (inscription: Inscription) => {
    const dateFin = new Date().toISOString().split('T')[0]
    const result = await window.electronAPI.inscriptions.update(inscription.id, { status: 'termine', dateFin })
    if (result.success) {
      toast.success('Formation terminée avec succès')
      fetchData()
    } else { toast.error(result.error) }
  }

  const openPaymentDialog = async (inscription: Inscription) => {
    setSelectedInscription(inscription)
    setPaymentDialogOpen(true)
  }

  const openReceiptDialog = async (inscription: Inscription) => {
    setSelectedInscription(inscription)
    const result = await window.electronAPI.paiements.getAll(inscription.id)
    if (result.success && result.data.length > 0) {
      setPaiements(result.data)
      setSelectedPaiementId(result.data[0].id)
      setReceiptDialogOpen(true)
    } else {
      toast.error('Aucun paiement trouvé pour cette inscription')
    }
  }

  const handleGenerateReceipt = async () => {
    if (!selectedInscription || !selectedPaiementId) return
    const result = await window.electronAPI.formationPdf.generateReceipt(selectedInscription.id, selectedPaiementId)
    if (result.success) {
      toast.success('Reçu généré avec succès')
      setReceiptDialogOpen(false)
    } else { toast.error(result.error) }
  }

  const handleGenerateCertificate = async (inscription: Inscription) => {
    const result = await window.electronAPI.formationPdf.generateCertificate(inscription.id)
    if (result.success) toast.success('Attestation générée avec succès')
    else toast.error(result.error)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await window.electronAPI.inscriptions.delete(deleteId)
    if (result.success) { toast.success('Inscription supprimée'); setDeleteId(null); fetchData() }
    else { toast.error(result.error) }
  }

  const handleFormationChange = (formationId: string) => {
    const formation = formations.find((f) => f.id === parseInt(formationId))
    setNewForm({ ...newForm, formationId, frais: formation ? formation.frais.toString() : '' })
  }

  const columns = [
    {
      key: 'apprenant', header: 'Apprenant',
      render: (i: Inscription) => <span className="font-semibold">{i.apprenantNom} {i.apprenantPrenom}<br /><span className="text-xs text-text-muted">{i.apprenantMatricule}</span></span>
    },
    {
      key: 'formation', header: 'Formation',
      render: (i: Inscription) => <span>{i.formationName}</span>
    },
    {
      key: 'creneau', header: 'Créneau',
      render: (i: Inscription) => {
        const colors: Record<string, string> = {
          '09H-12H': 'bg-blue-100 text-blue-700',
          '12H-15H': 'bg-warning/10 text-warning',
          '15H-18H': 'bg-purple-100 text-purple-700'
        }
        return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${colors[i.creneau || ''] || 'bg-gray-100 text-gray-500'}`}>{i.creneau}</span>
      }
    },
    { key: 'dateInscription', header: 'Date insc.' },
    {
      key: 'frais', header: 'Frais', className: 'text-right',
      render: (i: Inscription) => <span className="font-mono">{i.frais.toLocaleString()}</span>
    },
    {
      key: 'paye', header: 'Payé', className: 'text-right',
      render: (i: Inscription) => (
        <span className={`font-mono ${(i.montantPaye || 0) >= i.frais ? 'text-success' : 'text-warning'}`}>
          {(i.montantPaye || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'reste', header: 'Reste', className: 'text-right',
      render: (i: Inscription) => {
        const reste = i.frais - (i.montantPaye || 0)
        return <span className="font-mono text-danger">{Math.max(0, reste).toLocaleString()}</span>
      }
    },
    {
      key: 'status', header: 'Statut',
      render: (i: Inscription) => {
        const styles: Record<string, string> = {
          inscrit: 'bg-blue-100 text-blue-700',
          en_cours: 'bg-warning/10 text-warning',
          termine: 'bg-success/10 text-success',
          abandon: 'bg-danger/10 text-danger'
        }
        const labels: Record<string, string> = {
          inscrit: 'Inscrit', en_cours: 'En cours', termine: 'Terminé', abandon: 'Abandon'
        }
        return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${styles[i.status] || 'bg-gray-100 text-gray-500'}`}>{labels[i.status] || i.status}</span>
      }
    },
    {
      key: 'actions', header: 'Actions', className: 'text-right',
      render: (i: Inscription) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="secondary" size="sm" onClick={() => openPaymentDialog(i)} title="Ajouter un paiement">
            <Wallet className="h-3.5 w-3.5" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openReceiptDialog(i)} title="Générer le reçu">
            <FileText className="h-3.5 w-3.5" />
          </Button>
          {i.status === 'termine' ? (
            <Button variant="secondary" size="sm" onClick={() => handleGenerateCertificate(i)} title="Attestation de fin">
              <Award className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => handleMarkCompleted(i)} title="Marquer terminé">
              <CheckCircle className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(i.id)}>
            <Trash2 className="h-3.5 w-3.5 text-danger" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Inscriptions"
        description="Gestion des inscriptions aux formations"
        actions={
          <Button onClick={() => setNewDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Nouvelle inscription
          </Button>
        }
      />

      {loading ? <LoadingSpinner /> : inscriptions.length === 0 ? (
        <EmptyState title="Aucune inscription" description="Inscrivez un apprenant à une formation"
          action={<Button onClick={() => setNewDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Nouvelle inscription</Button>}
        />
      ) : <DataTable columns={columns} data={inscriptions} />}

      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nouvelle inscription</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Apprenant *</Label>
              <Select value={newForm.apprenantId} onValueChange={(v) => setNewForm({ ...newForm, apprenantId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un apprenant" /></SelectTrigger>
                <SelectContent>
                  {apprenants.filter((a) => a.status === 'actif').map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>{a.nom} {a.prenom} ({a.matricule})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formation *</Label>
              <Select value={newForm.formationId} onValueChange={handleFormationChange}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une formation" /></SelectTrigger>
                <SelectContent>
                  {formations.filter((f) => f.status === 'active').map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>{f.name} - {f.frais.toLocaleString()} XAF</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date d'inscription</Label>
                <Input type="date" value={newForm.dateInscription} onChange={(e) => setNewForm({ ...newForm, dateInscription: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date de fin prévue</Label>
                <Input type="date" value={newForm.dateFin} onChange={(e) => setNewForm({ ...newForm, dateFin: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Créneau horaire</Label>
              <Select value={newForm.creneau} onValueChange={(v) => setNewForm({ ...newForm, creneau: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="09H-12H">09H - 12H</SelectItem>
                  <SelectItem value="12H-15H">12H - 15H</SelectItem>
                  <SelectItem value="15H-18H">15H - 18H</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frais (XAF)</Label>
                <Input type="number" min="0" value={newForm.frais} onChange={(e) => setNewForm({ ...newForm, frais: e.target.value })} placeholder="150000" />
              </div>
              <div className="space-y-2">
                <Label>Montant payé (XAF)</Label>
                <Input type="number" min="0" value={newForm.montantPaye} onChange={(e) => setNewForm({ ...newForm, montantPaye: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} placeholder="Notes optionnelles" />
            </div>
            <Button onClick={handleCreateInscription} disabled={saving} className="w-full">
              {saving ? <span className="animate-spin mr-2">...</span> : <Plus className="h-4 w-4 mr-2" />}
              Inscrire
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un paiement</DialogTitle></DialogHeader>
          {selectedInscription && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <strong>{selectedInscription.apprenantNom} {selectedInscription.apprenantPrenom}</strong> - {selectedInscription.formationName}<br />
                Frais: {selectedInscription.frais.toLocaleString()} XAF | Payé: {(selectedInscription.montantPaye || 0).toLocaleString()} XAF | Reste: {Math.max(0, selectedInscription.frais - (selectedInscription.montantPaye || 0)).toLocaleString()} XAF
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant *</Label>
                  <Input type="number" min="0" value={paymentForm.montant} onChange={(e) => setPaymentForm({ ...paymentForm, montant: e.target.value })} placeholder="50000" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={paymentForm.datePaiement} onChange={(e) => setPaymentForm({ ...paymentForm, datePaiement: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mode de paiement</Label>
                  <Select value={paymentForm.modePaiement} onValueChange={(v) => setPaymentForm({ ...paymentForm, modePaiement: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="especes">Espèces</SelectItem>
                      <SelectItem value="virement">Virement</SelectItem>
                      <SelectItem value="cheque">Chèque</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="carte">Carte bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Référence</Label>
                  <Input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} placeholder="N° de référence" />
                </div>
              </div>
              <Button onClick={handleAddPayment} disabled={saving} className="w-full">
                <Wallet className="h-4 w-4 mr-2" />Enregistrer le paiement
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={receiptDialogOpen} onOpenChange={(o) => { if (!o) setReceiptDialogOpen(false); setReceiptDialogOpen(o) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Générer le reçu de paiement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sélectionner le paiement</Label>
              <Select value={selectedPaiementId?.toString() || ''} onValueChange={(v) => setSelectedPaiementId(parseInt(v))}>
                <SelectTrigger><SelectValue placeholder="Choisir un paiement" /></SelectTrigger>
                <SelectContent>
                  {paiements.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.datePaiement} - {p.montant.toLocaleString()} XAF ({p.modePaiement})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateReceipt} className="w-full">
              <FileText className="h-4 w-4 mr-2" />Générer le reçu PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null) }}
        title="Supprimer l'inscription" description="Êtes-vous sûr de vouloir supprimer cette inscription ?"
        confirmLabel="Supprimer" variant="danger" onConfirm={handleDelete} />
    </div>
  )
}
