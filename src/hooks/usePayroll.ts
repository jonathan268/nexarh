import { useState, useEffect, useCallback } from 'react'
import type { PayrollPeriod, Payslip } from '../types/electron.d'

export function usePayroll() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPeriods = useCallback(async () => {
    setLoading(true)
    const result = await window.electronAPI.payroll.getPeriods()
    if (result.success) {
      setPeriods(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPeriods()
  }, [fetchPeriods])

  return { periods, loading, error, refetch: fetchPeriods }
}

export function usePayslips(periodId: number | null) {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPayslips = useCallback(async () => {
    if (!periodId) return
    setLoading(true)
    const result = await window.electronAPI.payroll.getPayslips(periodId)
    if (result.success) {
      setPayslips(result.data)
    }
    setLoading(false)
  }, [periodId])

  useEffect(() => {
    fetchPayslips()
  }, [fetchPayslips])

  return { payslips, loading, refetch: fetchPayslips }
}
