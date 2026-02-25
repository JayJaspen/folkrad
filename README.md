# Folkrådet - Demokratisk Dialog

En politiskt neutral plattform för demokratisk dialog, byggd med Next.js och Supabase.

## 🚀 Kom igång

### 1. Skapa Supabase-projekt

1. Gå till [supabase.com](https://supabase.com) och skapa ett nytt projekt
2. Kopiera din **Project URL** och **anon public key** från Settings → API
3. Kör SQL-schemat i Supabase SQL Editor:
   - Öppna `supabase-schema.sql` och kör hela filen i SQL Editor

### 2. Konfigurera miljövariabler

```bash
cp .env.local.example .env.local
```

Fyll i dina Supabase-uppgifter i `.env.local`

### 3. Installera och kör

```bash
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000)

### 4. Skapa admin-användare

1. Registrera ett konto via `/register`
2. Kör i Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'din-admin@epost.se';
```

### 5. Deploy till Vercel

1. Pusha koden till GitHub
2. Importera projektet i [Vercel](https://vercel.com)
3. Lägg till miljövariabler i Vercel (Settings → Environment Variables)
4. Deploy!

## 📁 Projektstruktur

```
folkradet/
├── app/
│   ├── layout.tsx          # Root layout med Navbar
│   ├── page.tsx            # Startsida (Veckans Fråga + Partisympati)
│   ├── globals.css         # Tailwind + design system
│   ├── (auth)/
│   │   ├── login/page.tsx  # Inloggning
│   │   └── register/page.tsx # Registrering
│   ├── admin/page.tsx      # Admin-panel
│   ├── arkiv/page.tsx      # Arkiv med filter
│   ├── om-oss/page.tsx     # Om Folkrådet
│   └── kontakt/page.tsx    # Kontaktformulär
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Navigation
│   │   └── AuthProvider.tsx # Auth context
│   ├── admin/
│   │   ├── AdminQuestions.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── AdminSuggestions.tsx
│   │   └── AdminStats.tsx
│   ├── HeroSection.tsx
│   ├── WeekQuestionCard.tsx
│   └── PartyPreference.tsx
├── lib/
│   ├── supabase-browser.ts # Client-side Supabase
│   ├── supabase-server.ts  # Server-side Supabase
│   └── supabase-middleware.ts
├── types/index.ts          # TypeScript typer
├── middleware.ts            # Auth middleware
└── supabase-schema.sql     # Databasschema
```

## 🎨 Design

- **Navy:** #0f172a (primär)
- **Guld:** #c9a961 (accent)
- **Font Display:** Cormorant Garamond
- **Font Body:** Montserrat

## ✅ Funktioner

- [x] Användarregistrering & inloggning (Supabase Auth)
- [x] Veckans Fråga (flerval + öppna frågor)
- [x] Partisympatier med statistik
- [x] Admin-panel (frågor, användare, förslag, statistik)
- [x] Arkiv med filtrering (kön, ålder, län)
- [x] Kontaktformulär
- [x] Om Folkrådet
- [x] Responsiv design
- [x] Skyddade admin-routes via middleware
