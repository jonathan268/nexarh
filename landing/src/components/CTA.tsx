import { Download, ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Rejoignez les équipes qui utilisent NexaRH
        </h2>
        <p className="text-lg text-brand-100 mb-8 max-w-lg mx-auto">
          Téléchargez gratuitement et simplifiez votre gestion RH dès aujourd&apos;hui.
        </p>
        <a
          href="#download"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-brand-700 hover:bg-brand-50 font-bold text-base transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
        >
          <Download className="w-5 h-5" />
          Télécharger NexaRH
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  )
}
