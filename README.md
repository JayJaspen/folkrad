# Folkrådet – En Röst För Folket

Komplett Next.js + Supabase-applikation för www.folkradet.se

---

## Snabbstart – steg för steg

### 1. Förutsättningar

- Node.js 18+ installerat
- Ett GitHub-konto (du har det redan)
- Ett Vercel-konto (du har det redan)
- Ett Supabase-konto (gratis på supabase.com)
- Ett 46elks-konto för SMS (registrera på 46elks.com)

---

### 2. Skapa Supabase-projekt

1. Gå till [https://supabase.com](https://supabase.com) → New Project
2. Välj ett projektnamn (t.ex. `folkradet`) och ett lösenord
3. Gå till **SQL Editor** och klistra in hela innehållet från `supabase/migrations/001_initial_schema.sql`
4. Klicka **Run** – detta skapar alla tabeller och funktioner
5. Gå till **Project Settings → API**:
   - Kopiera **Project URL** → detta är `NEXT_PUBLIC_SUPABASE_URL`
   - Kopiera **anon public key** → detta är `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Kopiera **service_role key** → detta är `SUPABASE_SERVICE_ROLE_KEY`

---

### 3. Sätt upp projektet lokalt

```bash
# Klona/ladda in projektet
cd folkradet

# Installera beroenden
npm install

# Kopiera miljövariabelfilen
cp .env.local.example .env.local
```

Öppna `.env.local` och fyll i dina nycklar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ditt-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-nyckel
SUPABASE_SERVICE_ROLE_KEY=din-service-role-nyckel

ELKS_API_USERNAME=din-46elks-username
ELKS_API_PASSWORD=din-46elks-lösenord
ELKS_FROM_NAME=Folkradet

NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_LEFT=XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_RIGHT=XXXXXXXXXX
```

Starta utvecklingsserver:
```bash
npm run dev
# → http://localhost:3000
```

---

### 4. Skapa admin-konto

1. Registrera dig via `/register` med din e-post
2. Gå till Supabase → **Table Editor → profiles**
3. Hitta din rad och sätt `is_admin = true`

Eller kör i SQL Editor:
```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'din@email.se';
```

---

### 5. Publicera på GitHub

```bash
# Initiera git i projektmappen
git init
git add .
git commit -m "Initial commit – Folkrådet"

# Skapa nytt repo på github.com, sedan:
git remote add origin https://github.com/ditt-användarnamn/folkradet.git
git branch -M main
git push -u origin main
```

---

### 6. Driftsätt på Vercel

1. Gå till [https://vercel.com](https://vercel.com) → **New Project**
2. Välj ditt GitHub-repo `folkradet`
3. Klicka **Import**
4. Under **Environment Variables**, lägg till alla variabler från `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ELKS_API_USERNAME`
   - `ELKS_API_PASSWORD`
   - `ELKS_FROM_NAME`
   - `NEXT_PUBLIC_ADSENSE_CLIENT` (kan läggas till senare)
5. Klicka **Deploy** – din sida är live inom 2 minuter!

Vercel ger dig en URL som `folkradet.vercel.app`.

---

### 7. Koppla domänen www.folkradet.se

**I Vercel:**
1. Gå till ditt projekt → **Settings → Domains**
2. Lägg till `folkradet.se` och `www.folkradet.se`
3. Vercel visar dig de DNS-värden du behöver

**I one.com:**
1. Logga in på one.com
2. Gå till **DNS-inställningar** för `folkradet.se`
3. Lägg till/uppdatera dessa DNS-poster:
   - **CNAME**: `www` → `cname.vercel-dns.com`
   - **A-post**: `@` (root) → Vercels IP (visas i Vercel-dashboarden)
4. DNS-propagering tar vanligtvis 5-60 minuter

---

### 8. Supabase Auth – konfigurera URL

1. Gå till Supabase → **Authentication → URL Configuration**
2. Sätt **Site URL** till `https://www.folkradet.se`
3. Lägg till `https://www.folkradet.se/**` under **Redirect URLs**

---

## Arkitektur

```
folkradet/
├── app/
│   ├── page.tsx                    # Landningssida
│   ├── login/page.tsx              # Inloggning
│   ├── register/page.tsx           # Registrering (med 46elks SMS)
│   ├── contact/page.tsx            # Kontaktsida
│   ├── dashboard/                  # Användarvy (kräver inloggning)
│   │   ├── veckans-fraga/          # Flik 1: Veckans fråga + partiomröstning
│   │   ├── valjarbarometer/        # Flik 2: Väljarbarometer + PDF-export
│   │   ├── forslag/                # Flik 3: Förslag på frågor
│   │   ├── arkiv/                  # Flik 4: Arkiv
│   │   └── min-sida/               # Flik 5: Byt lösenord
│   ├── admin/                      # Adminvy (kräver is_admin=true)
│   │   ├── veckans-fraga/          # Skapa/hantera veckans fråga
│   │   ├── forslag/                # Granska användarförslag
│   │   ├── statistik/              # Statistik + PDF-export
│   │   ├── anvandare/              # Sök/hantera användare
│   │   ├── cpm-banners/            # Administrera annonsbanners
│   │   └── installningar/          # Webbplatsinställningar
│   └── api/
│       └── auth/
│           ├── send-sms/           # Skicka verifieringskod via 46elks
│           └── verify-sms/         # Verifiera kod
├── components/
│   ├── BannerAd.tsx                # Google AdSense / bildbanner
│   ├── charts/VoteChart.tsx        # Cirkel- & stapeldiagram (Recharts)
│   └── filters/ResultFilter.tsx    # Ålder/kön/läns-filter
├── lib/
│   ├── constants.ts                # Län, åldersgrupper, partier
│   ├── utils.ts                    # Hjälpfunktioner
│   └── supabase/
│       ├── client.ts               # Supabase browser-klient
│       └── server.ts               # Supabase server-klient
├── middleware.ts                   # Auth-skydd för /dashboard och /admin
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Hela databasstrukturen
```

---

## Teknisk stack

| Komponent | Teknologi |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Databas + Auth | Supabase (PostgreSQL + Row Level Security) |
| SMS-verifiering | 46elks (Sverige) |
| Diagram | Recharts |
| PDF-export | jsPDF + html2canvas |
| Annonsering | Google AdSense |
| Hosting | Vercel |

---

## Partifärger (väljarbarometern)

| Parti | Färg |
|---|---|
| Socialdemokraterna | `#E8112d` (röd) |
| Moderaterna | `#1B4F72` (mörkblå) |
| Sverigedemokraterna | `#5DADE2` (ljusblå) |
| Centerpartiet | `#27AE60` (grön) |
| Vänsterpartiet | `#8B0000` (mörkröd) |
| Kristdemokraterna | `#154360` (mörkblå) |
| Miljöpartiet de gröna | `#82E0AA` (ljusgrön) |
| Liberalerna | `#85C1E9` (ljusblå) |
| Annat parti | `#9B59B6` (lila) |
| Osäker | `#F4D03F` (gul) |

---

## Vanliga frågor

**Hur fungerar "antal registrerade användare" på startsidan?**
Räknaren visar 100+, 200+ osv. Den visas inte alls förrän minst 100 användare är registrerade.

**Hur aktiverar jag SMS-verifiering?**
Registrera ett konto på [46elks.com](https://46elks.com), hämta dina API-uppgifter och lägg till dem som miljövariabler.

**Hur publicerar jag en ny "Veckans fråga"?**
Logga in som admin → fliken "Veckans fråga" → klicka "Skapa ny fråga". Den gamla frågan inaktiveras automatiskt.

**Kan jag stänga av en användare?**
Ja, under Admin → Användare. Sök upp användaren och klicka "Stäng av". De får ett meddelande att de ska kontakta info@folkradet.se.

---

## Support

Kontakt: info@folkradet.se
