import { useState } from 'react'
// import { supabase } from '../supabaseClient'

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer']
const SKILLS = ['React.js', 'Node.js', 'Express.js', 'Next.js', 'JavaScript', 'HTML', 'CSS', 'MySQL', 'PostgreSQL', 'Figma', 'Canva', 'REST APIs', 'GitHub']
const POSITIONS = ['Internship', 'Full Time Job']

export default function Profile({ session, userProfile, navigate, setUserProfile }) {
  const [editing, setEditing]       = useState(false)
  const [name, setName]             = useState(userProfile?.name || '')
  const [role, setRole]             = useState(userProfile?.role || '')
  const [skills, setSkills]         = useState(userProfile?.skills || [])
  const [position, setPosition]     = useState(userProfile?.position || '')
  const [saved, setSaved]           = useState(false)

  const toggleSkill = (skill) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  const handleSave = () => {
    const updated = { ...userProfile, name, role, skills, position }
    // Save to localStorage using user ID (same key as onboarding)
    localStorage.setItem(`profile_${session.user.id}`, JSON.stringify(updated))
    setUserProfile(updated)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCancel = () => {
    // Reset to original values
    setName(userProfile?.name || '')
    setRole(userProfile?.role || '')
    setSkills(userProfile?.skills || [])
    setPosition(userProfile?.position || '')
    setEditing(false)
  }

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '64px',
      padding: '90px 2rem 4rem',
      maxWidth: '700px', margin: '0 auto',
      position: 'relative', zIndex: 1
    }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('dashboard')}
          style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '13px', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >← Dashboard</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '2rem', marginBottom: '0.4rem' }}>Your Profile</h1>
            <p style={{ color: 'var(--text2)', fontSize: '15px' }}>Manage your account and interview preferences</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="outline-btn" style={{ padding: '9px 20px', fontSize: '13px' }}>
              ✏️ Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCancel} className="outline-btn" style={{ padding: '9px 16px', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleSave} className="glow-btn" style={{ padding: '9px 20px', fontSize: '13px' }}>Save →</button>
            </div>
          )}
        </div>
        {saved && (
          <div style={{
            marginTop: '12px', padding: '10px 14px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--green)'
          }}>✓ Profile saved successfully</div>
        )}
      </div>

      {/* Avatar + locked fields */}
      <div className="glass" style={{ padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: '64px', height: '64px', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-head)',
          boxShadow: '0 8px 24px rgba(108,99,255,0.35)'
        }}>
          {userProfile?.username?.slice(0, 2).toUpperCase() || 'AI'}
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: '700', fontSize: '1.2rem', marginBottom: '3px' }}>
            {userProfile?.name}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '3px' }}>@{userProfile?.username} 🔒</p>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>{session.user.email}</p>
        </div>
      </div>

      {/* Editable fields */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1rem' }}>

        {/* Name */}
        <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Full name</p>
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px',
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          ) : (
            <p style={{ fontSize: '15px', color: 'var(--text)' }}>{userProfile?.name || '—'}</p>
          )}
        </div>

        {/* Role */}
        <div style={{ padding: '1.1rem 1.5rem' }}>
          <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Role</p>
          {editing ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    padding: '7px 14px',
                    background: role === r ? 'rgba(108,99,255,0.2)' : 'var(--surface)',
                    border: `1px solid ${role === r ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '99px', fontSize: '13px', fontWeight: '500',
                    color: role === r ? 'var(--accent2)' : 'var(--text2)', cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >{r}</button>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '15px', color: 'var(--text)' }}>{userProfile?.role || '—'}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="glass" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
        <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Skills {editing && <span style={{ color: 'var(--text3)', textTransform: 'none', fontSize: '11px' }}>(tap to toggle)</span>}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(editing ? SKILLS : userProfile?.skills || []).map(skill => {
            const isSelected = skills.includes(skill)
            return (
              <button
                key={skill}
                onClick={() => editing && toggleSkill(skill)}
                style={{
                  padding: '5px 13px',
                  background: editing
                    ? isSelected ? 'rgba(108,99,255,0.2)' : 'var(--surface)'
                    : 'rgba(108,99,255,0.1)',
                  border: `1px solid ${editing ? isSelected ? 'var(--accent)' : 'var(--border)' : 'rgba(108,99,255,0.25)'}`,
                  borderRadius: '99px', fontSize: '13px', fontWeight: '500',
                  color: editing ? isSelected ? 'var(--accent2)' : 'var(--text2)' : 'var(--accent2)',
                  cursor: editing ? 'pointer' : 'default',
                  transition: 'all 0.15s'
                }}
              >
                {editing && isSelected && '✓ '}{skill}
              </button>
            )
          })}
        </div>
      </div>

      {/* Position */}
      <div className="glass" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Position</p>
        {editing ? (
          <div style={{ display: 'flex', gap: '10px' }}>
            {POSITIONS.map(p => (
              <button
                key={p}
                onClick={() => setPosition(p)}
                style={{
                  flex: 1, padding: '10px',
                  background: position === p ? 'rgba(108,99,255,0.2)' : 'var(--surface)',
                  border: `1px solid ${position === p ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '500',
                  color: position === p ? 'var(--accent2)' : 'var(--text2)', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >{p}</button>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '15px', color: 'var(--text)' }}>{userProfile?.position || '—'}</p>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => navigate('interview')} className="glow-btn" style={{ flex: 1, padding: '13px', fontSize: '14px' }}>
          ▶ Start Interview
        </button>
        <button onClick={() => navigate('dashboard')} className="outline-btn" style={{ flex: 1, padding: '13px', fontSize: '14px' }}>
          ← Dashboard
        </button>
      </div>
    </div>
  )
}