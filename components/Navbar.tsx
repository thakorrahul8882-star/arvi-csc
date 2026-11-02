'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/languageContext';
import {
  Menu,
  X,
  Phone,
  Moon,
  Sun,
  Languages,
  Search,
  FileCheck2,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  onOpenTrackModal: () => void;
  onOpenApplyModal: () => void;
}

export default function Navbar({ onOpenTrackModal, onOpenApplyModal }: NavbarProps) {
  const { language, setLanguage, t, darkMode, toggleDarkMode } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top micro-bar for emergency / quick contact info */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-300">
              {language === 'gu' ? 'જન સુવિધા કેન્દ્ર' : 'Common Service Center'}
            </span>
            <span className="hidden sm:inline text-blue-200">·</span>
            <span className="hidden sm:inline text-slate-200">
              {language === 'gu' ? 'ખોડાણા, પાટણ (ગુજરાત)' : 'Khodana, Patan (Gujarat)'}
            </span>
            <span className="text-blue-200">·</span>
            <span className="text-amber-200">
              {language === 'gu' ? 'સંચાલક: રાહુલ ઠાકોર' : 'Operator: Rahul Thakor'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:7265013972"
              className="flex items-center gap-1.5 font-medium hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>7265013972</span>
            </a>
            <span className="text-blue-400">|</span>
            <Link
              href="/admin"
              className="flex items-center gap-1 text-blue-200 hover:text-white transition-colors"
              title="Admin Panel Login"
            >
              <Lock className="w-3 h-3 text-amber-300" />
              <span>{t.adminLogin}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation (Strict 3-zone contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark with emblem */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white font-bold text-lg shadow-sm border border-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="text-amber-400">A</span>
            <span className="text-white text-xs ml-0.5">CSC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-blue-950 dark:text-white whitespace-nowrap leading-tight">
              {t.siteTitle}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              {t.siteSubtitle}
            </span>
          </div>
        </Link>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a
            href="#services"
            className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t.services}
          </a>
          <a
            href="#schemes"
            className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t.schemes}
          </a>
          <a
            href="#testimonials"
            className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t.testimonialsTitle}
          </a>
          <a
            href="#contact"
            className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t.contactUs}
          </a>
        </nav>

        {/* Zone 3: Actions (Track Status, Apply Now, Language & Theme switch) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'gu' ? 'en' : 'gu')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-400 transition-colors flex items-center gap-1.5"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{language === 'gu' ? 'EN' : 'ગુજ'}</span>
          </button>

          {/* Dark Mode Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 transition-colors"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Track Application Status Button */}
          <button
            onClick={onOpenTrackModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.trackStatus}</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenApplyModal}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 focus:ring-2 focus:ring-blue-500/50"
          >
            {t.applyOnline}
          </button>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg"
            aria-label="Open Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600"
          >
            {t.services}
          </a>
          <a
            href="#schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600"
          >
            {t.schemes}
          </a>
          <a
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600"
          >
            {t.testimonialsTitle}
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600"
          >
            {t.contactUs}
          </a>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrackModal();
              }}
              className="w-full text-left py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t.trackStatus}</span>
            </button>
            <Link
              href="/admin"
              className="py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-500" />
              <span>{t.adminLogin}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
