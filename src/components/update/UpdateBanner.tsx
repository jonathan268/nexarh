import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Download, RotateCw, X } from 'lucide-react'
import type { UpdateInfo, UpdateProgress } from '../../types/electron.d'

type UpdateState =
  | { status: 'idle' }
  | { status: 'available'; info: UpdateInfo }
  | { status: 'downloading'; progress: UpdateProgress }
  | { status: 'downloaded'; info: UpdateInfo }
  | { status: 'error'; message: string }

export default function UpdateBanner() {
  const [state, setState] = useState<UpdateState>({ status: 'idle' })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!window.electronAPI?.update) return

    const unsubs: (() => void)[] = []

    unsubs.push(
      window.electronAPI.update.on('update:available', (info) => {
        setState({ status: 'available', info: info as UpdateInfo })
      })
    )

    unsubs.push(
      window.electronAPI.update.on('update:downloaded', (info) => {
        setState({ status: 'downloaded', info: info as UpdateInfo })
      })
    )

    unsubs.push(
      window.electronAPI.update.on('update:progress', (progress) => {
        setState((prev) => {
          if (prev.status !== 'downloading') return prev
          return { ...prev, progress: progress as UpdateProgress }
        })
      })
    )

    unsubs.push(
      window.electronAPI.update.on('update:error', (message) => {
        setState({ status: 'error', message: message as string })
      })
    )

    unsubs.push(
      window.electronAPI.update.on('update:not-available', () => {
        setState({ status: 'idle' })
      })
    )

    window.electronAPI.update.check()

    return () => unsubs.forEach((fn) => fn())
  }, [])

  const handleDownload = () => {
    window.electronAPI?.update?.download()
    setState({ status: 'downloading', progress: { percent: 0, bytesPerSecond: 0, total: 0, transferred: 0 } })
  }

  const handleInstall = () => {
    window.electronAPI?.update?.install()
  }

  if (dismissed || state.status === 'idle') return null

  return (
    <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        {state.status === 'available' && (
          <>
            <Download className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Nouvelle version disponible : <strong>v{state.info.version}</strong>
            </span>
          </>
        )}
        {state.status === 'downloading' && (
          <>
            <RotateCw className="h-4 w-4 shrink-0 animate-spin" />
            <span className="truncate">
              Téléchargement... {Math.round(state.progress.percent)}%
            </span>
            <div className="w-24 h-1.5 bg-emerald-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${state.progress.percent}%` }}
              />
            </div>
          </>
        )}
        {state.status === 'downloaded' && (
          <>
            <Download className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Mise à jour <strong>v{state.info.version}</strong> prête à être installée
            </span>
          </>
        )}
        {state.status === 'error' && (
          <span className="truncate">{state.message}</span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {state.status === 'available' && (
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs bg-white text-emerald-700 hover:bg-emerald-50"
            onClick={handleDownload}
          >
            Mettre à jour
          </Button>
        )}
        {state.status === 'downloaded' && (
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs bg-white text-emerald-700 hover:bg-emerald-50"
            onClick={handleInstall}
          >
            Redémarrer
          </Button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-emerald-700 rounded transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
