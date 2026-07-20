'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!username || !password) {
      setError('Username/Email dan kata sandi wajib diisi');
      setLoading(false);
      return;
    }

    // Authenticate directly against hardcoded credentials
    const cleanUsername = username.trim().toLowerCase();
    if ((cleanUsername === 'admin' || cleanUsername === 'admin@mindcare.com') && password === 'admin123') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mindcare_admin_auth', 'true');
      }
      setTimeout(() => {
        router.push('/admin/dashboard');
        setLoading(false);
      }, 500);
    } else {
      setTimeout(() => {
        setError('Login gagal. Periksa kembali username/email dan kata sandi Anda.');
        setLoading(false);
      }, 500);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col items-center justify-center p-6 sm:p-8 w-full">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="space-y-3 text-center">
          <h1 className="font-light tracking-tight text-4xl text-zinc-955">MindCare Admin.</h1>
          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Sistem Pemantauan Stres Mahasiswa</p>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-zinc-200 p-8 space-y-6">
          <h2 className="text-xl font-normal text-zinc-900 tracking-tight">Masuk Portal</h2>
          
          {error && (
            <div className="border border-red-200 bg-red-50/50 text-red-707 p-4 text-xs font-mono flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-650 mt-0.5" />
              <div>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-mono text-zinc-500 uppercase">Username / Email Admin</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-650 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-medium py-3 rounded-none transition duration-150 flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
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

        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 text-xs font-mono transition">
            <ArrowLeft className="w-3.5 h-3.5" /> kembali ke skrining
          </Link>
        </div>

      </div>
    </main>
  );
}
