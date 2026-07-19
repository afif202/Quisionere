'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
import { Heart, Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldAlert, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Email dan kata sandi wajib diisi');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data?.user) {
        // Successfully logged in
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(
        err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    // Save a token in localStorage to indicate demo mode session
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindcare_demo_mode', 'true');
      router.push('/admin/dashboard');
    }
  };

  return (
    <main className="flex-1 bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center min-h-screen">
      <div className="max-w-md mx-auto w-full">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-teal-600 text-white p-3 rounded-2xl shadow-lg shadow-teal-600/10 mb-3">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="font-extrabold text-2xl text-slate-800">Portal Admin MindCare</h1>
          <p className="text-sm text-slate-500 mt-1">Sistem Pemantauan Stres Mahasiswa</p>
        </div>

        {/* Login Box */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Masuk ke Dashboard</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-start gap-2.5 mb-5 font-medium">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Admin</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@mindcare.com"
                  className="pl-11 pr-4 py-3.5 w-full bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 py-3.5 w-full bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/10"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Masuk Sekarang <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Bypass / Testing Options */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-3">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Belum melakukan setup Supabase Auth?</span>
            </div>
            <button
              onClick={handleDemoBypass}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 hover:bg-teal-50/50 bg-white px-4 py-2.5 rounded-xl transition duration-200 shadow-sm w-full"
            >
              Masuk Mode Demo (Tanpa Database)
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kuesioner Mahasiswa
          </Link>
        </div>

      </div>
    </main>
  );
}
