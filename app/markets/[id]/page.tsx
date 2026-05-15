'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { Market } from '@/components/MarketCard';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.id as string;
  const { user, refreshBalance } = useAuth();
  
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trading State
  const [outcomeType, setOutcomeType] = useState<'YES' | 'NO'>('YES');
  const [sharesToBuy, setSharesToBuy] = useState<number>(100);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const { data } = await apiClient.get(`/markets/${marketId}`);
        if (data.success) {
          setMarket(data.payload);
        } else {
          setError(data.message);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch market details');
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [marketId]);

  const handleTrade = async () => {
    if (!user) {
      setTradeMessage({ type: 'error', text: 'Please login to trade.' });
      return;
    }
    if (sharesToBuy <= 0) {
      setTradeMessage({ type: 'error', text: 'Shares must be greater than 0.' });
      return;
    }
    
    setTradeLoading(true);
    setTradeMessage(null);

    try {
      const { data } = await apiClient.post('/trades', {
        localUserId: user.id,
        centralUserId: user.central_user_id,
        marketId: market?.id,
        outcomeType: outcomeType,
        sharesToBuy: sharesToBuy
      });

      if (data.success) {
        setTradeMessage({ type: 'success', text: `Successfully bought ${sharesToBuy} ${outcomeType} shares!` });
        await refreshBalance();
      } else {
        setTradeMessage({ type: 'error', text: data.message || 'Trade failed' });
      }
    } catch (err: any) {
      setTradeMessage({ type: 'error', text: err.response?.data?.message || 'Trade execution error' });
    } finally {
      setTradeLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (error || !market) return <div className="p-8 text-center text-error">Error: {error || 'Market not found'}</div>;

  const yesProb = Math.round(market.price_yes * 100) || 50;
  const noProb = Math.round(market.price_no * 100) || 50;
  
  const currentPrice = outcomeType === 'YES' ? yesProb : noProb;
  const totalCost = sharesToBuy * currentPrice;

  return (
    <div className="flex-1 max-w-[1440px] mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 border-collapse">
      {/* Left Column: Market Info */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Breadcrumbs & Badges */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 text-on-surface-variant font-body-sm items-center">
            <Link href="/markets" className="hover:text-primary transition-colors">Markets</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="uppercase">{market.category}</span>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-surface-container-high text-on-surface font-label-caps rounded border border-outline-variant uppercase">{market.status}</span>
          </div>
        </div>

        {/* H1 Title */}
        <h1 className="font-h1 text-h1 text-on-surface leading-tight">{market.title}</h1>

        {/* Price Display & Prob Bar */}
        <div className="bg-surface border border-outline-variant p-6 rounded flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="flex-1 bg-background border border-outline-variant rounded p-4 flex flex-col items-center justify-center hover:shadow-[0_0_12px_rgba(74,225,118,0.1)] transition-shadow">
              <span className="font-label-caps text-on-surface-variant mb-1">YES</span>
              <div className="flex items-baseline gap-2 text-secondary">
                <span className="font-mono-lg text-4xl">{yesProb}¢</span>
              </div>
            </div>
            <div className="flex-1 bg-background border border-outline-variant rounded p-4 flex flex-col items-center justify-center hover:shadow-[0_0_12px_rgba(255,84,81,0.1)] transition-shadow">
              <span className="font-label-caps text-on-surface-variant mb-1">NO</span>
              <div className="flex items-baseline gap-2 text-tertiary-container">
                <span className="font-mono-lg text-4xl">{noProb}¢</span>
              </div>
            </div>
          </div>
          {/* Probability Slider/Bar */}
          <div className="w-full h-2 bg-outline-variant rounded-full overflow-hidden flex relative">
            <div className="h-full bg-secondary transition-all" style={{ width: `${yesProb}%` }}></div>
            <div className="h-full bg-tertiary-container transition-all" style={{ width: `${noProb}%` }}></div>
            {/* Indicator line */}
            <div className="absolute top-0 bottom-0 w-[2px] bg-white" style={{ left: `${yesProb}%`, marginLeft: '-1px' }}></div>
          </div>
          <div className="flex justify-between font-mono-sm text-on-surface-variant px-1">
            <span>{yesProb}% Probability</span>
            <span>{noProb}%</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-surface border border-outline-variant p-6 rounded">
          <h3 className="font-h3 text-on-surface mb-2">About this Market</h3>
          <p className="font-body-md text-on-surface-variant leading-relaxed mb-4">
            {market.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-surface-container-high border border-outline-variant px-4 py-2 rounded flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">water_drop</span>
            <span className="font-mono-sm text-on-surface">Total: {market.total_invested?.toLocaleString()} 🪙</span>
          </div>
          <div className="bg-surface-container-high border border-outline-variant px-4 py-2 rounded flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">calendar_today</span>
            <span className="font-mono-sm text-on-surface">Ends {new Date(market.end_date).toLocaleDateString()}</span>
          </div>
          <div className="bg-surface-container-high border border-outline-variant px-4 py-2 rounded flex items-center gap-2">
            <span className="material-symbols-outlined text-outline">group</span>
            <span className="font-mono-sm text-on-surface">{market.investor_count} Investors</span>
          </div>
        </div>
      </div>

      {/* Right Column: Order Panel & Discussion */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Order Panel */}
        <div className="bg-surface-container border border-outline-variant p-6 rounded flex flex-col gap-6 sticky top-24">
          <h2 className="font-h2 text-on-surface">Beli Saham</h2>
          
          {/* Toggle */}
          <div className="flex bg-background border border-outline-variant p-1 rounded">
            <button 
              onClick={() => setOutcomeType('YES')}
              className={`flex-1 py-2 font-h3 rounded-sm transition-all ${
                outcomeType === 'YES' 
                  ? 'bg-secondary/20 text-secondary border border-secondary shadow-[0_0_12px_rgba(74,225,118,0.2)]' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >YES</button>
            <button 
              onClick={() => setOutcomeType('NO')}
              className={`flex-1 py-2 font-h3 rounded-sm transition-all ${
                outcomeType === 'NO' 
                  ? 'bg-error/20 text-error border border-error shadow-[0_0_12px_rgba(255,84,81,0.2)]' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >NO</button>
          </div>

          {/* Input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-on-surface-variant">JUMLAH SAHAM</label>
            <div className="flex items-center bg-background border border-outline-variant rounded overflow-hidden focus-within:border-primary transition-all">
              <button onClick={() => setSharesToBuy(Math.max(1, sharesToBuy - 10))} className="p-3 text-on-surface-variant hover:text-on-surface bg-surface-container-high border-r border-outline-variant material-symbols-outlined">remove</button>
              <input 
                className="flex-1 bg-transparent text-center font-mono-lg text-on-surface border-none focus:ring-0" 
                type="number" 
                value={sharesToBuy}
                onChange={(e) => setSharesToBuy(parseInt(e.target.value) || 0)}
                min="1"
              />
              <button onClick={() => setSharesToBuy(sharesToBuy + 10)} className="p-3 text-on-surface-variant hover:text-on-surface bg-surface-container-high border-l border-outline-variant material-symbols-outlined">add</button>
            </div>
          </div>

          {/* Quick Chips */}
          <div className="flex gap-2">
            {[10, 50, 100, 500].map(amount => (
              <button 
                key={amount}
                onClick={() => setSharesToBuy(amount)}
                className={`flex-1 py-1 rounded font-mono-sm transition-colors ${
                  sharesToBuy === amount 
                    ? 'bg-primary/10 border border-primary text-primary' 
                    : 'bg-background border border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-outline-variant pt-4 flex flex-col gap-2">
            <div className="flex justify-between font-mono-sm">
              <span className="text-on-surface-variant">Harga Per Saham</span>
              <span className="text-on-surface">{currentPrice}¢</span>
            </div>
            <div className="flex justify-between font-mono-sm">
              <span className="text-on-surface-variant">Saham Diterima</span>
              <span className="text-on-surface">{sharesToBuy} {outcomeType}</span>
            </div>
            <div className="flex justify-between font-mono-md mt-2">
              <span className="text-on-surface-variant font-bold">Total Biaya</span>
              <span className="text-on-surface font-bold">{totalCost} 🪙</span>
            </div>
          </div>

          {/* Messages */}
          {tradeMessage && (
            <div className={`p-3 rounded font-body-sm ${tradeMessage.type === 'success' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
              {tradeMessage.text}
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={handleTrade}
            disabled={tradeLoading || market.status !== 'OPEN'}
            className={`w-full py-4 font-h3 rounded transition-all disabled:opacity-50 ${
              outcomeType === 'YES' 
                ? 'bg-secondary text-surface hover:shadow-[0_0_16px_rgba(74,225,118,0.4)]' 
                : 'bg-error text-surface hover:shadow-[0_0_16px_rgba(255,84,81,0.4)]'
            }`}
          >
            {tradeLoading ? 'PROCESSING...' : `BELI ${sharesToBuy} Saham ${outcomeType} — ${totalCost} 🪙`}
          </button>
          
          <div className="text-center font-mono-sm text-on-surface-variant">
            Saldo kamu: 🪙 {user?.balance?.toLocaleString() || '---'}
          </div>
        </div>
      </div>
    </div>
  );
}
