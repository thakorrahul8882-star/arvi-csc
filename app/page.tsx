'use client';

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/lib/languageContext';
import { ServiceItem, SchemeItem, ApplicationItem, CenterSettings } from '@/lib/types';
import { INITIAL_SERVICES, INITIAL_SCHEMES, INITIAL_SETTINGS } from '@/lib/initialData';
import { db, testConnection } from '@/lib/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesGrid from '@/components/ServicesGrid';
import ServiceDetailModal from '@/components/ServiceDetailModal';
import ApplicationModal from '@/components/ApplicationModal';
import StatusTrackerModal from '@/components/StatusTrackerModal';
import GovUpdatesSection from '@/components/GovUpdatesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactFooter from '@/components/ContactFooter';
import AiAssistant from '@/components/AiAssistant';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

function HomePageContent() {
  const { language } = useLanguage();

  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [schemes, setSchemes] = useState<SchemeItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const deleted: string[] = JSON.parse(localStorage.getItem('arvi_deleted_schemes') || '[]');
        return INITIAL_SCHEMES.filter((s) => !deleted.includes(s.id));
      } catch {
        return INITIAL_SCHEMES;
      }
    }
    return INITIAL_SCHEMES;
  });
  const [settings, setSettings] = useState<CenterSettings>(INITIAL_SETTINGS);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [applyServiceTarget, setApplyServiceTarget] = useState<ServiceItem | null>(null);

  // Load live data from Firestore with fallback to initial data
  useEffect(() => {
    testConnection();

    // Deferred visitor count check
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const hasVisited = sessionStorage.getItem('arvi_visited');
        if (!hasVisited) {
          sessionStorage.setItem('arvi_visited', 'true');
          setSettings((prev) => ({ ...prev, visitorCount: prev.visitorCount + 1 }));
        }
      }
    }, 0);

    // 1. Sync Services from Firestore
    try {
      const unsubServices = onSnapshot(
        collection(db, 'services'),
        (snap) => {
          if (!snap.empty) {
            const list: ServiceItem[] = [];
            snap.forEach((d) => list.push(d.data() as ServiceItem));
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setServices(list);
          }
        },
        (err) => {
          console.warn('Live services listener error (using cache):', err);
        }
      );

      // 2. Sync Schemes
      const unsubSchemes = onSnapshot(
        collection(db, 'schemes'),
        (snap) => {
          const deletedSchemes: string[] = typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('arvi_deleted_schemes') || '[]')
            : [];
          if (!snap.empty) {
            const list: SchemeItem[] = [];
            snap.forEach((d) => {
              const item = d.data() as SchemeItem;
              const docId = item.id || d.id;
              if (!deletedSchemes.includes(docId)) {
                list.push({ ...item, id: docId });
              }
            });
            setSchemes(list);
          } else {
            setSchemes(INITIAL_SCHEMES.filter((s) => !deletedSchemes.includes(s.id)));
          }
        },
        (err) => {
          console.warn('Live schemes listener error (using cache):', err);
          const deletedSchemes: string[] = typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('arvi_deleted_schemes') || '[]')
            : [];
          setSchemes(INITIAL_SCHEMES.filter((s) => !deletedSchemes.includes(s.id)));
        }
      );

      // 3. Sync Settings
      const unsubSettings = onSnapshot(
        doc(db, 'settings', 'general'),
        (docSnap) => {
          if (docSnap.exists()) {
            setSettings(docSnap.data() as CenterSettings);
          }
        },
        (err) => {
          console.warn('Live settings listener error (using cache):', err);
        }
      );

      return () => {
        clearTimeout(timer);
        unsubServices();
        unsubSchemes();
        unsubSettings();
      };
    } catch (e) {
      console.warn('Firestore subscription fallback:', e);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenApplyModal = (service?: ServiceItem) => {
    setApplyServiceTarget(service || null);
    setIsApplyModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
        onOpenApplyModal={() => handleOpenApplyModal()}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onApplyClick={() => handleOpenApplyModal()}
          onOpenTrackModal={() => setIsTrackModalOpen(true)}
          bannerNotice={
            language === 'gu'
              ? settings.bannerNoticeGu || INITIAL_SETTINGS.bannerNoticeGu
              : settings.bannerNoticeEn || INITIAL_SETTINGS.bannerNoticeEn
          }
        />

        {/* Services Catalog */}
        <ServicesGrid
          services={services}
          searchQuery={searchQuery}
          onSelectService={(srv) => setSelectedService(srv)}
          onApplyService={(srv) => handleOpenApplyModal(srv)}
        />

        {/* Government Schemes & Recruitment */}
        <GovUpdatesSection
          schemes={schemes}
          onApplyForScheme={(sch) => {
            const schemeAsService: ServiceItem = {
              id: sch.id,
              category: sch.type,
              gujaratiName: sch.titleGu,
              englishName: sch.titleEn || sch.titleGu,
              fee: 50,
              processingTime: '૧ થી ૨ દિવસ',
              requiredDocuments: sch.requiredDocuments || ['આધાર કાર્ડ', 'રેશન કાર્ડ', 'બેંક પાસબુક'],
              descriptionGu: sch.detailsGu,
              descriptionEn: sch.detailsEn || sch.detailsGu,
              icon: 'FileText',
              active: true,
              order: 99,
            };
            handleOpenApplyModal(schemeAsService);
          }}
        />

        {/* Citizen Testimonials */}
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <ContactFooter visitorCount={settings.visitorCount} />

      {/* Modals */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onApply={(srv) => handleOpenApplyModal(srv)}
        />
      )}

      {isApplyModalOpen && (
        <ApplicationModal
          services={services}
          preSelectedService={applyServiceTarget}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={(newApp) => {
            console.log('Application created successfully:', newApp.applicationId);
          }}
          upiId={settings.upiId || '7265013972@upi'}
        />
      )}

      {isTrackModalOpen && (
        <StatusTrackerModal onClose={() => setIsTrackModalOpen(false)} />
      )}

      {/* AI Assistant "CSC Mitra" */}
      <AiAssistant />

      {/* Always visible Floating WhatsApp button */}
      <FloatingWhatsApp />
    </div>
  );
}

export default function HomePage() {
  return (
    <LanguageProvider>
      <HomePageContent />
    </LanguageProvider>
  );
}
