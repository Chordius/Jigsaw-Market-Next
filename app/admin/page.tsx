'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface AdminStats {
  active_markets: number;
  pending_payouts: number;
  total_users: number;
  trades_24h: number;
}

interface AdminActivity {
  id: string;
  title: string;
  resolved_outcome: string;
  created_at: string;
  resolved_by: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get('/admin/stats');
        if (data.success) {
          setStats(data.payload.stats);
          setActivity(data.payload.recent_activity);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      <header className="mb-12">
        <h2 className="font-h1 text-h1 text-on-surface">System Overview</h2>
        <p className="text-on-surface-variant font-body-md">Platform performance and real-time metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary p-3 bg-primary/10 rounded-xl">storefront</span>
            <span className="text-success font-mono-sm">LIVE</span>
          </div>
          <h3 className="text-on-surface-variant font-label-md uppercase tracking-wider">Active Markets</h3>
          <p className="text-on-surface font-h2 text-h2 mt-1">{stats?.active_markets || 0}</p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-secondary p-3 bg-secondary/10 rounded-xl">payments</span>
            <span className={Number(stats?.pending_payouts) > 0 ? 'text-warning font-mono-sm' : 'text-success font-mono-sm'}>
              {Number(stats?.pending_payouts) > 0 ? 'NEEDS ATTENTION' : 'CLEARED'}
            </span>
          </div>
          <h3 className="text-on-surface-variant font-label-md uppercase tracking-wider">Pending Payouts</h3>
          <p className="text-on-surface font-h2 text-h2 mt-1">{stats?.pending_payouts || 0}</p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-tertiary p-3 bg-tertiary/10 rounded-xl">group</span>
            <span className="text-outline font-mono-sm">ACTIVE</span>
          </div>
          <h3 className="text-on-surface-variant font-label-md uppercase tracking-wider">Total Users</h3>
          <p className="text-on-surface font-h2 text-h2 mt-1">{stats?.total_users.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-surface border border-outline-variant rounded-2xl p-6">
          <h3 className="font-h3 text-h3 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">bolt</span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/markets" className="flex flex-col items-center justify-center p-6 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-xl transition-all group">
              <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">add_circle</span>
              <span className="font-label-lg text-on-surface">Manage Markets</span>
            </a>
            <button 
              onClick={() => alert("Payout processing will be automated via QStash/Redis plan.")}
              className="flex flex-col items-center justify-center p-6 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-xl transition-all group"
            >
              <span className="material-symbols-outlined text-secondary mb-2 group-hover:scale-110 transition-transform">refresh</span>
              <span className="font-label-lg text-on-surface">Process Payouts</span>
            </button>
          </div>
        </section>

        <section className="bg-surface border border-outline-variant rounded-2xl p-6">
          <h3 className="font-h3 text-h3 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">history</span>
            Recent Resolutions
          </h3>
          <div className="space-y-4">
            {activity.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8">No recent resolutions</p>
            ) : (
              activity.map((act) => (
                <div key={act.id} className="flex gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors cursor-default">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-body-md text-on-surface font-bold">Market Resolved</p>
                    <p className="font-body-sm text-on-surface-variant line-clamp-1">{act.title} as {act.resolved_outcome}</p>
                  </div>
                  <span className="font-mono-sm text-outline-variant">{new Date(act.created_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
