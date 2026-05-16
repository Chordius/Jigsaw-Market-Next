'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col w-full">
      <nav className="bg-surface-container border-b border-outline-variant px-8 py-4">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            <h1 className="font-h3 text-h3 text-on-surface">Admin Console</h1>
          </div>
          <div className="flex gap-6">
            <a href="/admin" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg">Dashboard</a>
            <a href="/admin/markets" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg">Markets</a>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
