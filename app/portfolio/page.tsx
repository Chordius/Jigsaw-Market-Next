'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Market } from '@/components/MarketCard';

interface Holding {
  holding_id: string;
  market_id: string;
  market_title: string;
  market_status: string;
  outcome_type: string;
  shares_amount: number;
  average_buy_price: number;
  current_price: number;
  unrealized_pnl: number;
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data } = await apiClient.get(`/holdings/${user.id}`);
        if (data.success) {
          setHoldings(data.payload);
        } else {
          setError(data.message);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [user]);

  if (!user && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-center p-6">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">lock</span>
        <h2 className="text-h2 font-h2 text-on-surface mb-2">Login Required</h2>
        <p className="text-on-surface-variant font-body-md mb-6">You need to be logged in to view your portfolio.</p>
        <Link href="/login" className="bg-primary text-background font-bold px-6 py-3 rounded hover:bg-primary-fixed transition-colors">
          Login Now
        </Link>
      </div>
    );
  }

  const totalHoldings = holdings.length;
  const totalPnl = holdings.reduce((sum, h) => sum + Number(h.unrealized_pnl), 0);

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full p-6 flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant pb-4 mt-8">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface mb-2">Portfolio Kamu</h1>
          <p className="font-body-sm text-body-sm text-outline">Manage your active positions and track performance.</p>
        </div>
        <Link href="/markets" className="bg-primary-container text-on-primary-container font-body-sm text-body-sm font-bold py-2 px-4 rounded flex items-center gap-2 hover:bg-primary transition-colors shadow-[0_0_12px_rgba(80,143,248,0.2)]">
          <span className="material-symbols-outlined text-[18px]">search</span>
          Jelajahi Markets
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-outline-variant p-[1px] rounded-lg">
        {/* Balance Card */}
        <div className="bg-surface p-6 rounded-t-lg md:rounded-l-lg md:rounded-tr-none flex flex-col justify-center">
          <span className="font-label-caps text-label-caps text-outline mb-2 uppercase">Saldo Tersedia</span>
          <div className="font-mono-lg text-mono-lg text-[#FACC15] font-bold">
            🪙 {user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>
        {/* Total Holdings */}
        <div className="bg-surface p-6 flex flex-col justify-center">
          <span className="font-label-caps text-label-caps text-outline mb-2 uppercase">Total Active Holdings</span>
          <div className="font-mono-lg text-mono-lg text-on-surface font-bold">
            {totalHoldings}
          </div>
        </div>
        {/* Unrealized P/L */}
        <div className="bg-surface p-6 rounded-b-lg md:rounded-r-lg md:rounded-bl-none flex flex-col justify-center">
          <span className="font-label-caps text-label-caps text-outline mb-2 uppercase">Unrealized P/L</span>
          <div className={`font-mono-lg text-mono-lg font-bold flex items-center gap-1 ${totalPnl >= 0 ? 'text-secondary' : 'text-error'}`}>
            <span className="material-symbols-outlined text-[20px]">{totalPnl >= 0 ? 'trending_up' : 'trending_down'}</span>
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} 🪙
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="mt-4 border border-outline-variant rounded-lg bg-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-error">{error}</div>
        ) : holdings.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">shopping_bag</span>
            <p>You don't have any active positions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="p-4 font-label-caps text-outline font-bold">Market</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-center">Outcome</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-right">Shares</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-right">Avg. Buy Price</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-right">Current Price</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-right">P/L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {holdings.map((holding) => (
                  <tr key={holding.holding_id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="p-4">
                      <Link href={`/markets/${holding.market_id}`} className="font-body-md font-bold text-on-surface hover:text-primary transition-colors block max-w-xs truncate" title={holding.market_title}>
                        {holding.market_title}
                      </Link>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block font-label-caps px-2 py-1 rounded shadow-sm ${
                        holding.outcome_type === 'YES' 
                          ? 'bg-secondary/10 border border-secondary text-secondary shadow-[0_0_8px_rgba(74,225,118,0.1)]' 
                          : 'bg-error/10 border border-error text-error shadow-[0_0_8px_rgba(255,180,171,0.1)]'
                      }`}>
                        {holding.outcome_type}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono-md text-on-surface">{holding.shares_amount.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono-md text-outline">🪙 {(Number(holding.average_buy_price) * 100).toFixed(0)}¢</td>
                    <td className="p-4 text-right font-mono-md text-on-surface">🪙 {(Number(holding.current_price) * 100).toFixed(0)}¢</td>
                    <td className={`p-4 text-right font-mono-md font-bold ${Number(holding.unrealized_pnl) >= 0 ? 'text-secondary' : 'text-error'}`}>
                      {Number(holding.unrealized_pnl) >= 0 ? '+' : ''}{Number(holding.unrealized_pnl).toFixed(2)} 🪙
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
