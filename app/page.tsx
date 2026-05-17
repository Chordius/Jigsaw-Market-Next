import Link from "next/link";

interface TrendingMarket {
  id: string;
  title: string;
  category: string;
  price_yes: number;
  price_no: number;
  investor_count: number;
  total_invested: number;
  end_date: string;
}

async function getTrendingMarkets(): Promise<TrendingMarket[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const res = await fetch(
      `${baseUrl}/markets?status=OPEN&sortBy=popularity&order=desc`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.payload.slice(0, 3) : [];
  } catch {
    return [];
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default async function LandingPage() {
  const trendingMarkets = await getTrendingMarkets();
  return (
    <>
      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column */}
        <div className="col-span-1 lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container-high border border-outline-variant text-label-caps text-primary">
            <span className="material-symbols-outlined text-[16px]">online_prediction</span>
            Prediction Markets
          </div>
          <h1 className="text-h1 font-h1 text-on-surface">Predict the Future.<br />Win the Present.</h1>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-lg">
            Trade on the outcome of global events. Leverage your knowledge to build a portfolio of accurate predictions.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link href="/register" className="bg-primary text-background font-body-md font-bold px-6 py-3 rounded bloom-green transition-all flex items-center gap-2">
              Get Started
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
            <Link href="/markets" className="bg-transparent border border-outline text-on-surface-variant font-body-md font-bold px-6 py-3 rounded hover:border-primary hover:text-primary transition-all">
              View Markets
            </Link>
          </div>
          <p className="text-body-sm font-body-sm text-outline pt-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Free. Uses virtual Jigsaw Coins. No real money involved.
          </p>
        </div>

        {/* Right Column (Top Market Card — Live Data) */}
        <div className="col-span-1 lg:col-span-6 flex justify-center lg:justify-end">
          {trendingMarkets[0] ? (() => {
            const top = trendingMarkets[0];
            const yesPercent = Math.round(top.price_yes * 10);
            const noPercent = 100 - yesPercent;
            const daysLeft = Math.ceil(
              (new Date(top.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div className="bg-surface border border-outline-variant rounded-lg p-6 w-full max-w-md shadow-2xl relative transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Subtle Glow Behind */}
                <div className="absolute -inset-4 bg-primary/10 blur-2xl -z-10 rounded-full opacity-50"></div>
                {/* Header */}
                <div className="flex justify-between items-start mb-4 gap-3">
                  <h3 className="text-h3 font-h3 text-on-surface leading-tight line-clamp-2">{top.title}</h3>
                  <span className="text-label-caps font-label-caps text-outline bg-surface-container px-2 py-0.5 rounded shrink-0">{top.category}</span>
                </div>
                {/* Prices */}
                <div className="flex justify-between items-end mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-mono-lg font-mono-lg text-secondary">{yesPercent}¢</span>
                    <span className="text-label-caps font-label-caps text-secondary">YES</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-mono-lg font-mono-lg text-tertiary-container">{noPercent}¢</span>
                    <span className="text-label-caps font-label-caps text-tertiary-container">NO</span>
                  </div>
                </div>
                {/* Probability Bar */}
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mb-6 flex">
                  <div className="h-full bg-secondary" style={{ width: `${yesPercent}%` }}></div>
                  <div className="h-full bg-tertiary-container" style={{ width: `${noPercent}%` }}></div>
                </div>
                {/* Stats */}
                <div className="flex justify-between text-mono-sm font-mono-sm text-on-surface-variant mb-6 pb-4 border-b border-outline-variant">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    {top.investor_count} investors
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">toll</span>
                    {formatNumber(top.total_invested)} 🪙
                  </div>
                  {daysLeft > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {daysLeft}d left
                    </div>
                  )}
                </div>
                {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Link href={`/markets/${top.id}`} className="bg-surface-container-high border border-outline-variant text-secondary font-mono-md py-3 rounded bloom-green hover:bg-secondary/10 transition-colors text-center">BUY YES</Link>
                  <Link href={`/markets/${top.id}`} className="bg-surface-container-high border border-outline-variant text-tertiary-container font-mono-md py-3 rounded bloom-red hover:bg-tertiary-container/10 transition-colors text-center">BUY NO</Link>
                </div>
              </div>
            );
          })() : (
            /* Fallback: no markets yet */
            <div className="bg-surface border border-outline-variant rounded-lg p-6 w-full max-w-md shadow-2xl relative transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="absolute -inset-4 bg-primary/10 blur-2xl -z-10 rounded-full opacity-50"></div>
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-outline">bar_chart</span>
                <p className="font-body-sm text-center">No open markets yet.<br />Be the first to create one!</p>
                <Link href="/markets" className="text-primary font-bold text-sm hover:underline">Go to Markets →</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="border-t border-outline-variant bg-surface-container-lowest">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-h2 text-on-surface mb-4">How it Works</h2>
            <p className="text-body-md font-body-md text-on-surface-variant">Simple mechanics. Complex strategies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-surface border border-outline-variant p-8 rounded-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">search</span>
              </div>
              <div className="w-12 h-12 bg-surface-container-highest rounded flex items-center justify-center mb-6">
                <span className="text-mono-lg font-mono-lg text-primary">01</span>
              </div>
              <h3 className="text-h3 font-h3 text-on-surface mb-2">Select a Market</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Browse thousands of global events across politics, sports, entertainment, technology, and more.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-surface border border-outline-variant p-8 rounded-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">shopping_cart</span>
              </div>
              <div className="w-12 h-12 bg-surface-container-highest rounded flex items-center justify-center mb-6">
                <span className="text-mono-lg font-mono-lg text-primary">02</span>
              </div>
              <h3 className="text-h3 font-h3 text-on-surface mb-2">Buy Shares</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Purchase YES or NO shares based on your analysis. Prices reflect market probability.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-surface border border-outline-variant p-8 rounded-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">monitoring</span>
              </div>
              <div className="w-12 h-12 bg-surface-container-highest rounded flex items-center justify-center mb-6">
                <span className="text-mono-lg font-mono-lg text-primary">03</span>
              </div>
              <h3 className="text-h3 font-h3 text-on-surface mb-2">Track Price Movements</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Watch the market react to news in real-time. Sell early for profit or hold to resolution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-b border-outline-variant bg-surface py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-outline-variant text-center">
            <div className="flex flex-col items-center">
              <span className="text-h1 font-h1 text-primary-fixed mb-2">10k</span>
              <span className="text-label-caps font-label-caps text-on-surface-variant">USERS</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-h1 font-h1 text-primary-fixed mb-2">350+</span>
              <span className="text-label-caps font-label-caps text-on-surface-variant">MARKETS</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-h1 font-h1 text-primary-fixed mb-2">2.4M</span>
              <span className="text-label-caps font-label-caps text-on-surface-variant">TRADED</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-h1 font-h1 text-primary-fixed mb-2">98%</span>
              <span className="text-label-caps font-label-caps text-on-surface-variant">UPTIME</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="border-t border-outline-variant bg-surface-container-lowest">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-24">
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface-container-high border border-outline-variant text-label-caps text-primary mb-4">
              <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              Live Markets
            </div>
            <h2 className="text-h2 font-h2 text-on-surface">Trending Now</h2>
            <Link
              href="/markets?sort=popularity"
              className="hidden md:flex items-center justify-end gap-2 text-primary font-body-sm font-bold hover:underline absolute right-0 bottom-0"
            >
              View All Markets
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {trendingMarkets.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-outline-variant rounded-lg text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
              <p>No open markets yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingMarkets.map((market, index) => {
                const rankColors = ['text-[#FACC15]', 'text-[#94A3B8]', 'text-[#C4733B]'];
                const yesPercent = Math.round(market.price_yes * 10);
                const noPercent = 100 - yesPercent;
                const daysLeft = Math.ceil(
                  (new Date(market.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <Link
                    key={market.id}
                    href={`/markets/${market.id}`}
                    className="group bg-surface border border-outline-variant rounded-lg p-5 flex flex-col gap-4 hover:border-primary transition-all duration-200 hover:shadow-[0_0_20px_rgba(80,143,248,0.1)] relative overflow-hidden"
                  >
                    {/* Rank Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono-lg font-bold ${rankColors[index]}`}>#{index + 1}</span>
                        <span className="text-label-caps font-label-caps text-outline bg-surface-container px-2 py-0.5 rounded">
                          {market.category}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors">open_in_new</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-h3 text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {market.title}
                    </h3>

                    {/* Probability Bar */}
                    <div>
                      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden flex mb-1.5">
                        <div className="h-full bg-secondary transition-all" style={{ width: `${yesPercent}%` }} />
                        <div className="h-full bg-tertiary-container" style={{ width: `${noPercent}%` }} />
                      </div>
                      <div className="flex justify-between text-mono-sm font-mono-sm">
                        <span className="text-secondary">YES {yesPercent}%</span>
                        <span className="text-tertiary-container">NO {noPercent}%</span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-mono-sm font-mono-sm text-outline pt-2 border-t border-outline-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">group</span>
                        {market.investor_count} investors
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">toll</span>
                        {formatNumber(market.total_invested)} 🪙
                      </span>
                      {daysLeft > 0 && (
                        <span className="ml-auto flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {daysLeft}d
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-6 md:hidden text-center">
            <Link href="/markets?sort=popularity" className="text-primary font-body-sm font-bold hover:underline inline-flex items-center gap-1">
              View All Markets <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-32 text-center flex flex-col items-center">
        <h2 className="text-h1 font-h1 text-on-surface mb-8 max-w-2xl">Ready to make your first prediction?</h2>
        <Link href="/register" className="bg-primary text-background font-body-md font-bold px-8 py-4 rounded-lg bloom-green transition-all shadow-[0_0_20px_rgba(172,199,255,0.2)] hover:shadow-[0_0_30px_rgba(172,199,255,0.4)]">
          Register Now — It's Free
        </Link>
      </section>
    </>
  );
}
