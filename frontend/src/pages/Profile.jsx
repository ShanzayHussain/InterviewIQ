// ── Profile page: view user info (/profile) ──
// Shows username (read-only), name, email, role, skills, position
// All data comes from userProfile saved during onboarding

export default function Profile({ session, userProfile, navigate }) {
  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '64px',
      padding: '90px 2rem 4rem',
      maxWidth: '700px',
      margin: '0 auto',
      position: 'relative', zIndex: 1
    }}>

      {/* ── Page header ── */}
      <div className="animate-fade-up" style={{ marginBottom: '2.5rem' }}>
        <button
          onClick={() => navigate('dashboard')}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text3)', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '1.5rem', cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          ← Dashboard
        </button>
        <h1 style={{
          fontFamily: 'var(--font-head)', fontWeight: '800',
          fontSize: '2rem', marginBottom: '0.5rem'
        }}>Your Profile</h1>
        <p style={{ color: 'var(--text2)', fontSize: '15px' }}>
          Your account information and interview preferences
        </p>
      </div>

      {/* ── Avatar + name header ── */}
      <div
        className="glass animate-fade-up"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem'
        }}
      >
        {/* Large avatar */}
        <div style={{
          width: '72px', height: '72px', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: '800', color: '#fff',
          fontFamily: 'var(--font-head)',
          boxShadow: '0 8px 24px rgba(108,99,255,0.35)'
        }}>
          {userProfile?.username?.slice(0, 2).toUpperCase() || 'IQ'}
        </div>

        <div>
          <h2 style={{
            fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '1.4rem', marginBottom: '4px'
          }}>
            {userProfile?.name || '—'}
          </h2>
          {/* Username — clearly read-only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text3)' }}>
              @{userProfile?.username || '—'}
            </span>
            <span style={{
              fontSize: '10px', padding: '1px 7px',
              background: 'var(--surface2)', borderRadius: '99px',
              color: 'var(--text3)', border: '1px solid var(--border)'
            }}>cannot edit</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>{session.user.email}</p>
        </div>
      </div>

      {/* ── Info fields ── */}
      <div
        className="glass animate-fade-up"
        style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem' }}
      >
        {/* Each field row */}
        {[
          { label: 'Full name',   value: userProfile?.name,  icon: '👤' },
          { label: 'Email',       value: session.user.email, icon: '✉️' },
          { label: 'Username',    value: `@${userProfile?.username}`, icon: '🏷️', locked: true },
        ].map(({ label, value, icon, locked }, i, arr) => (
          <div
            key={label}
            style={{
              padding: '1.1rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '14px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'
            }}
          >
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                {label}
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '400' }}>
                {value || '—'}
              </p>
            </div>
            {locked && (
              <span style={{ fontSize: '16px', color: 'var(--text3)' }}>🔒</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Interview settings ── */}
      <div
        className="glass animate-fade-up"
        style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem' }}
      >
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <p style={{
            fontSize: '12px', fontWeight: '600', color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>Interview settings</p>
        </div>

        {[
          { label: 'Role',     value: userProfile?.role,     icon: '🎯' },
          { label: 'Position', value: userProfile?.position, icon: '💼' },
        ].map(({ label, value, icon }, i) => (
          <div key={label} style={{
            padding: '1.1rem 1.5rem',
            display: 'flex', alignItems: 'center', gap: '14px',
            borderBottom: i === 0 ? '1px solid var(--border)' : 'none'
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                {label}
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text)' }}>{value || '—'}</p>
            </div>
            <span style={{
              padding: '3px 10px',
              background: 'rgba(108,99,255,0.12)',
              border: '1px solid rgba(108,99,255,0.25)',
              borderRadius: '99px', fontSize: '12px', color: 'var(--accent2)', fontWeight: '500'
            }}>active</span>
          </div>
        ))}
      </div>

      {/* ── Skills ── */}
      {userProfile?.skills?.length > 0 && (
        <div
          className="glass animate-fade-up"
          style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}
        >
          <p style={{
            fontSize: '12px', fontWeight: '600', color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'
          }}>Skills ({userProfile.skills.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {userProfile.skills.map(skill => (
              <span key={skill} style={{
                padding: '6px 14px',
                background: 'rgba(108,99,255,0.1)',
                border: '1px solid rgba(108,99,255,0.25)',
                borderRadius: '99px', fontSize: '13px', fontWeight: '500',
                color: 'var(--accent2)'
              }}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => navigate('interview')}
          className="glow-btn"
          style={{ flex: 1, padding: '13px', fontSize: '14px' }}
        >
          ▶ Start Interview
        </button>
        <button
          onClick={() => navigate('dashboard')}
          className="outline-btn"
          style={{ flex: 1, padding: '13px', fontSize: '14px' }}
        >
          ← Dashboard
        </button>
      </div>
    </div>
  )
}
