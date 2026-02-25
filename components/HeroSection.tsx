'use client'

import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="bg-navy text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
          Folkrådet
        </h1>
        <p className="text-xl md:text-2xl font-display text-gold mb-4">
          Demokratisk Dialog
        </p>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          En politiskt neutral tjänst som är 100% transparent med undersökningsresultaten.
          Din röst är konfidentiell — ingen mer än du själv kan se vad du röstar.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register" className="btn-primary">
            Skapa konto
          </Link>
          <Link href="/om-oss" className="btn-outline border-white/30 text-white hover:bg-white/10 hover:text-white">
            Läs mer
          </Link>
        </div>
      </div>
    </section>
  )
}
