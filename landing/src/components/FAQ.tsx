'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'NexaRH est-il vraiment gratuit ?',
    a: 'Oui ! NexaRH est totalement gratuit. Pas de version premium, pas d\'abonnement, pas de limite de fonctionnalités. Vous téléchargez, vous installez, vous utilisez.',
  },
  {
    q: 'Mes données sont-elles stockées en ligne ?',
    a: 'Non. NexaRH est une application de bureau. Toutes vos données sont stockées localement sur votre machine dans une base SQLite. Aucune donnée ne transite par Internet. Vous gardez le contrôle total.',
  },
  {
    q: 'Puis-je exporter/importer ma base de données ?',
    a: 'Oui. NexaRH permet d\'exporter et d\'importer la base de données via l\'interface. Vous pouvez faire des sauvegardes manuelles ou compter sur la sauvegarde automatique hebdomadaire (tous les vendredis).',
  },
  {
    q: 'Comment sont générés les matricules ?',
    a: 'Les matricules sont générés automatiquement de façon aléatoire : EMP-XXXXXX pour les employés, STG-XXXXXX pour les stagiaires, APP-XXXXXX pour les apprenants. Le système garantit l\'unicité de chaque matricule.',
  },
  {
    q: 'Est-ce que je peux imprimer des attestations de stage ?',
    a: 'Oui. NexaRH génère des attestations de stage au format PDF avec un design moderne et élégant (fond bleu marine, accents dorés, bandes décoratives, sceau officiel). Prêtes à imprimer et à signer.',
  },
  {
    q: 'Puis-je personnaliser les bulletins de paie ?',
    a: 'Oui. Les bulletins de paie sont générés en PDF avec vos informations d\'entreprise. Vous pouvez personnaliser l\'en-tête et le pied de page. Le calcul des charges et des congés est automatisé.',
  },
  {
    q: 'NexaRH fonctionne-t-il sur mon Mac ?',
    a: 'Oui. NexaRH est disponible pour macOS (Intel et Apple Silicon). Le premier lancement nécessite un clic droit > Ouvrir car l\'application n\'est pas signée par Apple. Ensuite, elle fonctionne normalement.',
  },
  {
    q: 'Comment installer NexaRH sur Linux ?',
    a: 'Téléchargez le fichier .AppImage, rendez-le exécutable avec chmod +x, puis lancez-le. Aucune installation ni dépendance supplémentaire n\'est requise. L\'AppImage fonctionne sur toutes les distributions.',
  },
  {
    q: 'Comment signaler un bug ou suggérer une amélioration ?',
    a: 'Rendez-vous sur le dépôt GitHub : https://github.com/jonathan268/nexarh/issues. Vous pouvez y ouvrir une issue pour signaler un bug ou proposer une amélioration.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 lg:py-32 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-gray-600">
            Tout ce que vous devez savoir avant de télécharger NexaRH.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                'rounded-xl border transition-all duration-200',
                open === i ? 'border-brand-200 bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex items-center justify-between w-full px-6 py-4 text-left"
                aria-expanded={open === i}
              >
                <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200',
                    open === i && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <p className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
