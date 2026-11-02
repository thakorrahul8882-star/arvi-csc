'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ServiceItem, ApplicationItem } from '@/lib/types';
import { useLanguage } from '@/lib/languageContext';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import UpiPaymentDrawer from './UpiPaymentDrawer';
import {
  X,
  FileCheck2,
  Upload,
  CheckCircle,
  Copy,
  MessageCircle,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface ApplicationModalProps {
  services: ServiceItem[];
  preSelectedService?: ServiceItem | null;
  onClose: () => void;
  onSuccess: (app: ApplicationItem) => void;
  upiId?: string;
}

export default function ApplicationModal({
  services,
  preSelectedService,
  onClose,
  onSuccess,
  upiId = '7265013972@upi',
}: ApplicationModalProps) {
  const { language, t } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('ખોડાણા (પાટણ)');
  const [serviceId, setServiceId] = useState(preSelectedService?.id || services[0]?.id || 'pan-card');
  const [notes, setNotes] = useState('');
  const [docName, setDocName] = useState('');
  const [docBase64, setDocBase64] = useState<string | null>(null);
  const [docType, setDocType] = useState<string>('image/jpeg');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Payment flow
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'UPI' | 'CENTER'>('UPI');
  const [paymentUtr, setPaymentUtr] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID'>('PENDING');

  const [loading, setLoading] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<ApplicationItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Sync selected service
  const currentService = services.find((s) => s.id === serviceId) || services[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setDocName(file.name);
    setIsProcessingFile(true);

    if (file.type.startsWith('image/')) {
      setDocType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setDocBase64(compressed);
          } else {
            setDocBase64(event.target?.result as string);
          }
          setIsProcessingFile(false);
        };
        img.onerror = () => {
          setDocBase64(event.target?.result as string);
          setIsProcessingFile(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or other documents
      if (file.size > 800 * 1024) {
        setError(
          language === 'gu'
            ? 'PDF ફાઇલ 800 KB થી નાની હોવી જોઈએ અથવા મોબાઈલથી ફોટો પાડીને અપલોડ કરો.'
            : 'PDF file must be under 800 KB, or upload a photo image.'
        );
        setIsProcessingFile(false);
        return;
      }
      setDocType(file.type || 'application/pdf');
      const reader = new FileReader();
      reader.onload = () => {
        setDocBase64(reader.result as string);
        setIsProcessingFile(false);
      };
      reader.onerror = () => {
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !mobile.trim()) {
      setError(
        language === 'gu'
          ? 'કૃપા કરીને પૂરું નામ અને મોબાઈલ નંબર દાખલ કરો.'
          : 'Please enter your full name and mobile number.'
      );
      return;
    }
    if (mobile.trim().length < 10) {
      setError(
        language === 'gu'
          ? 'કૃપા કરીને માન્ય ૧૦ અંકનો મોબાઈલ નંબર દાખલ કરો.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }
    setError('');
    setShowPaymentStep(true);
  };

  const generateApplicationId = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `ARVI-2026-${randomDigits}`;
  };

  const handleFinalSubmit = async (utrNumber?: string) => {
    setLoading(true);
    setError('');
    const newAppId = generateApplicationId();
    const now = new Date().toISOString();

    const applicationData: ApplicationItem = {
      applicationId: newAppId,
      customerName: customerName.trim(),
      mobile: mobile.trim(),
      village: village.trim() || 'ખોડાણા (પાટણ)',
      serviceId: currentService.id,
      serviceName: language === 'gu' ? currentService.gujaratiName : currentService.englishName,
      fee: Number(currentService.fee) || 0,
      notes: notes.trim() || '',
      documentName: docName || '',
      documentData: docBase64 || '',
      documentType: docType || (docBase64?.startsWith('data:image') ? 'image/jpeg' : 'application/pdf'),
      status: 'SUBMITTED',
      paymentStatus: utrNumber ? 'PAID' : paymentStatus,
      paymentUtr: utrNumber || paymentUtr || '',
      createdAt: now,
      updatedAt: now,
    };

    try {
      // Save directly to Firestore collection
      const appRef = doc(db, 'applications', newAppId);
      await setDoc(appRef, applicationData);
    } catch (err) {
      console.warn('Firestore write warning:', err);
      // Fallback: Store locally so citizen never loses data
      try {
        const localApps = JSON.parse(localStorage.getItem('arvi_local_applications') || '[]');
        localApps.unshift(applicationData);
        localStorage.setItem('arvi_local_applications', JSON.stringify(localApps));
      } catch (locErr) {
        console.error('LocalStorage write error', locErr);
      }
    } finally {
      // Also cache in localStorage for instant tracking in current browser
      try {
        const localApps = JSON.parse(localStorage.getItem('arvi_local_applications') || '[]');
        const exists = localApps.some((a: ApplicationItem) => a.applicationId === newAppId);
        if (!exists) {
          localApps.unshift(applicationData);
          localStorage.setItem('arvi_local_applications', JSON.stringify(localApps));
        }
      } catch {}

      setLoading(false);
      setSubmittedApp(applicationData);
      onSuccess(applicationData);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti optional
      }
    }
  };

  const handleCopyId = () => {
    if (submittedApp) {
      navigator.clipboard.writeText(submittedApp.applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendToWhatsApp = () => {
    if (!submittedApp) return;
    const sName = submittedApp.serviceName;
    const msg = encodeURIComponent(
      `નમસ્તે રાહુલભાઈ (ARVI ONLINE & CSC),\nમેં ઓનલાઇન અરજી કરી છે:\n- અરજી નંબર: ${submittedApp.applicationId}\n- અરજદાર: ${submittedApp.customerName}\n- સેવા: ${sName}\n- ગામ: ${submittedApp.village}\n- મોબાઈલ: ${submittedApp.mobile}\nકૃપા કરીને કામગીરી શરૂ કરશો.`
    );
    window.open(`https://wa.me/917265013972?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.applicationFormTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'gu'
                  ? 'આર્વી ઓનલાઇન & CSC – ખોડાણા, પાટણ'
                  : 'ARVI ONLINE & CSC – Khodana, Patan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submittedApp ? (
            /* Submission Success Screen */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t.applicationIdGenerated}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {language === 'gu'
                    ? 'તમારો અરજી નંબર નીચે મુજબ છે. આ નંબર સાચવી રાખો અથવા વોટ્સએપ પર મોકલી આપો.'
                    : 'Here is your unique application reference ID. Save it for tracking.'}
                </p>
              </div>

              {/* Application ID Card */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    {language === 'gu' ? 'યુનિક અરજી નંબર' : 'Application Reference ID'}
                  </span>
                  <span className="text-xl font-mono font-black text-blue-900 dark:text-blue-200">
                    {submittedApp.applicationId}
                  </span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? (language === 'gu' ? 'કોપી થયું!' : 'Copied!') : (language === 'gu' ? 'કોપી' : 'Copy')}</span>
                </button>
              </div>

              {/* Details review */}
              <div className="max-w-md mx-auto text-left text-xs space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.customerName}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{submittedApp.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.services}:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{submittedApp.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.fee}:</span>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">₹{submittedApp.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'gu' ? 'પેમેન્ટ સ્થિતિ' : 'Payment'}:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {submittedApp.paymentStatus === 'PAID' ? 'PAID (UPI)' : 'કેન્દ્ર પર ચુકવણી (Pending)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSendToWhatsApp}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{language === 'gu' ? 'વોટ્સએપ પર રાહુલભાઈને મોકલો' : 'Notify Rahul Thakor on WhatsApp'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {language === 'gu' ? 'બંધ કરો' : 'Close'}
                </button>
              </div>
            </div>
          ) : !showPaymentStep ? (
            /* Step 1: Citizen Details Form */
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.selectService} *
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-blue-600"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {language === 'gu' ? s.gujaratiName : s.englishName} ({s.fee === 0 ? 'Custom' : `₹${s.fee}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Name & Mobile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.customerName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={language === 'gu' ? 'દા.ત. રાહુલ ઠાકોર' : 'e.g. Rahul Thakor'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.mobileNumber} *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="7265013972"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Village / City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.village}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="ખોડાણા / પાટણ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Notes / specific requirements */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.additionalNotes}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    language === 'gu'
                      ? 'કોઈ વિશેષ વિગત જેમ કે આધાર નંબર, જૂનો પાન નંબર અથવા સુધારો...'
                      : 'Any specific notes, reference number, or correction request...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Document upload field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.uploadDocLabel}
                </label>

                {docBase64 ? (
                  <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {docType.startsWith('image/') ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={docBase64}
                          alt="Uploaded Document"
                          className="w-12 h-12 object-cover rounded-lg border border-emerald-200 dark:border-emerald-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs">
                          PDF
                        </div>
                      )}
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
                          {docName}
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>{language === 'gu' ? 'ડોક્યુમેન્ટ તૈયાર છે' : 'Ready for upload'}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDocName('');
                        setDocBase64(null);
                      }}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline shrink-0 px-2 py-1"
                    >
                      {language === 'gu' ? 'હટાવો' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="doc-upload"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="doc-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"
                    >
                      {isProcessingFile ? (
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                      <span className="font-medium text-blue-700 dark:text-blue-400">
                        {isProcessingFile
                          ? language === 'gu'
                            ? 'પ્રોસેસ થઈ રહ્યું છે...'
                            : 'Processing...'
                          : language === 'gu'
                          ? 'ફોટો અથવા ડોક્યુમેન્ટ પસંદ કરો'
                          : 'Choose Document / Image'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        આધાર કાર્ડ, રેશન કાર્ડ અથવા સંબંધિત પુરાવાનો ફોટો
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </p>
              )}

              {/* Bottom Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {language === 'gu' ? 'રદ કરો' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>{language === 'gu' ? 'આગળ વધો (પેમેન્ટ / કન્ફર્મેશન)' : 'Proceed to Payment'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: Integrated Payment Option */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'gu' ? 'ચુકવણી પદ્ધતિ પસંદ કરો' : 'Choose Payment Method'}
                </h4>
                <button
                  onClick={() => setShowPaymentStep(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  {language === 'gu' ? 'પાછા જાઓ' : 'Back to Details'}
                </button>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('UPI')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    paymentOption === 'UPI'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'gu' ? 'UPI QR કોડ દ્વારા ચૂકવણી' : 'Instant UPI Payment'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    GPay, PhonePe, Paytm QR
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('CENTER')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    paymentOption === 'CENTER'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'gu' ? 'કેન્દ્ર પર રૂબરૂ ચુકવણી' : 'Pay at Center'}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {language === 'gu' ? 'રૂબરૂ મુલાકાત વખતે રોકડ' : 'Cash upon visit'}
                  </span>
                </button>
              </div>

              {paymentOption === 'UPI' ? (
                <UpiPaymentDrawer
                  amount={currentService.fee}
                  applicationId={`ARVI-${currentService.id.toUpperCase()}`}
                  serviceName={language === 'gu' ? currentService.gujaratiName : currentService.englishName}
                  upiId={upiId}
                  onPaymentSubmitted={(utr) => {
                    setPaymentUtr(utr);
                    handleFinalSubmit(utr);
                  }}
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {language === 'gu' ? 'કેન્દ્ર પર ચુકવણીની શરતો' : 'Pay at Center Terms'}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {language === 'gu'
                          ? `તમારી અરજી નોંધાઈ જશે. તમે ખોડાણા કેન્દ્ર પર રૂબરૂ આવીને સરકારી ફી ₹${currentService.fee} જમા કરાવી કામગીરી પૂર્ણ કરાવી શકો છો.`
                          : `Your application will be recorded. You can pay the standard fee of ₹${currentService.fee} at the Khodana center.`}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    onClick={() => handleFinalSubmit()}
                    className="w-full py-3 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{language === 'gu' ? 'અરજી કન્ફર્મ કરો' : 'Confirm Application'}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
