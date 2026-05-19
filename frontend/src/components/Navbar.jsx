import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Navbar({ session, userProfile, navigate, currentPage }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const initials = userProfile?.username
    ? userProfile.username.slice(0, 2).toUpperCase()
    : session?.user?.email?.slice(0, 2).toUpperCase() || 'IQ'

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      padding: '0 1.25rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>

      {/* ── Logo ── */}
      <button
        onClick={() => navigate('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none' }}
      >
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '700', color: '#fff',
          fontFamily: 'var(--font-head)', flexShrink: 0,
        }}>IQ</div>
        <span style={{
          fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '18px',
          background: 'linear-gradient(135deg, var(--text), var(--accent2))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>InterviewIQ</span>
      </button>

      {/* ── Desktop nav links — hidden on mobile ── */}
      <div className="desktop-nav" style={{ display: 'flex', gap: '8px' }}>
        {[
          { label: 'Dashboard',       key: 'dashboard' },
          { label: 'Start Interview', key: 'interview' },
        ].map(({ label, key }) => (
          <button key={key} onClick={() => navigate(key)} style={{
            background: currentPage === key ? 'var(--surface)' : 'transparent',
            color: currentPage === key ? 'var(--accent2)' : 'var(--text2)',
            border: currentPage === key ? '1px solid var(--border2)' : '1px solid transparent',
            padding: '7px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: '14px', fontFamily: 'var(--font-body)', fontWeight: '500',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
            onMouseEnter={e => { if (currentPage !== key) e.target.style.color = 'var(--text)' }}
            onMouseLeave={e => { if (currentPage !== key) e.target.style.color = 'var(--text2)' }}
          >
            {label === 'Start Interview' && <span style={{ marginRight: '6px' }}>▶</span>}
            {label}
          </button>
        ))}
      </div>

      {/* ── Desktop profile dropdown — hidden on mobile ── */}
      <div className="desktop-nav" style={{ position: 'relative' }}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: '99px', padding: '6px 14px 6px 6px', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
        >
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', color: '#fff', fontFamily: 'var(--font-head)',
          }}>{initials}</div>
          <span style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: '500' }}>
            {userProfile?.username || 'Profile'}
          </span>
          <span style={{
            fontSize: '10px', color: 'var(--text3)',
            transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}>▼</span>
        </button>

        {menuOpen && (
          <div className="animate-scale-in" style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', padding: '8px',
            minWidth: '200px', boxShadow: 'var(--shadow)', zIndex: 200,
          }}>
            <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-head)' }}>
                @{userProfile?.username || '—'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>
                {session.user.email}
              </p>
              {userProfile?.role && (
                <span style={{
                  display: 'inline-block', marginTop: '8px',
                  background: 'rgba(108,99,255,0.15)', color: 'var(--accent2)',
                  fontSize: '11px', fontWeight: '500', padding: '2px 8px',
                  borderRadius: '99px', border: '1px solid rgba(108,99,255,0.3)',
                }}>{userProfile.role}</span>
              )}
            </div>
            {[
              { label: '👤  View Profile', action: () => { navigate('profile'); setMenuOpen(false) } },
              { label: '🏠  Dashboard',    action: () => { navigate('dashboard'); setMenuOpen(false) } },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} style={{
                width: '100%', textAlign: 'left', background: 'transparent',
                color: 'var(--text2)', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                fontSize: '13px', transition: 'all 0.15s', display: 'block', border: 'none', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.target.style.background = 'var(--surface2)'; e.target.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text2)' }}
              >{label}</button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>
              <button onClick={handleLogout} style={{
                width: '100%', textAlign: 'left', background: 'transparent',
                color: 'var(--red)', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                fontSize: '13px', transition: 'all 0.15s', border: 'none', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.target.style.background = 'rgba(248,113,113,0.1)' }}
                onMouseLeave={e => { e.target.style.background = 'transparent' }}
              >🚪  Sign out</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Hamburger button — shown only on mobile ── */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
          color: 'var(--text)', fontSize: '18px', cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div className="mobile-menu animate-fade-in" style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          padding: '1rem', zIndex: 99,
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {/* User info */}
          <div style={{
            padding: '10px 12px 14px', borderBottom: '1px solid var(--border)', marginBottom: '4px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', color: '#fff',
            }}>{initials}</div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
                @{userProfile?.username || '—'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{session.user.email}</p>
            </div>
          </div>

          {/* Nav items */}
          {[
            { label: '🏠  Dashboard',      key: 'dashboard' },
            { label: '▶  Start Interview', key: 'interview' },
            { label: '👤  Profile',        key: 'profile' },
          ].map(({ label, key }) => (
            <button key={key} onClick={() => { navigate(key); setMenuOpen(false) }} style={{
              background: currentPage === key ? 'var(--surface)' : 'transparent',
              color: currentPage === key ? 'var(--accent2)' : 'var(--text2)',
              border: `1px solid ${currentPage === key ? 'var(--border2)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', padding: '13px 16px',
              fontSize: '14px', textAlign: 'left', cursor: 'pointer', fontWeight: '500',
            }}>{label}</button>
          ))}

          <button onClick={handleLogout} style={{
            background: 'transparent', color: 'var(--red)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 'var(--radius-sm)', padding: '13px 16px',
            fontSize: '14px', textAlign: 'left', cursor: 'pointer', marginTop: '4px',
          }}>🚪  Sign out</button>
        </div>
      )}
    </nav>
  )
}
