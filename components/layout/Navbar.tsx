'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Menu, X, User, LogOut, Shield, ChevronDown } from 'lucide-react'

export function Navbar() {
  const { user, profile, isAdmin, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="bg-navy text-white sticky top-0 z-50 shadow-strong">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⚖</span>
            <span className="font-display text-xl font-bold tracking-wide">
              Folkrådet
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="nav-link">Hem</Link>
            <Link href="/arkiv" className="nav-link">Arkiv</Link>
            <Link href="/om-oss" className="nav-link">Om Oss</Link>
            <Link href="/kontakt" className="nav-link">Kontakt</Link>
            {isAdmin && (
              <Link href="/admin" className="nav-link flex items-center gap-1">
                <Shield size={16} />
                Admin
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-navy-light animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm hover:text-gold transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <User size={16} className="text-gold" />
                  </div>
                  <span>{profile?.username || 'Användare'}</span>
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-strong border py-1 z-50">
                    <Link
                      href="/profil"
                      className="block px-4 py-2 text-sm text-navy hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Min profil
                    </Link>
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Logga ut
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm nav-link">
                  Logga in
                </Link>
                <Link href="/register" className="btn-primary text-sm !py-2 !px-4">
                  Registrera
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-2 pt-4 space-y-3">
            <Link href="/" className="block nav-link py-1" onClick={() => setMobileOpen(false)}>Hem</Link>
            <Link href="/arkiv" className="block nav-link py-1" onClick={() => setMobileOpen(false)}>Arkiv</Link>
            <Link href="/om-oss" className="block nav-link py-1" onClick={() => setMobileOpen(false)}>Om Oss</Link>
            <Link href="/kontakt" className="block nav-link py-1" onClick={() => setMobileOpen(false)}>Kontakt</Link>
            {isAdmin && (
              <Link href="/admin" className="block nav-link py-1" onClick={() => setMobileOpen(false)}>Admin</Link>
            )}
            <div className="pt-3 border-t border-white/10">
              {user ? (
                <button onClick={() => { signOut(); setMobileOpen(false) }} className="text-red-400 text-sm">
                  Logga ut
                </button>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" className="text-sm nav-link">Logga in</Link>
                  <Link href="/register" className="btn-primary text-sm !py-2 !px-4">Registrera</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
