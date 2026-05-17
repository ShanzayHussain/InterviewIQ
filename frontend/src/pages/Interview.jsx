import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

// ── Interview page: the actual mock interview experience ──
// Layout: left = interview chat | right = AI chatbot assistant
// Flow: Start → AI asks Q → User answers → Feedback → Next Q or Stop → Score shown


const API = ''  // empty string — Vite proxy handles it

export default function Interview({ userProfile, navigate, setLastResult }) {

  // ── Interview state ──
  const [phase, setPhase]               = useState('start')   // 'start' | 'questioning' | 'done'
  const [currentQuestion, setQuestion]  = useState('')
  const [questionNumber, setQNum]       = useState(0)
  const [answer, setAnswer]             = useState('')
  const [feedback, setFeedback]         = useState(null)      // { feedback, score, nextQuestion }
  const [history, setHistory]           = useState([])        // full conversation for LLM
  const [scores, setScores]             = useState([])        // score per question
  const [allFeedback, setAllFeedback]   = useState([])        // feedback per question
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [isSpeaking, setIsSpeaking]     = useState(false)
  const [isListening, setIsListening]   = useState(false)
  const [voiceError, setVoiceError]     = useState('')

  // ── Chatbot state ──
  const [chatOpen, setChatOpen]         = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI assistant. Ask me anything during the interview — concepts, hints, or how to improve your answers!" }
  ])
  const [chatInput, setChatInput]       = useState('')
  const [chatLoading, setChatLoading]   = useState(false)

  // Scroll refs
  const interviewEndRef = useRef(null)
  const chatEndRef      = useRef(null)
  const recognitionRef  = useRef(null)

  // Auto scroll
  useEffect(() => { interviewEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [feedback, currentQuestion])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window
  const SpeechRecognition = typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null
  const canListen = Boolean(SpeechRecognition)

  // Voice cleanup: stop any browser speech or microphone session when the page unmounts.
  useEffect(() => {
    return () => {
      if (canSpeak) window.speechSynthesis.cancel()
      recognitionRef.current?.stop()
    }
  }, [canSpeak])

  const speakText = (text) => {
    if (!text) return
    if (!canSpeak) {
      setVoiceError('Text to speech is not supported in this browser.')
      return
    }

    // SpeechSynthesis reads the AI question aloud directly in the browser.
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsSpeaking(false)
      // setVoiceError('Could not read the question aloud.')
    }
    setVoiceError('')
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (!canSpeak) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const startListening = () => {
    if (!canListen) {
      setVoiceError('Speech to text is not supported in this browser. Try Chrome or Edge.')
      return
    }

    // SpeechRecognition converts the candidate's voice into the answer textarea.
    const recognition = new SpeechRecognition()
    const startingAnswer = answer.trim()
    let confirmedTranscript = ''

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceError('')
    }
    recognition.onresult = (event) => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) confirmedTranscript += transcript
        else interimTranscript += transcript
      }

      const spokenAnswer = `${confirmedTranscript} ${interimTranscript}`.trim()
      const nextAnswer = [startingAnswer, spokenAnswer].filter(Boolean).join(' ')
      setAnswer(nextAnswer)
    }
    recognition.onerror = (event) => {
      setVoiceError(event.error === 'not-allowed'
        ? 'Microphone permission was blocked.'
        : 'Could not capture your voice. Please try again.')
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  // ── STEP 1: Call /api/start to get first question ──
  const startInterview = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/start`, {
        role: userProfile.role,
        skills: userProfile.skills,
        position: userProfile.position
      })
      const q = res.data.question
      setQuestion(q)
      setQNum(1)
      setPhase('questioning')
      // Add to history so LLM knows what was asked
      setHistory([{ role: 'assistant', content: q }])
    } catch {
      setError('Failed to start interview. Is the backend running?')
    }
    setLoading(false)
  }

  // ── STEP 2: Submit answer → call /api/answer ──
  const submitAnswer = async () => {
    if (!answer.trim()) return
    stopListening()
    setLoading(true)
    setError('')

    // Add user's answer to history
    const updatedHistory = [...history, { role: 'user', content: answer }]

    try {
      const res = await axios.post(`${API}/api/answer`, {
        role: userProfile.role,
        skills: userProfile.skills,
        position: userProfile.position,
        history: updatedHistory,
        answer,
        questionNumber
      })

      const result = res.data // { feedback, score, nextQuestion, summary }

      // Save feedback and score for this question
      setFeedback(result)
      setScores(prev => [...prev, result.score])
      setAllFeedback(prev => [...prev, { question: currentQuestion, answer, ...result }])

      // Update history with AI's response
      setHistory([...updatedHistory, {
        role: 'assistant',
        content: result.nextQuestion || result.summary || ''
      }])

      setAnswer('')
    } catch {
      setError('Failed to get feedback. Please try again.')
    }
    setLoading(false)
  }

  // ── STEP 3a: Go to next question ──
  const nextQuestion = () => {
    if (feedback?.nextQuestion) {
      setQuestion(feedback.nextQuestion)
      setQNum(prev => prev + 1)
      setFeedback(null)
    }
  }

  // ── STEP 3b: Stop interview and show score ──
  const stopInterview = () => {
    const totalScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0

    const result = { totalScore, scores, allFeedback }
    stopSpeaking()
    stopListening()
    setLastResult(result)  // sends to App.jsx → shown on Dashboard
    setPhase('done')
  }

  // ── Chatbot: send message to AI assistant ──
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)

    try {
      const res = await axios.post(`${API}/api/chat`, {
        message: userMsg,
        context: `The user is doing a mock interview for a ${userProfile.role} position. Current question: "${currentQuestion}"`
      })
      setChatMessages(prev => [...prev, { role: 'ai', text: res.data.reply }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I had trouble responding. Try again!' }])
    }
    setChatLoading(false)
  }

  // ── Average score ──
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  // ──────────────────────────────────────
  //  RENDER: START screen
  // ──────────────────────────────────────
  if (phase === 'start') {
    return (
      <div style={{
        minHeight: '100vh', paddingTop: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 2rem 4rem'
      }}>
        <div className="glass animate-scale-in" style={{
          maxWidth: '520px', width: '100%',
          padding: '3rem', borderRadius: 'var(--radius-lg)',
          textAlign: 'center', boxShadow: 'var(--glow)'
        }}>
          {/* Animated icon */}
          <div style={{
            width: '80px', height: '80px', margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
            animation: 'float 3s ease-in-out infinite',
            boxShadow: '0 8px 32px rgba(108,99,255,0.4)'
          }}>🎤</div>

          <h1 style={{
            fontFamily: 'var(--font-head)', fontWeight: '800',
            fontSize: '2rem', marginBottom: '0.75rem'
          }}>
            Mock Interview
          </h1>
          <p style={{ color: 'var(--text2)', marginBottom: '0.5rem', fontSize: '15px' }}>
            You're interviewing as a
          </p>
          <div style={{
            display: 'inline-flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center'
          }}>
            <span style={{
              padding: '5px 14px',
              background: 'rgba(108,99,255,0.15)',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '99px', fontSize: '14px', fontWeight: '600', color: 'var(--accent2)'
            }}>{userProfile.role}</span>
            <span style={{
              padding: '5px 14px',
              background: 'rgba(56,189,248,0.1)',
              border: '1px solid rgba(56,189,248,0.25)',
              borderRadius: '99px', fontSize: '14px', fontWeight: '600', color: 'var(--accent3)'
            }}>{userProfile.position}</span>
          </div>

          <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: '1.7', marginBottom: '2rem' }}>
            The AI will ask you <strong style={{ color: 'var(--text)' }}>5 questions</strong>.
            Answer each one, get instant feedback, then choose to continue or stop.
            An AI chatbot is available on the side to help you.
          </p>

          {error && (
            <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => navigate('dashboard')} className="outline-btn" style={{ padding: '12px 22px' }}>
              ← Back
            </button>
            <button
              onClick={startInterview}
              disabled={loading}
              className="glow-btn"
              style={{ fontSize: '16px', padding: '13px 30px' }}
            >
              {loading ? '⏳ Starting...' : '🚀 Start Interview'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────
  //  RENDER: DONE screen
  // ──────────────────────────────────────
  if (phase === 'done') {
    const stars = Math.round((avgScore / 10) * 5)
    return (
      <div style={{
        minHeight: '100vh', paddingTop: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 2rem 4rem'
      }}>
        <div className="glass animate-scale-in" style={{
          maxWidth: '600px', width: '100%',
          padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '1rem' }}>
            {avgScore >= 7 ? '🎉' : avgScore >= 5 ? '👍' : '💪'}
          </div>

          <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Interview Complete!
          </h1>
          <p style={{ color: 'var(--text2)', marginBottom: '1.5rem' }}>
            Here's how you performed
          </p>

          {/* Star rating */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1rem' }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{
                fontSize: '36px',
                color: i <= stars ? 'var(--gold)' : 'var(--surface2)',
                filter: i <= stars ? 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' : 'none',
              }}>★</span>
            ))}
          </div>

          {/* Overall score */}
          <div style={{ marginBottom: '2rem' }}>
            <span style={{
              fontFamily: 'var(--font-head)', fontWeight: '800', fontSize: '4rem',
              background: avgScore >= 7
                ? 'linear-gradient(135deg, var(--green), #34d399)'
                : avgScore >= 5
                ? 'linear-gradient(135deg, var(--gold), #fbbf24)'
                : 'linear-gradient(135deg, var(--red), #f87171)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>{avgScore.toFixed(1)}</span>
            <span style={{ color: 'var(--text3)', fontSize: '20px' }}>/10</span>
          </div>

          {/* Per-question breakdown */}
          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <p style={{
              fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '10px'
            }}>Question breakdown</p>
            {allFeedback.map((item, i) => (
              <div key={i} style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: '12px 14px',
                marginBottom: '8px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text2)' }}>Q{i + 1}</p>
                  <span style={{
                    fontSize: '13px', fontWeight: '700',
                    color: item.score >= 7 ? 'var(--green)' : item.score >= 5 ? 'var(--gold)' : 'var(--red)'
                  }}>{item.score}/10</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: '1.5' }}>
                  {item.feedback?.slice(0, 120)}...
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => navigate('dashboard')} className="outline-btn" style={{ flex: 1 }}>
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                stopSpeaking(); stopListening()
                setPhase('start')
                setQuestion(''); setQNum(0); setAnswer('')
                setFeedback(null); setHistory([])
                setScores([]); setAllFeedback([])
              }}
              className="glow-btn"
              style={{ flex: 1 }}
            >
              Try Again →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────
  //  RENDER: QUESTIONING phase (main interview)
  // ──────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '64px',
      display: 'flex',
      justifyContent: 'center',
      position: 'relative'
    }}>

      {/* ════════════════════════════════
          LEFT: Interview panel
      ════════════════════════════════ */}
      <div style={{
        flex: 1,
        padding: '2rem',
        maxWidth: chatOpen ? 'calc(100% - 360px)' : '100%',
        transition: 'max-width 0.3s ease',
        overflowY: 'auto',
        paddingTop: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>

        {/* Progress indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '2rem',
          width: '100%',
          maxWidth: '760px'
        }}>
          <div style={{ flex: 1, height: '4px', background: 'var(--surface2)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(questionNumber / 5) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--accent3))',
              transition: 'width 0.4s ease', borderRadius: '99px'
            }} />
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
            Question {questionNumber} of 5
          </span>
        </div>

        {/* Score pills for answered questions */}
        {scores.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', width: '100%', maxWidth: '760px' }}>
            {scores.map((s, i) => (
              <div key={i} style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                background: s >= 7
                  ? 'rgba(16,185,129,0.15)'
                  : s >= 5 ? 'rgba(245,158,11,0.15)' : 'rgba(248,113,113,0.15)',
                border: `1px solid ${s >= 7 ? 'rgba(16,185,129,0.4)' : s >= 5 ? 'rgba(245,158,11,0.4)' : 'rgba(248,113,113,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700',
                color: s >= 7 ? 'var(--green)' : s >= 5 ? 'var(--gold)' : 'var(--red)'
              }}>{s}</div>
            ))}
          </div>
        )}

        {/* ── Current question bubble ── */}
        <div
          className="glass animate-slide-in"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            borderLeft: '3px solid var(--accent)',
            maxWidth: '760px',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: '34px', height: '34px', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px'
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: 'var(--accent2)', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.05em' }}>
                AI INTERVIEWER · Q{questionNumber}
              </p>
              <p style={{ fontSize: '16px', color: 'var(--text)', lineHeight: '1.7' }}>
                {currentQuestion}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                {/* Voice button: question audio starts only after the user clicks this icon. */}
                <button
                  type="button"
                  onClick={isSpeaking ? stopSpeaking : () => speakText(currentQuestion)}
                  disabled={!canSpeak}
                  className="outline-btn"
                  style={{
                    width: '40px',
                    height: '40px',
                    padding: 0,
                    fontSize: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSpeaking ? 'rgba(56,189,248,0.14)' : 'transparent',
                    borderColor: isSpeaking ? 'var(--accent3)' : 'var(--border2)'
                  }}
                  title={isSpeaking ? 'Stop reading question' : 'Read question aloud'}
                  aria-label={isSpeaking ? 'Stop reading question' : 'Read question aloud'}
                >
                  🔊
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feedback block (shown after answering) ── */}
        {voiceError && (
          <p style={{ color: 'var(--gold)', fontSize: '13px', marginBottom: '1rem', maxWidth: '760px', width: '100%' }}>
            {voiceError}
          </p>
        )}

        {feedback && (
          <div
            className="animate-fade-up"
            style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              maxWidth: '760px',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--green)' }}>
                ✦ AI Feedback
              </p>
              <span style={{
                padding: '3px 10px',
                background: feedback.score >= 7
                  ? 'rgba(16,185,129,0.15)' : feedback.score >= 5
                  ? 'rgba(245,158,11,0.15)' : 'rgba(248,113,113,0.15)',
                borderRadius: '99px', fontSize: '13px', fontWeight: '700',
                color: feedback.score >= 7 ? 'var(--green)' : feedback.score >= 5 ? 'var(--gold)' : 'var(--red)'
              }}>
                {feedback.score}/10
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.75' }}>
              {feedback.feedback}
            </p>

            {/* Next/Stop buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
              {feedback.nextQuestion && (
                <button
                  onClick={nextQuestion}
                  className="glow-btn"
                  style={{ padding: '10px 22px', fontSize: '14px' }}
                >
                  Next Question →
                </button>
              )}
              <button
                onClick={stopInterview}
                className="outline-btn"
                style={{ padding: '10px 22px', fontSize: '14px' }}
              >
                {questionNumber >= 5 ? '🏁 See Results' : '⏹ Stop Interview'}
              </button>
            </div>
          </div>
        )}

        {/* ── Answer input (hidden when feedback shown) ── */}
        {!feedback && (
          <div style={{ maxWidth: '760px', width: '100%' }}>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={5}
              style={{
                width: '100%', padding: '14px',
                background: 'var(--surface)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)', fontSize: '15px',
                resize: 'vertical', lineHeight: '1.65',
                transition: 'border-color 0.2s',
                marginBottom: '12px'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {/* Recorder button: microphone-style control for speech-to-text dictation. */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={!canListen || loading}
                className={isListening ? 'glow-btn' : 'outline-btn'}
                style={{
                  width: '44px',
                  height: '44px',
                  padding: 0,
                  borderRadius: '50%',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  background: isListening ? 'var(--red)' : 'transparent',
                  color: isListening ? '#fff' : 'var(--text)'
                }}
                title={isListening ? 'Stop recording answer' : 'Record answer'}
                aria-label={isListening ? 'Stop recording answer' : 'Record answer'}
              >
                📢
                {isListening && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 0 0 3px rgba(255,255,255,0.22)'
                  }} />
                )}
              </button>
              <span style={{ color: isListening ? 'var(--green)' : 'var(--text3)', fontSize: '12px' }}>
                {isListening ? 'Recording...' : 'Click the mic to dictate your answer.'}
              </span>
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
                className="glow-btn"
                style={{ padding: '12px 26px', fontSize: '14px' }}
              >
                {loading ? '⏳ Evaluating...' : '✓ Submit Answer'}
              </button>
              <button
                onClick={stopInterview}
                className="outline-btn"
                style={{ padding: '12px 20px', fontSize: '14px' }}
              >
                ⏹ Stop
              </button>
            </div>
          </div>
        )}

        <div ref={interviewEndRef} />
      </div>

      {/* ════════════════════════════════
          RIGHT: AI Chatbot panel
      ════════════════════════════════ */}

      {/* Chatbot toggle button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50,
          width: '56px', height: '56px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 8px 24px rgba(108,99,255,0.5)',
          border: 'none', cursor: 'pointer',
          transition: 'transform 0.2s',
          animation: 'pulse-glow 3s ease-in-out infinite'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="AI Assistant"
      >
        {chatOpen ? '✕' : '🤖'}
      </button>

      {/* Chatbot side panel */}
      {chatOpen && (
        <div
          className="animate-slide-in"
          style={{
            position: 'fixed', right: 0, top: '64px', bottom: 0,
            width: '340px',
            background: 'var(--bg2)',
            borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            zIndex: 40
          }}
        >
          {/* Chatbot header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px'
            }}>🤖</div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px', fontFamily: 'var(--font-head)' }}>AI Assistant</p>
              <p style={{ fontSize: '11px', color: 'var(--green)' }}>● Online · Ask me anything</p>
            </div>
          </div>

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 13px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--accent), #7c74ff)'
                    : 'var(--surface)',
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  fontSize: '13px', lineHeight: '1.6',
                  color: msg.role === 'user' ? '#fff' : 'var(--text2)',
                  border: msg.role === 'ai' ? '1px solid var(--border)' : 'none'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', gap: '4px', padding: '8px 12px' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: `spin 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0.6
                  }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: '8px'
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendChatMessage() }}
              placeholder="Ask a question..."
              style={{
                flex: 1, padding: '10px 12px',
                background: 'var(--surface)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)', fontSize: '13px'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
            <button
              onClick={sendChatMessage}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                width: '38px', height: '38px',
                background: 'var(--accent)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                opacity: chatLoading || !chatInput.trim() ? 0.5 : 1,
                transition: 'opacity 0.2s'
              }}
            >→</button>
          </div>
        </div>
      )}
    </div>
  )
}
