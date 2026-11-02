'use client';

import React, { useState } from 'react';
import { ApplicationItem } from '@/lib/types';
import { useLanguage } from '@/lib/languageContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  FileText,
  IndianRupee,
  Loader2,
} from 'lucide-react';

interface StatusTrackerModalProps {
  onClose: () => void;
  initialQuery?: string;
}

export default function StatusTrackerModal({
  onClose,
  initialQuery = '',
}: StatusTrackerModalProps) {
  const { language, t } = useLanguage();
  const [queryId, setQueryId] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<ApplicationItem | null>(null);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = queryId.trim();
    if (!cleanId) return;

    setLoading(true);
    setSearched(true);
    setNotFound(false);
    setAppData(null);

    try {
      // 1. Try Firestore direct doc fetch
      const docRef = doc(db, 'applications', cleanId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setAppData(snap.data() as ApplicationItem);
      } else {
        // 2. Check local storage fallback
        const localApps: ApplicationItem[] = JSON.parse(
          localStorage.getItem('arvi_local_applications') || '[]'
        );
        const match = localApps.find(
          (a) =>
            a.applicationId.toLowerCase() === cleanId.toLowerCase() ||
            a.mobile === cleanId
        );
        if (match) {
          setAppData(match);
        } else {
          setNotFound(true);
        }
      }
    } catch (err) {
      console.warn('Status search error, checking local store:', err);
      const localApps: ApplicationItem[] = JSON.parse(
        localStorage.getItem('arvi_local_applications') || '[]'
      );
      const match = localApps.find(
        (a) =>
          a.applicationId.toLowerCase() === cleanId.toLowerCase() ||
          a.mobile === cleanId
      );
      if (match) {
        setAppData(match);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'IN_PROGRESS':
        return 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'REJECTED':
        return 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return t.statusCompleted;
      case 'IN_PROGRESS':
        return t.statusInProgress;
      case 'REJECTED':
        return t.statusRejected;
      default:
        return t.statusSubmitted;
    }
  };

  const handleWhatsAppHelp = () => {
    const text = encodeURIComponent(
      `નમસ્તે રાહુલભાઈ, મારી અરજી નંબર: ${queryId || appData?.applicationId || ''} ની સ્થિતિ જાણવા માટે સંપર્ક કરું છું.`
    );
    window.open(`https://wa.me/917265013972?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.trackModalTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'gu'
                ? 'અરજી નંબર અથવા મોબાઈલ નંબર વડે તાત્કાલિક સ્થિતિ જુઓ'
                : 'Track real-time progress using Application ID or Mobile'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder={t.trackInputPlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>{t.checkStatusBtn}</span>
                </>
              )}
            </button>
          </form>

          {/* Result view */}
          {appData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Status Header Badge */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${getStatusColor(appData.status)}`}>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold block opacity-75">
                    {language === 'gu' ? 'હાલની અરજી સ્થિતિ' : 'Current Status'}
                  </span>
                  <span className="text-lg font-black">{getStatusText(appData.status)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] block opacity-75">
                    {language === 'gu' ? 'અરજી ક્રમાંક' : 'Application ID'}
                  </span>
                  <span className="text-xs font-mono font-bold">{appData.applicationId}</span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-2">
                <div className="flex items-center justify-between relative">
                  {/* Step 1: Submitted */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      1
                    </div>
                    <span className="text-[11px] font-semibold mt-1 text-slate-700 dark:text-slate-300 text-center">
                      {language === 'gu' ? 'અરજી સ્વીકારી' : 'Submitted'}
                    </span>
                  </div>

                  <div className={`flex-1 h-1 mx-2 ${appData.status !== 'SUBMITTED' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />

                  {/* Step 2: In Progress */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        appData.status === 'IN_PROGRESS' || appData.status === 'COMPLETED'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      2
                    </div>
                    <span className="text-[11px] font-semibold mt-1 text-slate-700 dark:text-slate-300 text-center">
                      {language === 'gu' ? 'પ્રક્રિયા હેઠળ' : 'Processing'}
                    </span>
                  </div>

                  <div className={`flex-1 h-1 mx-2 ${appData.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />

                  {/* Step 3: Completed */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        appData.status === 'COMPLETED'
                          ? 'bg-emerald-600 text-white'
                          : appData.status === 'REJECTED'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      3
                    </div>
                    <span className="text-[11px] font-semibold mt-1 text-slate-700 dark:text-slate-300 text-center">
                      {appData.status === 'REJECTED'
                        ? language === 'gu' ? 'અસ્વીકાર' : 'Rejected'
                        : language === 'gu' ? 'પૂર્ણ / તૈયાર' : 'Completed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Application Details Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.customerName}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{appData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.services}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{appData.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.village}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{appData.village}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'gu' ? 'તારીખ' : 'Date'}:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {new Date(appData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'gu' ? 'પેમેન્ટ સ્થિતિ' : 'Payment'}:</span>
                  <span className={`font-semibold ${appData.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {appData.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'}
                  </span>
                </div>
                {appData.adminRemarks && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 block mb-0.5">
                      {language === 'gu' ? 'કેન્દ્ર નોંધ / રીમાર્ક:' : 'Admin Remarks:'}
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 italic">
                      &quot;{appData.adminRemarks}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleWhatsAppHelp}
                  className="px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{language === 'gu' ? 'રાહુલભાઈને પૂછો' : 'Ask Rahul Thakor on WhatsApp'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {language === 'gu' ? 'બંધ કરો' : 'Close'}
                </button>
              </div>
            </div>
          )}

          {searched && notFound && (
            <div className="p-6 text-center rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-800 dark:text-amber-200">
                {language === 'gu'
                  ? `"${queryId}" નંબર માટે કોઈ સક્રિય અરજી મળી નથી.`
                  : `No application found for reference "${queryId}".`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'gu'
                  ? 'કૃપા કરીને અરજી નંબર તપાસો અથવા સીધો રાહુલ ઠાકોરનો સંપર્ક કરો.'
                  : 'Please verify the ID or contact center directly.'}
              </p>
              <button
                onClick={handleWhatsAppHelp}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? 'વોટ્સએપ હેલ્પલાઇન (7265013972)' : 'WhatsApp Helpline'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
