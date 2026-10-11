"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [textInput, setTextInput] = useState("");
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);
  const [language, setLanguage] = useState("hi-IN"); // Default Indic voice
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setHasVoiceSupport(false);
      }
    }
  }, []);

  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isThinking) return;

    setTranscript(text);
    setTextInput("");
    setIsThinking(true);
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);

    try {
      const res = await fetch("/api/sarvam/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a friendly, concise multilingual voice assistant powered by Sarvam AI. Keep answers short, conversational, and direct (1-3 sentences) suitable for spoken voice audio in Indian contexts (English, Hindi, or Hinglish).",
            },
            { role: "user", content: text },
          ],
          model: "sarvam-105b-conversations",
        }),
      });

      if (!res.ok) throw new Error("Failed to reach Sarvam AI");
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Namaste! How can I assist you?";

      setResponse(reply);
      speakText(reply);
    } catch {
      const errMsg = "Sorry, I could not connect to Sarvam AI. Please check your network and API key.";
      setResponse(errMsg);
      speakText(errMsg);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleListening = () => {
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
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          handleSendQuery(spoken);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#07090e] px-4 py-8 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Minimal Header */}
      <header className="flex w-full max-w-xl items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-sm font-semibold tracking-tight text-white">Sarvam Voice</span>
        </div>

        {/* Language & Sound Toggles */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs text-slate-300 outline-none hover:border-slate-700 transition"
          >
            <option value="hi-IN">Hindi (hi-IN)</option>
            <option value="en-IN">English (India)</option>
            <option value="ta-IN">Tamil (ta-IN)</option>
            <option value="te-IN">Telugu (te-IN)</option>
            <option value="bn-IN">Bengali (bn-IN)</option>
          </select>

          <button
            onClick={() => {
              setVoiceEnabled(!voiceEnabled);
              if (voiceEnabled) window.speechSynthesis?.cancel();
            }}
            title={voiceEnabled ? "Mute Voice Output" : "Enable Voice Output"}
            className={`rounded-lg border px-2.5 py-1 text-xs transition ${
              voiceEnabled
                ? "border-indigo-500/40 bg-indigo-950/30 text-indigo-300"
                : "border-slate-800 bg-slate-900 text-slate-400"
            }`}
          >
            {voiceEnabled ? "🔊 Sound On" : "🔇 Muted"}
          </button>
        </div>
      </header>

      {/* Center Voice Orb & Status */}
      <main className="flex w-full max-w-xl flex-1 flex-col items-center justify-center my-8 space-y-8">
        {/* Animated Voice Orb */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Rings */}
          {(isListening || isThinking || isSpeaking) && (
            <div
              className={`absolute h-48 w-48 rounded-full animate-ping opacity-25 ${
                isListening
                  ? "bg-rose-500"
                  : isThinking
                  ? "bg-amber-400"
                  : "bg-indigo-500"
              }`}
            />
          )}

          {/* Central Mic Button */}
          <button
            onClick={toggleListening}
            className={`relative flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300 shadow-2xl focus:outline-none ${
              isListening
                ? "bg-rose-600 shadow-rose-600/40 scale-105"
                : isThinking
                ? "bg-amber-500 shadow-amber-500/30 scale-95 animate-pulse"
                : isSpeaking
                ? "bg-indigo-600 shadow-indigo-600/40 scale-105"
                : "bg-slate-900 border-2 border-slate-700/80 hover:border-indigo-500/80 hover:scale-105"
            }`}
          >
            <span className="text-4xl select-none">
              {isListening ? "🎙️" : isThinking ? "⏳" : isSpeaking ? "🔊" : "🎙️"}
            </span>
          </button>
        </div>

        {/* State Label */}
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">
            {isListening
              ? "Listening... Speak now"
              : isThinking
              ? "Sarvam AI is thinking..."
              : isSpeaking
              ? "Speaking..."
              : "Tap microphone to speak"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Powered by Sarvam-105B Indic Language Model
          </p>
        </div>

        {/* Clean Transcript / Conversation Card */}
        {(transcript || response) && (
          <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4 backdrop-blur-sm animate-fade-in">
            {transcript && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  You said
                </span>
                <p className="text-sm text-slate-200 mt-0.5">{transcript}</p>
              </div>
            )}

            {response && (
              <div className="border-t border-slate-800/60 pt-3">
                <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                  Sarvam
                </span>
                <p className="text-sm text-slate-100 mt-0.5 leading-relaxed">{response}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Minimal Bottom Text Fallback */}
      <footer className="w-full max-w-xl pb-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(textInput);
          }}
          className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5 focus-within:border-slate-700 transition"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type a question in English, Hindi, or Hinglish..."
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isThinking}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
