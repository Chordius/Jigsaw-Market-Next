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
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
              <h1 className="font-h1 text-h1 text-on-surface tracking-tighter">Jigsaw Terminal</h1>
            </div>
            <div className="space-y-4">
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Advanced predictive modeling for high-stakes decision making. Join the network of quantitative analysts and market makers.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex flex-col gap-1 border-l-2 border-outline-variant pl-4">
                  <span className="font-mono-md text-mono-md text-primary">System Status</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface-variant uppercase tracking-widest">Operational // V1.0.4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-background relative overflow-y-auto pt-24 pb-24">
          <div className="md:hidden absolute top-6 left-6 flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
            <span className="font-h3 text-h3 text-on-surface font-black tracking-tighter">Jigsaw</span>
          </div>

          <div className="w-full max-w-md mx-auto space-y-8 mt-12 md:mt-0">
            <div className="space-y-2">
              <h2 className="font-h2 text-h2 text-on-surface">Buat Akun Baru</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Mulai prediksi dalam 30 detik</p>
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

              <div className="flex items-start gap-3 pt-2">
                <div className="flex items-center h-5">
                  <input className="h-4 w-4 bg-surface border-outline-variant rounded-sm text-primary focus:ring-primary focus:ring-offset-background cursor-pointer" id="terms" name="terms" required type="checkbox" />
                </div>
                <div className="text-sm">
                  <label className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer" htmlFor="terms">
                    Saya setuju dengan <a className="text-primary hover:text-primary-fixed underline decoration-primary/30 underline-offset-4 transition-colors" href="#">Syarat & Ketentuan</a>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-DEFAULT shadow-sm font-h3 text-h3 text-on-primary bg-primary-container btn-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Membuat Akun...' : 'Buat Akun'}
                </button>
              </div>
            </form>

            <div className="text-center mt-8">
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1 group" href="/login">
                Sudah punya akun? Masuk
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center px-6">
            <p className="font-mono-sm text-mono-sm text-outline-variant">© 2024 Jigsaw Terminal. Strict Access Protocol.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
