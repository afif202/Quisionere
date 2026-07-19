'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldAlert, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient();

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
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindcare_demo_mode', 'true');
      router.push('/admin/dashboard');
    }
  };

  return (
    <main className="flex-1 bg-white text-zinc-900 font-sans py-24 px-6 sm:px-8 flex flex-col justify-center min-h-screen max-w-md mx-auto w-full">
      
      {/* Header */}
      <div className="space-y-3 text-center mb-8">
        <h1 className="font-light tracking-tight text-4xl text-zinc-950">MindCare Admin.</h1>
        <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">Sistem Pemantauan Stres Mahasiswa</p>
      </div>

      {/* Login Box (Borders over Shadows) */}
      <div className="bg-white border border-zinc-200 p-8 space-y-6">
        <h2 className="text-xl font-normal text-zinc-900 tracking-tight">Masuk Portal</h2>
        
        {error && (
          <div className="border border-red-200 bg-red-50/50 text-red-700 p-4 text-xs font-mono flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-650 mt-0.5" />
            <div>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-mono text-zinc-500 uppercase">Email Admin</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@mindcare.com"
                className="pl-9 pr-4 py-3 w-full bg-white border border-zinc-200 focus:border-zinc-900 text-sm focus:outline-none transition duration-150 rounded-none text-zinc-850"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-mono text-zinc-500 uppercase">Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 pr-10 py-3 w-full bg-white border border-zinc-200 focus:border-zinc-900 text-sm focus:outline-none transition duration-150 rounded-none font-sans text-zinc-850"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-650 transition"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-medium py-3 rounded-none transition duration-150 flex items-center justify-center gap-2 text-sm tracking-wide"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Masuk Sekarang <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Bypass Option */}
        <div className="pt-6 border-t border-zinc-100 space-y-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Belum Setup Supabase Auth?</span>
          </div>
          <button
            onClick={handleDemoBypass}
            className="text-xs font-mono text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 bg-white border border-emerald-250 py-2.5 rounded-none transition duration-150 w-full"
          >
            Masuk Mode Demo (Tanpa Database)
          </button>
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center mt-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 text-xs font-mono transition">
          <ArrowLeft className="w-3.5 h-3.5" /> kembali ke skrining
        </Link>
      </div>

    </main>
  );
}
