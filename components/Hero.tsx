'use client';

import React from 'react';
import { useLanguage } from '@/lib/languageContext';
import {
  Search,
  CheckCircle,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
} from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onApplyClick: () => void;
  onOpenTrackModal: () => void;
  bannerNotice?: string;
}

export default function Hero({
  searchQuery,
  setSearchQuery,
  onApplyClick,
  onOpenTrackModal,
  bannerNotice,
}: HeroProps) {
  const { language, t } = useLanguage();

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent(
      language === 'gu'
        ? 'નમસ્તે રાહુલભાઈ, મારે આર્વી ઓનલાઇન & CSC કેન્દ્રની સેવા વિશે માહિતી મેળવવી છે.'
        : 'Hello Rahul Thakor, I would like to inquire about services at ARVI ONLINE & CSC.'
    );
    window.open(`https://wa.me/917265013972?text=${text}`, '_blank');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 pt-8 pb-14 border-b border-slate-200 dark:border-slate-800">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/15 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Notice alert banner if present */}
        {bannerNotice && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-blue-500/10 border border-amber-300/50 dark:border-amber-600/30 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs sm:text-sm text-slate-800 dark:text-amber-200">
            <span className="shrink-0 px-2 py-0.5 rounded font-bold bg-amber-500 text-white text-[11px] uppercase tracking-wide">
              {language === 'gu' ? 'નવીનતમ સૂચના' : 'Notice'}
            </span>
            <p className="truncate font-medium">{bannerNotice}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines, Info & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Operator tag */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/80 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {language === 'gu'
                  ? 'ડિજિટલ સેવા કેન્દ્ર – ખોડાણા, પાટણ (સંચાલક: રાહુલ ઠાકોર)'
                  : 'Digital CSC Center – Khodana, Patan (Operator: Rahul Thakor)'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance">
              {t.heroHeadline}
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {t.heroDescription}
            </p>

            {/* Live Search Input Bar */}
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  {language === 'gu' ? 'સાફ કરો' : 'Clear'}
                </button>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onApplyClick}
                className="px-6 py-3 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>{t.applyOnline}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppClick}
                className="px-5 py-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'gu' ? 'વોટ્સએપ સંપર્ક (7265013972)' : 'WhatsApp (7265013972)'}</span>
              </button>

              <button
                onClick={onOpenTrackModal}
                className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4 transition-colors"
              >
                {t.trackStatus}
              </button>
            </div>
          </div>

          {/* Right Column: Stylized CSC Jan Suvidha Visual Hub */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-blue-800/40">
              {/* Center Emblem Header */}
              <div className="flex items-center justify-between pb-6 border-b border-blue-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-xl">
                    CSC
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-amber-400 tracking-wide">
                      આર્વી ઓનલાઈન & જન સુવિધા
                    </h3>
                    <p className="text-xs text-blue-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      <span>ખોડાણા, પાટણ (ગુજરાત)</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300 block">
                    Digital India
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {language === 'gu' ? 'સક્રિય કેન્દ્ર' : 'Verified Center'}
                  </span>
                </div>
              </div>

              {/* Center Highlights */}
              <div className="py-6 space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      {language === 'gu' ? 'અધિકૃત સરકારી સેવાઓ' : 'Official Government Portals'}
                    </h4>
                    <p className="text-xs text-blue-200/80 leading-relaxed">
                      {language === 'gu'
                        ? 'આયુષ્માન કાર્ડ, પાન કાર્ડ, રેશન કાર્ડ, 7/12 ઉતારા અને સરકારી ભરતી ફોર્મ.'
                        : 'Ayushman Bharat, PAN card, Ration card, AnyRoR 7/12, and official job portals.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      {language === 'gu' ? 'ઓનલાઇન અરજી & UPI પેમેન્ટ' : 'Online Apply & UPI Payments'}
                    </h4>
                    <p className="text-xs text-blue-200/80 leading-relaxed">
                      {language === 'gu'
                        ? 'ઘેરબેઠા ઓનલાઇન અરજી કરો, UPI વડે ફી ભરો અને લાઇવ સ્ટેટસ ચેક કરો.'
                        : 'Apply from home, pay fees instantly via UPI QR code, and track application progress.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      {language === 'gu' ? 'સમય અને સંપર્ક' : 'Timings & Assistance'}
                    </h4>
                    <p className="text-xs text-blue-200/80 leading-relaxed">
                      {language === 'gu'
                        ? 'સોમવાર થી શનિવાર: સવારે ૮:૦૦ થી રાત્રે ૮:૦૦ | ફોન: 7265013972'
                        : 'Mon - Sat: 8:00 AM to 8:00 PM | Helpline: 7265013972'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Contact Strip */}
              <div className="pt-4 border-t border-blue-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-blue-300 block">
                    {language === 'gu' ? 'કેન્દ્ર સંચાલક' : 'Center Manager'}
                  </span>
                  <span className="text-sm font-bold text-white">
                    રાહુલ ઠાકોર (Rahul Thakor)
                  </span>
                </div>
                <button
                  onClick={handleWhatsAppClick}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'મેસેજ કરો' : 'Message'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
