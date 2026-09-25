import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, EyeOff, Lock, User, CheckCircle2, AlertCircle, Globe, MapPin, Layers, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('officer');
  const [password, setPassword] = useState('officer123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  const handleQuickSelect = (role: 'admin' | 'officer' | 'citizen') => {
    setErrorMsg(null);
    setShakeError(false);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'officer') {
      setUsername('officer');
      setPassword('officer123');
    } else {
      setUsername('citizen');
      setPassword('user123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setShakeError(false);
    try {
      const data = await api.login({ username, password });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.access_token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please check password.');
      setShakeError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row select-none relative overflow-hidden">
      
      {/* LEFT SIDE: Animated Drifting Map Grid & Branding Showcase */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950 border-r border-slate-800 flex-col justify-between p-12 overflow-hidden">
        {/* Drifting Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-15 animate-drift-grid pointer-events-none" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Bhoomi Setu Logo"
              className="w-10 h-10 rounded-xl object-contain bg-slate-900 p-1 shadow-xl border border-emerald-500/40"
              onError={(e: any) => { e.target.src = `${import.meta.env.BASE_URL}logo.svg`; }}
            />
            <span className="font-black text-lg tracking-tight text-white">BHOOMI SETU</span>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> SIH26019 National Platform
          </span>
        </div>

        {/* Hero Narrative Showcase */}
        <div className="relative z-10 max-w-xl space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>33 Chhattisgarh Districts • Cadastral GIS Layer</span>
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
            AI-Powered Geospatial Intelligence for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">Land Acquisition & Governance</span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Unified digital evidence framework for Land Acquisition Officers (LAO), Tehsildars, and Citizens. Real-time satellite imagery, on-demand Voronoi cadastral parcels, forest impact monitoring, and highway acquisition analytics.
          </p>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">State Coverage</span>
              <span className="text-lg font-black text-emerald-400">33 Districts</span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Cadastral Parcels</span>
              <span className="text-lg font-black text-sky-400">3,300 Demo</span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">RFCTLARR AI</span>
              <span className="text-lg font-black text-amber-400">Instant Valuation</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          Official Prototype • Ministry of Rural Development & Land Resources
        </div>
      </div>

      {/* RIGHT SIDE: Glass Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10">
        
        {/* Top Controls */}
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleLanguage}
            className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{t('nav.language')}</span>
          </button>
        </div>

        <div className={`w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 ${shakeError ? 'animate-shake' : ''}`}>
          
          {/* Glass Header */}
          <div className="text-center space-y-2">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Bhoomi Setu Logo"
              className="w-16 h-16 rounded-2xl object-contain bg-slate-900 p-2 shadow-2xl border-2 border-emerald-500/40 mx-auto mb-2"
              onError={(e: any) => { e.target.src = `${import.meta.env.BASE_URL}logo.svg`; }}
            />
            <h2 className="text-2xl font-black tracking-tight text-white">
              Sign In to BHOOMI SETU
            </h2>
            <p className="text-xs text-slate-400">
              Land Governance & Highway Acquisition Portal
            </p>
          </div>

          {/* Quick Demo Role Selectors (with hover lift) */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Select Demo Role
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('officer')}
                className={`py-2 px-2 rounded-xl font-bold text-xs border text-center transition duration-200 transform hover:-translate-y-0.5 hover:shadow-lg ${
                  username === 'officer'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                👑 Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('citizen')}
                className={`py-2 px-2 rounded-xl font-bold text-xs border text-center transition duration-200 transform hover:-translate-y-0.5 hover:shadow-lg ${
                  username === 'citizen'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                👤 Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('admin')}
                className={`py-2 px-2 rounded-xl font-bold text-xs border text-center transition duration-200 transform hover:-translate-y-0.5 hover:shadow-lg ${
                  username === 'admin'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username / User ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Demo Credentials Footer Info */}
          <div className="pt-2 text-center text-[11px] text-slate-500 font-mono space-y-1">
            <div>Officer: <code className="text-emerald-400">officer / officer123</code></div>
            <div>Admin: <code className="text-emerald-400">admin / admin123</code> | Citizen: <code className="text-emerald-400">citizen / user123</code></div>
          </div>

        </div>
      </div>

    </div>
  );
};
