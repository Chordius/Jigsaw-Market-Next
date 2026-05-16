'use client';

import React, { useState } from 'react';
import apiClient from '@/lib/apiClient';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMarketModal({ isOpen, onClose, onSuccess }: CreateMarketModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await apiClient.post('/markets', {
        title,
        description,
        category,
        endDate: new Date(endDate).toISOString(),
      });

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to create market');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error creating market');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant rounded shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-surface">
          <h2 className="font-h3 text-h3 text-on-surface">Buat Market Baru</h2>
          <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors focus:outline-none">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow overflow-y-auto">
          {error && (
            <div className="bg-error-container/20 border border-error-container p-3 rounded text-error text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block font-body-sm text-on-surface-variant">Judul Prediksi *</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-outline focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 font-body-md text-on-surface placeholder-outline/50 transition-all outline-none" 
              placeholder="Apakah X akan terjadi sebelum..." 
              type="text"
            />
            <p className="font-mono-sm text-outline mt-1">Pertanyaan harus bisa dijawab YES/NO</p>
          </div>

          <div className="space-y-2">
            <label className="block font-body-sm text-on-surface-variant">Deskripsi / Aturan Resolusi</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-outline focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 font-body-sm text-on-surface placeholder-outline/50 transition-all outline-none resize-y" 
              placeholder="Detail aturan penyelesaian market..." 
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-body-sm text-on-surface-variant">Category *</label>
              <div className="relative">
                <select 
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-outline focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 font-body-md text-on-surface appearance-none outline-none transition-all"
                >
                  <option disabled value="">Pilih Kategori</option>
                  <option value="politics">Politik</option>
                  <option value="sports">Olahraga</option>
                  <option value="crypto">Crypto</option>
                  <option value="tech">Tech</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="climate">Climate</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-outline">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-body-sm text-on-surface-variant">Tanggal Berakhir *</label>
              <div className="relative">
                <input 
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-background border border-outline focus:border-primary focus:ring-1 focus:ring-primary rounded p-3 pl-10 font-mono-md text-on-surface placeholder-outline/50 transition-all outline-none" 
                  type="date"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-outline">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-6 border-t border-outline-variant flex justify-end items-center gap-4">
            <button 
              onClick={onClose}
              type="button"
              className="px-6 py-2 rounded border border-outline text-on-surface-variant font-body-sm hover:bg-surface-variant hover:text-on-surface transition-colors focus:outline-none"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded bg-primary-container text-on-primary-container font-body-sm font-bold disabled:opacity-50 hover:bg-primary hover:text-on-primary transition-colors focus:outline-none flex items-center gap-2"
            >
              {loading ? 'Menyimpan...' : 'Buat Market'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
