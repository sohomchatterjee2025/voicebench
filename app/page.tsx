"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: "user" | "sarvam";
  text: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "sarvam",
      text: "Hello! Tap the microphone button to talk, or type a message below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const speak = (text: string) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || isThinking) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }

    try {
      const res = await fetch("/api/sarvam/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a friendly, concise voice assistant. Give helpful, conversational responses in 1-3 sentences.",
            },
            ...messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: text },
          ],
          model: "sarvam-105b-conversations",
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();
      const replyText = data.choices?.[0]?.message?.content || "I didn't quite catch that. Could you repeat?";

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "sarvam", text: replyText }]);
      speak(replyText);
    } catch {
      const errorReply = "Sorry, I am having trouble connecting right now. Please try again.";
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "sarvam", text: errorReply }]);
      speak(errorReply);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleMic = () => {
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
      window.speechSynthesis?.cancel();
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          sendMessage(spoken);
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
    <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900 font-sans">
      {/* Top Bar */}
      <header className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
          <h1 className="text-base font-semibold text-gray-800">Sarvam Voice</h1>
        </div>

        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (soundEnabled) window.speechSynthesis?.cancel();
          }}
          className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
        >
          {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
        </button>
      </header>

      {/* Main Single-Page Chat View */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        {/* Chat Messages Container */}
        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-h-[380px] max-h-[520px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <span className="text-[11px] font-medium text-gray-400 mb-1 px-1">
                {m.sender === "user" ? "You" : "Sarvam"}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-medium text-gray-400 mb-1 px-1">Sarvam</span>
              <div className="rounded-2xl bg-gray-100 border border-gray-200 px-4 py-2.5 text-xs text-gray-500 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Big Bright Voice Mic Button in Center */}
        <div className="my-6 flex flex-col items-center justify-center">
          <button
            onClick={toggleMic}
            className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 ${
              isListening
                ? "bg-red-500 ring-4 ring-red-300 scale-110 shadow-red-500/40 animate-pulse"
                : isThinking
                ? "bg-amber-500 ring-4 ring-amber-200 scale-95"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-blue-500/30"
            }`}
            title="Click to speak"
          >
            <svg
              className="h-10 w-10 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
          <span className="mt-2 text-xs font-medium text-gray-500">
            {isListening ? "Listening... Speak now" : isThinking ? "Processing..." : "Tap to Speak"}
          </span>
        </div>

        {/* Text Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2 rounded-full border border-gray-300 bg-white p-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            disabled={isThinking}
            className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="rounded-full bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 transition"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
