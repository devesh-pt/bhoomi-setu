import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, BookOpen, Lock, Phone, Mail, ArrowRight, PlayCircle, ArrowLeft, KeyRound, CheckCircle2, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface LoginScreenProps {
  onBackToLanding: () => void;
  onExploreDemo: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBackToLanding, onExploreDemo }) => {
  const { loginWithCredentials, registerUser, loginAsRole } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  
  // Form fields
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('9876543210'); // Default to User Phone
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('user123'); // Default to user123

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setIdentifier('9999999999');
      setPassword('admin123');
    } else if (role === 'user') {
      setIdentifier('9876543210');
      setPassword('user123');
    } else if (role === 'official') {
      setIdentifier('9888888888');
      setPassword('official123');
    } else {
      setIdentifier('9777777777');
      setPassword('researcher123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      if (!phone.trim() || !password.trim()) {
        alert("Please enter a valid Phone Number and Password.");
        return;
      }
      registerUser(name, phone, email, password, selectedRole);
    } else {
      loginWithCredentials(identifier, password, selectedRole);
    }
  };

  const rolesList: { role: UserRole; title: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'user',
      title: 'User / Citizen',
      desc: 'Access Land Search, View Permitted Land Info, View Map & AI Risk.',
      icon: UserIcon,
      color: 'border-blue-500 bg-blue-50/50 text-blue-900',
    },
    {
      role: 'admin',
      title: 'Admin / Authorized Officer',
      desc: 'Full access: Add/Edit Land, Verify Records, Update Usability & Legal Cases.',
      icon: ShieldCheck,
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 md:grid-cols-12">
        {/* Left GovTech Credentials Panel */}
        <div className="md:col-span-5 bg-[#0f2942] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center space-x-1 text-xs text-slate-300 hover:text-white mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal Welcome</span>
            </button>

            <img
              src="/logo.jpg"
              alt="BHOOMI SETU Emblem"
              className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-emerald-400/40 mb-3"
            />
            <h2 className="text-2xl font-black tracking-tight text-white">BHOOMI SETU</h2>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-1">
              National Digital Platform
            </p>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Evidence-driven intelligence for research, policy innovation, and land governance in India.
            </p>
          </div>

          {/* Official Login Credentials Reference Box */}
          <div className="relative z-10 my-6 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-extrabold text-emerald-400 border-b border-slate-800 pb-2">
              <KeyRound className="w-4 h-4" />
              <span>Official Login Credentials</span>
            </div>

            {/* USER Credentials */}
            <div
              onClick={() => handleRoleSelect('user')}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                selectedRole === 'user' ? 'bg-blue-900/80 border-blue-400 text-white font-bold' : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-300">
                <span>👤 NORMAL USER LOGIN</span>
                {selectedRole === 'user' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
              </div>
              <div className="mt-1 font-mono text-[11px]">
                <div>Phone / ID: <strong>9876543210</strong></div>
                <div>Password: <strong>user123</strong></div>
              </div>
            </div>

            {/* ADMIN Credentials */}
            <div
              onClick={() => handleRoleSelect('admin')}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                selectedRole === 'admin' ? 'bg-emerald-900/80 border-emerald-400 text-white font-bold' : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                <span>🛡️ ADMIN / OFFICER LOGIN</span>
                {selectedRole === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="mt-1 font-mono text-[11px]">
                <div>Phone / ID: <strong>9999999999</strong></div>
                <div>Password: <strong>admin123</strong></div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-2 border-t border-slate-800">
            <button
              onClick={onExploreDemo}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow transition flex items-center justify-center space-x-1.5"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch 3-5 Min Guided Jury Demo</span>
            </button>
          </div>
        </div>

        {/* Right Interactive Form Panel */}
        <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isRegisterMode ? 'Sign Up with Phone No' : 'Welcome to BHOOMI SETU'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isRegisterMode ? 'Create account with Phone Number' : 'Sign in using Phone Number, Email, or User ID'}
              </p>
            </div>

            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              {isRegisterMode ? (
                <span>Already have account? Sign In</span>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up with Phone</span>
                </>
              )}
            </button>
          </div>

          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Login Role:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {rolesList.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleSelect(r.role)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      isSelected
                        ? r.color + ' ring-2 ring-blue-600 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-bold">{r.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login / Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegisterMode ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number (+91)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. citizen@bhoomi.gov.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number / Email / User ID
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter 9876543210 or 9999999999"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {!isRegisterMode && (
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Demo Password Hint: Use 'user123' for User or 'admin123' for Admin."); }} className="text-xs text-blue-600 hover:underline">
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2 mt-2"
            >
              <span>
                {isRegisterMode
                  ? `Sign Up & Login as ${selectedRole === 'admin' ? 'Admin' : 'User'}`
                  : `Sign In as ${selectedRole === 'admin' ? 'Admin / Officer' : 'Normal User'}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Shortcut */}
          <div className="mt-4 pt-3 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-2">Or instant 1-click login as:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => loginAsRole('user')}
                className="px-3 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-bold hover:bg-blue-200 transition"
              >
                👤 User (9876543210)
              </button>
              <button
                onClick={() => loginAsRole('admin')}
                className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-200 transition"
              >
                🛡️ Admin (9999999999)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
