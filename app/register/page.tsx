'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data } = await apiClient.post('/auth/register', { username, email, password });
      if (data.success && data.payload?.user) {
        await login(data.payload.user);
        router.push('/markets');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen -mt-16"> {/* Negative margin to offset navbar */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh+4rem)] overflow-hidden w-full">
        <div className="hidden md:flex md:w-1/2 bg-surface-container-lowest border-r border-outline-variant relative items-center justify-center p-12">
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

        <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-background relative overflow-y-auto pt-24 pb-24">
          <div className="md:hidden absolute top-6 left-6 flex items-center gap-2 mb-8">
            <img src="/puzzle.png" alt="Jigsaw Market" className="w-6 h-6" style={{ filter: 'brightness(0) saturate(100%) invert(74%) sepia(60%) saturate(500%) hue-rotate(180deg) brightness(110%)' }} />
            <span className="font-h3 text-h3 text-on-surface font-black tracking-tighter">Jigsaw Market</span>
          </div>

          <div className="w-full max-w-md mx-auto space-y-8 mt-12 md:mt-0">
            <div className="space-y-2">
              <h2 className="font-h2 text-h2 text-on-surface">Create New Account</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Start predicting in 30 seconds</p>
            </div>

            {error && (
              <div className="mb-6 bg-error-container/20 border border-error-container rounded p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-error mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <p className="font-body-sm text-body-sm text-error">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="space-y-1.5 group input-glow">
                <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="username">USERNAME</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-lg">person</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-outline-variant rounded-DEFAULT text-on-surface font-mono-md text-mono-md placeholder-outline focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
                    id="username" 
                    maxLength={20} 
                    minLength={3} 
                    name="username" 
                    placeholder="Trader_01" 
                    required 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 group input-glow">
                <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="email">EMAIL ADDRESS</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-lg">mail</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-outline-variant rounded-DEFAULT text-on-surface font-mono-md text-mono-md placeholder-outline focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
                    id="email" 
                    name="email" 
                    placeholder="analyst@domain.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 group input-glow">
                <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="password">PASSWORD</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-lg">lock</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-10 py-2.5 bg-surface border border-outline-variant rounded-DEFAULT text-on-surface font-mono-md text-mono-md placeholder-outline focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button 
                      className="text-outline hover:text-on-surface transition-colors focus:outline-none" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 group input-glow">
                <label className="block font-label-caps text-label-caps text-on-surface-variant" htmlFor="confirm_password">CONFIRM PASSWORD</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-lg">lock</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-10 py-2.5 bg-surface border border-outline-variant rounded-DEFAULT text-on-surface font-mono-md text-mono-md placeholder-outline focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
                    id="confirm_password" 
                    name="confirm_password" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-DEFAULT shadow-sm font-h3 text-h3 text-on-primary bg-primary-container btn-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="text-center mt-8">
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1 group" href="/login">
                Already have an account? Sign in
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center px-6">
            <p className="font-mono-sm text-mono-sm text-outline-variant">© 2024 Jigsaw Market. Strict Access Protocol.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
