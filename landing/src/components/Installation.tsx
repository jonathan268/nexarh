'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Monitor, Apple, Terminal, Download, Shield, FolderOpen, Play, MousePointerClick } from 'lucide-react'

type Platform = 'windows' | 'mac' | 'linux'

const tabs: { id: Platform; label: string; icon: typeof Monitor }[] = [
  { id: 'windows', label: 'Windows', icon: Monitor },
  { id: 'mac', label: 'macOS', icon: Apple },
  { id: 'linux', label: 'Linux', icon: Terminal },
]

const steps: Record<Platform, { icon: typeof Download; title: string; detail: string }[]> = {
  windows: [
    { icon: Download, title: 'Téléchargez l\'installateur', detail: 'Cliquez sur le bouton "Télécharger pour Windows" ci-dessus. Le fichier NexaRH-Setup-x.x.x.exe sera téléchargé.' },
    { icon: Shield, title: 'Lancez l\'installateur', detail: 'Double-cliquez sur le fichier .exe téléchargé. Si Windows Defender s\'affiche, cliquez sur "Informations complémentaires" puis "Exécuter quand même".' },
    { icon: FolderOpen, title: 'Choisissez le dossier', detail: 'L\'assistant d\'installation vous permet de choisir où installer NexaRH. Par défaut : C:\\Program Files\\NexaRH.' },
    { icon: MousePointerClick, title: 'Raccourcis', detail: 'L\'installation crée un raccourci sur le bureau et dans le menu Démarrer. Cochez ou décochez selon vos préférences.' },
    { icon: Play, title: 'Lancez NexaRH', detail: 'Une fois l\'installation terminée, cliquez sur "Terminer". NexaRH se lance automatiquement. Connectez-vous avec les identifiants par défaut : admin / admin.' },
  ],
  mac: [
    { icon: Download, title: 'Téléchargez le DMG', detail: 'Cliquez sur "Télécharger pour macOS". Le fichier NexaRH-x.x.x.dmg sera téléchargé.' },
    { icon: MousePointerClick, title: 'Ouvrez le DMG', detail: 'Double-cliquez sur le fichier .dmg téléchargé. Une fenêtre avec l\'icône NexaRH s\'ouvre.' },
    { icon: FolderOpen, title: 'Glissez dans Applications', detail: 'Glissez l\'icône NexaRH dans le dossier Applications qui se trouve dans la même fenêtre.' },
    { icon: Shield, title: 'Contournez Gatekeeper', detail: 'Premier lancement : faites Clic droit > Ouvrir sur NexaRH dans Applications, puis cliquez "Ouvrir". Apple ne peut pas vérifier le développeur — c\'est normal, l\'app n\'est pas signée.' },
    { icon: Play, title: 'Lancez NexaRH', detail: 'Après la première ouverture, vous pouvez lancer NexaRH normalement depuis le dossier Applications ou le Launchpad.' },
  ],
  linux: [
    { icon: Download, title: 'Téléchargez l\'AppImage', detail: 'Cliquez sur "Télécharger pour Linux". Le fichier NexaRH-x.x.x.AppImage sera téléchargé.' },
    { icon: MousePointerClick, title: 'Rendez-le exécutable', detail: 'Ouvrez un terminal dans le dossier du fichier et exécutez : chmod +x NexaRH-*.AppImage' },
    { icon: Play, title: 'Lancez l\'AppImage', detail: 'Double-cliquez sur le fichier AppImage ou lancez-le depuis le terminal : ./NexaRH-*.AppImage' },
    { icon: FolderOpen, title: '(Optionnel) Installez-le', detail: 'Vous pouvez déplacer l\'AppImage dans /opt ou ~/Applications. Créez un lanceur .desktop pour l\'intégrer au menu.' },
  ],
}

export default function Installation() {
  const [tab, setTab] = useState<Platform>('windows')

  return (
    <section id="install" className="py-24 lg:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-4">
            Installation
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Installer NexaRH en quelques clics
          </h2>
          <p className="text-gray-600">
            Suivez les étapes correspondant à votre système d&apos;exploitation.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                tab === t.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {steps[tab].map((step, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    Étape {i + 1}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-0.5">{step.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
