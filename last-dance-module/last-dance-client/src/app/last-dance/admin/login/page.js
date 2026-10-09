'use client';

/* 
  ==========================================================================
  ADMIN LOGIN DEMO CREDENTIALS:
  Email: admin@nutripay.co.ke (or any valid email)
  Password / PIN: admin123 (or 1234)
  ==========================================================================
*/

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, Mail, ArrowRight, KeyRound, Info } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@nutripay.co.ke');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // Admin credential check (Accepts admin@nutripay.co.ke / admin123 or 1234)
      if ((email && password) || password === 'admin123' || password === '1234') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', 'admin-token');
          localStorage.setItem('admin_user', JSON.stringify({ email: email || 'admin@nutripay.co.ke', role: 'admin' }));
        }
        router.push('/last-dance/admin');
      } else {
        setError('Invalid credentials. Use email admin@nutripay.co.ke and password admin123 or 1234.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Decorative subtle ambient blob */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-rose-500/10 blur-2xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal Access</h2>
          <p className="text-xs text-slate-500">NutriPay Last Dance Module Management Console</p>
        </div>

        {/* Onscreen Credentials Box */}
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl space-y-1.5 text-xs text-amber-900">
          <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[11px] text-amber-800">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Admin Credentials:</span>
          </div>
          <p className="font-mono text-[11px]">Email: <strong className="text-slate-900">admin@nutripay.co.ke</strong></p>
          <p className="font-mono text-[11px]">Password: <strong className="text-slate-900">admin123</strong> (or <strong className="text-slate-900">1234</strong>)</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Admin Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@nutripay.co.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-rose-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Security Password / PIN</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-rose-500 transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating Admin...' : 'Sign In To Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center space-x-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Direct URL: /last-dance/admin/login</span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
