'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/languageContext';
import {
  Bot,
  X,
  Send,
  MessageCircle,
  Sparkles,
  Loader2,
  ChevronDown,
} from 'lucide-react';

let msgCounter = 100;
function getNextId() {
  msgCounter += 1;
  return `msg-${msgCounter}`;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function AiAssistant() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialBotGreeting =
    language === 'gu'
      ? 'નમસ્તે! હું "CSC મિત્ર" – આર્વી ઓનલાઇન & CSC કેન્દ્ર, ખોડાણા (પાટણ) નો ડિજિટલ સહાયક છું. પાન કાર્ડ, આયુષ્માન કાર્ડ, રેશન કાર્ડ, 7/12 ઉતારા કે કોઈ પણ સરકારી યોજના વિશે પૂછો.'
      : 'Hello! I am "CSC Mitra" – the AI digital assistant for ARVI ONLINE & CSC, Khodana (Patan). How can I assist you with government services or required documents today?';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-initial',
      sender: 'bot',
      text: initialBotGreeting,
      time: '08:00 AM',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || loading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: getNextId(),
      sender: 'user',
      text: textToSend,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: getNextId(),
        sender: 'bot',
        text: data.reply || (
          language === 'gu'
            ? 'વધુ વિગત માટે રાહુલ ઠાકોર (7265013972) નો સીધો સંપર્ક કરો.'
            : 'For more details, please contact Rahul Thakor at 7265013972.'
        ),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: getNextId(),
        sender: 'bot',
        text:
          language === 'gu'
            ? 'માફ કરશો, નેટવર્ક સમસ્યા છે. કૃપા કરીને વોટ્સએપ નંબર 7265013972 પર સીધો સંપર્ક કરો.'
            : 'Network error. Please contact Rahul Thakor directly at 7265013972.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const msg = encodeURIComponent(
      language === 'gu'
        ? 'નમસ્તે રાહુલભાઈ, મને ARVI ONLINE & CSC સેન્ટરની સેવા વિશે પૂછપરછ કરવી છે.'
        : 'Hello Rahul Thakor, I would like to inquire about ARVI ONLINE & CSC services.'
    );
    window.open(`https://wa.me/917265013972?text=${msg}`, '_blank');
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-20 sm:right-24 z-40 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 group border border-blue-400/40"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6 text-amber-300" />
          <span className="hidden md:inline text-xs font-bold pr-1">
            {t.aiAssistantTitle}
          </span>
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-8 z-50 w-[94vw] sm:w-[420px] h-[550px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Top Bar */}
          <div className="p-4 bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 text-white">
                  <span>{t.aiAssistantTitle}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h4>
                <p className="text-[11px] text-blue-200">
                  {t.aiAssistantSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Questions Strip */}
          <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            {t.quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-blue-500 whitespace-nowrap shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-700 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 shadow-sm rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>{language === 'gu' ? 'CSC મિત્ર વિચારી રહ્યું છે...' : 'CSC Mitra is typing...'}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Direct WhatsApp shortcut in chat */}
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-xs">
            <span className="text-[11px] font-medium text-emerald-900 dark:text-emerald-300">
              {language === 'gu' ? 'સીધા રાહુલભાઈ સાથે વાત કરવી છે?' : 'Want to chat with Rahul Thakor directly?'}
            </span>
            <button
              onClick={handleOpenWhatsApp}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp (7265013972)</span>
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.askQuestionPlaceholder}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
