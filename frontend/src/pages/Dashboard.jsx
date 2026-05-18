import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function Dashboard({ userProfile, navigate, lastResult, interviewHistory = [], sessionCount }) {

  const chartRef = useRef(null)
  const chartCanvasRef = useRef(null)

  // ── Star rating component ──
  const StarRating = ({ score }) => {
    const stars = Math.round((score / 10) * 5)
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{
            fontSize: '22px',
            color: i <= stars ? 'var(--gold)' : 'var(--surface2)',
            filter: i <= stars ? 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' : 'none',
            transition: 'all 0.2s'
          }}>★</span>
        ))}
      </div>
    )
  }

  // ── interviewHistory from Supabase comes newest-first
  //    For charts we need oldest-first, so reverse it
  const savedAttempts = Array.isArray(interviewHistory) ? interviewHistory : []

  // chronological = oldest → newest (for charts and progress)
  const chronological = [...savedAttempts].reverse()

  // Make sure lastResult isn't duplicated
  const hasLastResult = lastResult && chronological.some(a =>
    a.completedAt && a.completedAt === lastResult.completedAt
  )
  const attempts = hasLastResult
    ? chronological
    : lastResult
    ? [...chronological, lastResult]
    : chronological

  // currentAttempt = most recent = last in chronological array
  const currentAttempt  = attempts.length > 0 ? attempts[attempts.length - 1] : null
  // previousAttempt = second most recent
  const previousAttempt = attempts.length > 1 ? attempts[attempts.length - 2] : null

  // ── Score progress chart (oldest → newest left → right) ──
  const chartWidth   = 520
  const chartHeight  = 180
  const chartPadding = 24
  const chartPoints  = attempts.map((attempt, index) => {
    const score = Number(attempt.totalScore) || 0
    const usableWidth  = chartWidth  - chartPadding * 2
    const usableHeight = chartHeight - chartPadding * 2
    const x = attempts.length === 1
      ? chartWidth / 2
      : chartPadding + (index / (attempts.length - 1)) * usableWidth
    const y = chartPadding + (1 - score / 10) * usableHeight
    return { x, y, score, label: `A${index + 1}` }
  })
  const chartPath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // // ── Per-skill analytics ──
  // const getSkillAverage = (attempt, skill) => {
  //   const related = (attempt?.allFeedback || [])
  //     .filter(item => `${item.question || ''} ${item.feedback || ''}`.toLowerCase().includes(skill.toLowerCase()))
  //   return related.length
  //     ? related.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / related.length
  //     : null
  // }

  // const skillAnalytics = (userProfile?.skills || [])
  //   .map(skill => ({
  //     skill,
  //     previous: previousAttempt ? getSkillAverage(previousAttempt, skill) : null,
  //     current:  currentAttempt  ? getSkillAverage(currentAttempt,  skill) : null,
  //   }))
  //   .filter(item => item.previous !== null || item.current !== null)
  //   .slice(0, 6)
// ── Per-skill analytics ──
const getSkillAverage = (attempt, skill) => {
  const allFeedback = attempt?.allFeedback || []

  // Try matching skill name in question/feedback
  const related = allFeedback.filter(item =>
    `${item.question || ''} ${item.feedback || ''}`
      .toLowerCase()
      .includes(skill.toLowerCase())
  )

  // If matching questions found
  if (related.length > 0) {
    return (
      related.reduce(
        (sum, item) => sum + (Number(item.score) || 0),
        0
      ) / related.length
    )
  }

  // Fallback → use overall interview average
  if (allFeedback.length > 0) {
    return (
      allFeedback.reduce(
        (sum, item) => sum + (Number(item.score) || 0),
        0
      ) / allFeedback.length
    )
  }

  return null
}

