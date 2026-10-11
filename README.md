# 🎙️ Voice Agent QA Platform

An enterprise evaluation, simulation, and observability platform built for voice AI agents across multilingual environments, powered by **Sarvam AI** (`sarvam-105b-conversations`).

Designed to ensure voice agents are robust, compliant, and latency-optimized before and after deployment.

---

## ⚡ Core Platform Pillars

### 1. 🛡️ Pre-Launch Conversation Stress Simulator
- **Simulate Thousands of Conversations:** Execute batch simulations of real-world synthetic caller interactions before deploying agent updates to production.
- **Edge-Case Stress Testing:**
  - **Voice Barge-in & Rapid Interruptions:** Tests conversational turn-taking when callers speak over TTS responses at <150ms boundaries.
  - **Noisy & Ambient Acoustic Distortion:** Injects ambient street noise, babble, vehicle rumble, and low-bandwidth GSM audio typical in emerging mobile networks.
  - **Policy Violation & Adversarial Red-Teaming:** Probes guardrails against social engineering, PII harvesting, OTP extraction, and unauthorized commitments.
  - **Dialect & Code-Switching:** Validates transitions between English, Hindi, Hinglish, Tamil, Telugu, and other regional Indian dialects.

### 2. 📡 Live Production Call Observability
- **Real-Time Stream Monitoring:** Continuously monitors live call streams across critical quality dimensions.
- **Key Metrics Tracked:**
  - **Latency (TTFT):** Measures Time to First Token and total voice turnaround time to prevent awkward conversational silences.
  - **Hallucination Detection:** Automated fact-checking against ground truth business policies using Sarvam-105B.
  - **Regulatory Compliance Score:** Checks adherence to strict regulatory disclosures and data protection standards.
  - **Resolution Rate & Sentiment:** Classifies caller emotion (Frustrated, Neutral, Positive) and final ticket outcome (Resolved vs Escalated).
- **Interactive Call Inspector:** Detailed inspection view displaying audio waveforms, interruption points, flagged violations, and turn-by-turn transcripts.

### 3. 📈 Continuous Improvement & Regression QA
- **Automated LLM-as-a-Judge:** 100% of calls undergo automated evaluation against standard QA rubrics.
- **Human QA Review Queue:** Spikes in latency or low-sentiment calls are automatically routed to human reviewers for labeling and triage.
- **Regression Benchmarking Matrix:** Compare new prompt variants and model weights (e.g., Release v2.4 vs v2.3) against a frozen golden dataset to prevent regressions before launch.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **AI Engine:** Sarvam AI Multilingual Conversational Foundation Models (`sarvam-105b-conversations`)
- **API Routes:**
  - `GET /api/sarvam/connection`: Handshake and latency benchmark against Sarvam API.
  - `POST /api/sarvam/chat`: Conversational completions and live adversarial evaluation runner.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd sarvam
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
```

### 3. Run Locally (Development)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the Voice Agent QA dashboard.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## ☁️ Deploying to Vercel

Deploy your Next.js application to Vercel in just a few steps:

### Option A: Deploy via GitHub (Recommended)
1. Push your project code to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete Voice Agent QA Platform"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Import your GitHub repository.
5. In the **Configure Project** screen:
   - **Framework Preset:** Next.js (automatically detected)
   - **Root Directory:** `./`
6. Expand **Environment Variables**:
   - Key: `SARVAM_API_KEY`
   - Value: `your_actual_sarvam_api_key`
7. Click **Deploy**. Vercel will build and assign a production URL (e.g., `https://your-project.vercel.app`).

### Option B: Deploy via Vercel CLI
1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```
2. Log in and deploy from project directory:
   ```bash
   vercel
   ```
3. Set your production environment variable when prompted or via:
   ```bash
   vercel env add SARVAM_API_KEY
   ```
4. Deploy to production:
   ```bash
   vercel --prod
   ```
