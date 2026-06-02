import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { toast } from 'sonner'
import { Save, Calculator } from 'lucide-react'
import type { Payslip, PayslipUpdateData } from '../../types/electron.d'

const CNPS_CEILING = 750_000
const CNPS_EMPLOYEE_RATE = 0.028
const IRPP_BRACKETS = [
  { min: 0, max: 62000, rate: 0 },
  { min: 62001, max: 125000, rate: 0.10 },
  { min: 125001, max: 250000, rate: 0.165 },
  { min: 250001, max: 500000, rate: 0.275 },
  { min: 500001, max: Infinity, rate: 0.385 }
]
const CFC_RATE = 0.01
const FNE_RATE = 0.01

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  payslip: Payslip
  employeeName: string
  onSaved: () => void
}

export default function EditPayslipDialog({ open, onOpenChange, payslip, employeeName, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<PayslipUpdateData>({
    baseSalary: payslip.baseSalary,
    workedDays: payslip.workedDays,
    overtimeHours: payslip.overtimeHours,
    transportAllowance: payslip.transportAllowance,
    housingAllowance: payslip.housingAllowance,
    mealAllowance: payslip.mealAllowance,
    performanceBonus: payslip.performanceBonus,
    otherBonuses: payslip.otherBonuses,
    advanceDeduction: payslip.advanceDeduction,
    otherDeductions: payslip.otherDeductions
  })

  const update = (key: keyof PayslipUpdateData, value: string) => {
    const num = parseFloat(value) || 0
    setForm((prev) => ({ ...prev, [key]: num }))
  }

  const calc = useMemo(() => {
    const baseSalary = form.baseSalary || 0
    const workedDays = form.workedDays || 26
    const overtimeHours = form.overtimeHours || 0
    const hourlyRate = baseSalary / (workedDays * 8)
    const overtimeAmount = Math.round(overtimeHours * hourlyRate * 1.5 * 100) / 100

    const totalBonuses =
      (form.transportAllowance || 0) +
      (form.housingAllowance || 0) +
      (form.mealAllowance || 0) +
      (form.performanceBonus || 0) +
      (form.otherBonuses || 0)

    const grossSalary = Math.round((baseSalary + overtimeAmount + totalBonuses) * 100) / 100

    const cappedSalary = Math.min(grossSalary, CNPS_CEILING)
    const cnpsEmployee = Math.round(cappedSalary * CNPS_EMPLOYEE_RATE * 100) / 100

    const taxableBase = grossSalary - cnpsEmployee
    let irpp = 0
    for (const bracket of IRPP_BRACKETS) {
      if (taxableBase > bracket.min) {
        const bracketAmount = Math.min(taxableBase, bracket.max) - bracket.min
        irpp += bracketAmount * bracket.rate
      }
    }
    irpp = Math.round(irpp * 100) / 100

    const cfc = Math.round(grossSalary * CFC_RATE * 100) / 100
    const fne = Math.round(grossSalary * FNE_RATE * 100) / 100

    const totalDeductions = Math.round(
      (cnpsEmployee + irpp + cfc + fne + (form.advanceDeduction || 0) + (form.otherDeductions || 0)) * 100
    ) / 100

    const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100

    return { totalBonuses, grossSalary, cnpsEmployee, cnpsEmployer: Math.round(cappedSalary * 0.162 * 100) / 100, irpp, cfc, fne, totalDeductions, netSalary }
  }, [form])

  const handleSave = async () => {
    setSaving(true)
    const result = await window.electronAPI.payroll.updatePayslip(payslip.id, form)
    if (result.success) {
      toast.success('Fiche de paie mise à jour')
      onSaved()
    } else {
      toast.error(result.error)
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Modifier la fiche de paie - {employeeName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Salaire de base (XAF)</Label>
              <Input
                type="number"
                value={form.baseSalary ?? ''}
                onChange={(e) => update('baseSalary', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Jours travaillés</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={form.workedDays ?? ''}
                onChange={(e) => update('workedDays', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-text-secondary">Heures supplémentaires</Label>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-xs">Heures supp.</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.overtimeHours ?? ''}
                  onChange={(e) => update('overtimeHours', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-text-secondary">Primes et indemnités</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Indemnité transport</Label>
                <Input
                  type="number"
                  value={form.transportAllowance ?? ''}
                  onChange={(e) => update('transportAllowance', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Indemnité logement</Label>
                <Input
                  type="number"
                  value={form.housingAllowance ?? ''}
                  onChange={(e) => update('housingAllowance', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Indemnité repas</Label>
                <Input
                  type="number"
                  value={form.mealAllowance ?? ''}
                  onChange={(e) => update('mealAllowance', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Prime performance</Label>
                <Input
                  type="number"
                  value={form.performanceBonus ?? ''}
                  onChange={(e) => update('performanceBonus', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Autres primes</Label>
                <Input
                  type="number"
                  value={form.otherBonuses ?? ''}
                  onChange={(e) => update('otherBonuses', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-text-secondary">Déductions</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Avance / acompte</Label>
                <Input
                  type="number"
                  value={form.advanceDeduction ?? ''}
                  onChange={(e) => update('advanceDeduction', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Autres déductions</Label>
                <Input
                  type="number"
                  value={form.otherDeductions ?? ''}
                  onChange={(e) => update('otherDeductions', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-border bg-gray-50 p-4 space-y-2">
            <Label className="text-sm font-semibold">Récapitulatif</Label>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Salaire brut</span>
                <span className="font-mono font-semibold">{calc.grossSalary.toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total primes</span>
                <span className="font-mono">{calc.totalBonuses.toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">CNPS (2.80%)</span>
                <span className="font-mono text-danger">{calc.cnpsEmployee.toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">IRPP</span>
                <span className="font-mono text-danger">{calc.irpp.toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">CFC (1%)</span>
                <span className="font-mono text-danger">{calc.cfc.toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">FNE (1%)</span>
                <span className="font-mono text-danger">{calc.fne.toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 mt-1 col-span-2">
                <span className="font-semibold">Total déductions</span>
                <span className="font-mono font-bold text-danger">{calc.totalDeductions.toLocaleString()} XAF</span>
              </div>
              <div className="flex justify-between border-t-2 border-primary pt-1 mt-1 col-span-2">
                <span className="font-bold text-primary">Net à payer</span>
                <span className="font-mono font-bold text-primary text-lg">{calc.netSalary.toLocaleString()} XAF</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
