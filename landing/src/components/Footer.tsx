import { Github, Mail, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xs">
                N
              </div>
              <span className="font-bold text-lg text-white">Nexa<span className="text-brand-400">RH</span></span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Logiciel de gestion des ressources humaines tout-en-un. Gratuit, puissant, multiplateforme.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Produit</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
              <li><a href="#download" className="hover:text-white transition-colors">Téléchargement</a></li>
              <li><a href="#install" className="hover:text-white transition-colors">Installation</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Ressources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://github.com/jonathan268/nexarh" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              </li>
              <li>
                <a href="https://github.com/jonathan268/nexarh/releases" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Notes de version
                </a>
              </li>
              <li>
                <a href="https://github.com/jonathan268/nexarh/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Signaler un bug
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://github.com/jonathan268/nexarh/discussions" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                  Discussions
                </a>
              </li>
              <li className="text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> contact@nexarh.app
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} NexaRH. Logiciel libre sous licence MIT.</p>
          <p className="inline-flex items-center gap-1 text-gray-500">
            Fait avec <Heart className="w-3.5 h-3.5 text-red-500" /> pour les RH
          </p>
        </div>
      </div>
    </footer>
  )
}