const skillAnalytics = (userProfile?.skills || [])
  .map(skill => ({
    skill,

    previous: previousAttempt
      ? getSkillAverage(previousAttempt, skill)
      : null,

    current: currentAttempt
      ? getSkillAverage(currentAttempt, skill)
      : null,
  }))
  .slice(0, 6)



  // ── Chart.js bar chart ──
  useEffect(() => {
    if (!skillAnalytics.length || !chartCanvasRef.current) return

    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    chartRef.current = new Chart(chartCanvasRef.current, {
      type: 'bar',
      data: {
        labels: skillAnalytics.map(s => s.skill),
        datasets: [
          {
            label: 'Previous',
            data: skillAnalytics.map(s => s.previous ?? 0),
            backgroundColor: 'rgba(90,90,112,0.45)',
            borderColor: 'rgba(160,155,200,0.7)',
            borderWidth: 1.5,
            borderRadius: 5,
            barPercentage: 0.65,
            categoryPercentage: 0.75,
          },
          {
            label: 'Current',
            data: skillAnalytics.map(s => s.current ?? 0),
            backgroundColor: 'rgba(56,189,248,0.45)',
            borderColor: 'rgba(56,189,248,0.85)',
            borderWidth: 1.5,
            borderRadius: 5,
            barPercentage: 0.65,
            categoryPercentage: 0.75,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(20,20,35,0.92)',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} / 10`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: 'rgba(148,163,184,0.8)', font: { size: 11 }, autoSkip: false },
            grid: { display: false },
            border: { display: false },
          },
          y: {
            min: 0, max: 10,
            ticks: { color: 'rgba(148,163,184,0.6)', font: { size: 11 }, stepSize: 2, callback: v => v },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { display: false },
          },
        },
      },
    })

    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    }
  }, [skillAnalytics.map(s => `${s.skill}:${s.previous}:${s.current}`).join('|')])

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      padding: '90px 2rem 4rem',
      maxWidth: '1100px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    }}>

      {/* ── Welcome header ── */}
      <div className="animate-fade-up" style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: '500', marginBottom: '6px' }}>
          Good to have you back
        </p>
        <h1 style={{
          fontFamily: 'var(--font-head)',
          fontWeight: '800',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          background: 'linear-gradient(135deg, var(--text), var(--accent2))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
        }}>
          Hey, {userProfile?.name || userProfile?.username}
          {/* <span style={{ WebkitTextFillColor: 'initial', background: 'none' }}>⚡</span> */}
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
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Role',     value: userProfile?.role || '—',                       icon: '🎯' },
          { label: 'Position', value: userProfile?.position || '—',                    icon: '💼' },
          { label: 'Skills',   value: `${userProfile?.skills?.length || 0} selected`,  icon: '🛠️' },
          { label: 'Sessions', value: String(sessionCount || 0),                        icon: '📊' },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="glass"
            style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', transition: 'transform 0.2s, border-color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.borderColor = 'var(--border)'  }}
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

      {/* ── Start interview + last result ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: lastResult ? '1fr 1fr' : '1fr',
        gap: '16px',
        marginBottom: '2rem',
      }}>
        {/* Start Interview CTA */}
        <div className="glass" style={{
          padding: '2.5rem', borderRadius: 'var(--radius-lg)',
          position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(108,99,255,0.3)', boxShadow: 'var(--glow)',
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '56px', height: '56px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
              borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', marginBottom: '1.25rem',
              boxShadow: '0 8px 24px rgba(108,99,255,0.4)',
            }}>▶</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1.6rem', marginBottom: '0.75rem' }}>
              Start Mock Interview
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: '1.65', marginBottom: '1.75rem' }}>
              Practice as a <strong style={{ color: 'var(--text)' }}>{userProfile?.role}</strong> applying
              for a <strong style={{ color: 'var(--text)' }}>{userProfile?.position}</strong> role.
              AI will ask 5 questions and give you feedback after each one.
            </p>
            <button onClick={() => navigate('interview')} className="glow-btn" style={{ fontSize: '15px', padding: '13px 28px' }}>
              Begin Interview →
            </button>
          </div>
        </div>

        {/* Last result card */}
        {lastResult && (
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Last session
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <StarRating score={lastResult.totalScore} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{
                fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '3rem',
                background: lastResult.totalScore >= 7
                  ? 'linear-gradient(135deg, var(--green), #34d399)'
                  : lastResult.totalScore >= 5
                  ? 'linear-gradient(135deg, var(--gold), #fbbf24)'
                  : 'linear-gradient(135deg, var(--red), #f87171)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {lastResult.totalScore.toFixed(1)}
              </span>
              <span style={{ color: 'var(--text3)', fontSize: '18px' }}>/10</span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              background: lastResult.totalScore >= 7 ? 'rgba(16,185,129,0.12)' : lastResult.totalScore >= 5 ? 'rgba(245,158,11,0.12)' : 'rgba(248,113,113,0.12)',
              borderRadius: '99px',
              border: `1px solid ${lastResult.totalScore >= 7 ? 'rgba(16,185,129,0.3)' : lastResult.totalScore >= 5 ? 'rgba(245,158,11,0.3)' : 'rgba(248,113,113,0.3)'}`,
              marginBottom: '1.25rem',
            }}>
              <span style={{
                fontSize: '13px', fontWeight: '500',
                color: lastResult.totalScore >= 7 ? 'var(--green)' : lastResult.totalScore >= 5 ? 'var(--gold)' : 'var(--red)',
              }}>
                {lastResult.totalScore >= 7 ? '🎉 Great performance' : lastResult.totalScore >= 5 ? '👍 Good effort' : '💪 Keep practicing'}
              </span>
            </div>
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
                        borderRadius: '4px 4px 0 0', minHeight: '4px',
                        transition: 'height 0.5s ease',
                      }} />
                      <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Q{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => navigate('interview')} className="outline-btn"
              style={{ width: '100%', marginTop: '1.25rem', fontSize: '14px', padding: '11px' }}>
              Try Again →
            </button>
          </div>
        )}
      </div>

      {/* ── Analytics section ── */}
      {attempts.length > 0 && (
        <div style={{ display: 'grid', gap: '16px', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

            {/* Score progress line chart — oldest left, newest right */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                Score progress
              </p>
              <div style={{ display: 'grid', gap: '14px' }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '180px', overflow: 'visible' }}>
                  {[0, 5, 10].map(value => {
                    const y = chartPadding + (1 - value / 10) * (chartHeight - chartPadding * 2)
                    return (
                      <g key={value}>
                        <line x1={chartPadding} y1={y} x2={chartWidth - chartPadding} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        <text x="0" y={y + 4} fill="var(--text3)" fontSize="11">{value}</text>
                      </g>
                    )
                  })}
                  {chartPath && (
                    <path d={chartPath} fill="none" stroke="var(--accent3)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {chartPoints.map(point => (
                    <g key={point.label}>
                      <circle cx={point.x} cy={point.y} r="5" fill="var(--accent3)" stroke="var(--bg2)" strokeWidth="2" />
                      <text x={point.x} y={chartHeight - 4} textAnchor="middle" fill="var(--text3)" fontSize="11">{point.label}</text>
                    </g>
                  ))}
                </svg>

                {/* Previous = second-last in chronological, Present = last */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Previous', score: previousAttempt ? Number(previousAttempt.totalScore) || 0 : null },
                    { label: 'Present',  score: currentAttempt  ? Number(currentAttempt.totalScore)  || 0 : null },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '12px', borderRadius: 'var(--radius)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <p style={{ color: 'var(--text3)', fontSize: '12px', marginBottom: '4px' }}>{item.label}</p>
                      <p style={{ color: 'var(--text)', fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '1.4rem' }}>
                        {item.score === null ? '--' : `${item.score.toFixed(1)}/10`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Per-skill bar chart */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                Per skill analytics
              </p>
              {skillAnalytics.length > 0 ? (
                <div style={{ display: 'grid', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(160,155,200,0.7)', display: 'inline-block' }} />
                      Previous
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(56,189,248,0.85)', display: 'inline-block' }} />
                      Current
                    </span>
                  </div>
                  <div style={{ position: 'relative', width: '100%', height: `${Math.max(skillAnalytics.length * 56 + 48, 200)}px` }}>
                    <canvas ref={chartCanvasRef} />
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {skillAnalytics.map(item => (
                      <div key={item.skill} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text2)', fontWeight: '600' }}>{item.skill}</span>
                        <span style={{ color: 'var(--text3)' }}>
                          Prev {item.previous === null ? '--' : item.previous.toFixed(1)} → Now{' '}
                          <span style={{
                            color: item.current === null
                              ? 'var(--text3)'
                              : item.current > (item.previous ?? 0) ? 'var(--green)'
                              : item.current < (item.previous ?? 0) ? 'var(--red)'
                              : 'var(--text3)',
                            fontWeight: '600',
                          }}>
                            {item.current === null ? '--' : item.current.toFixed(1)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: '1.6' }}>
                  Skill-level scores will appear when questions mention your selected skills.
                </p>
              )}
            </div>
          </div>

          {/* ── History table: newest on top, no reverse needed ── */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              Previous interview attempts
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.4fr 1fr auto',
              gap: '10px', padding: '0 14px 8px',
              color: 'var(--text3)', fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              <span>Date</span><span>Role</span><span style={{ textAlign: 'right' }}>Score</span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {/* newest-first: interviewHistory is already newest-first from Supabase,
                  but attempts is chronological so we reverse it back for display */}
              {[...attempts].reverse().map((attempt, i) => (
                <div key={attempt.completedAt || i} style={{
                  display: 'grid', gridTemplateColumns: '1.4fr 1fr auto',
                  gap: '10px', alignItems: 'center',
                  padding: '12px 14px', borderRadius: 'var(--radius)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text2)' }}>
                    {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'Recent session'}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '600' }}>
                    {attempt.role || userProfile?.role || 'Interview'}
                  </span>
                  <span style={{
                    color: attempt.totalScore >= 7 ? 'var(--green)' : attempt.totalScore >= 5 ? 'var(--gold)' : 'var(--red)',
                    fontWeight: '800', fontFamily: 'var(--font-head)', textAlign: 'right',
                  }}>
                    {(Number(attempt.totalScore) || 0).toFixed(1)}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Skills pills ── */}
      {userProfile?.skills?.length > 0 && (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Your skills
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {userProfile.skills.map(skill => (
              <span key={skill} style={{
                padding: '5px 12px',
                background: 'rgba(108,99,255,0.1)',
                border: '1px solid rgba(108,99,255,0.25)',
                borderRadius: '99px', fontSize: '13px', fontWeight: '500', color: 'var(--accent2)',
              }}>{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

