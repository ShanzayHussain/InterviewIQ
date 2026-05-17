const express = require('express')
const router  = express.Router()
const Groq    = require('groq-sdk')

// ── Groq client ──
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ── Model to use ──
const MODEL = 'llama-3.3-70b-versatile'

// ── Random topic pools per role ──
const topics = {
  'Frontend Developer': [
    'CSS and layout', 'React concepts', 'JavaScript fundamentals',
    'performance optimization', 'accessibility', 'state management',
    'browser APIs', 'responsive design', 'testing', 'TypeScript basics',
    'event handling', 'DOM manipulation', 'React hooks', 'component lifecycle',
    'async JavaScript and promises', 'CSS animations', 'webpack and bundlers'
  ],
  'Backend Developer': [
    'REST API design', 'database design', 'authentication and security',
    'error handling', 'caching strategies', 'scalability', 'Node.js concepts',
    'SQL queries and joins', 'middleware', 'file handling', 'environment variables',
    'rate limiting', 'logging', 'input validation', 'MVC architecture'
  ],
  'Full Stack Developer': [
    'frontend-backend communication', 'authentication flow', 'database design',
    'React and Node together', 'deployment', 'API design', 'session management',
    'file uploads', 'real-time features', 'performance optimization',
    'CORS and security', 'state management', 'version control workflows',
    'environment setup', 'debugging full stack issues'
  ],
  'UI/UX Designer': [
    'design principles', 'user research methods', 'Figma workflows', 'prototyping',
    'accessibility in design', 'design systems', 'color theory and typography',
    'user testing', 'wireframing', 'interaction design', 'information architecture',
    'mobile-first design', 'design handoff to developers', 'usability heuristics'
  ]
}

// ── Random question styles ──
const styles = [
  'Ask a conceptual "explain how X works" question',
  'Ask a practical "how would you build or solve X" scenario question',
  'Ask a "what is the difference between X and Y" comparison question',
  'Ask a "have you ever dealt with X, how did you handle it" experience question',
  'Ask a "what are the pros and cons of X approach" question',
  'Ask a debugging scenario — describe a bug and ask how they would find and fix it',
  'Ask a "walk me through how you would design X from scratch" question',
]

// ── Helper: pick random item from array ──
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]


// ════════════════════════════════════════
//  POST /api/start
//  Called when user clicks Begin Interview
//  Receives: { role, skills, position }
//  Returns:  { question }
// ════════════════════════════════════════
router.post('/start', async (req, res) => {
  const { role, skills, position } = req.body

  if (!role) {
    return res.status(400).json({ error: 'Role is required' })
  }

  // Pick random topic and style for this session
  const roleTopics   = topics[role] || topics['Full Stack Developer']
  const randomTopic  = pick(roleTopics)
  const randomStyle  = pick(styles)

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 1.0, // high = more creative and varied
      messages: [
        {
          role: 'system',
          content: `You are a professional technical interviewer conducting a mock interview.
The candidate is applying for a ${position || 'internship'} position as a ${role}.
Their skills include: ${skills?.join(', ') || 'general programming'}.

For this session, focus your question on the topic of: ${randomTopic}
Question style to use: ${randomStyle}

Rules:
- For internship: keep it foundational and approachable
- For full time: make it more practical and in-depth
- NEVER ask generic questions like "tell me about yourself" or "what are your strengths"
- Output ONLY the question itself — no intro, no numbering, no extra text whatsoever`
        },
        {
          role: 'user',
          content: 'Ask your first interview question.'
        }
      ]
    })

    const question = completion.choices[0].message.content.trim()
    res.json({ question })

  } catch (err) {
    console.error('❌ /start error:', err.message)
    res.status(500).json({ error: 'Failed to generate question' })
  }
})


// ════════════════════════════════════════
//  POST /api/answer
//  Called when user submits an answer
//  Receives: { role, skills, position, history, answer, questionNumber }
//  Returns:  { feedback, score, nextQuestion, summary }
// ════════════════════════════════════════
router.post('/answer', async (req, res) => {
  const { role, skills, position, history, answer, questionNumber } = req.body

  if (!role || !answer || !history) {
    return res.status(400).json({ error: 'role, answer and history are required' })
  }

  const isLastQuestion = questionNumber >= 5

  // Pick a fresh random topic for the next question so it never repeats
  const roleTopics  = topics[role] || topics['Full Stack Developer']
  const randomTopic = pick(roleTopics)
  const randomStyle = pick(styles)

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.9, // slightly varied for follow-up questions
      messages: [
        {
          role: 'system',
          content: `You are a professional technical interviewer for a ${position || 'internship'} ${role} position.
The candidate's skills: ${skills?.join(', ') || 'general programming'}.

The candidate just answered a question. You must:
1. Evaluate their answer honestly and constructively
2. Give a score from 1 to 10 based on accuracy, depth, and clarity
3. ${isLastQuestion
    ? 'This was the LAST question (question 5). Give a final overall summary of their full interview performance.'
    : `Ask the NEXT interview question. Focus on a DIFFERENT topic: ${randomTopic}. Style: ${randomStyle}`}

Scoring guide:
- 9-10: Excellent, thorough, accurate answer with good depth
- 7-8: Good answer, covers the main points with minor gaps
- 5-6: Partial answer, missing some important aspects
- 3-4: Weak answer, significant gaps or inaccuracies
- 1-2: Incorrect or very incomplete answer

You MUST respond with ONLY a valid JSON object.
No markdown, no backticks, no extra text before or after.
Exact format:
{
  "feedback": "2-3 sentences of specific constructive feedback mentioning what was good and what could be improved",
  "score": 7,
  "nextQuestion": ${isLastQuestion ? 'null' : '"the next interview question here"'},
  "summary": ${isLastQuestion ? '"2-3 sentence overall performance summary with encouragement"' : 'null'}
}`
        },
        // Full conversation history — AI remembers everything asked so far
        ...history,
        {
          role: 'user',
          content: answer
        }
      ]
    })

    const raw     = completion.choices[0].message.content.trim()
    // Strip markdown code fences if model adds them anyway
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed  = JSON.parse(cleaned)

    res.json(parsed)

  } catch (err) {
    console.error('❌ /answer error:', err.message)
    res.status(500).json({ error: 'Failed to evaluate answer' })
  }
})


// ════════════════════════════════════════
//  POST /api/chat
//  Called by the AI chatbot assistant panel
//  Receives: { message, context }
//  Returns:  { reply }
// ════════════════════════════════════════
router.post('/chat', async (req, res) => {
  const { message, context } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: `You are a friendly and helpful AI assistant supporting a candidate during a mock interview practice session.
Context about the current session: ${context || 'The user is doing a mock technical interview'}

Your responsibilities:
- Answer questions about technical concepts, technologies, or interview topics clearly
- Give hints if they are stuck on a question — but never give away the complete answer directly
- Suggest better ways to phrase or structure an answer
- Keep responses concise and encouraging — 2 to 4 sentences maximum
- Be warm, supportive, and confidence-building`
        },
        {
          role: 'user',
          content: message
        }
      ]
    })

    const reply = completion.choices[0].message.content.trim()
    res.json({ reply })

  } catch (err) {
    console.error('❌ /chat error:', err.message)
    res.status(500).json({ error: 'Failed to get response' })
  }
})


module.exports = router
