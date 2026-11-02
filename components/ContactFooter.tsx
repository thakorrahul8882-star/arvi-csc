'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/languageContext';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Lock,
  ExternalLink,
  X,
} from 'lucide-react';

interface ContactFooterProps {
  visitorCount?: number;
}

export default function ContactFooter({ visitorCount = 14850 }: ContactFooterProps) {
  const { language, t } = useLanguage();
  const [showLegalModal, setShowLegalModal] = useState<'PRIVACY' | 'TERMS' | null>(null);

  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Khodana+Patan+Gujarat';

  return (
    <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Operator */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-lg border border-blue-500/30">
                <span className="text-amber-400">A</span>
                <span className="text-white text-xs ml-0.5">CSC</span>
              </div>
              <div>
                <span className="text-base font-bold text-white block leading-tight">
                  {t.siteTitle}
                </span>
                <span className="text-xs text-amber-400 font-medium">
                  {t.siteSubtitle}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'gu'
                ? 'ખોડાણા અને સમગ્ર પાટણ વિસ્તારના નાગરિકો માટે તમામ પ્રકારની ડિજિટલ, સરકારી યોજનાઓ અને પ્રમાણપત્રોની સેવા આપતું અધિકૃત કેન્દ્ર.'
                : 'Authorized Digital Service Center in Khodana, Patan providing e-Governance services, certificates, and welfare applications.'}
            </p>

            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-0.5">
                {language === 'gu' ? 'સંચાલક:' : 'Operator:'}
              </span>
              <span className="text-sm font-bold text-white">
                રાહુલ ઠાકોર (Rahul Thakor)
              </span>
            </div>
          </div>

          {/* Column 2: Address & Timings */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'gu' ? 'કેન્દ્ર સરનામું & સમય' : 'Address & Timings'}
            </h4>

            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">
                  આર્વી ઓનલાઇન & CSC સેન્ટર
                </p>
                <p className="text-slate-400 mt-0.5">
                  મુખ્ય બજાર, ખોડાણા, તાલુકો પાટણ, જિલ્લો પાટણ, ગુજરાત – ૩૮૪૨૬૫
                </p>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 mt-1.5"
                >
                  <span>Google Maps પર જુઓ</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">કેન્દ્રનો સમય:</p>
                <p className="text-slate-400 mt-0.5">
                  સોમ થી શનિ: સવારે ૮:૦૦ થી રાત્રે ૮:૦૦
                </p>
                <p className="text-slate-400">
                  રવિવાર: સવારે ૯:૦૦ થી બપોરે ૧:૦૦
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Contact & Direct WhatsApp */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'gu' ? 'સંપર્ક માહિતી' : 'Contact & Helpline'}
            </h4>

            <div className="space-y-3">
              <a
                href="tel:7265013972"
                className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+91 7265013972 (કૉલ કરો)</span>
              </a>

              <a
                href="https://wa.me/917265013972"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>+91 7265013972 (WhatsApp ચેટ)</span>
              </a>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <span className="text-[11px] text-slate-400 block mb-1">UPI પેમેન્ટ ID:</span>
                <span className="font-mono font-bold text-amber-300">7265013972sonu@ybl</span>
              </div>
            </div>
          </div>

          {/* Column 4: Admin & Legal Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'gu' ? 'કેન્દ્ર સંચાલન & લિંક્સ' : 'Admin & Links'}
            </h4>

            {/* Admin Dashboard portal link */}
            <Link
              href="/admin"
              className="w-full inline-flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-300 hover:text-white hover:bg-blue-900/60 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.adminLogin} (રાહુલ ઠાકોર)</span>
              </div>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Legal Links */}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <button
                onClick={() => setShowLegalModal('PRIVACY')}
                className="hover:text-slate-200 transition-colors underline"
              >
                {language === 'gu' ? 'ગોપનીયતા નીતિ' : 'Privacy Policy'}
              </button>
              <span>·</span>
              <button
                onClick={() => setShowLegalModal('TERMS')}
                className="hover:text-slate-200 transition-colors underline"
              >
                {language === 'gu' ? 'નિયમો અને શરતો' : 'Terms of Service'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} ARVI ONLINE & CSC. All Rights Reserved · ખોડાણા, પાટણ, ગુજરાત.
          </p>
          <p className="flex items-center gap-1 text-slate-400">
            <span>Digital India Jan Suvidha Portal</span>
            <span>·</span>
            <span>Made for Gujarat Citizens</span>
          </p>
        </div>
      </div>

      {/* Legal Information Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-base">
                {showLegalModal === 'PRIVACY'
                  ? language === 'gu' ? 'ગોપનીયતા નીતિ (Privacy Policy)' : 'Privacy Policy'
                  : language === 'gu' ? 'નિયમો અને શરતો (Terms & Conditions)' : 'Terms & Conditions'}
              </h3>
              <button onClick={() => setShowLegalModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                આર્વી ઓનલાઇન & CSC કેન્દ્ર, ખોડાણા (પાટણ) નાગરિકોના તમામ અંગત દસ્તાવેજો (જેમ કે આધાર, રેશન કાર્ડ, પાન કાર્ડ) ની સંપૂર્ણ સુરક્ષા અને ગોપનીયતા જાળવે છે.
              </p>
              <p>
                તમામ વિગતો માત્ર સંબંધિત સરકારી પોર્ટલ (OJAS, Digital Gujarat, ikhedut, NSDL, UTIITSL) પર ફોર્મ ભરવાના હેતુ માટે જ ઉપયોગમાં લેવાય છે.
              </p>
              <p>
                સરકારી ફી નિર્ધારિત નિયમો મુજબ લેવામાં આવે છે. કોઈ પણ પૂછપરછ માટે રાહુલ ઠાકોરનો સંપર્ક 7265013972 પર કરવો.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowLegalModal(null)}
                className="px-4 py-2 text-xs font-bold bg-blue-700 text-white rounded-lg"
              >
                {language === 'gu' ? 'સમજાયું' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
