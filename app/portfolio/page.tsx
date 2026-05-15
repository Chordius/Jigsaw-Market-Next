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

interface Payout {
  id: string;
  payout_amount: number;
  processed_at: string;
  market_title: string;
  resolved_outcome: string;
}

interface Order {
  id: string;
  order_type: 'BUY' | 'SELL';
  outcome_type: 'YES' | 'NO';
  shares_amount: number;
  price_at_order: number;
  total_cost: number;
  created_at: string;
  market_id: string;
  market_title: string;
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'positions' | 'wins' | 'history'>('positions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const [holdingsRes, payoutsRes, ordersRes] = await Promise.all([
          apiClient.get(`/holdings/${user.id}`),
          apiClient.get(`/users/${user.id}/payouts`),
          apiClient.get(`/users/${user.id}/orders`)
        ]);

        if (holdingsRes.data.success) {
          setHoldings(holdingsRes.data.payload);
        }
        if (payoutsRes.data.success) {
          setPayouts(payoutsRes.data.payload);
        }
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.payload);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          <h1 className="font-h1 text-h1 text-on-surface mb-2">Your Portfolio</h1>
          <p className="font-body-sm text-body-sm text-outline">Manage your active positions and track performance.</p>
        </div>
        <Link href="/markets" className="bg-primary-container text-on-primary-container font-body-sm text-body-sm font-bold py-2 px-4 rounded flex items-center gap-2 hover:bg-primary transition-colors shadow-[0_0_12px_rgba(80,143,248,0.2)]">
          <span className="material-symbols-outlined text-[18px]">search</span>
          Explore Markets
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-outline-variant p-[1px] rounded-lg">
        {/* Balance Card */}
        <div className="bg-surface p-6 rounded-t-lg md:rounded-l-lg md:rounded-tr-none flex flex-col justify-center">
          <span className="font-label-caps text-label-caps text-outline mb-2 uppercase">Available Balance</span>
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

      {/* Tab Switcher */}
      <div className="flex gap-1 border-b border-outline-variant">
        {(
          [
            { key: 'positions', label: 'Active Positions', icon: 'bar_chart', count: holdings.length },
            { key: 'wins',      label: 'Recent Wins',      icon: 'military_tech', count: payouts.length },
            { key: 'history',   label: 'Transaction History', icon: 'receipt_long', count: orders.length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface hover:border-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
              activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Active Positions Table */}
      {activeTab === 'positions' && (
      <div className="border border-outline-variant rounded-lg bg-surface overflow-hidden">
        <div className="bg-surface-container px-6 py-4 border-b border-outline-variant">
           <h3 className="font-h3 text-on-surface">Active Positions</h3>
        </div>
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
                <tr className="bg-surface-container-low border-b border-outline-variant">
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
                  <tr key={holding.holding_id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-body-md font-bold text-on-surface line-clamp-1 mb-1" title={holding.market_title}>
                          {holding.market_title}
                        </span>
                        <Link href={`/markets/${holding.market_id}`} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                          VIEW MARKET <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </Link>
                      </div>
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
                    <td className="p-4 text-right font-mono-md text-outline">🪙 {Number(holding.average_buy_price).toFixed(2)}</td>
                    <td className="p-4 text-right font-mono-md text-on-surface">🪙 {Number(holding.current_price).toFixed(2)}</td>
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
      )}

      {/* Recent Wins Table */}
      {activeTab === 'wins' && (
      <div className="mt-8 border border-outline-variant rounded-lg bg-surface overflow-hidden mb-12">
        <div className="bg-surface-container px-6 py-4 border-b border-outline-variant flex justify-between items-center">
           <h3 className="font-h3 text-on-surface">Recent Wins (Resolved Payouts)</h3>
           <div className="font-mono-sm text-secondary font-bold">
             Total Won: 🪙 {payouts.reduce((sum, p) => sum + Number(p.payout_amount), 0).toFixed(2)}
           </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">military_tech</span>
            <p>No resolved winnings yet. Keep predicting!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="p-4 font-label-caps text-outline font-bold">Market</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-center">Outcome</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-right">Settled Date</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-right">Payout Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4">
                      <span className="font-body-md font-bold text-on-surface line-clamp-1">{payout.market_title}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-label-caps bg-outline-variant/30 px-2 py-1 rounded text-on-surface text-xs">
                        {payout.resolved_outcome}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono-sm text-outline">
                      {new Date(payout.processed_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right font-mono-md font-bold text-secondary">
                      +🪙 {Number(payout.payout_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Transaction History Table */}
      {activeTab === 'history' && (
      <div className="border border-outline-variant rounded-lg bg-surface overflow-hidden mb-12">
        <div className="bg-surface-container px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-h3 text-on-surface">Transaction History</h3>
          <div className="font-mono-sm text-outline font-bold">
            {orders.length} total transactions
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">receipt_long</span>
            <p>No transactions yet. Buy your first shares!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="p-4 font-label-caps text-outline font-bold">Date</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-center">Type</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-center">Outcome</th>
                  <th className="p-4 font-label-caps text-outline font-bold">Market</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-right">Shares</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-right">Price / Share</th>
                  <th className="p-4 font-label-caps text-outline font-bold text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-mono-sm text-outline whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                      <div className="text-xs text-on-surface-variant">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block font-label-caps px-2 py-1 rounded ${
                        order.order_type === 'BUY'
                          ? 'bg-primary/10 border border-primary text-primary'
                          : 'bg-error/10 border border-error text-error'
                      }`}>
                        {order.order_type}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block font-label-caps px-2 py-1 rounded ${
                        order.outcome_type === 'YES'
                          ? 'bg-secondary/10 border border-secondary text-secondary'
                          : 'bg-error/10 border border-error text-error'
                      }`}>
                        {order.outcome_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link href={`/markets/${order.market_id}`} className="font-body-md text-on-surface line-clamp-1 hover:text-primary transition-colors" title={order.market_title}>
                        {order.market_title}
                      </Link>
                    </td>
                    <td className="p-4 text-right font-mono-md text-on-surface">{Number(order.shares_amount).toLocaleString()}</td>
                    <td className="p-4 text-right font-mono-sm text-outline">🪙 {Number(order.price_at_order).toFixed(4)}</td>
                    <td className={`p-4 text-right font-mono-md font-bold ${
                      order.order_type === 'BUY' ? 'text-error' : 'text-secondary'
                    }`}>
                      {order.order_type === 'BUY' ? '-' : '+'}🪙 {Number(order.total_cost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
