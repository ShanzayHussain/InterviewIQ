// ── Loader: shown while checking auth session on startup ──
export default function Loader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Spinning ring */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: '3px solid var(--surface2)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-head)', fontSize: '14px', letterSpacing: '0.1em' }}>
        INITIALIZING
      </p>
    </div>
  )
}
