
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react';

interface MenuItem {
  page: string
  title: string
}

interface MainHeaderProps {
  menuPages: MenuItem[]
}

export default function MainHeader({ menuPages }: MainHeaderProps) {

  const pageSlugMap: Record<string, string> = {
    HOME: '/',
    BEACH: '/praias',
    BUSINESS_FOOD: '/o-que-comer',
    BUSINESS_ACCOMMODATION: '/onde-ficar',
    EVENTS: '/eventos',
    NEWS: '/noticias',
    TOUR: '/o-que-fazer',
  }

  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu mobile ao clicar fora
  useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-menu.png"
              alt="São Sebastião Turismo"
              width={240}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Menu de Navegação */}
          <nav className="hidden md:flex-wrap md:flex items-center gap-6">
            {menuPages.map((page) => {
              const href = pageSlugMap[page.page] || `/${page.page.toLowerCase()}`
              return (
                <Link
                  key={page.page}
                  href={href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition text-sm uppercase"
                >
                  {page.title}
                </Link>
              )
            })}
          </nav>

          {/* Menu Mobile (hamburger) */}
          <button
            className="md:hidden text-gray-700"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar Mobile */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" />
            {/* Sidebar */}
            <div
              ref={menuRef}
              className="relative ml-auto w-64 max-w-full bg-white h-full shadow-lg p-6 flex flex-col gap-4 animate-slide-in-right"
            >
              <button
                className="absolute top-4 right-4 text-gray-700"
                aria-label="Fechar menu"
                onClick={() => setMobileOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <nav className="flex flex-col gap-4 mt-8">
                {menuPages.map((page) => {
                  const href = pageSlugMap[page.page] || `/${page.page.toLowerCase()}`
                  return (
                    <Link
                      key={page.page}
                      href={href}
                      className="text-gray-700 hover:text-blue-600 font-medium transition text-base uppercase"
                      onClick={() => setMobileOpen(false)}
                    >
                      {page.title}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
