'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { Market } from '@/components/MarketCard';
import { useAuth } from '@/context/AuthContext';
import MarketComments from '@/components/MarketComments';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const marketId = params.id as string;
  const { user, loading: authLoading, refreshBalance } = useAuth();
  
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Trading State
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [outcomeType, setOutcomeType] = useState<'YES' | 'NO'>('YES');
  const [sharesToBuy, setSharesToBuy] = useState<number>(10);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [userHoldings, setUserHoldings] = useState<any[]>([]);
  const [realHistory, setRealHistory] = useState<any[]>([]);

  // Available Shares to Sell (Mocking logic without full holdings breakdown, we'll try to find if we can query holdings or just limit by what user thinks they have till backend errors, or fetch holdings)
  // To keep it simple, we'll let the user attempt to sell and let the backend validate if they don't have enough.


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

    const fetchHoldings = async () => {
      if (!user) return;
      try {
        const { data } = await apiClient.get(`/holdings/${user.id}`);
        if (data.success) {
          setUserHoldings(data.payload);
        }
      } catch (err) {}
    };

    const fetchHistory = async () => {
      try {
        const { data } = await apiClient.get(`/markets/${marketId}/history`);
        if (data.success) {
          setRealHistory(data.payload);
        }
      } catch (err) {}
    };

    fetchMarket();
    fetchHoldings();
    fetchHistory();
  }, [marketId, user]);

  const currentOutcomeHolding = userHoldings.find(h => h.market_id === marketId && h.outcome_type === outcomeType);
  const holdingAmount = currentOutcomeHolding ? currentOutcomeHolding.shares_amount : 0;

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
      const payload = tradeMode === 'BUY' ? {
        localUserId: user.id,
        centralUserId: user.central_user_id,
        marketId: market?.id,
        outcomeType: outcomeType,
        sharesToBuy: sharesToBuy,
        action: 'BUY'
      } : {
        localUserId: user.id,
        centralUserId: user.central_user_id,
        marketId: market?.id,
        outcomeType: outcomeType,
        sharesToSell: sharesToBuy, // using the same input state for simplicity
        action: 'SELL'
      };

      const { data } = await apiClient.post('/trades', Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null)));

      if (data.success) {
        setTradeMessage({ type: 'success', text: `Successfully ${tradeMode === 'BUY' ? 'bought' : 'sold'} ${sharesToBuy} ${outcomeType} shares!` });
        await refreshBalance();
        
        // Refresh market details implicitly
        const refreshMarketReq = await apiClient.get(`/markets/${marketId}`);
        if(refreshMarketReq.data.success) {
          setMarket(refreshMarketReq.data.payload);
        }

        // Refresh history
        const refreshHistoryReq = await apiClient.get(`/markets/${marketId}/history`);
        if(refreshHistoryReq.data.success) {
          setRealHistory(refreshHistoryReq.data.payload);
        }

        // Refresh holdings
        const refreshHoldingsReq = await apiClient.get(`/holdings/${user.id}`);
        if(refreshHoldingsReq.data.success) {
          setUserHoldings(refreshHoldingsReq.data.payload);
        }
      } else {
        setTradeMessage({ type: 'error', text: data.message || `${tradeMode} failed` });
      }
    } catch (err: any) {
      setTradeMessage({ type: 'error', text: err.response?.data?.message || 'Trade execution error' });
    } finally {
      setTradeLoading(false);
    }
  };

  const yesProb = market ? Number(market.price_yes) || 5 : 5;
  const noProb = market ? Number(market.price_no) || 5 : 5;
  
  const currentPrice = outcomeType === 'YES' ? yesProb : noProb;
  
  // LS-LMSR Preview Logic
  const previewData = useMemo(() => {
    if (!market || isNaN(sharesToBuy) || sharesToBuy <= 0) return null;
    
    const qYes = parseFloat(market.liquidity_yes || '0');
    const qNo = parseFloat(market.liquidity_no || '0');
    
    // Fixed LMSR: B is constant (100)
    const b = 100;
    
    const lmsrCost = (q1: number, q2: number, currentB: number) => {
        const max = Math.max(q1, q2);
        return max + currentB * Math.log(Math.exp((q1 - max) / currentB) + Math.exp((q2 - max) / currentB));
    };

    const costBefore = lmsrCost(qYes, qNo, b);
    const isBuy = tradeMode === 'BUY';
    const delta = isBuy ? sharesToBuy : -sharesToBuy;
    
    const qYesNew = outcomeType === 'YES' ? qYes + delta : qYes;
    const qNoNew = outcomeType === 'NO' ? qNo + delta : qNo;
    const costAfter = lmsrCost(qYesNew, qNoNew, b);
    
    const totalAmount = Math.abs(costAfter - costBefore) * 10;
    const avgPrice = totalAmount / sharesToBuy;
    
    const priceAfterRaw = 10 * (1 / (1 + Math.exp((qNoNew - qYesNew) / b)));
    const finalPrice = outcomeType === 'YES' ? priceAfterRaw : (10 - priceAfterRaw);
    
    const priceImpact = isBuy ? (finalPrice - currentPrice) : (currentPrice - finalPrice);
    const potentialPayout = sharesToBuy * 10;
    const potentialProfit = potentialPayout - totalAmount;
    const roi = (potentialProfit / totalAmount) * 100;

    return {
        totalAmount,
        avgPrice,
        priceImpact,
        potentialProfit,
        roi
    };
  }, [market, outcomeType, sharesToBuy, currentPrice, tradeMode]);

  const effectiveTotalAmount = previewData?.totalAmount || 0;

  // Generate Real Chart Data
  const chartData = useMemo(() => {
    if (realHistory.length === 0) {
      // Return a flat line starting from creation
      const start = new Date(market?.created_at || Date.now());
      const now = new Date();
      return [
        { time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), YES: 5.0, NO: 5.0 },
        { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), YES: yesProb, NO: noProb }
      ];
    }

    // Process real history
    const data = realHistory.map((h, i) => {
      const d = new Date(h.time);
      const isYes = h.outcome === 'YES';
      const price = Number(h.price);
      return {
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        YES: isYes ? price : Number((10 - price).toFixed(2)),
        NO: isYes ? Number((10 - price).toFixed(2)) : price
      };
    });

    // Add current point
    const now = new Date();
    data.push({
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        YES: yesProb,
        NO: noProb
    });

    return data;
  }, [yesProb, noProb, realHistory, market?.created_at]);

  if (authLoading || (!user && !error)) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (error || !market) return <div className="p-8 text-center text-error">Error: {error || 'Market not found'}</div>;

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
                <span className="font-mono-lg text-4xl">{yesProb.toFixed(2)} 🪙</span>
              </div>
            </div>
            <div className="flex-1 bg-background border border-outline-variant rounded p-4 flex flex-col items-center justify-center hover:shadow-[0_0_12px_rgba(255,84,81,0.1)] transition-shadow">
              <span className="font-label-caps text-on-surface-variant mb-1">NO</span>
              <div className="flex items-baseline gap-2 text-tertiary-container">
                <span className="font-mono-lg text-4xl">{noProb.toFixed(2)} 🪙</span>
              </div>
            </div>
          </div>
          {/* Recharts Probability Chart */}
          <div className="w-full h-48 mt-4 font-mono-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4AE176" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4AE176" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5451" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF5451" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 10]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1D22', borderColor: '#484A54', color: '#E1E2EC' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={outcomeType} 
                  stroke={outcomeType === 'YES' ? '#4AE176' : '#FF5451'} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill={outcomeType === 'YES' ? 'url(#colorYes)' : 'url(#colorNo)'} 
                />
              </AreaChart>
            </ResponsiveContainer>
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
            <span className="font-mono-sm text-on-surface">Total: {Number(market.total_invested || 0).toFixed(2)} 🪙</span>
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

        {/* Comments Section */}
        <MarketComments marketId={marketId} />
      </div>

      {/* Right Column: Order Panel & Discussion */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Order Panel */}
        <div className="bg-surface-container border border-outline-variant p-6 rounded flex flex-col gap-6 sticky top-24">
          
          <div className="flex justify-between items-center">
            <h2 className="font-h2 text-on-surface">Trade Shares</h2>
            <div className="flex bg-background border border-outline-variant rounded p-1">
              <button 
                onClick={() => setTradeMode('BUY')}
                className={`px-4 py-1 text-sm font-bold rounded-sm transition-all ${
                  tradeMode === 'BUY' ? 'bg-primary text-background' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >BUY</button>
              <button 
                onClick={() => setTradeMode('SELL')}
                className={`px-4 py-1 text-sm font-bold rounded-sm transition-all ${
                  tradeMode === 'SELL' ? 'bg-primary text-background' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >SELL</button>
            </div>
          </div>
          
          {/* Outcome Toggle */}
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
            <div className="flex justify-between items-end">
              <label className="font-label-caps text-on-surface-variant">AMOUNT OF SHARES</label>
              {user && (
                <div className="text-mono-sm text-outline flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                  Owned: <span className="font-bold text-on-surface">{holdingAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
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
              <span className="text-on-surface-variant">Avg. Price</span>
              <span className="text-on-surface">{(previewData?.avgPrice || currentPrice).toFixed(2)} 🪙</span>
            </div>
            {tradeMode === 'BUY' && (
              <>
                <div className="flex justify-between font-mono-sm">
                  <span className="text-on-surface-variant">Price Impact</span>
                  <span className={`font-medium ${previewData && previewData.priceImpact > 0.5 ? 'text-error' : 'text-secondary'}`}>
                    {previewData ? `+${previewData.priceImpact.toFixed(2)}` : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between font-mono-sm">
                  <span className="text-on-surface-variant">Potential Profit</span>
                  <span className="text-secondary font-bold">
                    🪙{previewData?.potentialProfit.toFixed(2)} ({previewData?.roi.toFixed(1)}%)
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between font-mono-md mt-2 pt-2 border-t border-outline-variant/30">
              <span className="text-on-surface-variant font-bold">{tradeMode === 'BUY' ? 'Total Cost' : 'Estimated Return'}</span>
              <span className="text-on-surface font-bold">
                {tradeMode === 'BUY' ? '-' : '+'}{effectiveTotalAmount.toFixed(2)} 🪙
              </span>
            </div>
          </div>

          {/* Messages */}
          {/* Expiration Message */}
          {market.status !== 'OPEN' && (
            <div className="p-4 bg-outline-variant/20 border border-outline-variant rounded flex items-center gap-3 text-on-surface-variant font-body-md">
              <span className="material-symbols-outlined">lock</span>
              This market is {market.status.toLowerCase()} and trading is disabled.
            </div>
          )}
          {market.status === 'OPEN' && new Date(market.end_date) < new Date() && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded flex items-center gap-3 text-warning font-body-md">
              <span className="material-symbols-outlined">timer_off</span>
              This market has expired and trading is disabled.
            </div>
          )}

          {tradeMessage && (
            <div className={`p-3 rounded font-body-sm ${tradeMessage.type === 'success' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
              {tradeMessage.text}
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={handleTrade}
            disabled={tradeLoading || market.status !== 'OPEN' || new Date(market.end_date) < new Date() || !user}
            className={`w-full py-4 font-h3 rounded transition-all disabled:opacity-50 disabled:grayscale ${
              outcomeType === 'YES' 
                ? 'bg-secondary text-surface hover:shadow-[0_0_16px_rgba(74,225,118,0.4)]' 
                : 'bg-error text-surface hover:shadow-[0_0_16px_rgba(255,84,81,0.4)]'
            }`}
          >
            {tradeLoading ? 'PROCESSING...' : 
              (market.status !== 'OPEN' || new Date(market.end_date) < new Date()) ? 'TRADING CLOSED' :
              `${tradeMode} ${sharesToBuy} ${outcomeType} SHARES — ${effectiveTotalAmount.toFixed(2)} 🪙`}
          </button>
          
          <div className="text-center font-mono-sm text-on-surface-variant">
            Your Balance: 🪙 {user?.balance?.toLocaleString() || '---'}
          </div>
        </div>
      </div>
    </div>
  );
}
