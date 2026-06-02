'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Téléchargement', href: '#download' },
  { label: 'Installation', href: '#install' },
  { label: 'FAQ', href: '#faq' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <span className={cn('font-bold text-xl tracking-tight', scrolled ? 'text-gray-900' : 'text-white')}>
              Nexa<span className="text-brand-500">RH</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                )}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#download"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40"
            >
              Télécharger
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className={cn('w-6 h-6', scrolled ? 'text-gray-900' : 'text-white')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className={cn('w-6 h-6', scrolled ? 'text-gray-900' : 'text-white')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#download"
              className="block text-center px-4 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all"
              onClick={() => setMobileOpen(false)}
            >
              Télécharger
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
