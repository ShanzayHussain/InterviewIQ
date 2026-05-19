<img width="1869" height="782" alt="image" src="https://github.com/user-attachments/assets/2bdee755-a0ce-43b1-8176-18a037502a09" /># 🚀 InterviewIQ

> AI-powered mock interview platform for developers — practice technical interviews, receive instant AI feedback, and track your improvement over time.

<p align="center">
  <a href="https://interview-iq-bay.vercel.app">🌐 Live Demo</a> •
  <a href="https://github.com/ShanzayHussain">💻 GitHub</a> •
  <a href="https://www.linkedin.com/in/shanzay-hussain-437044325/">🔗 LinkedIn</a>
</p>

---

# 📌 Overview

InterviewIQ simulates a real technical interview environment using AI. Users can select their role, technical skills, and position level, then participate in a personalized mock interview session.

The AI interviewer generates role-specific questions, evaluates answers, provides instant constructive feedback, assigns scores, and tracks performance across multiple sessions.

Built for students and developers who want to improve their interview skills in a practical and interactive way.

---

# ✨ Features

## 🤖 AI Interview Engine

* Choose from:

  * Frontend Developer
  * Backend Developer
  * Full Stack Developer
  * UI/UX Designer
* Select technical skills such as React, Node.js, JavaScript, etc.
* Choose position level:

  * Internship
  * Full-Time
* AI generates unique interview questions every session
* Detailed scoring and feedback for every answer

---

## 🎤 Voice Support

* **Speech-to-Text** for answering questions using voice
* **Text-to-Speech** for AI-generated interview questions

Creates a more realistic interview experience.

---

## 💬 AI Chatbot Assistant

* Integrated AI chatbot during interviews
* Ask technical questions or request clarification
* Helpful guidance without directly revealing answers

---

## 📊 Analytics Dashboard

* Track interview scores visually
* Performance history and improvement graphs
* Per-question scoring analysis
* Session statistics and analytics

---

## 🗂️ Interview History

* View previous interview attempts
* Compare past scores
* Monitor long-term progress and improvement

---

# 🛠️ Tech Stack

| Layer              | Technology               |
| ------------------ | ------------------------ |
| Frontend           | React 19, Vite 8         |
| Backend            | Node.js, Express 5       |
| Database & Auth    | Supabase (PostgreSQL)    |
| AI Integration     | Groq API — LLaMA 3.3 70B |
| Charts & Analytics | Chart.js                 |
| Deployment         | Vercel                   |

---

# 📸 Screenshots

## 🏠 Landing Page

Modern landing page introducing InterviewIQ and its AI-powered interview experience.

<img width="512" height="604" alt="image" src="https://github.com/user-attachments/assets/3651ad1d-7321-4c98-99dd-44108aa74c94" />

---

## 🔐 Authentication Page

User login and signup system powered by Supabase Authentication.

<img width="1641" height="807" alt="image" src="https://github.com/user-attachments/assets/2ce0f507-637d-46b4-9da0-bf4ffce6781e" />

---

## 📊 Dashboard

Analytics dashboard showing:

* Previous interview history
* Performance charts
* Score progress graphs
* Session statistics

<img width="724" height="756" alt="image" src="https://github.com/user-attachments/assets/cd216e79-6991-44b5-a9d4-9f12fde5ad13" />

---

## 👤 Profile Page

Profile management page where users can:

* Update role
* Select skills
* Edit interview preferences

<img width="1356" height="782" alt="image" src="https://github.com/user-attachments/assets/5ea7f0c0-1c83-4bd7-a768-a3b3fb8f0f95" />

---

## 🎙️ Interview Session

Interactive AI interview interface featuring:

* AI-generated questions
* User answers
* AI chatbot assistant
* Speech-to-text support
* Text-to-speech functionality

<img width="639" height="732" alt="image" src="https://github.com/user-attachments/assets/bf7480aa-0040-4a66-b7a9-341294ee094c" />

---

## 🏆 Score & Feedback Page

Detailed results page showing:

* Final interview score
* Per-question feedback
* Strengths & weaknesses
* Improvement suggestions

![Uploading image.png…]()

---

# 📂 Project Structure

```bash
InterviewIQ/
├── frontend/                 # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.jsx
│   └── package.json
│
├── backend/                  # Node.js + Express backend
│   ├── routes/
│   │   └── interview.js
│   ├── index.js
│   └── package.json
│
└── vercel.json
```

---

# ⚙️ How It Works

```text
User selects role + skills + position
                ↓
AI generates tailored interview question
                ↓
User answers via text or voice
                ↓
AI evaluates answer and assigns score
                ↓
Feedback generated instantly
                ↓
Process repeats for 5 interview questions
                ↓
Final results saved to Supabase
                ↓
Analytics displayed on dashboard
```

---

# 🔒 Authentication & Data

* Authentication handled using Supabase Auth
* Interview sessions and analytics stored in PostgreSQL database
* User profiles and history securely managed through Supabase

---

# 🚀 Deployment

| Service  | Platform |
| -------- | -------- |
| Frontend | Vercel   |
| Backend  | Vercel   |
| Database | Supabase |

---

# 👨‍💻 Author

### Shanzay Hussain

Software Engineering Student passionate about Full Stack Development & AI-powered applications.

🔗 LinkedIn:
https://www.linkedin.com/in/shanzay-hussain-437044325/

💻 GitHub:
https://github.com/ShanzayHussain

---

# 📄 License

MIT License
