
---

# 🚀 CareerInsight Intelligence System

> An AI-powered full-stack career guidance platform that analyzes user profiles, identifies skill gaps, and generates personalized career roadmaps using Generative AI.

---

## 🌐 Live Demo

🔗 **Deployed Application:**
👉 [https://careerinsight-intelligence-system.vercel.app](https://careerinsight-intelligence-system.vercel.app)

> *(Replace this with your actual deployed link if different)*

---

## 📌 Overview

The **CareerInsight Intelligence System** helps students and professionals make smarter career decisions by providing:

* AI-driven career recommendations
* Resume-based skill analysis
* Personalized learning roadmaps
* Clear insights into career growth paths

---

## ✨ Features

### 👤 User Features

* 🔐 Secure Authentication (Clerk)
* 📄 Resume/Profile Analysis
* 🎯 Career Path Suggestions
* 📊 Skill Gap Identification
* 🛣️ Personalized Learning Roadmap

### 🤖 AI Features

* Gemini API integration
* Context-aware recommendations
* Smart roadmap generation

### 💻 System Features

* Responsive UI (Tailwind + Shadcn UI)
* Scalable backend with Next.js
* Background job processing using Inngest

---

## 🛠️ Tech Stack

**Frontend**

* React 19
* Next.js 15
* Tailwind CSS
* Shadcn UI

**Backend**

* Next.js API Routes / Server Actions

**Database**

* NeonDB (PostgreSQL)

**ORM**

* Prisma

**Authentication**

* Clerk

**AI Integration**

* Gemini API

**Background Jobs**

* Inngest

---

## 🧱 System Architecture

```bash
User → Frontend (React + Next.js)
     → Backend API (Next.js)
     → Prisma ORM
     → NeonDB (PostgreSQL)

AI → Gemini API  
Async Jobs → Inngest  
Auth → Clerk
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/shambhavijaiswal01/CareerInsight_Intelligence_System.git
cd CareerInsight_Intelligence_System
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=your_neondb_url

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

GEMINI_API_KEY=your_gemini_api_key

INNGEST_EVENT_KEY=your_inngest_key
```

---

### 4️⃣ Run the Project

```bash
npm run dev
```

App runs at:

```
http://localhost:3000
```

---

## 🚀 Deployment (Vercel)

### 🔹 Steps to Deploy

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Click **Deploy**

---

### 🔹 Environment Variables for Vercel

Add the same `.env` variables in:

**Vercel → Project Settings → Environment Variables**

---

### 🔹 Build Command

```
npm run build
```

### 🔹 Output Directory

```
.next
```

---

## 📊 Problem Statement

Many individuals face:

* Lack of structured career guidance
* Unclear skill requirements
* No personalized learning path

This system solves these problems using **AI-powered insights and automation**.

---

## 💡 How It Works

1. User logs in
2. Enters profile or uploads resume
3. AI analyzes skills
4. System identifies gaps
5. Generates:

   * Career suggestions
   * Learning roadmap
   * Actionable steps

---

## 🚀 Future Enhancements

* 📱 Mobile app
* 📊 Advanced analytics dashboard
* 🔔 Smart notifications
* 🌍 Multi-language support
* 🧑‍💼 Recruiter integration

---

## 🤝 Contributing

```bash
Fork → Clone → Create Branch → Commit → Push → Pull Request
```

---

## 📜 License

MIT License

---

## 👩‍💻 Author

**Shambhavi Jaiswal**
---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 📢 Share it

---
