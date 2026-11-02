'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/languageContext';

export default function FloatingWhatsApp() {
  const { language } = useLanguage();

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      language === 'gu'
        ? 'નમસ્તે રાહુલભાઈ, મને આર્વી ઓનલાઇન & CSC કેન્દ્રની સેવા વિશે માહિતી જોઈએ છે.'
        : 'Hello Rahul Thakor, I would like to inquire about ARVI ONLINE & CSC services.'
    );
    window.open(`https://wa.me/917265013972?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      <button
        onClick={handleWhatsApp}
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white dark:border-slate-800"
        aria-label="Contact Rahul Thakor on WhatsApp"
        title="WhatsApp: 7265013972"
      >
        <MessageCircle className="w-8 h-8 fill-white text-emerald-500" />
      </button>

      {/* Hover tooltip */}
      <span className="hidden group-hover:block absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
        {language === 'gu' ? 'રાહુલ ઠાકોર: 7265013972' : 'WhatsApp: 7265013972'}
      </span>
    </div>
  );
}
