import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// ── Pages (each page is its own file in /src/pages/) ──
import Landing   from './pages/Landing'
import Auth      from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Interview from './pages/Interview'
import Profile   from './pages/Profile'

// ── Shared components ──
import Navbar    from './components/Navbar'
import Loader    from './components/Loader'

export default function App() {
  // ── Auth state ──
  const [session, setSession]   = useState(null)
  const [loading, setLoading]   = useState(true)

  // ── Current "page" — we use simple string routing (no react-router needed) ──
  // Routes: 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'interview' | 'profile'
  const [page, setPage]         = useState('landing')

  // ── User profile stored after onboarding ──
  const [userProfile, setUserProfile] = useState(null)

  // ── Interview results from last session (shown on dashboard) ──
  const [lastResult, setLastResult] = useState(null)
  const [sessionCount, setSessionCount] = useState(0)
  const loadProfile = useCallback((userId) => {
    const saved = localStorage.getItem(`profile_${userId}`)
    const savedResult = localStorage.getItem(`lastResult_${userId}`)
    const savedSessionCount = localStorage.getItem(`sessionCount_${userId}`)

    if (savedResult) {
      try {
        setLastResult(JSON.parse(savedResult))
      } catch {
        localStorage.removeItem(`lastResult_${userId}`)
        setLastResult(null)
      }
    } else {
      setLastResult(null)
    }

    setSessionCount(Number(savedSessionCount) || 0)

    if (saved) {
      try {
        setUserProfile(JSON.parse(saved))
        setPage('dashboard')
      } catch {
        localStorage.removeItem(`profile_${userId}`)
        setUserProfile(null)
        setLastResult(null)
        setSessionCount(0)
        setPage('onboarding')
      }
    } else {
      setPage('onboarding')
    }
  }, [])

  // ── Listen to Supabase auth changes ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) {
        // Check if user already completed onboarding
        loadProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        loadProfile(session.user.id)
      } else {
        // Logged out — go to landing
        setPage('landing')
        setUserProfile(null)
        setLastResult(null)
        setSessionCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  // ── Load profile from localStorage (or later from Supabase) ──
  // ── Save profile after onboarding ──
  const saveProfile = (profile) => {
    const userId = session.user.id
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile))
    setUserProfile(profile)
    setPage('dashboard')
  }

  // ── Navigation helper passed to all pages ──
  const navigate = (target) => setPage(target)

  const saveInterviewResult = (result) => {
    const userId = session.user.id
    const nextCount = sessionCount + 1
    const resultWithDate = { ...result, completedAt: new Date().toISOString() }

    localStorage.setItem(`lastResult_${userId}`, JSON.stringify(resultWithDate))
    localStorage.setItem(`sessionCount_${userId}`, String(nextCount))
    setLastResult(resultWithDate)
    setSessionCount(nextCount)
  }
  // ── Show full-screen loader while checking auth ──
  if (loading) return <Loader />

  // ── Render the right page ──
  return (
    <div className="noise">
      {/* Navbar only shown when user is logged in and past onboarding */}
      {session && page !== 'onboarding' && page !== 'auth' && (
        <Navbar
          session={session}
          userProfile={userProfile}
          navigate={navigate}
          currentPage={page}
        />
      )}

      {/* ── Route: Landing page (/) ── */}
      {page === 'landing' && (
        <Landing navigate={navigate} session={session} />
      )}

      {/* ── Route: Auth page (/auth) — login + signup ── */}
      {page === 'auth' && (
        <Auth navigate={navigate} />
      )}

      {/* ── Route: Onboarding (/onboarding) — role, skills, position ── */}
      {page === 'onboarding' && session && (
        <Onboarding
          session={session}
          saveProfile={saveProfile}
        />
      )}

      {/* ── Route: Dashboard (/dashboard) — home after login ── */}
      {page === 'dashboard' && session && (
        <Dashboard
          session={session}
          userProfile={userProfile}
          navigate={navigate}
          lastResult={lastResult}
          sessionCount={sessionCount}
        />
      )}

      {/* ── Route: Interview (/interview) — the actual mock interview ── */}
      {page === 'interview' && session && (
        <Interview
          session={session}
          userProfile={userProfile}
          navigate={navigate}
          setLastResult={saveInterviewResult}
        />
      )}

      {/* ── Route: Profile (/profile) — view/edit user info ── */}
      {page === 'profile' && session && (
        <Profile
          session={session}
          userProfile={userProfile}
          navigate={navigate}
          setUserProfile={setUserProfile}    
        />
      )}
    </div>
  )
}
