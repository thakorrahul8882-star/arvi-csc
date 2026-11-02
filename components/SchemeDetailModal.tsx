'use client';

import React from 'react';
import { SchemeItem } from '@/lib/types';
import { useLanguage } from '@/lib/languageContext';
import {
  X,
  Calendar,
  Building2,
  CheckCircle2,
  FileText,
  IndianRupee,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface SchemeDetailModalProps {
  scheme: SchemeItem | null;
  onClose: () => void;
  onApplyForScheme?: (scheme: SchemeItem) => void;
}

export default function SchemeDetailModal({
  scheme,
  onClose,
  onApplyForScheme,
}: SchemeDetailModalProps) {
  const { language } = useLanguage();

  if (!scheme) return null;

  const isGu = language === 'gu';

  const typeLabels: Record<string, { gu: string; en: string; color: string }> = {
    RECRUITMENT: { gu: 'સરકારી ભરતી', en: 'Govt Recruitment', color: 'bg-blue-600 text-white' },
    SCHEME: { gu: 'સરકારી યોજના', en: 'Welfare Scheme', color: 'bg-emerald-600 text-white' },
    FARMER: { gu: 'ખેડૂત વિશેષ (ikhedut)', en: 'Farmer Welfare', color: 'bg-amber-600 text-white' },
    EDUCATION: { gu: 'સ્કોલરશિપ & શિક્ષણ', en: 'Education / Scholarship', color: 'bg-purple-600 text-white' },
    ANNOUNCEMENT: { gu: 'મહત્વપૂર્ણ જાહેરાત', en: 'Announcement', color: 'bg-indigo-600 text-white' },
  };

  const currentType = typeLabels[scheme.type] || {
    gu: scheme.type,
    en: scheme.type,
    color: 'bg-blue-600 text-white',
  };

  const whatsappMessage = encodeURIComponent(
    `નમસ્તે રાહુલભાઈ (ARVI ONLINE & CSC - ખોડાણા),\n\nહું "${scheme.titleGu}" યોજના/ભરતી વિશે વધુ વિગતો મેળવવા અને ફોર્મ ભરાવવા માંગુ છું.\n- છેલ્લી તારીખ: ${scheme.deadline}\n\nકૃપા કરીને મને જરૂરી પ્રક્રિયા જણાવશો.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur shrink-0">
          <div className="space-y-1.5 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${currentType.color} shadow-sm`}>
                {isGu ? currentType.gu : currentType.en}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-3.5 h-3.5" />
                <span>{scheme.department}</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
              {isGu ? scheme.titleGu : scheme.titleEn || scheme.titleGu}
            </h2>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>
                {isGu ? 'અરજી કરવાની છેલ્લી તારીખ: ' : 'Application Deadline: '}
                <strong className="font-bold underline decoration-amber-500/50">{scheme.deadline}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* Main Description */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 space-y-1.5">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{isGu ? 'યોજના વિશે વિગતવાર પરિચય' : 'Scheme Overview'}</span>
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
              {isGu ? scheme.detailsGu : scheme.detailsEn || scheme.detailsGu}
            </p>
          </div>

          {/* Benefits Box */}
          {scheme.benefits && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isGu ? 'મળવાપાત્ર સહાય / લાભ' : 'Benefits & Financial Assistance'}</span>
              </h3>
              <p className="text-emerald-950 dark:text-emerald-200 font-semibold leading-relaxed text-xs sm:text-sm">
                {scheme.benefits}
              </p>
            </div>
          )}

          {/* Eligibility Box */}
          {scheme.eligibility && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1.5">
              <h3 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{isGu ? 'પાત્રતા અને નિયમો (કોણ લાભ લઈ શકે)' : 'Eligibility Criteria'}</span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                {scheme.eligibility}
              </p>
            </div>
          )}

          {/* Required Documents Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isGu ? 'જરૂરી આધાર-પુરાવા (ડોક્યુમેન્ટ્સ યાદી)' : 'Required Documents'}</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {scheme.requiredDocuments?.length || 0} ડોક્યુમેન્ટ જરૂરી
              </span>
            </div>

            {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scheme.requiredDocuments.map((docName, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                      {docName}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                {isGu
                  ? 'આ યોજના માટે આધાર કાર્ડ, રેશન કાર્ડ અને બેંક પાસબુક સાથે કેન્દ્ર પર સંપર્ક કરવો.'
                  : 'Please bring Aadhaar card, ration card, and bank passbook to the center.'}
              </p>
            )}
          </div>

          {/* Application Process */}
          {scheme.applicationProcess && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{isGu ? 'અરજી કરવાની પ્રક્રિયા (કેવી રીતે ફોર્મ ભરવું)' : 'How to Apply'}</span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                {scheme.applicationProcess}
              </p>
            </div>
          )}

          {/* Center Assurance Badge */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-800 dark:text-amber-300">
              {isGu
                ? '📍 ARVI ONLINE & CSC (ખોડાણા) કેન્દ્ર પર તમામ દસ્તાવેજો સ્કેન કરી ફોર્મ ભરી આપવામાં આવે છે.'
                : '📍 Full document scanning and form filling assistance available at our Khodana center.'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {scheme.link ? (
            <a
              href={scheme.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40"
            >
              <span>{isGu ? 'સત્તાવાર સરકારી પોર્ટલ' : 'Official Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-xs text-slate-500">
              {isGu ? 'કેન્દ્ર રૂબરૂ સહાય' : 'Visit Center'}
            </span>
          )}

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/917265013972?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isGu ? 'વોટ્સએપ પર ફોર્મ સહાય' : 'WhatsApp Assistance'}</span>
            </a>

            {onApplyForScheme && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApplyForScheme(scheme);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <span>{isGu ? 'ઓનલાઇન અરજી કરો' : 'Apply Online'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
