'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'gu' | 'en';

export interface Translations {
  siteTitle: string;
  siteSubtitle: string;
  location: string;
  ownerLabel: string;
  ownerName: string;
  contactWhatsApp: string;
  home: string;
  services: string;
  schemes: string;
  trackStatus: string;
  applyOnline: string;
  contactUs: string;
  adminLogin: string;
  heroHeadline: string;
  heroDescription: string;
  searchPlaceholder: string;
  allCategories: string;
  fee: string;
  processingTime: string;
  requiredDocs: string;
  applyNow: string;
  whatsappEnquiry: string;
  viewDetails: string;
  applicationFormTitle: string;
  customerName: string;
  mobileNumber: string;
  village: string;
  selectService: string;
  additionalNotes: string;
  uploadDocLabel: string;
  submitApplication: string;
  applicationIdGenerated: string;
  statusSubmitted: string;
  statusInProgress: string;
  statusCompleted: string;
  statusRejected: string;
  trackModalTitle: string;
  trackInputPlaceholder: string;
  checkStatusBtn: string;
  payWithUpi: string;
  scanQrToPay: string;
  openUpiApp: string;
  utrPlaceholder: string;
  submitPaymentProof: string;
  aiAssistantTitle: string;
  aiAssistantSubtitle: string;
  askQuestionPlaceholder: string;
  send: string;
  quickQuestions: string[];
  testimonialsTitle: string;
  workingHours: string;
  centerAddress: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  gu: {
    siteTitle: 'આર્વી ઓનલાઈન & CSC',
    siteSubtitle: 'જન સુવિધા કેન્દ્ર – ખોડાણા (પાટણ)',
    location: 'ખોડાણા, પાટણ, ગુજરાત',
    ownerLabel: 'સંચાલક',
    ownerName: 'રાહુલ ઠાકોર',
    contactWhatsApp: 'સંપર્ક / વોટ્સએપ',
    home: 'મુખ્ય પૃષ્ઠ',
    services: 'સેવાઓ',
    schemes: 'સરકારી યોજનાઓ & ભરતી',
    trackStatus: 'અરજી સ્થિતિ',
    applyOnline: 'ઓનલાઇન અરજી કરો',
    contactUs: 'સંપર્ક',
    adminLogin: 'એડમિન લૉગિન',
    heroHeadline: 'ખોડાણા અને પાટણ વિસ્તારનું વિશ્વસનીય જન સુવિધા કેન્દ્ર',
    heroDescription: 'તમામ સરકારી યોજનાઓ, પાન કાર્ડ, આયુષ્માન કાર્ડ, રેશન કાર્ડ, ખેડૂત સહાય અને ભરતી ફોર્મ ઝડપી અને સચોટ રીતે ભરી આપીએ છીએ.',
    searchPlaceholder: 'કોઈપણ સેવા શોધો (જેમ કે: પાન કાર્ડ, આયુષ્માન, 7/12, ભરતી)...',
    allCategories: 'તમામ સેવાઓ',
    fee: 'સરકારી / સેવા ફી',
    processingTime: 'સમય મર્યાદા',
    requiredDocs: 'જરૂરી દસ્તાવેજો (ડોક્યુમેન્ટ્સ)',
    applyNow: 'ઓનલાઇન અરજી કરો',
    whatsappEnquiry: 'વોટ્સએપ પૂછપરછ',
    viewDetails: 'વિગતવાર માહિતી',
    applicationFormTitle: 'ઓનલાઇન સેવા અરજી ફોર્મ',
    customerName: 'અરજદારનું પૂરું નામ',
    mobileNumber: 'મોબાઈલ નંબર',
    village: 'ગામ / શહેરનું નામ',
    selectService: 'સેવા પસંદ કરો',
    additionalNotes: 'વધારાની વિગત અથવા નોંધ',
    uploadDocLabel: 'ડોક્યુમેન્ટ ફોટો અપલોડ (વૈકલ્પિક)',
    submitApplication: 'અરજી સબમિટ કરો',
    applicationIdGenerated: 'તમારી અરજી સફળતાપૂર્વક સ્વીકારાઈ છે!',
    statusSubmitted: 'અરજી સ્વીકારેલ',
    statusInProgress: 'પ્રક્રિયા હેઠળ',
    statusCompleted: 'કામગીરી પૂર્ણ (તૈયાર)',
    statusRejected: 'અસ્વીકાર થયેલ',
    trackModalTitle: 'તમારી અરજીની સ્થિતિ તપાસો',
    trackInputPlaceholder: 'અરજી નંબર દાખલ કરો (દા.ત. ARVI-2026-XXXX)',
    checkStatusBtn: 'સ્થિતિ જુઓ',
    payWithUpi: 'UPI દ્વારા ચૂકવણી કરો',
    scanQrToPay: 'કોઈપણ UPI એપ વડે સ્કેન કરીને પે કરો',
    openUpiApp: 'UPI એપમાં પે કરો (GPay / PhonePe / Paytm)',
    utrPlaceholder: '૧૨ અંકનો UTR / ટ્રાન્ઝેક્શન નંબર દાખલ કરો',
    submitPaymentProof: 'પેમેન્ટ પુષ્ટિ સબમિટ કરો',
    aiAssistantTitle: 'CSC મિત્ર – સેવા સહાયક',
    aiAssistantSubtitle: 'કોઈપણ સરકારી સેવા કે ડોક્યુમેન્ટ વિશે પૂછો',
    askQuestionPlaceholder: 'અહીં તમારો પ્રશ્ન લખો (દા.ત. પાન કાર્ડ માટે શું જોઈએ?)...',
    send: 'મોકલો',
    quickQuestions: [
      'પાન કાર્ડ માટે કયા ડોક્યુમેન્ટ જોઈએ?',
      'આયુષ્માન કાર્ડ કેવી રીતે કઢાવવું?',
      'નવી સરકારી ભરતી કઈ ચાલુ છે?',
      'કેન્દ્રનો સમય અને રાહુલભાઈનો સંપર્ક',
    ],
    testimonialsTitle: 'અમારા સંતુષ્ટ ગ્રાહકોના અભિપ્રાય',
    workingHours: 'સોમવાર થી શનિવાર: સવારે ૮:૦૦ થી રાત્રે ૮:૦૦ | રવિવાર: સવારે ૯:૦૦ થી બપોરે ૧:૦૦',
    centerAddress: 'આર્વી ઓનલાઇન & CSC સેન્ટર, મુખ્ય બજાર, ખોડાણા, જિ. પાટણ, ગુજરાત - ૩૮૪૨૬૫',
  },
  en: {
    siteTitle: 'ARVI ONLINE & CSC',
    siteSubtitle: 'Common Service Center – Khodana (Patan)',
    location: 'Khodana, Patan, Gujarat',
    ownerLabel: 'Center Operator',
    ownerName: 'Rahul Thakor',
    contactWhatsApp: 'Contact / WhatsApp',
    home: 'Home',
    services: 'Services',
    schemes: 'Govt Schemes & Jobs',
    trackStatus: 'Track Status',
    applyOnline: 'Apply Online',
    contactUs: 'Contact',
    adminLogin: 'Admin Login',
    heroHeadline: 'Trusted Digital & Common Service Center in Patan',
    heroDescription: 'Fast, reliable government schemes, PAN card, Ayushman card, land records, farmer subsidies, and online recruitment applications.',
    searchPlaceholder: 'Search any service (e.g. PAN card, Ayushman, 7/12, police job)...',
    allCategories: 'All Services',
    fee: 'Fee',
    processingTime: 'Processing Time',
    requiredDocs: 'Required Documents',
    applyNow: 'Apply Online',
    whatsappEnquiry: 'WhatsApp Enquiry',
    viewDetails: 'View Details',
    applicationFormTitle: 'Online Service Application Form',
    customerName: 'Full Name',
    mobileNumber: 'Mobile Number',
    village: 'Village / City',
    selectService: 'Select Service',
    additionalNotes: 'Additional Notes / Request',
    uploadDocLabel: 'Upload Document Image (Optional)',
    submitApplication: 'Submit Application',
    applicationIdGenerated: 'Application Submitted Successfully!',
    statusSubmitted: 'Submitted',
    statusInProgress: 'Processing',
    statusCompleted: 'Completed & Ready',
    statusRejected: 'Rejected',
    trackModalTitle: 'Track Your Application Status',
    trackInputPlaceholder: 'Enter Application ID (e.g. ARVI-2026-XXXX)',
    checkStatusBtn: 'Check Status',
    payWithUpi: 'Pay with UPI',
    scanQrToPay: 'Scan with any UPI App to Pay',
    openUpiApp: 'Pay via UPI App (GPay / PhonePe / Paytm)',
    utrPlaceholder: 'Enter 12-digit UPI UTR / Ref Number',
    submitPaymentProof: 'Submit Payment Confirmation',
    aiAssistantTitle: 'CSC Mitra – AI Assistant',
    aiAssistantSubtitle: 'Ask anything about Gujarati & CSC government services',
    askQuestionPlaceholder: 'Type your question here (e.g., Documents for PAN Card?)...',
    send: 'Send',
    quickQuestions: [
      'What documents are needed for PAN Card?',
      'How to get Ayushman Bharat card?',
      'Which government recruitments are currently open?',
      'Center timings & Rahul Thakor contact details',
    ],
    testimonialsTitle: 'Citizen Testimonials from Patan & Khodana',
    workingHours: 'Mon - Sat: 8:00 AM to 8:00 PM | Sun: 9:00 AM to 1:00 PM',
    centerAddress: 'ARVI Online & CSC Center, Main Bazaar, Khodana, Dist. Patan, Gujarat - 384265',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'gu',
  setLanguage: () => {},
  t: TRANSLATIONS.gu,
  darkMode: false,
  toggleDarkMode: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('arvi_lang') as Language;
      if (savedLang === 'gu' || savedLang === 'en') return savedLang;
    }
    return 'gu';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('arvi_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('arvi_lang', lang);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('arvi_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('arvi_theme', 'light');
      }
      return next;
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
