'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import MarketCard, { Market } from '@/components/MarketCard';
import { useAuth } from '@/context/AuthContext';
import CreateMarketModal from '@/components/CreateMarketModal';

const categories = [
  { id: "Politics", label: 'Politics', icon: 'policy' },
  { id: "Sports", label: 'Sports', icon: 'sports_basketball' },
  { id: "Academics", label: 'Academics', icon: 'school' },
  { id: "Economy", label: 'Economy', icon: 'monitoring' },
  { id: "Tech", label: 'Tech', icon: 'memory' },
  { id: "Entertainment", label: 'Entertainment', icon: 'movie' },
  { id: "Others", label: 'Others', icon: 'category' }
];

export default function MarketsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters from URL
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'popularity';

  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      // Build query string
      let query = `?status=ALL&sortBy=${sortBy}&order=${sortBy === 'ends_by' ? 'asc' : 'desc'}`;
      if (selectedCategory) {
        query += `&category=${selectedCategory}`;
      }

      const { data } = await apiClient.get(`/markets${query}`);
      if (data.success) {
        setMarkets(data.payload);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [selectedCategory, sortBy]);

  // Client-side search filtering
  const filteredMarkets = markets.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-1 -mt-16 pt-16">
      {/* SideNavBar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] p-4 bg-surface-container-low border-r border-outline-variant w-64 z-40">
        <div className="mb-8 px-4">
          <div className="text-h3 font-h3 text-on-surface mb-2">Categories</div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <button
            onClick={() => updateUrlParams('category', '')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-100 ${selectedCategory === ''
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: selectedCategory === '' ? "'FILL' 1" : "'FILL' 0" }}>explore</span>
            <span className="font-body-sm font-semibold">All Markets</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateUrlParams('category', cat.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-100 ${selectedCategory === cat.id
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'
                }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: selectedCategory === cat.id ? "'FILL' 1" : "'FILL' 0" }}>{cat.icon}</span>
              <span className="font-body-sm font-semibold">{cat.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-6 min-h-screen relative">
        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface border border-outline-variant rounded-DEFAULT py-3 pl-12 pr-4 text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-outline-variant"
                placeholder="Search markets by keyword..."
                type="text"
                value={searchQuery}
                onChange={(e) => updateUrlParams('search', e.target.value)}
              />
            </div>
            {user && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-background font-bold px-6 py-3 rounded hover:bg-primary-fixed transition-colors whitespace-nowrap"
              >
                + Create Market
              </button>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="font-mono-sm text-outline">
              Showing {filteredMarkets.length} markets
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-outline">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => updateUrlParams('sort', e.target.value)}
                className="bg-surface border border-outline-variant rounded py-1 px-2 text-on-surface font-mono-sm focus:border-primary focus:outline-none appearance-none"
              >
                <option value="popularity">Popularity (High-Low)</option>
                <option value="ends_by">Ending Soon</option>
                <option value="created_at">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Market Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-error-container/20 border border-error-container p-4 rounded text-error flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-outline-variant rounded-lg">
            <span className="material-symbols-outlined text-4xl text-outline mb-4">search_off</span>
            <h3 className="font-h3 text-on-surface">No markets found</h3>
            <p className="text-on-surface-variant font-body-sm mt-2">Try changing category filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMarkets.map(market => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </main>

      <CreateMarketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMarkets}
      />
    </div>
  );
}
