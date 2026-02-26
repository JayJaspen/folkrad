'use client';
import { useState } from 'react';

const COUNTIES = [
  'Blekinge','Dalarna','Gotland','Gävleborg','Halland','Jämtland','Jönköping',
  'Kalmar','Kronoberg','Norrbotten','Skåne','Stockholm','Södermanland','Uppsala',
  'Värmland','Västerbotten','Västernorrland','Västmanland','Västra Götaland','Örebro','Östergötland'
];

type Mode = 'landing' | 'login' | 'register' | 'verify';

export default function Home() {
  const [mode, setMode] = useState<Mode>('landing');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Register
  const [rName, setRName] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rPw, setRPw] = useState('');
  const [rGender, setRGender] = useState('');
  const [rYear, setRYear] = useState('');
  const [rCounty, setRCounty] = useState('');

  // SMS
  const [smsCode, setSmsCode] = useState('');
  const [pendingData, setPendingData] = useState<any>(null);

  const reset = () => { setError(''); setSuccess(''); };

  const go = (m: Mode, admin = false) => {
    reset(); setMode(m); setIsAdmin(admin);
  };

  /* ── LOGIN ──────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); reset();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.redirect;
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  /* ── REGISTER ───────────────── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); reset();
    const currentYear = new Date().getFullYear();
    if (currentYear - parseInt(rYear) < 18) {
      setError('Du måste vara minst 18 år.'); setLoading(false); return;
    }
    const userData = {
      name: rName, email: rEmail, phone: rPhone, password: rPw,
      gender: rGender, birth_year: parseInt(rYear), county: rCounty,
    };
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPendingData(userData);
      setMode('verify');
      setSuccess('En verifieringskod har skickats via SMS.');
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  /* ── VERIFY SMS ─────────────── */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); reset();
    try {
      const res = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: pendingData.phone, code: smsCode, userData: pendingData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Konto skapat! Du kan nu logga in.');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const yearOpts = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 18 - i);

  /* ── STYLES (inline to keep in one file) ── */
  const S = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #0c1a32 0%, #163a64 45%, #0a1428 100%)',
      position: 'relative' as const, overflow: 'hidden',
    },
    // subtle grain overlay
    grain: {
      position: 'fixed' as const, inset: 0, pointerEvents: 'none' as const,
      opacity: 0.035,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    },
    header: {
      padding: '1.2rem 2rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      position: 'relative' as const, zIndex: 2,
    },
    logo: {
      display: 'flex', alignItems: 'center', gap: '.7rem',
    },
    logoMark: {
      width: 42, height: 42, borderRadius: '50%',
      background: 'linear-gradient(135deg, #c5a247, #ddc578)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.35rem', fontWeight: 700, color: '#0c1a32',
      fontFamily: 'var(--font-display)',
    },
    logoText: {
      fontFamily: 'var(--font-display)', fontSize: '1.55rem',
      color: '#c5a247', letterSpacing: '.3px',
    },
    main: {
      maxWidth: 1200, margin: '0 auto', padding: '0 1rem',
      position: 'relative' as const, zIndex: 2,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '110px 1fr 110px',
      gap: '2rem', alignItems: 'start',
    },
    center: {
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', paddingTop: '3.5rem', paddingBottom: '4rem',
    },
    heroTitle: {
      fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.2rem)',
      color: '#fff', textAlign: 'center' as const, lineHeight: 1.2,
      marginBottom: '1.2rem',
    },
    heroGold: { color: '#c5a247' },
    heroSub: {
      color: 'rgba(255,255,255,.55)', fontSize: '1.1rem',
      textAlign: 'center' as const, maxWidth: 520, lineHeight: 1.6,
      marginBottom: '2.5rem',
    },
    heroBtns: {
      display: 'flex', gap: '1rem', flexWrap: 'wrap' as const, justifyContent: 'center',
    },
    adminLink: {
      marginTop: '2.5rem', background: 'none', border: 'none',
      color: 'rgba(255,255,255,.22)', fontSize: '.75rem', cursor: 'pointer',
      fontFamily: 'var(--font-body)', textDecoration: 'underline',
    },
    formWrap: { width: '100%', maxWidth: 440 },
    formWrapWide: { width: '100%', maxWidth: 480 },
    formTitle: {
      fontFamily: 'var(--font-display)', fontSize: '1.5rem',
      color: 'var(--navy)', marginBottom: '.35rem',
    },
    formSub: { color: '#999', fontSize: '.88rem', marginBottom: '1.5rem' },
    mb: (n: number) => ({ marginBottom: `${n}rem` }),
    row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    switchLink: {
      marginTop: '1rem', textAlign: 'center' as const,
    },
    switchBtn: {
      background: 'none', border: 'none', color: 'var(--gold)',
      cursor: 'pointer', fontWeight: 600, fontSize: '.88rem',
      fontFamily: 'var(--font-body)',
    },
    footer: {
      textAlign: 'center' as const, padding: '3rem 0 1.5rem',
      color: 'rgba(255,255,255,.2)', fontSize: '.75rem',
      position: 'relative' as const, zIndex: 2,
    },
    codeInput: {
      textAlign: 'center' as const, fontSize: '1.6rem',
      letterSpacing: '.6rem', fontWeight: 600,
    },
  };

  return (
    <div style={S.page}>
      <div style={S.grain} />

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoMark}>F</div>
          <span style={S.logoText}>Folkrådet</span>
        </div>
        <div style={{ display: 'flex', gap: '.6rem' }}>
          <button className="btn btn-gold" style={{ fontSize: '.82rem', padding: '.5rem 1.1rem' }}
            onClick={() => go('login')}>Logga in</button>
          <button className="btn btn-outline-light" style={{ fontSize: '.82rem', padding: '.5rem 1.1rem' }}
            onClick={() => go('register')}>Registrera</button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={S.main}>
        <div style={S.grid}>
          {/* Left ad */}
          <div className="ad-slot ad-slot-dark hide-mobile" style={{ minHeight: 550 }}>Annons</div>

          {/* Center */}
          <div style={S.center}>

            {/* ═══ LANDING ═══ */}
            {mode === 'landing' && (
              <div className="anim-fade-up">
                <h2 style={S.heroTitle}>
                  Din röst.<br /><span style={S.heroGold}>Varje vecka.</span>
                </h2>
                <p style={S.heroSub}>
                  Folkrådet ger dig möjligheten att delta i veckans viktigaste frågor
                  och följa Sveriges politiska puls i realtid.
                </p>
                <div style={S.heroBtns}>
                  <button className="btn btn-gold" style={{ fontSize: '1.05rem', padding: '.9rem 2.2rem' }}
                    onClick={() => go('register')}>Skapa konto</button>
                  <button className="btn btn-ghost" style={{ fontSize: '1.05rem', padding: '.9rem 2.2rem' }}
                    onClick={() => go('login')}>Logga in</button>
                </div>
                <button style={S.adminLink} onClick={() => go('login', true)}>Admin</button>
              </div>
            )}

            {/* ═══ LOGIN ═══ */}
            {mode === 'login' && (
              <div className="card anim-fade-up" style={S.formWrap}>
                <h2 style={S.formTitle}>{isAdmin ? 'Admin-inloggning' : 'Logga in'}</h2>
                <p style={S.formSub}>{isAdmin ? 'Logga in med ditt admin-konto' : 'Välkommen tillbaka'}</p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleLogin}>
                  <div style={S.mb(1)}>
                    <label className="label">E-postadress</label>
                    <input className="field" type="email" required value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)} />
                  </div>
                  <div style={S.mb(1.5)}>
                    <label className="label">Lösenord</label>
                    <input className="field" type="password" required value={loginPw}
                      onChange={e => setLoginPw(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading}
                    style={{ width: '100%' }}>
                    {loading ? 'Loggar in…' : 'Logga in'}
                  </button>
                </form>
                <div style={S.switchLink}>
                  <button style={S.switchBtn} onClick={() => go(isAdmin ? 'landing' : 'register')}>
                    {isAdmin ? '← Tillbaka' : 'Har du inget konto? Registrera dig'}
                  </button>
                </div>
              </div>
            )}

            {/* ═══ REGISTER ═══ */}
            {mode === 'register' && (
              <div className="card anim-fade-up" style={S.formWrapWide}>
                <h2 style={S.formTitle}>Skapa konto</h2>
                <p style={S.formSub}>Registrera dig för att delta i Folkrådet</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleRegister}>
                  <div style={S.mb(.9)}>
                    <label className="label">Namn</label>
                    <input className="field" required value={rName} onChange={e => setRName(e.target.value)} />
                  </div>
                  <div style={S.mb(.9)}>
                    <label className="label">E-postadress</label>
                    <input className="field" type="email" required value={rEmail} onChange={e => setREmail(e.target.value)} />
                  </div>
                  <div style={S.mb(.9)}>
                    <label className="label">Mobilnummer (t.ex. +46701234567)</label>
                    <input className="field" type="tel" required placeholder="+46…" value={rPhone}
                      onChange={e => setRPhone(e.target.value)} />
                  </div>
                  <div style={S.mb(.9)}>
                    <label className="label">Lösenord (minst 6 tecken)</label>
                    <input className="field" type="password" required minLength={6} value={rPw}
                      onChange={e => setRPw(e.target.value)} />
                  </div>

                  <div style={{ ...S.row2, ...S.mb(.9) }}>
                    <div>
                      <label className="label">Kön</label>
                      <select className="field select" required value={rGender} onChange={e => setRGender(e.target.value)}>
                        <option value="">Välj…</option>
                        <option>Man</option><option>Kvinna</option><option>Vill ej ange</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Födelseår</label>
                      <select className="field select" required value={rYear} onChange={e => setRYear(e.target.value)}>
                        <option value="">Välj…</option>
                        {yearOpts.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={S.mb(1.5)}>
                    <label className="label">Län</label>
                    <select className="field select" required value={rCounty} onChange={e => setRCounty(e.target.value)}>
                      <option value="">Välj län…</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Registrerar…' : 'Registrera'}
                  </button>
                </form>
                <div style={S.switchLink}>
                  <button style={S.switchBtn} onClick={() => go('login')}>
                    Har du redan konto? Logga in
                  </button>
                </div>
              </div>
            )}

            {/* ═══ VERIFY SMS ═══ */}
            {mode === 'verify' && (
              <div className="card anim-fade-up" style={S.formWrap}>
                <h2 style={S.formTitle}>Verifiera ditt nummer</h2>
                <p style={S.formSub}>Ange koden som skickades till {pendingData?.phone}</p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleVerify}>
                  <div style={S.mb(1.5)}>
                    <label className="label">Verifieringskod</label>
                    <input className="field" required maxLength={6} placeholder="123456"
                      value={smsCode} onChange={e => setSmsCode(e.target.value)}
                      style={S.codeInput} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Verifierar…' : 'Verifiera'}
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Right ad */}
          <div className="ad-slot ad-slot-dark hide-mobile" style={{ minHeight: 550 }}>Annons</div>
        </div>
      </main>

      <footer style={S.footer}>
        © {new Date().getFullYear()} Folkrådet. Alla rättigheter förbehållna.
      </footer>
    </div>
  );
}
