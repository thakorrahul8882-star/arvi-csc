'use client';

import React, { useState, useEffect } from 'react';
import { auth, ADMIN_EMAIL } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState<User | any | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = sessionStorage.getItem('arvi_admin_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            return parsed;
          }
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setUser(firebaseUser);
          sessionStorage.setItem(
            'arvi_admin_session',
            JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            })
          );
        } else {
          // Reject any unauthorized user immediately
          await signOut(auth);
          sessionStorage.removeItem('arvi_admin_session');
          setUser(null);
        }
      } else {
        // If not authenticated in Firebase Auth, check verified session
        const savedUser = sessionStorage.getItem('arvi_admin_session');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
              setUser(parsed);
            }
          } catch {
            // ignore
          }
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleLoginSuccess = (authenticatedUser: any) => {
    if (authenticatedUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setUser(authenticatedUser);
      sessionStorage.setItem('arvi_admin_session', JSON.stringify(authenticatedUser));
    } else {
      signOut(auth);
      sessionStorage.removeItem('arvi_admin_session');
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    sessionStorage.removeItem('arvi_admin_session');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-xs text-slate-400">એડમિન ઓથેન્ટિકેશન ચકાસી રહ્યું છે...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}
