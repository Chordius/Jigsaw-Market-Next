'use client';

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="w-full h-16 px-6 flex justify-between items-center border-b border-outline-variant bg-surface glass-panel sticky top-0 z-50">
      <Link href={user ? "/markets" : "/"} className="flex items-center gap-2 text-xl font-h1 text-on-surface tracking-tighter">
        <img src="/puzzle.png" alt="Jigsaw Market" className="w-7 h-7" style={{ filter: 'brightness(0) saturate(100%) invert(74%) sepia(60%) saturate(500%) hue-rotate(180deg) brightness(110%)' }} />
        Jigsaw Market
      </Link>
      <div className="flex items-center gap-4">
        {!loading && user ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded text-sm font-mono-md">
              <span className="text-on-surface font-bold truncate max-w-[100px]">{user.username}</span>
              <span className="material-symbols-outlined text-[16px] text-primary ml-1">account_balance_wallet</span>
              <span className="text-on-surface">{user.balance?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '')} 🪙</span>
            </div>
            <Link href="/markets" className="text-label-caps text-on-surface-variant hover:text-primary transition-colors">
              MARKETS
            </Link>
            <Link href="/portfolio" className="text-label-caps text-on-surface-variant hover:text-primary transition-colors">
              PORTFOLIO
            </Link>
            <Link href="/leaderboard" className="text-label-caps text-on-surface-variant hover:text-primary transition-colors">
              LEADERBOARD
            </Link>
            <button onClick={logout} className="text-label-caps text-error hover:text-error/80 transition-colors">
              LOGOUT
            </button>
          </>
        ) : !loading && !user ? (
          <Link href="/login" className="text-label-caps text-on-surface-variant hover:text-primary transition-colors">
            LOGIN
          </Link>
        ) : null}
      </div>
    </header>
  );
}
