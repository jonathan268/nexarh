import { ArrowRight, Download, CheckCircle2 } from 'lucide-react'

const stats = [
  { label: 'Modules RH', value: '12+' },
  { label: 'Export PDF', value: 'Intégré' },
  { label: 'Notifications', value: 'Automatiques' },
  { label: 'Plateformes', value: '3' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-600/15 via-transparent to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white">
            Gérez vos RH avec
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">
              puissance & simplicité
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            NexaRH est le logiciel de gestion des ressources humaines tout-en-un. Employés, contrats, paie, congés,
            stages, formations — centralisez et automatisez l&apos;ensemble de vos processus RH.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#download"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-0.5 animate-glow hover:animate-none"
            >
              <Download className="w-5 h-5 animate-bounce-gentle" />
              Télécharger gratuitement
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-gray-600 text-gray-200 hover:bg-white/5 font-semibold text-base transition-all"
            >
              Voir les fonctionnalités
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 pt-4 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Gratuit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Aucun abonnement
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Données locales
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> 3 plateformes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-6 max-w-xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />
    </section>
  )
}
