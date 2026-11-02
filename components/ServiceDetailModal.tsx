'use client';

import React from 'react';
import { ServiceItem } from '@/lib/types';
import { useLanguage } from '@/lib/languageContext';
import {
  X,
  Clock,
  IndianRupee,
  FileCheck,
  CheckCircle,
  MessageCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onApply: (service: ServiceItem) => void;
}

export default function ServiceDetailModal({
  service,
  onClose,
  onApply,
}: ServiceDetailModalProps) {
  const { language, t } = useLanguage();

  if (!service) return null;

  const handleWhatsAppEnquiry = () => {
    const sName = language === 'gu' ? service.gujaratiName : service.englishName;
    const msg = encodeURIComponent(
      language === 'gu'
        ? `નમસ્તે રાહુલભાઈ, મને "${sName}" સેવા માટે માહિતી અને અરજી કરવા વિશે માર્ગદર્શન જોઈએ છે.`
        : `Hello Rahul Thakor, I would like guidance on applying for "${sName}".`
    );
    window.open(`https://wa.me/917265013972?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              {service.category} · {language === 'gu' ? 'જન સુવિધા સેવા' : 'CSC Service'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-1 text-slate-900 dark:text-white">
              {language === 'gu' ? service.gujaratiName : service.englishName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Fee & Processing Time Bar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{t.fee}</span>
              </span>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-1">
                {service.fee === 0
                  ? language === 'gu'
                    ? 'વાહન / પ્લાન મુજબ'
                    : 'As per plan / vehicle'
                  : `₹${service.fee}`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t.processingTime}</span>
              </span>
              <p className="text-sm font-bold text-amber-950 dark:text-amber-200 mt-1">
                {service.processingTime}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              {language === 'gu' ? 'સેવા વિગત' : 'Service Description'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'gu' ? service.descriptionGu : service.descriptionEn}
            </p>
          </div>

          {/* Required Documents Checklist */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.requiredDocs}</span>
            </h3>
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
              {service.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification note */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p>
              {language === 'gu'
                ? 'તમામ અરજીઓ ગુજરાત સરકાર અને ભારત સરકારના સત્તાવાર અધિકૃત પોર્ટલ મારફતે કરવામાં આવે છે. અરજી બાદ તમને ઓનલાઇન અરજી નંબર આપવામાં આવશે.'
                : 'All applications are processed securely via official state and central government portals with instant reference ID.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={handleWhatsAppEnquiry}
            className="px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.whatsappEnquiry}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onApply(service);
            }}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>{t.applyNow}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
