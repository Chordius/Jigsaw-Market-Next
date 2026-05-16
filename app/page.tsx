import Link from "next/link";

export default function LandingPage() {
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

        {/* Right Column (Market Card Mockup) */}
        <div className="col-span-1 lg:col-span-6 flex justify-center lg:justify-end">
          <div className="bg-surface border border-outline-variant rounded-lg p-6 w-full max-w-md shadow-2xl relative transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
            {/* Subtle Glow Behind */}
            <div className="absolute -inset-4 bg-primary/10 blur-2xl -z-10 rounded-full opacity-50"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-h3 font-h3 text-on-surface leading-tight">Will the Fed cut rates before Q3 2025?</h3>
              <span className="material-symbols-outlined text-outline">account_balance</span>
            </div>
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-mono-lg font-mono-lg text-secondary">67¢</span>
                <span className="text-label-caps font-label-caps text-secondary">YES</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-mono-lg font-mono-lg text-tertiary-container">33¢</span>
                <span className="text-label-caps font-label-caps text-tertiary-container">NO</span>
              </div>
            </div>
            {/* Probability Bar */}
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mb-6 flex">
              <div className="h-full bg-secondary" style={{ width: '67%' }}></div>
              <div className="h-full bg-tertiary-container" style={{ width: '33%' }}></div>
            </div>
            <div className="flex justify-between text-mono-sm font-mono-sm text-on-surface-variant mb-6 pb-4 border-b border-outline-variant">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">bar_chart</span>
                124,500 🪙
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                14 days
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/markets" className="bg-surface-container-high border border-outline-variant text-secondary font-mono-md py-3 rounded bloom-green hover:bg-secondary/10 transition-colors text-center">BUY YES</Link>
              <Link href="/markets" className="bg-surface-container-high border border-outline-variant text-tertiary-container font-mono-md py-3 rounded bloom-red hover:bg-tertiary-container/10 transition-colors text-center">BUY NO</Link>
            </div>
          </div>
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
              <p className="text-body-sm font-body-sm text-on-surface-variant">Browse thousands of global events across politics, sports, crypto, and technology.</p>
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
