import { ArrowRight, Download, Users, FileText, Calendar, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Modules RH', value: '12+' },
  { label: 'Export PDF', value: 'Intégré' },
  { label: 'Notifications', value: 'Automatiques' },
  { label: 'Plateformes', value: '3' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-sky-600/5 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Version 1.0.0 disponible
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Gérez vos RH avec
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-400">
                puissance & simplicité
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
              NexaRH est le logiciel de gestion des ressources humaines tout-en-un. Employés, contrats, paie, congés,
              stages, formations — centralisez et automatisez l&apos;ensemble de vos processus RH.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#download"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-gray-800">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-4 shadow-lg shadow-brand-600/30">
                    <span className="text-white font-bold text-2xl">N</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">Interface de gestion NexaRH</p>
                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    {[Users, FileText, Calendar, TrendingUp].map((Icon, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-gray-700">
                        <Icon className="w-4 h-4 text-brand-400" />
                        <span className="text-gray-300 text-xs">{['Employés', 'Contrats', 'Congés', 'Paie'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl" />
            <div className="absolute -top-4 -left-4 w-48 h-48 bg-sky-600/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
