export default function Landing({ navigate, session }) {
  const isLoggedIn = !!session

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '15%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
          animation: 'orb 12s ease-in-out infinite',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
          animation: 'orb 15s ease-in-out infinite reverse',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
          animation: 'orb 10s ease-in-out infinite 3s',
          borderRadius: '50%'
        }} />
      </div>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '0 clamp(1rem, 4vw, 2.5rem)', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem',
        background: 'rgba(10,10,15,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '800', color: '#fff',
            fontFamily: 'var(--font-head)', flexShrink: 0
          }}>IQ</div>
          <span style={{
            fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '20px',
            background: 'linear-gradient(135deg, #fff, var(--accent2))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap'
          }}>InterviewIQ</span>
        </div>

        <button
          onClick={() => navigate(isLoggedIn ? 'dashboard' : 'auth')}
          className="glow-btn"
          style={{ fontSize: '14px', padding: '9px clamp(14px, 3vw, 22px)', whiteSpace: 'nowrap' }}
        >
          {isLoggedIn ? 'Go to Dashboard ->' : 'Get Started →'}
        </button>
      </header>

      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: 'auto',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '116px 2rem 3rem'
      }}>
        <div
          className="animate-fade-up"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(108,99,255,0.12)',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: '99px',
            padding: '6px 16px',
            marginBottom: '2rem',
            animation: 'fadeUp 0.5s ease forwards'
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--accent2)', fontWeight: '600', letterSpacing: '0.08em' }}>
            AI-POWERED MOCK INTERVIEWS
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontWeight: '800',
            fontSize: 'clamp(2.6rem, 7vw, 5.5rem)',
            lineHeight: '1.08',
            maxWidth: '820px',
            marginBottom: '1.5rem',
            animation: 'fadeUp 0.6s ease 0.1s both forwards',
            // opacity: 0
          }}
        >
          Ace Your Next{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Interview</span>
          <br />with AI
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text2)',
          maxWidth: '560px',
          lineHeight: '1.7',
          marginBottom: '2.5rem',
          animation: 'fadeUp 0.6s ease 0.2s both forwards',
          // opacity: 0
        }}>
          Practice real interview questions tailored to your role and skills.
          Get instant AI feedback, track your progress, and land the job.
        </p>

        <div style={{
          display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.6s ease 0.3s both forwards',
          // opacity: 0
        }}>
          <button
            onClick={() => navigate(isLoggedIn ? 'dashboard' : 'auth')}
            className="glow-btn"
            style={{ fontSize: '16px', padding: '15px 36px', animation: 'pulse-glow 3s ease-in-out infinite' }}
          >
          {isLoggedIn ? 'Go to Dashboard' : 'Start Practicing Free'} {'→'}
          </button>
          {/* <button className="outline-btn" style={{ fontSize: '15px', padding: '14px 28px' }}>
            Watch Demo
          </button> */}
        </div>

      </section>

      <section style={{
        position: 'relative', zIndex: 1,
        padding: '1rem 2rem 5rem',
        maxWidth: '1100px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontFamily: 'var(--font-head)', fontWeight: '700',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          textAlign: 'center', marginBottom: '0.75rem'
        }}>Everything you need to prepare</h2>
        <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: '3rem', fontSize: '15px' }}>
          Built for CS students and early career developers
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {[
            {
              icon: 'Q',
              title: 'Role-specific questions',
              desc: 'Questions tailored to Frontend, Backend, Full Stack, or UI/UX roles - matching real interviews.',
              color: 'var(--accent)'
            },
            {
              icon: 'IQ',
              title: 'Instant AI feedback',
              desc: 'Get detailed feedback after every answer - what was good, what to improve, and how to say it better.',
              color: 'var(--accent3)'
            },
            {
              icon: '%',
              title: 'Performance tracking',
              desc: 'Visual scores and star ratings after each session so you can see yourself improving over time.',
              color: 'var(--gold)'
            },
            {
              icon: '?',
              title: 'AI chatbot assistant',
              desc: 'Stuck on a concept during the interview? Ask the built-in AI chatbot for hints and explanations.',
              color: 'var(--green)'
            },
            {
              icon: '{}',
              title: 'Skill-based practice',
              desc: 'Select your skills - React, Node, Figma, SQL and more - for questions that match your actual stack.',
              color: '#f472b6'
            },
            {
              icon: 'CV',
              title: 'Internship & job ready',
              desc: 'Practice for internships or full-time roles with questions that match the experience level.',
              color: '#fb923c'
            },
          ].map(({ icon, title, desc, color }) => (
            <div
              key={title}
              className="glass"
              style={{
                padding: '1.75rem',
                borderRadius: 'var(--radius-lg)',
                transition: 'transform 0.25s, border-color 0.25s',
                cursor: 'default'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = 'var(--border2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <div style={{
                width: '48px', height: '48px',
                background: `${color}18`,
                borderRadius: 'var(--radius)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: icon.length > 1 ? '15px' : '22px',
                fontWeight: '800',
                fontFamily: 'var(--font-head)',
                color,
                marginBottom: '1rem',
                border: `1px solid ${color}30`
              }}>{icon}</div>
              <h3 style={{
                fontFamily: 'var(--font-head)', fontWeight: '600',
                fontSize: '17px', marginBottom: '8px', color: 'var(--text)'
              }}>{title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.65' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center',
        padding: '5rem 2rem 6rem'
      }}>
        <div className="glass" style={{
          maxWidth: '600px', margin: '0 auto',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--glow)'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-head)', fontWeight: '800',
            fontSize: '2rem', marginBottom: '1rem'
          }}>Ready to practice?</h2>
          <p style={{ color: 'var(--text2)', marginBottom: '2rem', fontSize: '15px', lineHeight: '1.6' }}>
            Free to use. No credit card. Just sign up and start your first mock interview in minutes.
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? 'dashboard' : 'auth')}
            className="glow-btn"
            style={{ fontSize: '16px', padding: '14px 36px' }}
          >
            {isLoggedIn ? 'Go to Dashboard ->' : 'Create Free Account →'}
          </button>
        </div>
      </section>

      <footer style={{
        textAlign: 'center', padding: '2rem',
        borderTop: '1px solid var(--border)',
        color: 'var(--text3)', fontSize: '13px',
        position: 'relative', zIndex: 1
      }}>
        <span style={{ fontFamily: 'var(--font-head)', fontWeight: '600' }}>InterviewIQ</span>
        {' '}- Built for CS students - Powered by Groq AI
      </footer>
    </div>
  )
}
