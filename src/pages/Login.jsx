import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Coffee,
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Info
} from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, sessionNotice, clearSessionNotice } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillDemoCredentials = () => {
    setEmail('admin@beanbrew.com');
    setPassword('admin123');
    setError('');
    clearSessionNotice?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    clearSessionNotice?.();
    setLoading(true);

    try {
      const res = await authApi.adminLogin({
        email: email.trim().toLowerCase(),
        password
      });

      const user = res.data?.user;
      const token = res.data?.token;

      if (!token || !user) {
        throw new Error('Authentication failed: Missing session token.');
      }

      if (user.role !== 'admin') {
        throw new Error('Access denied: Administrator privileges required.');
      }

      login(token, user);
      setLocation('/');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to authenticate. Verify credentials & server status.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Cafe Ambiance Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ea8e47]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#b85c1f]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-[#ebdccd] rounded-3xl p-8 sm:p-10 shadow-xl shadow-[#2e241f]/5 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#b85c1f] to-[#ea8e47] text-white shadow-lg shadow-[#b85c1f]/25 mb-4">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#2e241f] tracking-tight">Bean & Brew</h1>
          <p className="text-xs text-[#786c65] mt-1.5 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#b85c1f]" />
            Kitchen & Operations Management Portal
          </p>
        </div>

        {/* Session Notice (e.g. session timeout) */}
        {sessionNotice && !error && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 shrink-0 text-amber-700" />
            <span>{sessionNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#786c65] mb-2">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89688]" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email..."
                className="w-full pl-10 pr-4 py-3 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-sm text-[#2e241f] placeholder-[#a89688] focus:outline-none focus:border-[#b85c1f] focus:ring-2 focus:ring-[#b85c1f]/20 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#786c65] mb-2">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89688]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-sm text-[#2e241f] placeholder-[#a89688] focus:outline-none focus:border-[#b85c1f] focus:ring-2 focus:ring-[#b85c1f]/20 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#786c65] hover:text-[#2e241f] cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Fill Helper */}
          <div className="bg-[#faf7f2] p-3 rounded-2xl border border-[#ebdccd] flex items-center justify-between text-xs">
            <span className="text-[#786c65] text-[11px]">Demo Credentials available</span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs font-bold text-[#b85c1f] hover:text-[#a35017] flex items-center gap-1 cursor-pointer transition hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Fill Demo</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#b85c1f] to-[#c76828] hover:from-[#a35017] hover:to-[#b85c1f] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#b85c1f]/25 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Access Staff Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#a89688] flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by Role-Based Access & Rate-Limiting</span>
        </div>
      </div>
    </div>
  );
}
