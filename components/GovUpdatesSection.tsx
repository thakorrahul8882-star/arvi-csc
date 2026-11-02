'use client';

import React, { useState } from 'react';
import { SchemeItem } from '@/lib/types';
import { useLanguage } from '@/lib/languageContext';
import SchemeDetailModal from './SchemeDetailModal';
import {
  Bell,
  Briefcase,
  Tractor,
  Award,
  GraduationCap,
  Calendar,
  Building2,
  CheckCircle2,
  Eye,
  ClipboardList,
  IndianRupee,
} from 'lucide-react';

interface GovUpdatesSectionProps {
  schemes: SchemeItem[];
  onApplyForScheme?: (scheme: SchemeItem) => void;
}

export default function GovUpdatesSection({
  schemes,
  onApplyForScheme,
}: GovUpdatesSectionProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECRUITMENT' | 'SCHEME' | 'FARMER' | 'EDUCATION'>('ALL');
  const [selectedScheme, setSelectedScheme] = useState<SchemeItem | null>(null);

  const tabs = [
    { key: 'ALL', labelGu: 'તમામ અપડેટ્સ', labelEn: 'All Updates' },
    { key: 'RECRUITMENT', labelGu: 'સરકારી ભરતી', labelEn: 'Recruitment' },
    { key: 'SCHEME', labelGu: 'સરકારી યોજનાઓ', labelEn: 'Welfare Schemes' },
    { key: 'FARMER', labelGu: 'ખેડૂત વિશેષ (ikhedut)', labelEn: 'Farmer Updates' },
    { key: 'EDUCATION', labelGu: 'સ્કોલરશિપ & શિક્ષણ', labelEn: 'Education' },
  ];

  const filteredUpdates = schemes.filter((s) => {
    if (!s.active) return false;
    if (activeTab === 'ALL') return true;
    return s.type === activeTab;
  });

  return (
    <section id="schemes" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
              <Bell className="w-3.5 h-3.5" />
              <span>{language === 'gu' ? 'તાજા સમાચાર અને જાહેરાતો' : 'Latest Govt Announcements'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {language === 'gu' ? 'સરકારી યોજનાઓ અને ભરતી અપડેટ્સ' : 'Government Schemes & Recruitment'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === 'gu'
                ? 'ખોડાણા કેન્દ્ર પરથી નિયમિત સરકારી પોર્ટલની ચકાસણી સાથે તાજી માહિતી ઉપલબ્ધ.'
                : 'Verified updates for jobs, scholarships, and farming subsidies in Gujarat.'}
            </p>
          </div>
        </div>

        {/* Tab Controls (Zero-Pill discipline) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              {language === 'gu' ? tab.labelGu : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Grid of Update Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUpdates.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div>
                {/* Card Meta Top: Unboxed text with separators */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                      {item.type}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate max-w-[130px]">{item.department}</span>
                    </span>
                  </div>

                  {item.requiredDocuments && item.requiredDocuments.length > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1 shrink-0">
                      <ClipboardList className="w-3 h-3" />
                      <span>{item.requiredDocuments.length} ડોક્યુમેન્ટ</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  onClick={() => setSelectedScheme(item)}
                  className="text-base font-bold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {language === 'gu' ? item.titleGu : item.titleEn}
                </h3>

                {/* Benefits Pill Highlight if present */}
                {item.benefits && (
                  <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center gap-1.5 text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{item.benefits}</span>
                  </div>
                )}

                {/* Subtitle / Details */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed line-clamp-3">
                  {language === 'gu' ? item.detailsGu : item.detailsEn}
                </p>

                {/* Deadline */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {language === 'gu' ? 'છેલ્લી તારીખ: ' : 'Deadline: '}
                    <strong className="font-bold">{item.deadline}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedScheme(item)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'વિગતવાર માહિતી & ડોક્યુમેન્ટ્સ' : 'View Details'}</span>
                </button>

                <a
                  href={`https://wa.me/917265013972?text=${encodeURIComponent(
                    `નમસ્તે રાહુલભાઈ, મને "${item.titleGu}" વિશે ફોર્મ ભરવા માહિતી જોઈએ છે.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors"
                >
                  {language === 'gu' ? 'ફોર્મ ભરાવો' : 'Apply via CSC'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Scheme Detail Modal with Required Documents */}
      <SchemeDetailModal
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
        onApplyForScheme={onApplyForScheme}
      />
    </section>
  );
}
