import { useState } from 'react'

const roles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer']
const positions = ['Internship', 'Full Time Job']
const skills = ['React.js', 'Node.js', 'Express.js', 'Next.js', 'JavaScript', 'HTML', 'CSS', 'MySQL', 'PostgreSQL', 'Figma', 'Canva', 'REST APIs', 'GitHub']

export default function Onboarding({ session, saveProfile }) {
  const emailName = session?.user?.email?.split('@')[0] || ''
  const [name, setName] = useState('')
  const [username, setUsername] = useState(emailName)
  const [role, setRole] = useState(roles[0])
  const [position, setPosition] = useState(positions[0])
  const [selectedSkills, setSelectedSkills] = useState(['React.js', 'JavaScript'])
  const [error, setError] = useState('')

  const toggleSkill = (skill) => {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    )
  }

  const handleSubmit = () => {
    const cleanName = name.trim()
    const cleanUsername = username.trim().replace(/^@+/, '')

    if (!cleanName) {
      setError('Please enter your full name.')
      return
    }

    if (!cleanUsername) {
      setError('Please choose a username.')
      return
    }

    if (selectedSkills.length === 0) {
      setError('Select at least one skill for your practice sessions.')
      return
    }

    saveProfile({
      name: cleanName,
      username: cleanUsername,
      role,
      position,
      skills: selectedSkills,
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{
        position: 'fixed',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '640px',
        height: '640px',
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 68%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div className="glass animate-scale-in" style={{
        width: '100%',
        maxWidth: '760px',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: '800',
            color: '#fff',
            fontFamily: 'var(--font-head)',
            margin: '0 auto 1rem',
          }}>IQ</div>
          <h1 style={{
            fontFamily: 'var(--font-head)',
            fontWeight: '800',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            marginBottom: '0.5rem',
          }}>
            Set up your practice profile
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '15px' }}>
            These details shape your mock interview questions.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '1.25rem',
            fontSize: '13px',
            color: 'var(--red)',
          }}>{error}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px', fontWeight: '500' }}>
              Full name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: '14px',
              }}
            />
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px', fontWeight: '500' }}>
              Username
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: '14px',
              }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px', fontWeight: '500' }}>
              Target role
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: '14px',
              }}
            >
              {roles.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px', fontWeight: '500' }}>
              Position level
            </span>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: '14px',
              }}
            >
              {positions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <p style={{
            fontSize: '12px',
            color: 'var(--text3)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}>
            Skills
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill) => {
              const active = selectedSkills.includes(skill)
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '7px 13px',
                    background: active ? 'rgba(108,99,255,0.18)' : 'var(--surface)',
                    border: active ? '1px solid rgba(108,99,255,0.45)' : '1px solid var(--border2)',
                    borderRadius: '99px',
                    color: active ? 'var(--accent2)' : 'var(--text2)',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  {skill}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="glow-btn"
          style={{ width: '100%', fontSize: '15px', padding: '13px', marginTop: '2rem' }}
        >
          Continue to dashboard {'→'}
        </button>
      </div>
    </div>
  )
}