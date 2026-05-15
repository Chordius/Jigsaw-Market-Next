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
      <div className="hidden lg:flex w-[40%] bg-surface-container-lowest border-r border-outline-variant relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBeGG4cWb0WWg8tvMEE8sXQZGPw1879Dv8O7Qb53bfCijaHJeYVUutw-T8A8oh9_ARXtZ1eCpx_8rJZ9YXZ1AmypCZmcXuG2u6zIfbfpXv9YqQehJPHRlMwMY9pTdTta0pa9oo7x79ysZnqiz_EvcGfrhTtwPuiI7MW36dnUbNQU4DvoPWeG7d_CCT9CNlHaMoE7Ecq_4S_UMfIBTVUjkejzQo6y2yvNj4wwiR7v1k4wKa8nOl6ZsPhAnkOQKetclXQKmSDtrFCj1rJ')" }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50"></div>
        
        <div className="relative z-10 max-w-lg w-full flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <img src="/puzzle.png" alt="Jigsaw Market" className="w-10 h-10" style={{ filter: 'brightness(0) saturate(100%) invert(74%) sepia(60%) saturate(500%) hue-rotate(180deg) brightness(110%)' }} />
            <h1 className="font-h1 text-h1 text-on-surface tracking-tighter">Jigsaw Market</h1>
          </div>
        </div>
      </div>

      {/* Right Panel (60%) */}
      <div className="w-full lg:w-[60%] bg-surface flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="font-h1 text-h1 text-on-surface tracking-tighter">Jigsaw Market</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-h2 text-h2 text-on-surface">Welcome back</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">Log in to your Jigsaw Market account</p>
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
