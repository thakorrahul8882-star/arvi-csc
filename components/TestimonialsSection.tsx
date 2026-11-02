'use client';

import React from 'react';
import { useLanguage } from '@/lib/languageContext';
import { Star, Quote, MapPin } from 'lucide-react';

export default function TestimonialsSection() {
  const { language, t } = useLanguage();

  const reviews = [
    {
      name: 'રમેશભાઈ ચૌધરી',
      nameEn: 'Rameshbhai Chaudhary',
      village: 'ખોડાણા (પાટણ)',
      service: 'ખેડૂત નોંધણી & ટ્રેક્ટર સહાય',
      text: 'રાહુલભાઈએ ikhedut પોર્ટલ પર ટ્રેક્ટર સબસિડીનું ફોર્મ એક જ દિવસમાં ભરી આપ્યું. કોઈ પણ ભૂલ વગર મંજૂરી મળી ગઈ. ખૂબ જ પ્રમાણિક કામ છે.',
      textEn: 'Rahul Thakor helped me apply for the tractor subsidy on ikhedut within a single day. No errors, got approved quickly.',
      rating: 5,
    },
    {
      name: 'હરેશભાઈ પ્રજાપતિ',
      nameEn: 'Hareshbhai Prajapati',
      village: 'પાટણ',
      service: 'આયુષ્માન કાર્ડ & પાન કાર્ડ',
      text: 'પરિવારના ૪ સભ્યોના આયુષ્માન કાર્ડ તાત્કાલિક બનાવી આપ્યા. હોસ્પિટલમાં કેશલેસ સારવારમાં ઘણો ફાયદો થયો. ARVI CSC નો ખૂબ આભાર.',
      textEn: 'Made Ayushman cards for all 4 family members immediately. Great help for hospital treatment.',
      rating: 5,
    },
    {
      name: 'જયેશભાઈ ઠાકોર',
      nameEn: 'Jayeshbhai Thakor',
      village: 'ખોડાણા',
      service: 'પોલીસ કોન્સ્ટેબલ ભરતી ફોર્મ',
      text: 'ઓનલાઈન ભરતી ફોર્મ ભરવામાં ફોટો-સહી સાઈઝ કરવામાં ઘણી તકલીફ પડતી હતી. રાહુલભાઈએ સંપૂર્ણ ચોકસાઈથી ફોર્મ સબમિટ કરી આપ્યું.',
      textEn: 'Very smooth application process for police recruitment. Document resizing and submission done accurately.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-16 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
          {language === 'gu' ? 'ગ્રાહક સંતોષ' : 'Citizen Reviews'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {t.testimonialsTitle}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {language === 'gu'
            ? 'ખોડાણા, પાટણ અને આસપાસના ગામોના નાગરિકોનો અમારે માટે અતૂટ વિશ્વાસ.'
            : 'Genuine experiences from residents of Khodana and Patan.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-500 mb-4">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &quot;{language === 'gu' ? rev.text : rev.textEn}&quot;
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'gu' ? rev.name : rev.nameEn}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>{rev.village}</span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded">
                {rev.service}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
