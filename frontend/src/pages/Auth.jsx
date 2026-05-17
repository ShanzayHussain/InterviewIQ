import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth({ navigate }) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields'); 
      return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let result

      if (isSignup) {
        result = await supabase.auth.signUp({ email: email.trim(), password })
        if (!result.error) {
          setSuccess('Account created! Please check your email and click the confirmation link before signing in.')
          setIsSignup(false)
          setPassword('')
        }
      } else {
        result = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        // if (!result.error) {
        //   navigate('onboarding')
        // }
      }

      if (result.error) setError(result.error.message)
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0
      }} />

      <div
        className="glass animate-scale-in"
        style={{
          width: '100%', maxWidth: '420px',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow)',
          position: 'relative', zIndex: 1
        }}
      >
        <button
          onClick={() => navigate('landing')}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text3)', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '2rem', cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          ← Back to home
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            borderRadius: 'var(--radius)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: '800', color: '#fff',
            fontFamily: 'var(--font-head)',
            margin: '0 auto 1rem'
          }}>IQ</div>

          <h1 style={{
            fontFamily: 'var(--font-head)', fontWeight: '800',
            fontSize: '1.6rem', marginBottom: '6px'
          }}>
            {isSignup ? 'Create account' : 'Welcome back'}
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '14px' }}>
            {isSignup ? 'Start practicing for your dream job' : 'Continue your interview practice'}
          </p>
        </div>

        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '1rem',
            fontSize: '13px', color: 'var(--green)'
          }}>{success}</div>
        )}

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '1rem',
            fontSize: '13px', color: 'var(--red)'
          }}>{error}</div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px', fontWeight: '500' }}>
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%', padding: '12px 14px',
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)', fontSize: '14px',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%', padding: '12px 14px',
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)', fontSize: '14px',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="glow-btn"
          style={{ width: '100%', fontSize: '15px', padding: '13px' }}
        >
          {loading
            ? 'Please wait...'
            : isSignup ? 'Create account' : 'Sign in'
          }
        </button>

        <p style={{
          textAlign: 'center', fontSize: '13px',
          color: 'var(--text3)', marginTop: '1.5rem'
        }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess('') }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--accent2)', fontWeight: '600',
              cursor: 'pointer', fontSize: '13px',
              textDecoration: 'underline'
            }}
          >
            {isSignup ? 'Sign in' : 'Sign up free'}
          </button>
        </p>
      </div>
    </div>
  )
}