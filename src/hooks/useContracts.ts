import { useState, useEffect, useCallback } from 'react'
import type { Contract } from '../types/electron.d'

export function useContracts(filters?: Record<string, unknown>) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContracts = useCallback(async () => {
    setLoading(true)
    const result = await window.electronAPI.contracts.getAll(filters)
    if (result.success) {
      setContracts(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  return { contracts, loading, error, refetch: fetchContracts }
}
