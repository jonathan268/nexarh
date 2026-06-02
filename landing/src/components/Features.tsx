'use client'

import { cn } from '@/lib/utils'
import {
  Users, FileText, CalendarDays, Banknote,
  GraduationCap, BookOpen, UserCheck, Bell,
  ShieldCheck, Database, Download, Printer
} from 'lucide-react'
import Reveal from './Reveal'

const features = [
  {
    icon: Users,
    title: 'Gestion des employés',
    desc: 'Fiches complètes, matricules automatiques, historique des postes et services.',
  },
  {
    icon: FileText,
    title: 'Contrats de travail',
    desc: 'CDI, CDD, conventions. Suivi des échéances, renouvellements et statuts.',
  },
  {
    icon: Banknote,
    title: 'Paie automatisée',
    desc: 'Bulletins de paie PDF personnalisés, calcul automatique des charges et congés.',
  },
  {
    icon: CalendarDays,
    title: 'Congés & absences',
    desc: 'Soldes de congés, validation des demandes, historique et relances automatiques.',
  },
  {
    icon: GraduationCap,
    title: 'Gestion des stages',
    desc: 'Stagiaires, conventions, attestations de stage PDF design luxe, suivi des périodes.',
  },
  {
    icon: BookOpen,
    title: 'Formations & inscriptions',
    desc: 'Plan de formation, inscriptions avec créneaux (09h-12h, 12h-15h, 15h-18h).',
  },
  {
    icon: UserCheck,
    title: 'Apprenants & alternance',
    desc: 'Suivi des apprenants en alternance, présences, contrats d\'apprentissage.',
  },
  {
    icon: Bell,
    title: 'Notifications intelligentes',
    desc: 'Alertes fin de contrat, fin de stage, impayés, backup, rappels automatiques.',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité & rôles',
    desc: 'Authentification, gestion des permissions, journal d\'audit complet.',
  },
  {
    icon: Database,
    title: 'Sauvegarde automatique',
    desc: 'Backup hebdomadaire automatique (vendredi). Import/export natif de la base.',
  },
  {
    icon: Printer,
    title: 'Export PDF pro',
    desc: 'Attestations, bulletins, rapports. Designs modernes prêts à imprimer.',
  },
  {
    icon: Download,
    title: 'Multiplateforme',
    desc: 'Disponible sur Windows (installateur), macOS (DMG) et Linux (AppImage).',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-4">
            Fonctionnalités
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin pour gérer vos RH
          </h2>
          <p className="text-lg text-gray-600">
            Un logiciel complet qui couvre l&apos;ensemble de vos processus RH, de l&apos;embauche à la paie.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 60}>
              <div className={cn(
                'group p-6 rounded-2xl border border-gray-100 hover:border-brand-100 hover:shadow-lg hover:shadow-brand-50/50 transition-all duration-300 hover:scale-[1.03]'
              )}>
                <div className="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className="w-6 h-6 text-brand-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
