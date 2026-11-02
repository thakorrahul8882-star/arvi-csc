'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/languageContext';
import {
  QrCode,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface UpiPaymentDrawerProps {
  amount: number;
  applicationId: string;
  serviceName: string;
  onPaymentSubmitted: (utr: string) => void;
  upiId?: string;
}

export default function UpiPaymentDrawer({
  amount,
  applicationId,
  serviceName,
  onPaymentSubmitted,
  upiId = '7265013972@upi',
}: UpiPaymentDrawerProps) {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [error, setError] = useState('');

  // Standard UPI URI format
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=ARVI%20ONLINE%20CSC&am=${amount}&cu=INR&tn=${encodeURIComponent(applicationId)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}&margin=8`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setError(
        language === 'gu'
          ? 'કૃપા કરીને પેમેન્ટ કર્યા બાદ આવેલ UTR / ટ્રાન્ઝેક્શન નંબર દાખલ કરો.'
          : 'Please enter the 12-digit UTR / Transaction Reference Number.'
      );
      return;
    }
    setError('');
    onPaymentSubmitted(utrNumber.trim());
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block">
            {t.payWithUpi}
          </span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {serviceName}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">{t.fee}</span>
          <span className="text-2xl font-black text-blue-900 dark:text-blue-300 tabular-nums">
            ₹{amount}
          </span>
        </div>
      </div>

      {/* QR Code and Instructions */}
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        {/* Dynamic QR Code */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt="UPI QR Code"
            className="w-44 h-44 rounded-lg object-contain"
          />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-2">
            GPay · PhonePe · Paytm · BHIM
          </span>
        </div>

        {/* Payment details */}
        <div className="space-y-4 max-w-xs text-center sm:text-left">
          <div>
            <span className="text-xs text-slate-400 block">
              {language === 'gu' ? 'અધિકૃત UPI ID' : 'Official UPI ID'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200"
                title="Copy UPI ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">
              {language === 'gu' ? 'ખાતાધારક' : 'Beneficiary'}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              ARVI ONLINE & CSC (રાહુલ ઠાકોર)
            </span>
          </div>

          {/* Direct Pay on Mobile Button */}
          <a
            href={upiUrl}
            className="inline-flex sm:w-full items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>{t.openUpiApp}</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>

      {/* UTR Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {language === 'gu'
            ? 'ચુકવણી કર્યા પછી UTR / Reference No. અહીં દાખલ કરો:'
            : 'Enter UPI Reference / UTR Number after payment:'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            placeholder={t.utrPlaceholder}
            className="flex-1 px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap transition-colors"
          >
            {t.submitPaymentProof}
          </button>
        </div>
        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}
      </form>
    </div>
  );
}
