'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Monitor, Apple, Terminal, Download } from 'lucide-react'

type Platform = 'windows' | 'mac' | 'linux'

const platforms: { id: Platform; label: string; icon: typeof Monitor; desc: string }[] = [
  { id: 'windows', label: 'Windows', icon: Monitor, desc: 'Windows 10 & 11 (64-bit)' },
  { id: 'mac', label: 'macOS', icon: Apple, desc: 'macOS 12+ (Intel & Apple Silicon)' },
  { id: 'linux', label: 'Linux', icon: Terminal, desc: 'Ubuntu, Debian, Fedora (AppImage)' },
]

const downloadUrls: Record<Platform, string> = {
  windows: 'https://github.com/jonathan268/nexarh/releases/latest',
  mac: 'https://github.com/jonathan268/nexarh/releases/latest',
  linux: 'https://github.com/jonathan268/nexarh/releases/latest',
}

export default function DownloadSection() {
  const [detected, setDetected] = useState<Platform | null>(null)
  const [selected, setSelected] = useState<Platform>('windows')

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('win')) setDetected('windows')
    else if (ua.includes('mac')) setDetected('mac')
    else if (ua.includes('linux')) setDetected('linux')
  }, [])

  useEffect(() => {
    if (detected) setSelected(detected)
  }, [detected])

  return (
    <section id="download" className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-4">
          Téléchargement
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Prêt à simplifier votre gestion RH ?
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
          Téléchargez NexaRH gratuitement et commencez à gérer vos ressources humaines en toute simplicité.
        </p>

        {detected && (
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Système détecté : {platforms.find((p) => p.id === detected)?.label}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                selected === p.id
                  ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              <p.icon className="w-5 h-5" />
              <span>{p.label}</span>
              {detected === p.id && (
                <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  Recommandé
                </span>
              )}
            </button>
          ))}
        </div>

        <a
          href={downloadUrls[selected]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg transition-all shadow-xl shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5"
        >
          <Download className="w-6 h-6" />
          Télécharger pour {platforms.find((p) => p.id === selected)?.label}
        </a>

        <p className="mt-4 text-sm text-gray-400">
          {platforms.find((p) => p.id === selected)?.desc} — Guide d&apos;installation ci-dessous
        </p>
      </div>
    </section>
  )
}
