'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ServiceItem,
  SchemeItem,
  ApplicationItem,
  CenterSettings,
  ApplicationStatus,
  PaymentStatus,
} from '@/lib/types';
import {
  INITIAL_SERVICES,
  INITIAL_SCHEMES,
  INITIAL_SETTINGS,
} from '@/lib/initialData';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  LayoutDashboard,
  Users,
  Layers,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  Plus,
  Trash2,
  Edit2,
  IndianRupee,
  Eye,
  Filter,
  Save,
  ShieldCheck,
  FileText,
  Paperclip,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  X,
  Upload,
  Phone,
  RefreshCw,
  ClipboardList,
  Building2,
} from 'lucide-react';
import SchemeDetailModal from '../SchemeDetailModal';

// Normalize & sanitize base64 or URL data so browser decodes it reliably
function sanitizeDocumentSrc(data?: string): string {
  if (!data) return '';
  const str = data.trim();
  if (str.startsWith('data:') || str.startsWith('http://') || str.startsWith('https://') || str.startsWith('blob:')) {
    return str;
  }
  if (str.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${str}`;
  }
  if (str.startsWith('iVBORw')) {
    return `data:image/png;base64,${str}`;
  }
  if (str.startsWith('JVBERi')) {
    return `data:application/pdf;base64,${str}`;
  }
  return `data:image/jpeg;base64,${str}`;
}

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'APPLICATIONS' | 'SERVICES' | 'SCHEMES' | 'SETTINGS'>('OVERVIEW');

  // Live state
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
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

  // Filters & search
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Deletion Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'SCHEME' | 'APPLICATION';
    id: string;
    title: string;
  } | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string>('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Document Viewer Lightbox Modal state
  const [previewDocApp, setPreviewDocApp] = useState<ApplicationItem | null>(null);
  const [docZoom, setDocZoom] = useState<number>(1);
  const [docRotation, setDocRotation] = useState<number>(0);
  const [docImageError, setDocImageError] = useState<boolean>(false);
  const [detailDocImageError, setDetailDocImageError] = useState<boolean>(false);
  const [isUpdatingDoc, setIsUpdatingDoc] = useState<boolean>(false);
  const [docUpdateNotice, setDocUpdateNotice] = useState<string>('');

  // WhatsApp doc request helper
  const getWhatsAppDocRequestUrl = (app: ApplicationItem) => {
    const cleanMobile = app.mobile.replace(/\D/g, '');
    const mobileWithCountry = cleanMobile.startsWith('91') && cleanMobile.length === 12
      ? cleanMobile
      : `91${cleanMobile}`;
    const text = encodeURIComponent(
      `નમસ્તે ${app.customerName}જી,\n\nARVI ONLINE & CSC (ખોડાણા) તરફથી રાહુલ ઠાકોરનો સંદેશ.\n\nતમારી અરજી (નંબર: ${app.applicationId} - ${app.serviceName}) માટે અપલોડ કરેલ દસ્તાવેજનો ફોટો સ્પષ્ટ અથવા પૂર્ણ રીતે મળ્યો નથી.\n\nકૃપા કરીને આ વોટ્સએપ નંબર પર દસ્તાવેજનો સ્પષ્ટ ફોટો ફરીથી મોકલી આપશો જેથી તમારી અરજીની કામગીરી તુરંત શરૂ કરી શકાય.\n\nઆભાર,\nરાહુલ ઠાકોર\nARVI ONLINE & CSC\nખોડાણા, પાટણ (મો. 7265013972)`
    );
    return `https://wa.me/${mobileWithCountry}?text=${text}`;
  };

  // Admin upload/replace document helper
  const handleAdminDocUpload = (appId: string, file: File) => {
    setIsUpdatingDoc(true);
    setDocUpdateNotice('');

    const applyUpdate = async (base64: string, type: string) => {
      try {
        const now = new Date().toISOString();
        const appRef = doc(db, 'applications', appId);
        await updateDoc(appRef, {
          documentData: base64,
          documentName: file.name,
          documentType: type,
          updatedAt: now,
        });

        // Update local state
        setApplications((prev) =>
          prev.map((a) =>
            a.applicationId === appId
              ? { ...a, documentData: base64, documentName: file.name, documentType: type, updatedAt: now }
              : a
          )
        );

        if (selectedApp?.applicationId === appId) {
          setSelectedApp((prev) =>
            prev ? { ...prev, documentData: base64, documentName: file.name, documentType: type, updatedAt: now } : null
          );
        }

        if (previewDocApp?.applicationId === appId) {
          setPreviewDocApp((prev) =>
            prev ? { ...prev, documentData: base64, documentName: file.name, documentType: type, updatedAt: now } : null
          );
        }

        setDocImageError(false);
        setDetailDocImageError(false);
        setDocUpdateNotice('દસ્તાવેજ સફળતાપૂર્વક અપડેટ થયો!');
        setTimeout(() => setDocUpdateNotice(''), 4000);
      } catch (err) {
        console.error('Update doc error:', err);
      } finally {
        setIsUpdatingDoc(false);
      }
    };

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1000;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const comp = canvas.toDataURL('image/jpeg', 0.75);
            applyUpdate(comp, 'image/jpeg');
          } else {
            applyUpdate(e.target?.result as string, file.type || 'image/jpeg');
          }
        };
        img.onerror = () => {
          applyUpdate(e.target?.result as string, file.type || 'image/jpeg');
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        applyUpdate(reader.result as string, file.type || 'application/pdf');
      };
      reader.readAsDataURL(file);
    }
  };

  // Download document helper
  const handleDownloadDocument = (app: ApplicationItem) => {
    if (!app.documentData) return;
    try {
      const src = sanitizeDocumentSrc(app.documentData);
      const link = document.createElement('a');
      link.href = src;
      const cleanCustomer = app.customerName.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_');
      link.download = `${cleanCustomer}_${app.documentName || 'document'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download document error:', e);
    }
  };

  // New Service Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<ServiceItem>>({
    category: 'IDENTITY',
    fee: 50,
    active: true,
  });

  // New Scheme Modal
  // Scheme Modal state
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<SchemeItem | null>(null);
  const [previewScheme, setPreviewScheme] = useState<SchemeItem | null>(null);
  const [schemeForm, setSchemeForm] = useState<Partial<SchemeItem & { documentsInput?: string }>>({
    type: 'SCHEME',
    active: true,
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState<CenterSettings>(INITIAL_SETTINGS);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Sync from Firestore / LocalStorage
  useEffect(() => {
    // 1. Applications listener
    const unsubApps = onSnapshot(
      collection(db, 'applications'),
      (snap) => {
        const deletedApps: string[] = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('arvi_deleted_applications') || '[]')
          : [];
        const list: ApplicationItem[] = [];
        snap.forEach((d) => {
          const item = d.data() as ApplicationItem;
          if (!deletedApps.includes(item.applicationId)) {
            list.push(item);
          }
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setApplications(list);
      },
      (err) => {
        console.warn('Applications snapshot warning:', err);
        const deletedApps: string[] = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('arvi_deleted_applications') || '[]')
          : [];
        const localApps: ApplicationItem[] = JSON.parse(localStorage.getItem('arvi_local_applications') || '[]');
        setApplications(localApps.filter((a) => !deletedApps.includes(a.applicationId)));
      }
    );

    // 2. Services listener
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
      (err) => console.warn(err)
    );

    // 3. Schemes listener
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
        console.warn(err);
        const deletedSchemes: string[] = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('arvi_deleted_schemes') || '[]')
          : [];
        setSchemes(INITIAL_SCHEMES.filter((s) => !deletedSchemes.includes(s.id)));
      }
    );

    // 4. Settings listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'general'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as CenterSettings;
          setSettings(data);
          setSettingsForm(data);
        }
      },
      (err) => console.warn(err)
    );

    return () => {
      unsubApps();
      unsubServices();
      unsubSchemes();
      unsubSettings();
    };
  }, []);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = appStatusFilter === 'ALL' || app.status === appStatusFilter;
      const query = appSearch.trim().toLowerCase();
      if (!query) return matchesStatus;

      const matchesQuery =
        app.applicationId.toLowerCase().includes(query) ||
        app.customerName.toLowerCase().includes(query) ||
        app.mobile.includes(query) ||
        app.serviceName.toLowerCase().includes(query) ||
        app.village.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [applications, appStatusFilter, appSearch]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'SUBMITTED').length;
    const inProgress = applications.filter((a) => a.status === 'IN_PROGRESS').length;
    const completed = applications.filter((a) => a.status === 'COMPLETED').length;
    const totalFees = applications
      .filter((a) => a.paymentStatus === 'PAID' || a.paymentStatus === 'VERIFIED')
      .reduce((sum, a) => sum + (a.fee || 0), 0);

    return { total, pending, inProgress, completed, totalFees };
  }, [applications]);

  // Update Application Status & Payment
  const handleUpdateAppStatus = async (
    appId: string,
    newStatus: ApplicationStatus,
    newRemarks?: string,
    newPaymentStatus?: PaymentStatus
  ) => {
    try {
      const ref = doc(db, 'applications', appId);
      const updates: any = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      if (newRemarks !== undefined) updates.adminRemarks = newRemarks;
      if (newPaymentStatus !== undefined) updates.paymentStatus = newPaymentStatus;

      await updateDoc(ref, updates);

      // Local state update
      setApplications((prev) =>
        prev.map((a) => (a.applicationId === appId ? { ...a, ...updates } : a))
      );
      if (selectedApp && selectedApp.applicationId === appId) {
        setSelectedApp((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (err) {
      console.warn('Update app error, updating locally:', err);
      const updated = applications.map((a) =>
        a.applicationId === appId
          ? {
              ...a,
              status: newStatus,
              adminRemarks: newRemarks !== undefined ? newRemarks : a.adminRemarks,
              paymentStatus: newPaymentStatus !== undefined ? newPaymentStatus : a.paymentStatus,
              updatedAt: new Date().toISOString(),
            }
          : a
      );
      setApplications(updated);
      localStorage.setItem('arvi_local_applications', JSON.stringify(updated));
    }
  };

  // Send WhatsApp notification to citizen
  const handleSendWhatsAppNotification = (app: ApplicationItem) => {
    const statusText =
      app.status === 'COMPLETED'
        ? 'કામગીરી પૂર્ણ થઈ ગઈ છે. તમારો દસ્તાવેજ/પ્રમાણપત્ર તૈયાર છે, કેન્દ્ર પરથી મેળવી શકો છો.'
        : app.status === 'IN_PROGRESS'
        ? 'તમારી અરજી ચકાસણી હેઠળ છે અને કામગીરી ચાલુ છે.'
        : app.status === 'REJECTED'
        ? `તમારી અરજીમાં ક્ષતિ હોવાથી અસ્વીકાર થયેલ છે. કારણ: ${app.adminRemarks || 'દસ્તાવેજ અધૂરા'}.`
        : 'તમારી અરજી સફળતાપૂર્વક સ્વીકારાયેલ છે.';

    const message = encodeURIComponent(
      `નમસ્તે ${app.customerName}જી,\n\nARVI ONLINE & CSC (ખોડાણા, પાટણ) તરફથી તમારી અરજીનું સ્ટેટસ અપડેટ:\n- અરજી ક્રમાંક: ${app.applicationId}\n- સેવા: ${app.serviceName}\n- હાલની સ્થિતિ: ${statusText}\n\nવધુ માહિતી માટે સંપર્ક કરો: રાહુલ ઠાકોર (7265013972).`
    );

    window.open(`https://wa.me/91${app.mobile.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  // Save Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingService?.id || `srv-${Date.now()}`;
    const requiredDocsArray = typeof serviceForm.requiredDocuments === 'string'
      ? (serviceForm.requiredDocuments as string).split(',').map((s) => s.trim()).filter(Boolean)
      : (serviceForm.requiredDocuments || ['આધાર કાર્ડ']);

    const newService: ServiceItem = {
      id,
      category: serviceForm.category || 'IDENTITY',
      gujaratiName: serviceForm.gujaratiName || 'નવી સેવા',
      englishName: serviceForm.englishName || 'New Service',
      fee: Number(serviceForm.fee) || 0,
      processingTime: serviceForm.processingTime || '૨ થી ૩ દિવસ',
      requiredDocuments: requiredDocsArray,
      descriptionGu: serviceForm.descriptionGu || '',
      descriptionEn: serviceForm.descriptionEn || '',
      icon: serviceForm.icon || 'CheckCircle2',
      active: serviceForm.active ?? true,
      order: editingService?.order || services.length + 1,
    };

    try {
      await setDoc(doc(db, 'services', id), newService);
    } catch (err) {
      console.warn('Save service fallback:', err);
    }

    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newService;
        return copy;
      }
      return [...prev, newService];
    });

    setIsServiceModalOpen(false);
    setEditingService(null);
    setServiceForm({});
  };

  // Delete Service
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('શું તમે ખરેખર આ સેવા ડિલીટ કરવા માંગો છો?')) return;
    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch (err) {
      console.warn(err);
    }
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  // Save Scheme
  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingScheme?.id || schemeForm.id || `scheme-${Date.now()}`;
    
    // Parse documents list from comma-separated string or array
    let docsArray: string[] = [];
    if (typeof schemeForm.documentsInput === 'string') {
      docsArray = schemeForm.documentsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(schemeForm.requiredDocuments)) {
      docsArray = schemeForm.requiredDocuments;
    }

    const newScheme: SchemeItem = {
      id,
      type: schemeForm.type || 'SCHEME',
      titleGu: schemeForm.titleGu || '',
      titleEn: schemeForm.titleEn || '',
      department: schemeForm.department || 'ગુજરાત સરકાર',
      deadline: schemeForm.deadline || 'નજીકના ભવિષ્યમાં',
      detailsGu: schemeForm.detailsGu || '',
      detailsEn: schemeForm.detailsEn || '',
      benefits: schemeForm.benefits || '',
      eligibility: schemeForm.eligibility || '',
      requiredDocuments: docsArray,
      applicationProcess: schemeForm.applicationProcess || '',
      link: schemeForm.link || '',
      active: schemeForm.active ?? true,
      createdAt: editingScheme?.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'schemes', id), newScheme);
    } catch (err) {
      console.warn('Save scheme error:', err);
    }

    // Un-delete if this ID was previously marked deleted
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('arvi_deleted_schemes') || '[]');
      if (deleted.includes(id)) {
        const filtered = deleted.filter((d) => d !== id);
        localStorage.setItem('arvi_deleted_schemes', JSON.stringify(filtered));
      }
    } catch {}

    setSchemes((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newScheme;
        return copy;
      }
      return [newScheme, ...prev];
    });

    setIsSchemeModalOpen(false);
    setEditingScheme(null);
    setSchemeForm({});
    showToast(editingScheme ? 'યોજના સફળતાપૂર્વક અપડેટ થઈ ગઈ છે!' : 'નવી યોજના સફળતાપૂર્વક ઉમેરાઈ ગઈ છે!');
  };

  // Delete Scheme
  const handleDeleteScheme = async (id: string) => {
    try {
      // 1. Mark in deleted schemes in localStorage
      const deletedList: string[] = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('arvi_deleted_schemes') || '[]')
        : [];
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        localStorage.setItem('arvi_deleted_schemes', JSON.stringify(deletedList));
      }

      // 2. Remove from local state immediately
      setSchemes((prev) => prev.filter((s) => s.id !== id));

      // 3. Delete from Firestore
      await deleteDoc(doc(db, 'schemes', id));

      showToast('યોજના સફળતાપૂર્વક કાઢી નાખવામાં આવી છે.');
    } catch (err) {
      console.warn('Delete scheme error:', err);
      setSchemes((prev) => prev.filter((s) => s.id !== id));
      showToast('યોજના સફળતાપૂર્વક કાઢી નાખવામાં આવી છે.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Delete Application
  const handleDeleteApplication = async (appId: string) => {
    try {
      // 1. Mark in deleted applications in localStorage
      const deletedApps: string[] = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('arvi_deleted_applications') || '[]')
        : [];
      if (!deletedApps.includes(appId)) {
        deletedApps.push(appId);
        localStorage.setItem('arvi_deleted_applications', JSON.stringify(deletedApps));
      }

      // 2. Delete from localStorage 'arvi_local_applications'
      const localApps: ApplicationItem[] = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('arvi_local_applications') || '[]')
        : [];
      const updatedLocal = localApps.filter((a) => a.applicationId !== appId);
      localStorage.setItem('arvi_local_applications', JSON.stringify(updatedLocal));

      // 3. Delete from local state immediately
      setApplications((prev) => prev.filter((a) => a.applicationId !== appId));

      // 4. Close modals if this app is currently open
      if (selectedApp?.applicationId === appId) {
        setSelectedApp(null);
      }
      if (previewDocApp?.applicationId === appId) {
        setPreviewDocApp(null);
      }

      // 5. Delete from Firestore
      await deleteDoc(doc(db, 'applications', appId));

      showToast('અરજી સફળતાપૂર્વક કાઢી નાખવામાં આવી છે.');
    } catch (err) {
      console.warn('Delete application error:', err);
      setApplications((prev) => prev.filter((a) => a.applicationId !== appId));
      const localApps: ApplicationItem[] = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('arvi_local_applications') || '[]')
        : [];
      const updatedLocal = localApps.filter((a) => a.applicationId !== appId);
      localStorage.setItem('arvi_local_applications', JSON.stringify(updatedLocal));
      showToast('અરજી સફળતાપૂર્વક કાઢી નાખવામાં આવી છે.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'general'), settingsForm);
      setSettings(settingsForm);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.warn('Save settings warning:', err);
      setSettings(settingsForm);
      setSettingsSaved(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center">
            CSC
          </div>
          <div>
            <span className="text-sm font-bold text-white block leading-tight">
              ARVI ONLINE & CSC – સંચાલક ડેશબોર્ડ
            </span>
            <span className="text-xs text-amber-400">
              સંચાલક: રાહુલ ઠાકોર ({user?.email || 'thakorrahul8882@gmail.com'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800"
          >
            <span>ગ્રાહક વેબસાઇટ જુઓ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900/60 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>લૉગ આઉટ</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-900/40 p-4 space-y-1 shrink-0">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ડેશબોર્ડ ઓવરવ્યૂ</span>
          </button>

          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'APPLICATIONS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>ગ્રાહક અરજીઓ (Applications)</span>
            </div>
            {stats.pending > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {stats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SERVICES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>સેવાઓનું સંચાલન (Services)</span>
          </button>

          <button
            onClick={() => setActiveTab('SCHEMES')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SCHEMES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>યોજનાઓ & ભરતી જાહેરાતો</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SETTINGS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>કેન્દ્ર સેટિંગ્સ & સૂચના બેનર</span>
          </button>
        </aside>

        {/* Tab View Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white">કેન્દ્ર સંચાલન સ્ટેટિસ્ટિક્સ</h2>

              {/* 5 Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400 block">કુલ અરજીઓ</span>
                  <span className="text-2xl font-black text-white mt-1 block tabular-nums">
                    {stats.total}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-amber-400 block">નવી અરજીઓ (Pending)</span>
                  <span className="text-2xl font-black text-amber-400 mt-1 block tabular-nums">
                    {stats.pending}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-blue-400 block">ચાલુ કામગીરી</span>
                  <span className="text-2xl font-black text-blue-400 mt-1 block tabular-nums">
                    {stats.inProgress}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-emerald-400 block">પૂર્ણ થયેલ</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block tabular-nums">
                    {stats.completed}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 col-span-2 md:col-span-1">
                  <span className="text-xs text-slate-400 block">UPI એકત્રિત ફી</span>
                  <span className="text-2xl font-black text-emerald-300 mt-1 block tabular-nums">
                    ₹{stats.totalFees}
                  </span>
                </div>
              </div>

              {/* Recent Applications Quick Peek */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">તાજેતરની નાગરિક અરજીઓ</h3>
                  <button
                    onClick={() => setActiveTab('APPLICATIONS')}
                    className="text-xs font-semibold text-blue-400 hover:underline"
                  >
                    તમામ અરજીઓ જુઓ ({applications.length})
                  </button>
                </div>

                {applications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    અત્યારે કોઈ નવી ઓનલાઇન અરજી આવી નથી.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 pb-2">
                          <th className="py-2">અરજી નંબર</th>
                          <th className="py-2">અરજદાર</th>
                          <th className="py-2">સેવા</th>
                          <th className="py-2">મોબાઈલ</th>
                          <th className="py-2">સ્થિતિ</th>
                          <th className="py-2 text-right">ક્રિયા</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {applications.slice(0, 5).map((app) => (
                          <tr key={app.applicationId} className="hover:bg-slate-850">
                            <td className="py-3 font-mono font-bold text-blue-400">{app.applicationId}</td>
                            <td className="py-3 font-semibold text-white">{app.customerName}</td>
                            <td className="py-3 text-slate-300">{app.serviceName}</td>
                            <td className="py-3 font-mono text-slate-400">{app.mobile}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  app.status === 'COMPLETED'
                                    ? 'bg-emerald-950 text-emerald-300'
                                    : app.status === 'IN_PROGRESS'
                                    ? 'bg-blue-950 text-blue-300'
                                    : 'bg-amber-950 text-amber-300'
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setActiveTab('APPLICATIONS');
                                }}
                                className="text-blue-400 hover:underline font-semibold"
                              >
                                વિગતો
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'APPLICATION',
                                    id: app.applicationId,
                                    title: `${app.customerName} (${app.applicationId})`,
                                  })
                                }
                                className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded transition-colors inline-flex items-center"
                                title="અરજી કાઢી નાખો (Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATIONS */}
          {activeTab === 'APPLICATIONS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">નાગરિક અરજી વ્યવસ્થાપન</h2>
                  <p className="text-xs text-slate-400">
                    અરજી ચકાસો, સ્ટેટસ અપડેટ કરો અને વોટ્સએપ પર નાગરિકને સીધો મેસેજ મોકલો
                  </p>
                </div>

                {/* Filter and search */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder="અરજી નંબર અથવા નામ શોધો..."
                    className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">તમામ સ્ટેટસ</option>
                    <option value="SUBMITTED">SUBMITTED (નવી)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (ચાલુ)</option>
                    <option value="COMPLETED">COMPLETED (પૂર્ણ)</option>
                    <option value="REJECTED">REJECTED (અસ્વીકાર)</option>
                  </select>
                </div>
              </div>

              {/* Applications Table */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 pb-3">
                      <th className="py-2.5">અરજી ID</th>
                      <th className="py-2.5">અરજદાર & ગામ</th>
                      <th className="py-2.5">સેવા</th>
                      <th className="py-2.5">દસ્તાવેજ / પુરાવો</th>
                      <th className="py-2.5">ફી / પેમેન્ટ</th>
                      <th className="py-2.5">સ્ટેટસ</th>
                      <th className="py-2.5 text-right">ક્રિયા</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredApplications.map((app) => (
                      <tr key={app.applicationId} className="hover:bg-slate-850/60">
                        <td className="py-3 font-mono font-bold text-blue-400">
                          {app.applicationId}
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-white">{app.customerName}</p>
                          <p className="text-[11px] text-slate-400">{app.mobile} · {app.village}</p>
                        </td>
                        <td className="py-3 text-slate-200">
                          <span className="font-medium">{app.serviceName}</span>
                        </td>
                        <td className="py-3">
                          {app.documentData ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewDocApp(app);
                                setDocZoom(1);
                                setDocRotation(0);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-950/80 border border-blue-700/80 text-blue-300 hover:bg-blue-900 hover:text-white transition-all shadow-sm"
                              title="દસ્તાવેજ મોટો જુઓ / ડાઉનલોડ કરો"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="max-w-[110px] truncate">
                                {app.documentName || 'ડોક્યુમેન્ટ જુઓ'}
                              </span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium italic">
                              નથી આપેલ
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-white">₹{app.fee}</p>
                          <span
                            className={`text-[10px] font-bold ${
                              app.paymentStatus === 'PAID' || app.paymentStatus === 'VERIFIED'
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {app.paymentStatus} {app.paymentUtr ? `(${app.paymentUtr})` : ''}
                          </span>
                        </td>
                        <td className="py-3">
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleUpdateAppStatus(app.applicationId, e.target.value as ApplicationStatus)
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              app.status === 'COMPLETED'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : app.status === 'IN_PROGRESS'
                                ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                                : app.status === 'REJECTED'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                                : 'bg-amber-950/80 text-amber-300 border-amber-800'
                            }`}
                          >
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>
                        <td className="py-3 text-right space-x-1.5 sm:space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleSendWhatsAppNotification(app)}
                            className="p-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 rounded-lg inline-flex items-center"
                            title="Send WhatsApp update to applicant"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-2.5 py-1 bg-slate-800 text-blue-300 hover:bg-slate-700 rounded-lg font-semibold inline-flex items-center"
                          >
                            વિગતો
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'APPLICATION',
                                id: app.applicationId,
                                title: `${app.customerName} (${app.applicationId})`,
                              })
                            }
                            className="p-1.5 bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900 rounded-lg transition-colors inline-flex items-center"
                            title="અરજી કાઢી નાખો (Delete Application)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detail drawer / modal if selected */}
              {selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
                  <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-800 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-amber-400 font-mono font-bold">{selectedApp.applicationId}</span>
                        <h3 className="text-base font-bold text-white">{selectedApp.customerName}</h3>
                      </div>
                      <button onClick={() => setSelectedApp(null)} className="p-1 text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block">સેવા:</span>
                        <span className="font-bold text-white">{selectedApp.serviceName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">મોબાઈલ:</span>
                        <span className="font-mono font-bold text-white">{selectedApp.mobile}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">ગામ / શહેર:</span>
                        <span className="font-medium text-white">{selectedApp.village}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">તારીખ:</span>
                        <span className="font-mono text-white">{new Date(selectedApp.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {selectedApp.notes && (
                      <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-1">અરજદારની વિશેષ નોંધ:</span>
                        <p className="text-slate-200">{selectedApp.notes}</p>
                      </div>
                    )}

                    {/* Enhanced Document Card in Detail Modal */}
                    <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white">અપલોડ કરેલ દસ્તાવેજ / પુરાવો:</span>
                        </div>
                        {selectedApp.documentData && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewDocApp(selectedApp);
                                setDocZoom(1);
                                setDocRotation(0);
                                setDocImageError(false);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>મોટું જુઓ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(selectedApp)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm"
                            >
                              <Download className="w-3 h-3" />
                              <span>ડાઉનલોડ</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {docUpdateNotice && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5 animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{docUpdateNotice}</span>
                        </div>
                      )}

                      {selectedApp.documentData ? (
                        selectedApp.documentType?.includes('pdf') || selectedApp.documentData.startsWith('data:application/pdf') ? (
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center font-bold text-xs">
                                PDF
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">{selectedApp.documentName || 'અરજદાર દસ્તાવેજ.pdf'}</p>
                                <p className="text-[11px] text-slate-400">PDF દસ્તાવેજ</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewDocApp(selectedApp);
                                setDocZoom(1);
                                setDocRotation(0);
                                setDocImageError(false);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg border border-slate-700"
                            >
                              ખોલો
                            </button>
                          </div>
                        ) : detailDocImageError ? (
                          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-center space-y-2.5">
                            <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs">
                              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>આ અરજીનો ફોટો અધૂરો/ક્ષતિગ્રસ્ત છે</span>
                            </div>
                            <p className="text-[11px] text-slate-300">
                              (અગાઉની જૂની ટેસ્ટ અરજી). તમે અરજદાર પાસેથી વોટ્સએપ પર નવો ફોટો મંગાવી શકો છો અથવા અહીંથી નવો ફોટો અપલોડ કરી શકો છો:
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                              <a
                                href={getWhatsAppDocRequestUrl(selectedApp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>વોટ્સએપ પર ફોટો મંગાવો</span>
                              </a>
                              <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{isUpdatingDoc ? 'અપલોડ થઈ રહ્યું છે...' : 'નવો ફોટો અહીં અપલોડ કરો'}</span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  disabled={isUpdatingDoc}
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleAdminDocUpload(selectedApp.applicationId, f);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setPreviewDocApp(selectedApp);
                              setDocZoom(1);
                              setDocRotation(0);
                              setDocImageError(false);
                            }}
                            className="relative rounded-xl overflow-hidden border border-slate-700 bg-black/50 group cursor-pointer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sanitizeDocumentSrc(selectedApp.documentData)}
                              alt={selectedApp.documentName || 'Applicant Document'}
                              onError={() => setDetailDocImageError(true)}
                              className="w-full max-h-52 object-contain mx-auto"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                              <span className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>મોટી સાઈઝમાં જુઓ (Zoom)</span>
                              </span>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
                          <p className="text-[11px] text-slate-400 italic mb-2">
                            અરજદારે ઓનલાઇન દસ્તાવેજ અપલોડ કર્યો નથી.
                          </p>
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUpdatingDoc ? 'અપલોડ થઈ રહ્યું છે...' : 'અહીં દસ્તાવેજ જોડો'}</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              disabled={isUpdatingDoc}
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleAdminDocUpload(selectedApp.applicationId, f);
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Admin remarks input */}
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        સંચાલક રીમાર્ક (Admin Note / Reason):
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedApp.adminRemarks || ''}
                        onBlur={(e) =>
                          handleUpdateAppStatus(selectedApp.applicationId, selectedApp.status, e.target.value)
                        }
                        placeholder="દા.ત. પાન કાર્ડ નંબર જનરેટ થઈ ગયેલ છે, ઈ-પાન તૈયાર છે."
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                      />
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
                      <button
                        onClick={() => handleSendWhatsAppNotification(selectedApp)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>વોટ્સએપ અપડેટ મોકલો</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'APPLICATION',
                              id: selectedApp.applicationId,
                              title: `${selectedApp.customerName} (${selectedApp.applicationId})`,
                            })
                          }
                          className="px-3.5 py-2 bg-rose-950/80 border border-rose-800/90 hover:bg-rose-900 text-rose-300 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>અરજી કાઢી નાખો</span>
                        </button>
                        <button
                          onClick={() => setSelectedApp(null)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                        >
                          બંધ કરો
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERVICES */}
          {activeTab === 'SERVICES' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">સેવાઓનું સંચાલન (Services Catalog)</h2>
                  <p className="text-xs text-slate-400">
                    નવી સેવા ઉમેરો, ફી બદલો, જરૂરી ડોક્યુમેન્ટ અપડેટ કરો
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm({ category: 'IDENTITY', fee: 50, active: true });
                    setIsServiceModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>નવી સેવા ઉમેરો</span>
                </button>
              </div>

              {/* Services List Table */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 pb-3">
                      <th className="py-2.5">સેવા નામ (ગુજરાતી / English)</th>
                      <th className="py-2.5">કેટેગરી</th>
                      <th className="py-2.5">ફી</th>
                      <th className="py-2.5">સમય</th>
                      <th className="py-2.5">સ્થિતિ</th>
                      <th className="py-2.5 text-right">ક્રિયા</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-850">
                        <td className="py-3">
                          <p className="font-bold text-white">{srv.gujaratiName}</p>
                          <p className="text-[11px] text-slate-400">{srv.englishName}</p>
                        </td>
                        <td className="py-3 text-slate-300 font-mono text-[11px]">{srv.category}</td>
                        <td className="py-3 font-bold text-emerald-400">
                          {srv.fee === 0 ? 'Custom' : `₹${srv.fee}`}
                        </td>
                        <td className="py-3 text-slate-300">{srv.processingTime}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              srv.active ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {srv.active ? 'સક્રિય' : 'બંધ'}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingService(srv);
                              setServiceForm({
                                ...srv,
                                requiredDocuments: srv.requiredDocuments.join(', '),
                              } as any);
                              setIsServiceModalOpen(true);
                            }}
                            className="p-1.5 text-blue-400 hover:bg-slate-800 rounded-lg"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 text-rose-400 hover:bg-slate-800 rounded-lg"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Service Modal Form */}
              {isServiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
                  <form
                    onSubmit={handleSaveService}
                    className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-800 text-xs space-y-4 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white">
                        {editingService ? 'સેવા વિગત સુધારો' : 'નવી સેવા ઉમેરો'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsServiceModalOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">સેવાનું ગુજરાતી નામ *</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.gujaratiName || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, gujaratiName: e.target.value })}
                        placeholder="દા.ત. પાન કાર્ડ સેવાઓ"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">સેવાનું અંગ્રેજી નામ *</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.englishName || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, englishName: e.target.value })}
                        placeholder="e.g. PAN Card Services"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">કેટેગરી</label>
                        <select
                          value={serviceForm.category || 'IDENTITY'}
                          onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                        >
                          <option value="IDENTITY">IDENTITY (ઓળખ)</option>
                          <option value="AGRICULTURE">AGRICULTURE (ખેડૂત)</option>
                          <option value="REVENUE">REVENUE (જમીન/7-12)</option>
                          <option value="HEALTH">HEALTH (આયુષ્માન)</option>
                          <option value="RTO">RTO (વાહન/લાઇસન્સ)</option>
                          <option value="EXAMS">EXAMS (સરકારી ભરતી)</option>
                          <option value="WELFARE">WELFARE (યોજનાઓ)</option>
                          <option value="CERTIFICATES">CERTIFICATES</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">સેવા ફી (₹) *</label>
                        <input
                          type="number"
                          value={serviceForm.fee ?? 50}
                          onChange={(e) => setServiceForm({ ...serviceForm, fee: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">સમય મર્યાદા</label>
                      <input
                        type="text"
                        value={serviceForm.processingTime || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, processingTime: e.target.value })}
                        placeholder="૨ થી ૩ દિવસ / તાત્કાલિક"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        જરૂરી ડોક્યુમેન્ટ્સ (અલ્પવિરામ &apos;,&apos; વડે અલગ કરો)
                      </label>
                      <input
                        type="text"
                        value={
                          typeof serviceForm.requiredDocuments === 'string'
                            ? serviceForm.requiredDocuments
                            : serviceForm.requiredDocuments?.join(', ') || ''
                        }
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, requiredDocuments: e.target.value as any })
                        }
                        placeholder="આધાર કાર્ડ, રેશન કાર્ડ, ફોટો..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">ગુજરાતી વિવરણ</label>
                      <textarea
                        rows={2}
                        value={serviceForm.descriptionGu || ''}
                        onChange={(e) => setServiceForm({ ...serviceForm, descriptionGu: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="srv-active"
                        checked={serviceForm.active ?? true}
                        onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="srv-active" className="text-slate-300">
                        આ સેવા હોમપેજ પર સક્રિય રાખો
                      </label>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsServiceModalOpen(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                      >
                        રદ કરો
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                      >
                        સેવ કરો
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCHEMES & RECRUITMENT */}
          {activeTab === 'SCHEMES' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">યોજનાઓ અને ભરતી અપડેટ્સ</h2>
                  <p className="text-xs text-slate-400">
                    નવી સરકારી ભરતી અથવા ખેડૂત સહાય યોજના તરત જ વેબસાઇટ પર પ્રકાશિત કરો
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingScheme(null);
                    setSchemeForm({ type: 'SCHEME', active: true, documentsInput: '' });
                    setIsSchemeModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>નવી જાહેરાત / યોજના ઉમેરો</span>
                </button>
              </div>

              {/* Schemes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schemes.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                          {s.type}
                        </span>
                        <span className="text-[11px] text-amber-400 font-semibold">
                          છેલ્લી તારીખ: {s.deadline}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{s.titleGu}</h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{s.department}</span>
                      </p>

                      {/* Benefits & Documents badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        {s.benefits && (
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{s.benefits}</span>
                          </span>
                        )}
                        {s.requiredDocuments && s.requiredDocuments.length > 0 && (
                          <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <ClipboardList className="w-3 h-3" />
                            <span>{s.requiredDocuments.length} દસ્તાવેજ</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                        {s.detailsGu}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      {s.link ? (
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span>પોર્ટલ લિંક</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500 text-xs">કેન્દ્ર રૂબરૂ</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {/* Preview Details & Documents Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewScheme(s)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900 border border-blue-800/80 rounded-lg flex items-center gap-1 transition-colors"
                          title="વિગતો અને ડોક્યુમેન્ટ્સ જુઓ"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span className="hidden sm:inline">ડોક્યુમેન્ટ્સ</span>
                        </button>

                        {/* Edit Scheme Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingScheme(s);
                            setSchemeForm({
                              ...s,
                              documentsInput: s.requiredDocuments?.join(', ') || '',
                            });
                            setIsSchemeModalOpen(true);
                          }}
                          className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-950/60 border border-transparent hover:border-amber-800/60 rounded-lg transition-colors"
                          title="માહિતી અને ડોક્યુમેન્ટ્સ એડિટ કરો (Edit)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Scheme Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'SCHEME',
                              id: s.id,
                              title: s.titleGu,
                            })
                          }
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 border border-transparent hover:border-rose-900/60 rounded-lg transition-colors"
                          title="યોજના કાઢી નાખો (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comprehensive Scheme Add / Edit Form Modal */}
              {isSchemeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
                  <form
                    onSubmit={handleSaveScheme}
                    className="bg-slate-900 rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-slate-800 text-xs space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl text-slate-100"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {editingScheme ? 'યોજના / ભરતી માહિતી સુધારો (Edit Scheme)' : 'નવી જાહેરાત / યોજના પ્રકાશિત કરો'}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          જરૂરી ડોક્યુમેન્ટ્સ, સહાયની રકમ અને વિગતો અહીંથી સંપૂર્ણ નિયંત્રિત કરો
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSchemeModalOpen(false);
                          setEditingScheme(null);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">પ્રકાર (Category) *</label>
                        <select
                          value={schemeForm.type || 'SCHEME'}
                          onChange={(e) => setSchemeForm({ ...schemeForm, type: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="SCHEME">સરકારી યોજના (Welfare Scheme)</option>
                          <option value="RECRUITMENT">સરકારી ભરતી (Govt Recruitment)</option>
                          <option value="FARMER">ખેડૂત વિશેષ (ikhedut / Farmer)</option>
                          <option value="EDUCATION">શિક્ષણ & સ્કોલરશિપ (Scholarship)</option>
                          <option value="ANNOUNCEMENT">મહત્વપૂર્ણ જાહેરાત (Announcement)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">છેલ્લી તારીખ (Deadline) *</label>
                        <input
                          type="text"
                          required
                          value={schemeForm.deadline || ''}
                          onChange={(e) => setSchemeForm({ ...schemeForm, deadline: e.target.value })}
                          placeholder="દા.ત. ૩૧ ડિસેમ્બર ૨૦૨૬ / નજીકના ભવિષ્યમાં"
                          className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">યોજનાનું નામ (ગુજરાતી) *</label>
                      <input
                        type="text"
                        required
                        value={schemeForm.titleGu || ''}
                        onChange={(e) => setSchemeForm({ ...schemeForm, titleGu: e.target.value })}
                        placeholder="દા.ત. કુંવરબાઈનું મામેરું યોજના – ₹૧૨,૦૦૦ સહાય"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">સરકારી વિભાગ (Department)</label>
                        <input
                          type="text"
                          value={schemeForm.department || ''}
                          onChange={(e) => setSchemeForm({ ...schemeForm, department: e.target.value })}
                          placeholder="દા.ત. સામાજિક ન્યાય અને અધિકારીતા વિભાગ"
                          className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">મળવાપાત્ર લાભ / સહાય (Benefits)</label>
                        <input
                          type="text"
                          value={schemeForm.benefits || ''}
                          onChange={(e) => setSchemeForm({ ...schemeForm, benefits: e.target.value })}
                          placeholder="દા.ત. ₹૧૨,૦૦૦ સહાય / ૫૦% સબસિડી"
                          className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Required Documents Control Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-300 font-semibold">
                          જરૂરી આધાર-પુરાવા / ડોક્યુમેન્ટ્સ (અલ્પવિરામથી અલગ કરો) *
                        </label>
                        <span className="text-[11px] text-amber-400 font-mono">
                          દરેક ડોક્યુમેન્ટ વચ્ચે અલ્પવિરામ (,) મૂકો
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={schemeForm.documentsInput !== undefined ? schemeForm.documentsInput : (schemeForm.requiredDocuments?.join(', ') || '')}
                        onChange={(e) => setSchemeForm({ ...schemeForm, documentsInput: e.target.value })}
                        placeholder="દા.ત. આધાર કાર્ડ, રેશન કાર્ડ, આવકનો દાખલો, બેંક પાસબુક, ૭/૧૨ ઉતારો, પાસપોર્ટ સાઇઝ ફોટો"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        આ ડોક્યુમેન્ટ્સ ગ્રાહકને હોમપેજ પર ચેકમર્ક સાથે સ્પષ્ટ યાદી રૂપે જોવા મળશે.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">પાત્રતા અને નિયમો (Eligibility)</label>
                      <input
                        type="text"
                        value={schemeForm.eligibility || ''}
                        onChange={(e) => setSchemeForm({ ...schemeForm, eligibility: e.target.value })}
                        placeholder="દા.ત. વાર્ષિક આવક મર્યાદા ₹૧,૨૦,૦૦૦, લગ્નના ૨ વર્ષની અંદર, ૧૨ પાસ..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">વિગતવાર વર્ણન (Full Details)</label>
                      <textarea
                        rows={2}
                        value={schemeForm.detailsGu || ''}
                        onChange={(e) => setSchemeForm({ ...schemeForm, detailsGu: e.target.value })}
                        placeholder="યોજનાના મુખ્ય ફાયદા અને વિગતો..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">અરજી કરવાની પ્રક્રિયા (How to Apply)</label>
                      <input
                        type="text"
                        value={schemeForm.applicationProcess || ''}
                        onChange={(e) => setSchemeForm({ ...schemeForm, applicationProcess: e.target.value })}
                        placeholder="દા.ત. ARVI ONLINE & CSC ખોડાણા ખાતે ઓનલાઇન ફોર્મ ભરાશે."
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">સત્તાવાર પોર્ટલ લિંક (Website URL)</label>
                      <input
                        type="url"
                        value={schemeForm.link || ''}
                        onChange={(e) => setSchemeForm({ ...schemeForm, link: e.target.value })}
                        placeholder="https://ojas.gujarat.gov.in અથવા https://ikhedut.gujarat.gov.in"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="scheme-active-toggle"
                        checked={schemeForm.active ?? true}
                        onChange={(e) => setSchemeForm({ ...schemeForm, active: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="scheme-active-toggle" className="text-slate-300 text-xs font-semibold cursor-pointer">
                        આ યોજના વેબસાઇટ હોમપેજ પર સક્રિય રાખો (Show on website)
                      </label>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSchemeModalOpen(false);
                          setEditingScheme(null);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-semibold"
                      >
                        રદ કરો
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingScheme ? 'ફેરફાર સેવ કરો' : 'પ્રકાશિત કરો'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-white">વેબસાઇટ બેનર & કેન્દ્ર સેટિંગ્સ</h2>
                <p className="text-xs text-slate-400">
                  હોમપેજ પર દર્શાવવામાં આવતી સૂચનાઓ, UPI ID અને સંપર્ક વિગતો સુધારો
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    હોમપેજ ટોપ એલર્ટ બેનર (ગુજરાતી)
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.bannerNoticeGu}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bannerNoticeGu: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    સંચાલક નામ (Operator Name)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.ownerName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      સંપર્ક ફોન નંબર
                    </label>
                    <input
                      type="text"
                      value={settingsForm.contactPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      વોટ્સએપ નંબર (WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    UPI ID (QR કોડ પેમેન્ટ માટે)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.upiId}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    કેન્દ્ર સરનામું (Location)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.location}
                    onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {settingsSaved && (
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>સેટિંગ્સ સફળતાપૂર્વક સેવ કરવામાં આવી છે!</span>
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>સેટિંગ્સ સેવ કરો</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* High-Resolution Document Viewer Lightbox Modal */}
      {previewDocApp && previewDocApp.documentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            {/* Top Bar */}
            <div className="h-16 px-6 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                  <Paperclip className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{previewDocApp.customerName} નો દસ્તાવેજ</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {previewDocApp.applicationId}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    સેવા: {previewDocApp.serviceName} · મોબાઈલ: {previewDocApp.mobile} · ગામ: {previewDocApp.village}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                {/* Zoom & Rotate controls for images */}
                {(!previewDocApp.documentType?.includes('pdf') && !previewDocApp.documentData.startsWith('data:application/pdf')) && (
                  <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDocZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono px-1.5 text-slate-300">
                      {Math.round(docZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setDocZoom((z) => Math.min(3, z + 0.25))}
                      className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocRotation((r) => (r + 90) % 360)}
                      className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <label className="cursor-pointer px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUpdatingDoc ? 'અપલોડ...' : 'બદલો / અપલોડ'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={isUpdatingDoc}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleAdminDocUpload(previewDocApp.applicationId, f);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handleDownloadDocument(previewDocApp)}
                  className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ડાઉનલોડ કરો</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewDocApp(null);
                    setDocZoom(1);
                    setDocRotation(0);
                    setDocImageError(false);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Preview Container */}
            <div className="flex-1 bg-slate-950 p-4 overflow-auto flex items-center justify-center">
              {previewDocApp.documentType?.includes('pdf') || previewDocApp.documentData.startsWith('data:application/pdf') ? (
                <iframe
                  src={sanitizeDocumentSrc(previewDocApp.documentData)}
                  title={previewDocApp.documentName || 'Applicant PDF'}
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                />
              ) : docImageError ? (
                <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-800/80 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">દસ્તાવેજનો ફોટો અધૂરો અથવા અમાન્ય છે</h4>
                    <p className="text-xs text-amber-300 font-mono font-medium mt-1">
                      {previewDocApp.documentName || 'અરજદાર દસ્તાવેજ'}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      આ જૂની ટેસ્ટ અરજી હોવાથી અથવા નેટવર્ક કનેક્શનના કારણે ફોટો અધૂરો અપલોડ થયો હતો, જેથી બ્રાઉઝરમાં ખુલી શકતો નથી.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <a
                      href={getWhatsAppDocRequestUrl(previewDocApp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>અરજદાર ({previewDocApp.customerName}) ને WhatsApp પર નવો ફોટો મોકલવા કહો</span>
                    </a>

                    <label className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{isUpdatingDoc ? 'અપલોડ થઈ રહ્યું છે...' : 'અહીં નવો સ્પષ્ટ ફોટો / દસ્તાવેજ અપલોડ કરો'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isUpdatingDoc}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleAdminDocUpload(previewDocApp.applicationId, f);
                        }}
                      />
                    </label>

                    <a
                      href={`tel:${previewDocApp.mobile}`}
                      className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>ગ્રાહકને કોલ કરો ({previewDocApp.mobile})</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="max-w-full max-h-full flex items-center justify-center overflow-auto p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sanitizeDocumentSrc(previewDocApp.documentData)}
                    alt={previewDocApp.documentName || 'Document Full Preview'}
                    onError={() => setDocImageError(true)}
                    style={{
                      transform: `scale(${docZoom}) rotate(${docRotation}deg)`,
                      transition: 'transform 0.2s ease',
                    }}
                    className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-slate-800"
                  />
                </div>
              )}
            </div>

            {/* Bottom Info Bar */}
            <div className="h-12 px-6 border-t border-slate-800 bg-slate-900 text-xs text-slate-400 flex items-center justify-between shrink-0">
              <span className="truncate max-w-sm">ફાઇલ: {previewDocApp.documentName || 'અરજદાર દસ્તાવેજ'}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppNotification(previewDocApp)}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>વોટ્સએપ મેસેજ મોકલો</span>
                </button>
                <span>·</span>
                <span className="text-slate-500">ARVI ONLINE & CSC ખોડાણા</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {deleteConfirm.type === 'SCHEME'
                    ? 'યોજના કાઢી નાખવાની પુષ્ટિ'
                    : 'અરજી કાઢી નાખવાની પુષ્ટિ'}
                </h3>
                <p className="text-xs text-rose-300 font-medium">આ પ્રક્રિયા કાયમી ધોરણે થશે</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-850 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="text-slate-400">
                {deleteConfirm.type === 'SCHEME'
                  ? 'તમે નીચેની યોજના વેબસાઇટ પરથી દૂર કરવા માંગો છો:'
                  : 'તમે નીચેની નાગરિક અરજી સંપૂર્ણપણે કાઢી નાખવા માંગો છો:'}
              </p>
              <p className="font-bold text-white text-sm line-clamp-2 pt-1">{deleteConfirm.title}</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {deleteConfirm.type === 'SCHEME'
                ? 'આ યોજના હોમપેજ તથા એડમિન લિસ્ટ બંનેમાંથી હટાવી દેવામાં આવશે.'
                : 'આ અરજીનો તમામ ડેટા, ગ્રાહકની વિગતો અને અપલોડ કરેલ દસ્તાવેજ કાયમી ધોરણે ડિલીટ થઈ જશે.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                રદ કરો (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === 'SCHEME') {
                    handleDeleteScheme(deleteConfirm.id);
                  } else {
                    handleDeleteApplication(deleteConfirm.id);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>હા, કાઢી નાખો</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Scheme Detail Preview Modal */}
      <SchemeDetailModal
        scheme={previewScheme}
        onClose={() => setPreviewScheme(null)}
      />
    </div>
  );
}
