"use client";

import { useState, useEffect, useRef } from "react";

// Categorized Agent Modes from the Idea Library
interface AgentPreset {
  id: string;
  name: string;
  category: string;
  systemPrompt: string;
}

const AGENT_PRESETS: AgentPreset[] = [
  {
    id: "general",
    name: "General Multilingual Assistant",
    category: "General",
    systemPrompt: "You are a concise, culturally aware voice assistant. Respond naturally in 1-3 sentences in the user's language (Hindi, Bengali, Tamil, Telugu, Marathi, or English). If interrupted, yield immediately and address the new question directly.",
  },
  {
    id: "underwriting",
    name: "Intelligent Underwriting & Loan Agent (No. 22, 27)",
    category: "Banking & Finance",
    systemPrompt: "You are an intelligent Indic voice underwriting and credit evaluation agent. Verify borrower details, cross-check income/KYC clauses, explain loan terms concisely in Indian languages, and provide clear explainable risk decisions.",
  },
  {
    id: "accounts_payable",
    name: "Accounts Payable & Invoice Matcher (No. 24, 38)",
    category: "Banking & Finance",
    systemPrompt: "You are an accounts payable voice copilot. Verify invoice line items, purchase order numbers, GST discrepancies, and draft prompt vendor clarification responses in polite regional business language.",
  },
  {
    id: "insurance_claims",
    name: "Claim-It: Insurance Claim Copilot (No. 28)",
    category: "Banking & Finance",
    systemPrompt: "You are an empathetic Indian insurance claim voice assistant. Guide policyholders through hospitalization and accident claim narrations, identifying missing hospital bills, policy limits, and pre-filling claim forms.",
  },
  {
    id: "language_coach",
    name: "Indic Pronunciation & Language Coach (No. 1, 32)",
    category: "Education & Language",
    systemPrompt: "You are a personalized Indic language and pronunciation coach. Listen to the user's pronunciation, celebrate correct phrasing, and provide gentle, constructive corrections for vocabulary across Indian languages.",
  },
  {
    id: "doubt_solver",
    name: "Bhasha Doubt Solver & Misconception Detector (No. 30, 31)",
    category: "Education & Language",
    systemPrompt: "You are an interactive Indic STEM tutor. When a student asks a doubt, prompt them to explain their intuition before guiding them, gently correcting conceptual misconceptions with relatable Indian real-world analogies.",
  },
  {
    id: "sarkari_sahayak",
    name: "Sarkari Sahayak: Scheme & Benefit Finder (No. 29, 45)",
    category: "Government & Citizen",
    systemPrompt: "You are Sarkari Sahayak, a public welfare navigator for Indian citizens and gig workers. Cross-reference official schemes (EPFO, PM-Kisan, Ayushman Bharat, e-Shram), explain eligibility in clear spoken language, and guide application steps.",
  },
  {
    id: "grievance_rti",
    name: "Grievance Drafter & RTI Copilot (No. 46, 47)",
    category: "Government & Citizen",
    systemPrompt: "You are an administrative citizen legal copilot. Help users articulate official public grievances according to CPGRAMS standards, or frame legally compliant Right to Information (RTI) applications citing relevant departments.",
  },
  {
    id: "patient_intake",
    name: "Sunniye Samjhiye: Patient OPD Intake (No. 39, 40)",
    category: "Healthcare",
    systemPrompt: "You are an empathetic hospital OPD triage voice assistant. Record patient symptom narratives in regional languages, extract key complaints clearly, and structure concise clinical summaries for attending physicians.",
  },
  {
    id: "missed_dose",
    name: "Missed-Dose & Patient Recovery Companion (No. 41)",
    category: "Healthcare",
    systemPrompt: "You are a warm, non-diagnostic post-discharge care companion. Check on patients in their native tongue regarding medication adherence, recovery symptoms, and follow-up clinic visits, escalating red-flag symptoms.",
  },
  {
    id: "dispatcher",
    name: "Dispatcher-in-Your-Pocket & Voice POD (No. 36, 37)",
    category: "Logistics",
    systemPrompt: "You are a real-time logistics voice dispatcher. Process driver voice notes on highway delays, transit checkpoints, and consignee delivery confirmations, converting spoken reports into structured logistics updates.",
  },
  {
    id: "disaster_relief",
    name: "Signal Fusion & Needs-to-Relief Matcher (No. 42, 44)",
    category: "Public Safety",
    systemPrompt: "You are a crisis and disaster response voice coordinator. Ingest emergency voice dispatches from citizens, extract urgent relief requirements (food, boat, medical), deduplicate locations, and prioritize dispatch triage.",
  },
  {
    id: "misinformation_triage",
    name: "Cross-Lingual Misinformation Triage (No. 49, 50)",
    category: "Information Integrity",
    systemPrompt: "You are an Indian fact-checking intelligence assistant. Analyze claims circulating on messaging channels across Indic languages, cross-referencing verified public facts and assigning evidence-backed veracity ratings.",
  },
];

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  interrupted?: boolean;
}

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<AgentPreset>(AGENT_PRESETS[0]);
  const [activeLanguage, setActiveLanguage] = useState("hi-IN");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputText, setInputText] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: "intro",
      role: "assistant",
      text: "Namaste! Tap the blue microphone to speak, or interrupt anytime while I'm talking.",
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const turnsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, isThinking]);

  // Human Interruption Handler: Immediately halts speech synthesis and resumes listening
  const interruptSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speak = (text: string) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = activeLanguage;
    utterance.rate = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (query: string, wasInterruption = false) => {
    const text = query.trim();
    if (!text || isThinking) return;

    // Cut off any active speech immediately
    interruptSpeaking();

    const userTurn: ChatTurn = {
      id: Date.now().toString(),
      role: "user",
      text,
      interrupted: wasInterruption,
    };

    setTurns((prev) => [...prev, userTurn]);
    setInputText("");
    setIsThinking(true);

    try {
      const messagesPayload = [
        {
          role: "system",
          content: `${selectedPreset.systemPrompt} If the user interrupts you mid-flow, immediately yield, drop previous context, and answer their new command directly in 1-3 sentences.`,
        },
        ...turns.map((t) => ({ role: t.role, content: t.text })),
        { role: "user", content: text },
      ];

      const res = await fetch("/api/sarvam/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesPayload,
          model: "sarvam-105b-conversations",
        }),
      });

      if (!res.ok) throw new Error("API call failed");
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Understood.";

      const agentTurn: ChatTurn = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: reply,
      };

      setTurns((prev) => [...prev, agentTurn]);
      speak(reply);
    } catch {
      const errorTurn: ChatTurn = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Main sun raha hoon. Please repeat your command.",
      };
      setTurns((prev) => [...prev, errorTurn]);
      speak("Main sun raha hoon.");
    } finally {
      setIsThinking(false);
    }
  };

  const toggleMic = () => {
    // If speaking, tapping the mic functions as an instant interruption
    if (isSpeaking) {
      interruptSpeaking();
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      interruptSpeaking();
      const recognition = new SpeechRecognition();
      recognition.lang = activeLanguage;
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const spoken = e.results[0][0].transcript;
        if (spoken) {
          handleSend(spoken, isSpeaking);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#070a11] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Sleek Minimal Header: Only Claims Languages */}
      <header className="border-b border-slate-800/80 bg-[#0c101c]/80 px-6 py-4 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md shadow-blue-600/30 text-sm">
              VB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-white">VoiceBench</h1>
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                  Sarvam 105B
                </span>
              </div>
              <p className="text-[11px] text-blue-400 font-medium">
                Hindi • Bengali • Tamil • Telugu • Marathi • Gujarati • Kannada • Malayalam • Odia • Punjabi • English
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Language Picker */}
            <select
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 outline-none"
            >
              <option value="hi-IN">Hindi (hi-IN)</option>
              <option value="bn-IN">Bengali (bn-IN)</option>
              <option value="en-IN">English (en-IN)</option>
              <option value="ta-IN">Tamil (ta-IN)</option>
              <option value="te-IN">Telugu (te-IN)</option>
              <option value="mr-IN">Marathi (mr-IN)</option>
              <option value="gu-IN">Gujarati (gu-IN)</option>
            </select>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (soundEnabled) interruptSpeaking();
              }}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition"
            >
              {soundEnabled ? "🔊 Sound On" : "🔇 Muted"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 gap-4">
        {/* Compact Agent Capability Mode Switcher (Idea Library Domains) */}
        <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#0c101c]/60 p-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Domain Mode:
            </span>
            <select
              value={selectedPreset.id}
              onChange={(e) => {
                const found = AGENT_PRESETS.find((p) => p.id === e.target.value);
                if (found) setSelectedPreset(found);
              }}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-blue-300 font-medium outline-none"
            >
              {AGENT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.category}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Barge-in Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className={`h-2 w-2 rounded-full ${isSpeaking ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            <span>{isSpeaking ? "⚡ Speaking (Tap mic to interrupt)" : "⚡ Interruption Ready"}</span>
          </div>
        </div>

        {/* Clean Responsive Chat Stream */}
        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-800/80 bg-[#0a0e1a]/80 p-5 min-h-[360px] max-h-[500px]">
          {turns.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col ${t.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-medium text-slate-400">
                  {t.role === "user" ? "You" : selectedPreset.name.split(":")[0]}
                </span>
                {t.interrupted && (
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-amber-400 border border-amber-500/20">
                    ⚡ Human Interruption
                  </span>
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  t.role === "user"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-[#111726] text-slate-200 border border-slate-800"
                }`}
              >
                {t.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-medium text-slate-400 mb-1 px-1">Sarvam 105B</span>
              <div className="rounded-2xl bg-[#111726] border border-slate-800 px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                <span>Processing voice turn...</span>
              </div>
            </div>
          )}
          <div ref={turnsEndRef} />
        </div>

        {/* Big Bright Blue Voice Mic Button & Interruption Trigger */}
        <div className="my-2 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer Ripple on Speaking or Listening */}
            {(isListening || isSpeaking) && (
              <div
                className={`absolute h-28 w-28 rounded-full animate-ping opacity-25 ${
                  isListening ? "bg-red-500" : "bg-amber-400"
                }`}
              />
            )}

            <button
              onClick={toggleMic}
              className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 focus:outline-none ${
                isListening
                  ? "bg-red-500 ring-4 ring-red-400/40 scale-105 shadow-red-500/40 animate-pulse"
                  : isSpeaking
                  ? "bg-amber-500 ring-4 ring-amber-400/40 hover:bg-amber-600 shadow-amber-500/40"
                  : isThinking
                  ? "bg-blue-800 scale-95"
                  : "bg-blue-600 hover:bg-blue-500 hover:scale-105 shadow-blue-600/40"
              }`}
              title={isSpeaking ? "Tap to interrupt speech" : "Tap to speak"}
            >
              {isSpeaking ? (
                <span className="text-2xl select-none">⏹️</span>
              ) : (
                <svg className="h-9 w-9 fill-current" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </button>
          </div>

          <span className="mt-2 text-xs font-semibold text-slate-300">
            {isListening
              ? "🎙️ Listening... (Speak your command)"
              : isSpeaking
              ? "⚡ Agent is Speaking — Tap button to Interrupt immediately"
              : isThinking
              ? "⏳ Synthesizing Response..."
              : "Tap Microphone to Speak"}
          </span>
        </div>

        {/* Minimal Bottom Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText, isSpeaking);
          }}
          className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-[#0d1220] p-1.5 shadow-md focus-within:border-blue-500 transition"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type command, or speak above (interruption active anytime)..."
            disabled={isThinking}
            className="flex-1 bg-transparent px-4 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
