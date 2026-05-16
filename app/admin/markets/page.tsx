'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface AdminMarket {
  id: string;
  title: string;
  category: string;
  end_date: string;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  resolved_outcome: 'YES' | 'NO' | null;
  active_traders: number;
}

export default function AdminMarketsPage() {
  const [markets, setMarkets] = useState<AdminMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMarket, setNewMarket] = useState({ title: '', category: 'Crypto', end_date: '', description: '' });

  const fetchMarkets = async () => {
    try {
      const { data } = await apiClient.get('/admin/markets');
      if (data.success) {
        setMarkets(data.payload);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('creating');
    try {
      const { data } = await apiClient.post('/admin/markets/create', newMarket);
      if (data.success) {
        setShowCreateModal(false);
        setNewMarket({ title: '', category: 'Crypto', end_date: '', description: '' });
        await fetchMarkets();
      }
    } catch (e) {
      alert("Failed to create market");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id: string, outcome: 'YES' | 'NO') => {
    if (!confirm(`Are you sure you want to resolve this market as ${outcome}? This will trigger payouts.`)) return;
    
    setActionLoading(id);
    try {
        await apiClient.post(`/markets/${id}/resolve`, { outcome });
        await fetchMarkets();
    } catch (e) {
        alert("Failed to resolve market");
    } finally {
        setActionLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-[1440px] mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">Manage Markets</h2>
          <p className="text-on-surface-variant font-body-md">Create, close, and resolve prediction markets</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-full flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Create New Market
        </button>
      </header>

      {/* Create Market Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-outline-variant w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-h3 text-h3 text-on-surface">New Market</h3>
              <button onClick={() => setShowCreateModal(false)} className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">close</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface-variant">MARKET TITLE</label>
                <input 
                  required
                  className="bg-surface-container border border-outline-variant rounded p-3 text-on-surface focus:border-primary outline-none"
                  placeholder="e.g. Will Bitcoin reach $100k by year end?"
                  value={newMarket.title}
                  onChange={e => setNewMarket({...newMarket, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-on-surface-variant">CATEGORY</label>
                  <select 
                    className="bg-surface-container border border-outline-variant rounded p-3 text-on-surface focus:border-primary outline-none"
                    value={newMarket.category}
                    onChange={e => setNewMarket({...newMarket, category: e.target.value})}
                  >
                    <option>Crypto</option>
                    <option>Politics</option>
                    <option>Sports</option>
                    <option>Economy</option>
                    <option>Pop Culture</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-on-surface-variant">END DATE</label>
                  <input 
                    required
                    type="date"
                    className="bg-surface-container border border-outline-variant rounded p-3 text-on-surface focus:border-primary outline-none"
                    value={newMarket.end_date}
                    onChange={e => setNewMarket({...newMarket, end_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface-variant">DESCRIPTION</label>
                <textarea 
                  className="bg-surface-container border border-outline-variant rounded p-3 text-on-surface focus:border-primary outline-none h-24 resize-none"
                  placeholder="Rules and resolution criteria..."
                  value={newMarket.description}
                  onChange={e => setNewMarket({...newMarket, description: e.target.value})}
                />
              </div>
              <button 
                disabled={actionLoading === 'creating'}
                type="submit"
                className="bg-primary text-on-primary font-bold py-4 rounded-xl mt-4 hover:shadow-[0_0_16px_rgba(80,143,248,0.3)] transition-all disabled:opacity-50"
              >
                {actionLoading === 'creating' ? 'CREATING...' : 'CREATE MARKET'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Market</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Status</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Ends At</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Traders</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {markets.map((m) => (
                <tr key={m.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-body-md font-bold text-on-surface">{m.title}</div>
                    <div className="text-on-surface-variant text-xs">{m.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      m.status === 'OPEN' ? 'bg-success/10 text-success' : 
                      m.status === 'CLOSED' ? 'bg-warning/10 text-warning' : 
                      'bg-outline-variant text-on-surface-variant'
                    }`}>
                      {m.status} {m.resolved_outcome && `(${m.resolved_outcome})`}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono-sm text-on-surface-variant">
                    {new Date(m.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface">
                    {m.active_traders}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {m.status !== 'RESOLVED' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          disabled={actionLoading === m.id}
                          onClick={() => handleResolve(m.id, 'YES')}
                          className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded hover:bg-success/20 transition-all text-xs font-bold"
                        >
                          Resolve YES
                        </button>
                        <button 
                          disabled={actionLoading === m.id}
                          onClick={() => handleResolve(m.id, 'NO')}
                          className="px-3 py-1 bg-error/10 text-error border border-error/20 rounded hover:bg-error/20 transition-all text-xs font-bold"
                        >
                          Resolve NO
                        </button>
                      </div>
                    ) : (
                      <span className="text-on-surface-variant italic text-xs">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
