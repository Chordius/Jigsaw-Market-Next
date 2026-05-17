'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

interface LeaderboardUser {
  rank: number;
  local_user_id: string;
  username: string;
  total_trades: number;
  total_buy_cost: number;
  total_sell_value: number;
  net_trade_cashflow: number;
  current_position_value: number;
  total_paid_payouts: number;
  total_surplus: number;
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await apiClient.get('/users/leaderboard?limit=100');
        if (data.success) {
          setUsers(data.payload);
        } else {
          setError(data.message);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const currentUsers = users.slice(startIndex, endIndex);

  const showPodium = currentPage === 1;
  const top3 = showPodium ? users.slice(0, 3) : [];
  
  const tableUsers = showPodium ? currentUsers.slice(3) : currentUsers;

  return (
    <div className="flex-1 p-4 md:p-8 w-full max-w-[1440px] mx-auto flex flex-col min-h-screen">
      <header className="mb-12">
        <h1 className="font-h1 text-h1 text-on-surface mb-2">Global Leaderboard</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Top predictors by total surplus</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-error-container/20 border border-error-container p-4 rounded text-error flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      ) : (
        <>
          {/* Podium Section */}
          {top3.length > 0 && (
            <section className="mb-16">
              <div className="flex flex-row justify-center items-end gap-1 md:gap-4 h-[300px] max-w-3xl mx-auto">
                {/* Rank 2 */}
                {top3[1] && (
                  <div className="flex flex-col items-center w-1/3 relative">
                    <div className="mb-4 flex flex-col items-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-outline-variant overflow-hidden mb-2 relative flex items-center justify-center bg-surface-variant text-on-surface text-xl">
                        {top3[1].username.charAt(0).toUpperCase()}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-variant border border-outline-variant rounded-full flex items-center justify-center font-mono-sm text-on-surface font-bold">2</div>
                      </div>
                      <span className="font-body-md text-on-surface font-bold truncate w-full text-center">{top3[1].username}</span>
                      <span className="font-mono-md text-secondary mt-1">{top3[1].total_surplus?.toLocaleString(undefined, { maximumFractionDigits: 0 })} 🪙</span>
                    </div>
                    <div className="w-full bg-surface-container-high border-t border-l border-r border-outline-variant h-[120px] rounded-t-lg flex justify-center items-start pt-4 relative overflow-hidden">
                      <span className="font-mono-lg text-outline font-bold opacity-50 relative z-10">02</span>
                    </div>
                  </div>
                )}
                
                {/* Rank 1 */}
                {top3[0] && (
                  <div className="flex flex-col items-center w-1/3 relative z-10">
                    <div className="mb-4 flex flex-col items-center relative">
                      <div className="absolute -top-10 text-primary animate-pulse">
                        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                      </div>
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary glow-active overflow-hidden mb-2 relative flex items-center justify-center bg-surface-variant text-on-surface text-2xl">
                        {top3[0].username.charAt(0).toUpperCase()}
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary border border-surface rounded-full flex items-center justify-center font-mono-sm text-on-primary font-bold">1</div>
                      </div>
                      <span className="font-body-md text-on-surface font-bold truncate w-full text-center">{top3[0].username}</span>
                      <span className="font-mono-lg text-primary mt-1 font-bold">{top3[0].total_surplus?.toLocaleString(undefined, { maximumFractionDigits: 0 })} 🪙</span>
                    </div>
                    <div className="w-full bg-surface-container-highest border-t border-l border-r border-primary h-[160px] rounded-t-lg flex justify-center items-start pt-4 relative overflow-hidden shadow-[0_-4px_24px_-4px_rgba(172,199,255,0.15)]">
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-primary/10"></div>
                      <span className="font-mono-lg text-primary font-bold opacity-80 relative z-10">01</span>
                    </div>
                  </div>
                )}

                {/* Rank 3 */}
                {top3[2] && (
                  <div className="flex flex-col items-center w-1/3 relative">
                    <div className="mb-4 flex flex-col items-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-outline-variant overflow-hidden mb-2 relative flex items-center justify-center bg-surface-variant text-on-surface text-xl">
                        {top3[2].username.charAt(0).toUpperCase()}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-variant border border-outline-variant rounded-full flex items-center justify-center font-mono-sm text-on-surface font-bold">3</div>
                      </div>
                      <span className="font-body-md text-on-surface font-bold truncate w-full text-center">{top3[2].username}</span>
                      <span className="font-mono-md text-secondary mt-1">{top3[2].total_surplus?.toLocaleString(undefined, { maximumFractionDigits: 0 })} 🪙</span>
                    </div>
                    <div className="w-full bg-surface-container-high border-t border-l border-r border-outline-variant h-[100px] rounded-t-lg flex justify-center items-start pt-4 relative overflow-hidden">
                      <span className="font-mono-lg text-outline font-bold opacity-50 relative z-10">03</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Ranking Table */}
          <section className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="font-label-caps text-on-surface-variant px-6 py-4 w-20 text-center tracking-widest">Rank</th>
                    <th className="font-label-caps text-on-surface-variant px-6 py-4 tracking-widest">Predictor</th>
                    <th className="font-label-caps text-on-surface-variant px-6 py-4 text-right tracking-widest">Total Surplus</th>
                    <th className="font-label-caps text-on-surface-variant px-6 py-4 text-right tracking-widest hidden md:table-cell">Total Trades</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {tableUsers.map((u) => {
                    const isCurrentUser = currentUser && currentUser.id === u.local_user_id;
                    return (
                      <tr 
                        key={u.local_user_id} 
                        className={`${isCurrentUser ? 'bg-surface-container border-l-2 border-primary' : 'hover:bg-surface-container-low'} transition-colors group cursor-default`}
                      >
                        <td className="px-6 py-4">
                          <div className={`font-mono-md text-center ${isCurrentUser ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                            {u.rank < 10 ? `0${u.rank}` : u.rank}
                          </div>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center text-on-surface-variant font-body-sm uppercase">
                            {u.username.charAt(0)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-body-md transition-colors ${isCurrentUser ? 'text-primary font-bold' : 'text-on-surface group-hover:text-primary'}`}>
                              {u.username}
                            </span>
                            {isCurrentUser && (
                              <span className="bg-primary/20 text-primary font-label-caps text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Current
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono-md text-secondary font-bold">
                            {u.total_surplus?.toLocaleString(undefined, { maximumFractionDigits: 0 })} 🪙
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          <span className="font-mono-md text-on-surface">
                            {u.total_trades}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {tableUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
                        No predictors found for this page.
                      </td>
                    </tr>
                  )}

                  {currentUser && !users.find(u => u.local_user_id === currentUser.id) && users.length > 0 && (
                    <>
                      <tr>
                        <td className="px-6 py-2 bg-surface-container-lowest/50 text-center" colSpan={4}>
                          <span className="material-symbols-outlined text-outline-variant text-[16px]">more_vert</span>
                        </td>
                      </tr>
                      <tr className="bg-surface-container border-l-2 border-primary transition-colors cursor-default">
                        <td className="px-6 py-4">
                          <div className="font-mono-md text-primary font-bold text-center">-</div>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center text-on-surface-variant font-body-sm uppercase">
                            {currentUser.username.charAt(0)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-body-md text-primary font-bold">{currentUser.username}</span>
                            <span className="bg-primary/20 text-primary font-label-caps text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">Current</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono-md text-secondary font-bold">
                            {currentUser.balance?.toLocaleString(undefined, { maximumFractionDigits: 0 })} 🪙
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden md:table-cell">
                          <span className="font-mono-md text-on-surface">-</span>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-outline-variant bg-surface-container-low">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-surface border border-outline-variant rounded font-body-sm text-on-surface disabled:opacity-50 hover:bg-surface-variant transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  Previous
                </button>
                <div className="font-mono-sm text-outline">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 bg-surface border border-outline-variant rounded font-body-sm text-on-surface disabled:opacity-50 hover:bg-surface-variant transition-colors flex items-center gap-2"
                >
                  Next
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
