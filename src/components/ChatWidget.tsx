import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

// ✦ HIGH-FIDELITY REARING CENTAUR ARCHER SVG LOGO (VERBATIM BRAND REPRODUCTION)
export const CentaurArcherLogo: React.FC<{ className?: string; color?: string }> = ({
  className = "w-12 h-12",
  color = "#C9A96E"
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 68,36 C 70,30 68,20 62,15 M 68,36 C 65,42 58,45 52,47" strokeWidth="2.5" />
        <path d="M 45,39 L 75,25" strokeWidth="2" />
        <path d="M 72,23 L 76,25 L 72,28 Z" fill={color} />
        <path d="M 61,16 L 43,40" strokeWidth="1" strokeDasharray="2,2" />

        <path d="M 45,30 C 47,26 49,23 48,20 C 46,17 42,16 39,18 C 36,20 37,25 39,28" strokeWidth="2.5" />
        <path d="M 40,20 L 44,22" />
        <path d="M 42,28 C 45,30 48,34 50,38 L 41,45 L 36,36 Z" fill={`${color}20`} strokeWidth="2" />

        <path d="M 44,30 Q 36,34 32,38 L 43,40" />
        <path d="M 48,33 Q 58,31 66,28" strokeWidth="2" />

        <path d="M 36,36 Q 26,38 20,44 Q 15,50 18,58 Q 21,65 28,62 C 34,60 38,54 41,45" strokeWidth="2.5" />
        <path d="M 18,58 L 14,75 Q 12,82 17,84 L 21,84 L 22,70" />
        <path d="M 23,61 Q 20,70 23,78 L 27,78 L 27,68" />

        <path d="M 41,43 Q 48,46 54,49 C 58,51 60,55 58,58 L 54,58" />
        <path d="M 39,45 Q 43,51 48,53 C 51,55 52,58 50,61" />

        <path d="M 18,50 C 13,52 9,58 11,66 C 12,72 16,74 18,74 C 15,68 15,58 18,50" fill={color} />

        <path d="M 30,88 L 70,88" strokeWidth="1.5" />
        <path d="M 27,88 L 31,85 M 27,88 L 31,91" strokeWidth="1.5" />
        <path d="M 73,88 L 69,85 M 73,88 L 69,91" strokeWidth="1.5" />
      </g>
    </svg>
  );
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string, text: string }[]>([
    { role: 'model', text: '✦ CONCIERGE OPENED 👋\n\nWelcome to DRIPEON. Ask me anything about our unique fits, materials, or your custom styled selections.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Format messages for the Gemini API (using {role, parts: [{text}]})
      const apiMessages = newMessages
        // Skip the very first introductory system message for the API context to save tokens and confusion
        .slice(1)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, { role: 'model', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the styling database. " + (data.error || "Please try again.") }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection error. Please check your network." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING BRAND TRIGGER BUTTON */}
      <button
        id="rt-chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white border border-neutral-800 text-red-600 flex items-center justify-center shadow-2xl transition-all duration-300 hover:border-red-600/80 hover:text-red-600 hover:shadow-[0_0_20px_rgba(201,169,110,0.15)] group cursor-pointer"
        aria-label="Engage DRIPEON Stylist Concierge"
      >
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-105" />
      </button>

      {/* CUSTOM CHAT WINDOW */}
      <div
        className={`fixed bottom-18 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-22 z-[100] sm:w-[350px] h-[400px] sm:h-[470px] bg-[#050505] border border-neutral-800/80 rounded-2xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300 transform origin-bottom-right ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none invisible'
          }`}
      >
        {/* Custom Header */}
        <div className="px-4 py-3 bg-[#0a0a0a] border-b border-neutral-900 flex items-center justify-between pointer-events-auto shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#111] border border-red-600/40 flex items-center justify-center shadow-inner relative shrink-0">
              <CentaurArcherLogo className="w-5 h-5 mr-[1px] mb-[1px]" color="#2563eb" />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black animate-pulse" />
            </div>

            <div className="text-left">
              <h4 className="text-[11px] font-black tracking-[0.25em] text-red-600 uppercase leading-tight">
                DRIPEON
              </h4>
              <span className="text-[8px] font-medium text-neutral-500 uppercase tracking-widest block leading-none mt-0.5">
                CONCIERGE • ACTIVE
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-6 h-6 rounded-md border border-neutral-900 text-neutral-500 hover:text-[#ffffff] hover:bg-neutral-800 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050505] custom-scrollbar">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                      ? 'bg-[#1a4b9c] text-[#ffffff] rounded-br-sm'
                      : 'bg-[#111] border border-neutral-800 text-neutral-200 rounded-bl-sm'
                    }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full justify-start"
              >
                <div className="bg-[#111] border border-neutral-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                  <span className="text-[12px] text-neutral-400">Stylist is typing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <div className="p-3 bg-[#0a0a0a] border-t border-neutral-900">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="State your styling preferences..."
              className="w-full bg-[#111] border border-neutral-800 rounded-full py-2.5 pl-4 pr-12 text-[13px] text-[#ffffff] placeholder-neutral-500 focus:outline-none focus:border-red-600/50 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-[#ffffff] hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2 pb-1">
            <span className="text-[9px] text-neutral-600 font-medium tracking-widest uppercase">
              Powered by DRIPEON AI
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #050505;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </>
  );
}
