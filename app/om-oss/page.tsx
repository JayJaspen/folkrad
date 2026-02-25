export default function OmOssPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="section-title">Om Folkrådet</h1>
      <div className="mt-8 prose prose-navy mx-auto">
        <div className="card space-y-6">
          <p className="text-lg text-gray-600 leading-relaxed">
            En politiskt neutral tjänst som är 100% transparent med
            undersökningsresultaten. Din röst är även konfidentiell, så ingen
            mer än du själv kan se vad du röstar.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Du kan själv sortera utefter utvalda kriterier för att se hur
            resultaten ser ut baserat på kön, ålder &amp; län.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Vi som driver Folkrådet är politiskt neutrala och lyfter
            samhällsaktuella frågor.
          </p>

          <div className="bg-navy/5 rounded-lg p-6 mt-8">
            <h3 className="font-display text-xl font-bold text-navy mb-3">
              Kontakta oss
            </h3>
            <p className="text-gray-600">
              📧{' '}
              <a
                href="mailto:info@folkradet.se"
                className="text-gold hover:underline"
              >
                info@folkradet.se
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
