import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

import Landing    from './pages/Landing'
import Auth       from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard  from './pages/Dashboard'
import Interview  from './pages/Interview'
import Profile    from './pages/Profile'
import Navbar     from './components/Navbar'
import Loader     from './components/Loader'

export default function App() {
  const [session, setSession]                   = useState(null)
  const [loading, setLoading]                   = useState(true)
  const [page, setPage]                         = useState('landing')
  const [userProfile, setUserProfile]           = useState(null)
  const [lastResult, setLastResult]             = useState(null)
  const [interviewHistory, setInterviewHistory] = useState([])
  const [sessionCount, setSessionCount]         = useState(0)

  // 
  // Load sessions — cache first, then sync
  // 
  const loadSessions = async (userId) => {
    // 1. Load from localStorage cache instantly
    try {
      const cached = localStorage.getItem(`sessions_${userId}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        setInterviewHistory(parsed)
        setSessionCount(parsed.length)
        if (parsed.length > 0) setLastResult(parsed[0])
      }
    } catch {}

    // 2. Sync from Supabase — always overwrites cache with fresh data
    try {
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (sessions && !error) {
        const mapped = sessions.map(s => ({
          totalScore:  s.total_score,
          scores:      s.scores || [],
          role:        s.role,
          position:    s.position,
          completedAt: s.created_at,
          allFeedback: (s.questions || []).map((q, i) => ({
            question: q,
            answer:   (s.answers   || [])[i] || '',
            feedback: (s.feedbacks || [])[i] || '',
            score:    (s.scores    || [])[i] || 0,
          }))
        }))
        localStorage.setItem(`sessions_${userId}`, JSON.stringify(mapped))
        setInterviewHistory(mapped)
        setSessionCount(mapped.length)
        if (mapped.length > 0) setLastResult(mapped[0])
      }
    } catch (err) {
      console.error('loadSessions error:', err)
    }
  }

  // 
  // Load profile — cache first, Supabase always overwrites
  // 
  const loadProfile = useCallback(async (userId) => {
    // 1. Show cached profile instantly so UI feels fast
    let hasCache = false
    try {
      const cached = localStorage.getItem(`profile_${userId}`)
      if (cached) {
        setUserProfile(JSON.parse(cached))
        hasCache = true
      }
    } catch {}

    // 2. Load cached sessions instantly too
    try {
      const cachedSessions = localStorage.getItem(`sessions_${userId}`)
      if (cachedSessions) {
        const parsed = JSON.parse(cachedSessions)
        setInterviewHistory(parsed)
        setSessionCount(parsed.length)
        if (parsed.length > 0) setLastResult(parsed[0])
      }
    } catch {}

    // 3. Go to dashboard immediately if cache exists
    if (hasCache) setPage('dashboard')

    // 4. ALWAYS fetch fresh profile from Supabase and overwrite
    // This ensures edits from other browsers are always picked up
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile && !error) {
        // Always overwrite local cache and state with Supabase data
        localStorage.setItem(`profile_${userId}`, JSON.stringify(profile))
        setUserProfile(profile)
        if (!hasCache) setPage('dashboard')
      } else if (!hasCache) {
        setPage('onboarding')
      }
    } catch {
      if (!hasCache) setPage('onboarding')
    }

    // 5. Sync sessions from Supabase in background
    await loadSessions(userId)
  }, [])

  // 
  // Auth listener
  // 
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      if (event === 'INITIAL_SESSION') {
        if (session?.user?.id) {
          loadProfile(session.user.id).finally(() => {
            clearTimeout(timeout)
            setLoading(false)
          })
        } else {
          clearTimeout(timeout)
          setPage('landing')
          setLoading(false)
        }
        return
      }

      if (event === 'SIGNED_IN') {
        if (session?.user?.id) {
          loadProfile(session.user.id).finally(() => {
            clearTimeout(timeout)
            setLoading(false)
          })
        } else {
          setLoading(false)
        }
        return
      }

      if (event === 'SIGNED_OUT') {
        clearTimeout(timeout)
        setPage('landing')
        setUserProfile(null)
        setLastResult(null)
        setInterviewHistory([])
        setSessionCount(0)
        setLoading(false)
        return
      }

      setLoading(false)
    })

    return () => { clearTimeout(timeout); subscription.unsubscribe() }
  }, [loadProfile])

  // 
  // Save profile after onboarding
  //
  const saveProfile = async (profile) => {
    const userId = session.user.id
    const fullProfile = {
      ...profile,
      email:      session.user.email,
      id:         userId,
      updated_at: new Date().toISOString()
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(fullProfile)
      if (error) console.error('saveProfile error:', error.message)
      else console.log('✅ Profile saved to Supabase')
    } catch (err) {
      console.error('saveProfile failed:', err)
    }

    localStorage.setItem(`profile_${userId}`, JSON.stringify(fullProfile))
    setUserProfile(fullProfile)
    setPage('dashboard')
  }

  // 
  // Save interview result
  // 
  const saveInterviewResult = async (result) => {
    const userId = session.user.id
    const resultWithMeta = {
      ...result,
      role:        userProfile?.role,
      position:    userProfile?.position,
      completedAt: new Date().toISOString()
    }

    try {
      const { error } = await supabase
        .from('sessions')
        .insert({
          user_id:     userId,
          role:        userProfile?.role,
          position:    userProfile?.position,
          total_score: result.totalScore,
          scores:      result.scores || [],
          questions:   (result.allFeedback || []).map(f => f.question),
          answers:     (result.allFeedback || []).map(f => f.answer),
          feedbacks:   (result.allFeedback || []).map(f => f.feedback),
        })
      if (error) console.error('saveSession error:', error.message)
      else console.log('✅ Session saved to Supabase')
    } catch (err) {
      console.error('saveSession failed:', err)
    }

    const nextHistory = [resultWithMeta, ...interviewHistory]
    setLastResult(resultWithMeta)
    setInterviewHistory(nextHistory)
    setSessionCount(prev => prev + 1)
    localStorage.setItem(`sessions_${userId}`, JSON.stringify(nextHistory))
  }

  // 
  // Update profile from Profile page
  // Always saves updated_at so other browsers know to refresh
  // 
  const updateProfile = async (updated) => {
    const userId = session.user.id
    const updatedWithTime = { ...updated, updated_at: new Date().toISOString() }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name:       updated.name,
          role:       updated.role,
          skills:     updated.skills,
          position:   updated.position,
          updated_at: updatedWithTime.updated_at,
        })
        .eq('id', userId)
      if (error) console.error('updateProfile error:', error.message)
      else console.log('✅ Profile updated in Supabase')
    } catch (err) {
      console.error('updateProfile failed:', err)
    }

    localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedWithTime))
    setUserProfile(updatedWithTime)
  }

  const navigate = (target) => setPage(target)

  if (loading) return <Loader />

  return (
    <div className="noise">
      {session && page !== 'onboarding' && page !== 'auth' && page !== 'landing' && (
        <Navbar
          session={session}
          userProfile={userProfile}
          navigate={navigate}
          currentPage={page}
        />
      )}

      {page === 'landing'    && <Landing    navigate={navigate} session={session} />}
      {page === 'auth'       && <Auth       navigate={navigate} />}
      {page === 'onboarding' && session && <Onboarding session={session} saveProfile={saveProfile} />}
      {page === 'dashboard'  && session && (
        <Dashboard
          session={session}
          userProfile={userProfile}
          navigate={navigate}
          lastResult={lastResult}
          interviewHistory={interviewHistory}
          sessionCount={sessionCount}
        />
      )}
      {page === 'interview'  && session && (
        <Interview
          session={session}
          userProfile={userProfile}
          navigate={navigate}
          setLastResult={saveInterviewResult}
        />
      )}
      {page === 'profile'    && session && (
        <Profile
          session={session}
          userProfile={userProfile}
          navigate={navigate}
          setUserProfile={updateProfile}
        />
      )}
    </div>
  )
}
