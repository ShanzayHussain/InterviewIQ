const express = require('express')
const cors    = require('cors')
require('dotenv').config()

const app = express()

// ── Middleware ──
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://interview-iq-bay.vercel.app/'
  ]
}))
app.use(express.json())

// ── Routes ──
// All interview endpoints live in routes/interview.js
const interviewRoutes = require('./routes/interview')
app.use('/api', interviewRoutes)

// ── Health check ──
app.get('/', (req, res) => {
  res.json({ status: 'InterviewAI backend running' })
})

// ── Start server ──
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})