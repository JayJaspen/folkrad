'use client';

export default function DashboardPage() {
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header style={{
        background: 'linear-gradient(135deg, var(--navy), var(--blue))',
        padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #c5a247, #ddc578)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 700, color: '#0c1a32',
            fontFamily: 'var(--font-display)',
          }}>F</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#c5a247' }}>
            Folkrådet
          </span>
        </div>
        <button className="btn btn-outline-light" style={{ fontSize: '.8rem', padding: '.4rem .9rem' }}
          onClick={handleLogout}>Logga ut</button>
      </header>

      <div style={{ maxWidth: 900, margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: '1rem' }}>
          Välkommen!
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          🏗️ Användar-dashboarden byggs i nästa steg. Inloggningen fungerar!
        </p>
      </div>
    </div>
  );
}
