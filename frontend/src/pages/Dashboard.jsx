// ── Dashboard: main home page after login ──
// Shows welcome, profile summary, last result score, and Start Interview CTA

export default function Dashboard({ userProfile, navigate, lastResult }) {

  // ── Star rating component (reused for score display) ──
  const StarRating = ({ score }) => {
    // Score is 1–10, convert to 1–5 stars
    const stars = Math.round((score / 10) * 5)
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{
            fontSize: '24px',
            color: i <= stars ? 'var(--gold)' : 'var(--surface2)',
            filter: i <= stars ? 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' : 'none',
            transition: 'all 0.2s'
          }}>★</span>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px', // offset for fixed navbar
      padding: '90px 2rem 4rem',
      maxWidth: '1100px',
      margin: '0 auto',
      position: 'relative', zIndex: 1
    }}>

      {/* ── Welcome header ── */}
      <div
        className="animate-fade-up"
        style={{ marginBottom: '2.5rem' }}
      >
        <p style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: '500', marginBottom: '6px' }}>
          Good to have you back
        </p>
        <h1 style={{
          fontFamily: 'var(--font-head)', fontWeight: '800',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          background: 'linear-gradient(135deg, var(--text), var(--accent2))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Hey, {userProfile?.name || userProfile?.username} 
           <span
    style={{
      WebkitTextFillColor: 'initial',
      background: 'none'
    }}
  >
      ⚡
  </span>

        </h1> 

        <p style={{ color: 'var(--text2)', fontSize: '16px' }}>
          Ready to practice your{' '}
          <span style={{ color: 'var(--accent2)', fontWeight: '500' }}>{userProfile?.role}</span> interview?
        </p>
      </div>

      {/* ── Stats row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Role',     value: userProfile?.role || '—',          icon: '🎯' },
          { label: 'Position', value: userProfile?.position || '—',       icon: '💼' },
          { label: 'Skills',   value: `${userProfile?.skills?.length || 0} selected`, icon: '🛠️' },
          { label: 'Sessions', value: lastResult ? '1+' : '0',            icon: '📊' },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="glass"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              transition: 'transform 0.2s, border-color 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.borderColor = 'var(--border2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
            <p style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-head)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Main content: Start interview + last result ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: lastResult ? '1fr 1fr' : '1fr',
        gap: '16px',
        marginBottom: '2rem'
      }}>

        {/* Start Interview CTA card */}
        <div
          className="glass"
          style={{
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(108,99,255,0.3)',
            boxShadow: 'var(--glow)'
          }}
        >
          {/* Decorative background glow */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
              borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', marginBottom: '1.25rem',
              boxShadow: '0 8px 24px rgba(108,99,255,0.4)'
            }}>▶</div>

            <h2 style={{
              fontFamily: 'var(--font-head)', fontWeight: '800',
              fontSize: '1.6rem', marginBottom: '0.75rem'
            }}>
              Start Mock Interview
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: '1.65', marginBottom: '1.75rem' }}>
              Practice as a <strong style={{ color: 'var(--text)' }}>{userProfile?.role}</strong> applying
              for a <strong style={{ color: 'var(--text)' }}>{userProfile?.position}</strong> role.
              AI will ask 5 questions and give you feedback after each one.
            </p>

            <button
              onClick={() => navigate('interview')}
              className="glow-btn"
              style={{ fontSize: '15px', padding: '13px 28px' }}
            >
              Begin Interview →
            </button>
          </div>
        </div>

        {/* ── Last result card (only shown if user completed an interview) ── */}
        {lastResult && (
          <div
            className="glass"
            style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}
          >
            <p style={{
              fontSize: '12px', fontWeight: '500', color: 'var(--text3)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem'
            }}>Last session</p>

            {/* Star rating */}
            <div style={{ marginBottom: '1rem' }}>
              {StarRating({ score: lastResult.totalScore })}
            </div>

            {/* Score number */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{
                fontFamily: 'var(--font-head)', fontWeight: '800',
                fontSize: '3rem',
                background: lastResult.totalScore >= 7
                  ? 'linear-gradient(135deg, var(--green), #34d399)'
                  : lastResult.totalScore >= 5
                  ? 'linear-gradient(135deg, var(--gold), #fbbf24)'
                  : 'linear-gradient(135deg, var(--red), #f87171)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {lastResult.totalScore.toFixed(1)}
              </span>
              <span style={{ color: 'var(--text3)', fontSize: '18px' }}>/10</span>
            </div>

            {/* Performance label */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              background: lastResult.totalScore >= 7
                ? 'rgba(16,185,129,0.12)'
                : lastResult.totalScore >= 5
                ? 'rgba(245,158,11,0.12)'
                : 'rgba(248,113,113,0.12)',
              borderRadius: '99px',
              border: `1px solid ${lastResult.totalScore >= 7 ? 'rgba(16,185,129,0.3)' : lastResult.totalScore >= 5 ? 'rgba(245,158,11,0.3)' : 'rgba(248,113,113,0.3)'}`,
              marginBottom: '1.25rem'
            }}>
              <span style={{
                fontSize: '13px', fontWeight: '500',
                color: lastResult.totalScore >= 7 ? 'var(--green)' : lastResult.totalScore >= 5 ? 'var(--gold)' : 'var(--red)'
              }}>
                {lastResult.totalScore >= 7 ? '🎉 Great performance' : lastResult.totalScore >= 5 ? '👍 Good effort' : '💪 Keep practicing'}
              </span>
            </div>

            {/* Per-question scores mini chart */}
            {lastResult.scores && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>Per question</p>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '50px' }}>
                  {lastResult.scores.map((score, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '100%',
                        height: `${(score / 10) * 40}px`,
                        background: score >= 7
                          ? 'linear-gradient(180deg, var(--green), #34d399)'
                          : score >= 5
                          ? 'linear-gradient(180deg, var(--gold), #fbbf24)'
                          : 'linear-gradient(180deg, var(--red), #f87171)',
                        borderRadius: '4px 4px 0 0',
                        minHeight: '4px',
                        transition: 'height 0.5s ease'
                      }} />
                      <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Q{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('interview')}
              className="outline-btn"
              style={{ width: '100%', marginTop: '1.25rem', fontSize: '14px', padding: '11px' }}
            >
              Try Again →
            </button>
          </div>
        )}
      </div>

      {/* ── Skills pills (decorative info) ── */}
      {userProfile?.skills?.length > 0 && (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <p style={{
            fontSize: '12px', fontWeight: '500', color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'
          }}>Your skills</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {userProfile.skills.map(skill => (
              <span key={skill} style={{
                padding: '5px 12px',
                background: 'rgba(108,99,255,0.1)',
                border: '1px solid rgba(108,99,255,0.25)',
                borderRadius: '99px',
                fontSize: '13px', fontWeight: '500',
                color: 'var(--accent2)'
              }}>{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
