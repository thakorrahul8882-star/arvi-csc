'use client';

import React, { useState, useMemo } from 'react';
import { ServiceItem } from '@/lib/types';
import { useLanguage } from '@/lib/languageContext';
import {
  CreditCard,
  HeartHandshake,
  Tractor,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Shield,
  Car,
  Award,
  GraduationCap,
  BookOpen,
  ScrollText,
  Compass,
  Layers,
  CheckCircle2,
  Clock,
  IndianRupee,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface ServicesGridProps {
  services: ServiceItem[];
  searchQuery: string;
  onSelectService: (service: ServiceItem) => void;
  onApplyService: (service: ServiceItem) => void;
}

export default function ServicesGrid({
  services,
  searchQuery,
  onSelectService,
  onApplyService,
}: ServicesGridProps) {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Categories list
  const categories = useMemo(() => {
    return [
      { key: 'ALL', labelGu: 'તમામ સેવાઓ', labelEn: 'All Services' },
      { key: 'IDENTITY', labelGu: 'પાન & ઓળખ પત્ર', labelEn: 'Identity & Cards' },
      { key: 'AGRICULTURE', labelGu: 'ખેડૂત વિશેષ (ikhedut)', labelEn: 'Farmer Welfare' },
      { key: 'REVENUE', labelGu: '૭/૧૨ & જમીન', labelEn: 'Land & Revenue' },
      { key: 'HEALTH', labelGu: 'આયુષ્માન & આરોગ્ય', labelEn: 'Health' },
      { key: 'RTO', labelGu: 'ડ્રાઇવિંગ & વાહન RTO', labelEn: 'Vehicle & RTO' },
      { key: 'EXAMS', labelGu: 'સરકારી ભરતી', labelEn: 'Recruitment' },
      { key: 'WELFARE', labelGu: 'સરકારી યોજનાઓ', labelEn: 'Govt Schemes' },
      { key: 'CERTIFICATES', labelGu: 'પ્રમાણપત્રો & ગેઝેટ', labelEn: 'Certificates' },
    ];
  }, []);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      if (!srv.active) return false;
      const matchesCategory =
        selectedCategory === 'ALL' ||
        srv.category === selectedCategory ||
        (selectedCategory === 'CERTIFICATES' && (srv.category === 'CERTIFICATES' || srv.category === 'LEGAL'));

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        srv.gujaratiName.toLowerCase().includes(query) ||
        srv.englishName.toLowerCase().includes(query) ||
        srv.descriptionGu.toLowerCase().includes(query) ||
        srv.descriptionEn.toLowerCase().includes(query) ||
        srv.requiredDocuments.some((d) => d.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  // Icon mapper
  const renderIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6 text-blue-700 dark:text-blue-400' };
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard {...props} />;
      case 'HeartHandshake':
        return <HeartHandshake {...props} />;
      case 'Tractor':
        return <Tractor {...props} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet {...props} />;
      case 'FileText':
        return <FileText {...props} />;
      case 'Shield':
        return <Shield {...props} />;
      case 'Car':
        return <Car {...props} />;
      case 'Award':
        return <Award {...props} />;
      case 'GraduationCap':
        return <GraduationCap {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'ScrollText':
        return <ScrollText {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Layers':
        return <Layers {...props} />;
      default:
        return <CheckCircle2 {...props} />;
    }
  };

  return (
    <section id="services" className="py-16 max-w-7xl mx-auto px-4 sm:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
            {language === 'gu' ? 'ડિજિટલ સેવા કેટેલોગ' : 'Digital Services Catalog'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {language === 'gu' ? 'અમારા કેન્દ્રની લોકપ્રિય સેવાઓ' : 'Popular CSC & Government Services'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'gu'
              ? 'દરેક સેવા પર ક્લિક કરીને વિગતો, જરૂરી ડોક્યુમેન્ટ અને ફી જાણી શકો છો.'
              : 'Click any service to view required documents, turnaround time, and apply online.'}
          </p>
        </div>

        {/* Total services count */}
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-start md:self-end">
          <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>
            {language === 'gu'
              ? `કુલ ${filteredServices.length} સેવાઓ ઉપલબ્ધ`
              : `${filteredServices.length} services available`}
          </span>
        </div>
      </div>

      {/* Interactive Category Filter Tabs (Zero-Pill discipline: clean segmented tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === cat.key
                ? 'bg-blue-800 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            {language === 'gu' ? cat.labelGu : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {language === 'gu'
              ? 'શોધાયેલ વિગત માટે કોઈ સેવા મળી નથી. કૃપા કરીને અન્ય કીવર્ડ અજમાવો.'
              : 'No services found matching your query. Please try another search.'}
          </p>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {language === 'gu' ? 'તમામ સેવાઓ જુઓ' : 'View all services'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Card Top: Icon & Metadata */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {renderIcon(service.icon)}
                  </div>

                  {/* Fee badge (unboxed text / clean metric) */}
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      {t.fee}
                    </span>
                    <span className="text-base font-extrabold text-blue-950 dark:text-white tabular-nums">
                      {service.fee === 0
                        ? language === 'gu'
                          ? 'વાહન મુજબ'
                          : 'Custom'
                        : `₹${service.fee}`}
                    </span>
                  </div>
                </div>

                {/* Service Title */}
                <h3
                  onClick={() => onSelectService(service)}
                  className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer transition-colors"
                >
                  {language === 'gu' ? service.gujaratiName : service.englishName}
                </h3>

                {/* Subtitle / English secondary text */}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {language === 'gu' ? service.englishName : service.gujaratiName}
                </p>

                {/* Short description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {language === 'gu' ? service.descriptionGu : service.descriptionEn}
                </p>

                {/* Processing time meta with dot separator */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="truncate">{service.processingTime}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 flex items-center gap-2">
                <button
                  onClick={() => onSelectService(service)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-center"
                >
                  {t.viewDetails}
                </button>
                <button
                  onClick={() => onApplyService(service)}
                  className="flex-1 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors text-center flex items-center justify-center gap-1"
                >
                  <span>{t.applyNow}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
