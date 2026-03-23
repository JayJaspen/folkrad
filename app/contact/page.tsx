"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Could wire to an email API (e.g. Resend) – for now just show confirmation
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <span className="text-gold font-bold text-sm">F</span>
        </div>
        <span className="text-primary font-bold text-lg">Folkrådet</span>
      </Link>

      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-bold text-primary mb-1">Kontakta oss</h1>
        <p className="text-gray-500 text-sm mb-6">
          Du kan alltid nå oss på{" "}
          <a href="mailto:info@folkradet.se" className="text-primary font-medium hover:underline">
            info@folkradet.se
          </a>
        </p>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📨</div>
            <p className="font-semibold text-primary">Tack för ditt meddelande!</p>
            <p className="text-gray-500 text-sm mt-2">Vi återkommer så snart som möjligt.</p>
            <Link href="/" className="btn-primary inline-block mt-4">Tillbaka till startsidan</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Namn</label>
              <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Ditt namn" />
            </div>
            <div>
              <label className="label">E-post</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="din@email.se" />
            </div>
            <div>
              <label className="label">Meddelande</label>
              <textarea className="input min-h-[120px] resize-none" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required placeholder="Skriv ditt meddelande här..." />
            </div>
            <button type="submit" className="btn-primary w-full">Skicka</button>
          </form>
        )}
      </div>
    </div>
  );
}
