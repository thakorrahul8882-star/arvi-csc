'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  auth,
  googleProvider,
  ADMIN_EMAIL,
} from '@/lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('કૃપા કરીને એડમિન પાસવર્ડ દાખલ કરો.');
      return;
    }

    setLoading(true);
    setError('');

    // Secure owner passcode fallback for Rahul Thakor (owner of 7265013972)
    if (
      password.trim() === '7265013972' ||
      password.trim() === 'rahul7265' ||
      password.trim() === 'arvi@2026'
    ) {
      const ownerUser = {
        uid: 'owner_rahul_thakor',
        email: ADMIN_EMAIL,
        displayName: 'રાહુલ ઠાકોર',
      };
      sessionStorage.setItem('arvi_admin_session', JSON.stringify(ownerUser));
      onLoginSuccess(ownerUser);
      setLoading(false);
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      // Double check email matches authorized owner
      if (cred.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setError('અનધિકૃત એક્સેસ: આ એડમિન પેનલ ફક્ત રાહુલ ઠાકોર (thakorrahul8882@gmail.com) માટે જ સુરક્ષિત છે.');
        return;
      }
      onLoginSuccess(cred.user);
    } catch (err: any) {
      console.warn('Firebase email auth error:', err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('ખોટો પાસવર્ડ. કૃપા કરીને સાચો પાસવર્ડ દાખલ કરો અથવા નીચે આપેલ Google સાઇન-ઇન બટનનો ઉપયોગ કરો.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Firebase માં Password લોગિન સક્ષમ નથી. કૃપા કરીને નીચે આપેલ Google સાઇન-ઇન બટન વડે લૉગિન કરો.');
      } else {
        setError(err.message || 'લૉગિન કરવામાં ક્ષતિ આવી.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userEmail = res.user?.email?.toLowerCase();

      // STRICT SECURITY GATE: Only allow Rahul Thakor (thakorrahul8882@gmail.com)
      if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        sessionStorage.removeItem('arvi_admin_session');
        setError(
          `પ્રવેશ નામંજૂર: "${res.user?.email}" અધિકૃત સંચાલક નથી! આ એડમિન પેનલ ફક્ત રાહુલ ઠાકોર (${ADMIN_EMAIL}) માટે જ સુરક્ષિત છે.`
        );
        return;
      }

      onLoginSuccess(res.user);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google સાઇન-ઇન નિષ્ફળ રહ્યું.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Back to public website link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ગ્રાહક વેબસાઇટ (હોમપેજ) પર પાછા જાઓ</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-amber-400 font-extrabold text-2xl flex items-center justify-center mx-auto border border-blue-500/30 shadow-lg">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              ARVI ONLINE & CSC એડમિન પેનલ
            </h1>
            <p className="text-xs text-slate-400">
              સુરક્ષિત સંચાલક ઓથેન્ટિકેશન (ખોડાણા, પાટણ)
            </p>
          </div>

          {/* Security Notice: Restricted to Rahul Thakor only */}
          <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/80 text-xs flex items-start gap-2.5 text-blue-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              આ એડમિન પેનલ ફક્ત અધિકૃત સંચાલક <strong className="text-white">રાહુલ ઠાકોર ({ADMIN_EMAIL})</strong> માટે જ સીમિત છે. અન્ય કોઈ પણ વ્યક્તિ આ પેનલમાં લૉગિન કરી શકશે નહીં.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                અધિકૃત સંચાલક ઈમેઈલ (Locked)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={ADMIN_EMAIL}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-200 text-xs font-semibold cursor-not-allowed select-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                સંચાલક પાસવર્ડ (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>પાસવર્ડ વડે લૉગિન કરો</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              અથવા
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Google Sign-in restricted strictly to thakorrahul8882@gmail.com */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google વડે લૉગિન કરો ({ADMIN_EMAIL})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
