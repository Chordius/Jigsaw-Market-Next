'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      if (data.success && data.payload?.user) {
        await login(data.payload.user);
        router.push('/markets');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen -mt-16"> {/* Negative margin to offset navbar */}
      {/* Left Panel (40%) */}
      <div className="hidden lg:flex w-[40%] bg-surface-container-lowest flex-col justify-between p-12 relative overflow-hidden border-r border-outline-variant">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(172, 199, 255, 0.1) 0%, transparent 70%)' }}>
          {/* Using a placeholder for the abstract chart image */}
          <div className="w-full h-full bg-surface-container-lowest" />
        </div>
        <div className="z-10">
          <h1 className="font-h1 text-h1 text-on-surface tracking-tighter">Jigsaw</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-unit">Analytical Brutalism v1.0</p>
        </div>
        <div className="z-10">
          <p className="font-h3 text-h3 text-on-surface max-w-sm">Financial Intelligence at the Edge.</p>
          <p className="font-body-sm text-body-sm text-outline mt-unit*2 max-w-sm leading-relaxed">Execute trades with precision. Analyze sentiment in real-time. Dominate the market with unparalleled data density.</p>
        </div>
      </div>

      {/* Right Panel (60%) */}
      <div className="w-full lg:w-[60%] bg-surface flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="font-h1 text-h1 text-on-surface tracking-tighter">Jigsaw</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-h2 text-h2 text-on-surface">Welcome back</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">Log in to your Jigsaw account</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-error-container/20 border border-error-container rounded p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-error mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <p className="font-body-sm text-body-sm text-error">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Field */}
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2" htmlFor="email">Email</label>
              <input 
                className="w-full bg-background border border-outline-variant rounded px-4 py-3 font-mono-md text-mono-md text-on-surface focus:outline-none focus:border-primary form-input-glow transition-all" 
                id="email" 
                name="email" 
                placeholder="trader@jigsaw.io" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  className="w-full bg-background border border-outline-variant rounded px-4 py-3 font-mono-md text-mono-md text-on-surface focus:outline-none focus:border-primary form-input-glow transition-all" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-outline hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input className="form-checkbox bg-background border-outline-variant text-primary rounded-sm focus:ring-primary focus:ring-offset-background" type="checkbox" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full bg-primary text-on-primary font-body-md text-body-md font-bold py-3 px-4 rounded btn-primary-glow transition-all disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant"></div>
            <span className="font-mono-sm text-mono-sm text-outline">-- or --</span>
            <div className="flex-1 h-px bg-outline-variant"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 group" href="/register">
              Don't have an account? <span className="text-primary font-bold group-hover:underline">Sign up here</span>
              <span className="material-symbols-outlined text-sm text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
