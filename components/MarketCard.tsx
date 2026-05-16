import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export interface Market {
  id: string;
  title: string;
  category: string;
  end_date: string;
  status: string;
  description: string;
  resolved_outcome: string | null;
  investor_count: number;
  total_invested: number;
  price_yes: number;
  price_no: number;
  liquidity_yes: string;
  liquidity_no: string;
  created_at: string;
}

const categoryIcons: Record<string, string> = {
  crypto: 'currency_bitcoin',
  politics: 'policy',
  sports: 'sports_basketball',
  tech: 'memory',
  entertainment: 'movie',
  academics: 'school',
  economy: 'monitoring',
  others: 'category'
};

export default function MarketCard({ market }: { market: Market }) {
  const icon = categoryIcons[market.category?.toLowerCase()] || 'category';
  const yesProb = Number(market.price_yes) || 5;
  const noProb = Number(market.price_no) || 5;
  const { user } = useAuth();
  const router = useRouter();

  const handleTradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
    } else {
      router.push(`/markets/${market.id}`);
    }
  };

  return (
    <div className="group relative bg-surface border border-outline-variant p-4 rounded-lg flex flex-col gap-4 overflow-hidden transition-all hover:border-outline h-full">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-outline text-[16px]">{icon}</span>
          <span className="font-label-caps text-label-caps text-outline uppercase">{market.category}</span>
        </div>
        <div className="font-mono-sm text-mono-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-sm border border-secondary/20">
          {market.status}
        </div>
      </div>
      
      <h3 className="font-h3 text-h3 text-on-surface leading-tight line-clamp-2" title={market.title}>
        {market.title}
      </h3>
      
      <div className="mt-auto pt-4 flex flex-col gap-2">
        <div className="flex justify-between font-mono-md text-mono-md">
          <span className="text-secondary">YES {yesProb.toFixed(2)} 🪙</span>
          <span className="text-error">NO {noProb.toFixed(2)} 🪙</span>
        </div>
        
        {/* Probability Bar */}
        <div className="h-1.5 w-full bg-outline-variant rounded-full overflow-hidden flex">
          <div className="h-full bg-secondary" style={{ width: `${(yesProb / 10) * 100}%` }}></div>
          <div className="h-full bg-error" style={{ width: `${(noProb / 10) * 100}%` }}></div>
        </div>
        
        <div className="flex justify-between text-mono-sm text-outline-variant mt-1">
          <span>{Number(market.total_invested || 0).toFixed(2)} 🪙</span>
          <span>Ends: {new Date(market.end_date).toISOString().split('T')[0]}</span>
        </div>
      </div>
      
      {/* Hover Actions Overlay */}
      <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button onClick={handleTradeClick} className="bg-primary text-background font-h3 text-h3 px-6 py-2 rounded bloom-green transition-all shadow-[0_0_15px_rgba(172,199,255,0.2)]">
          TRADE NOW
        </button>
      </div>
    </div>
  );
}
