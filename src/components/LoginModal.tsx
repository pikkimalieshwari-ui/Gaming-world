import React, { useState } from 'react';
import { User as UserIcon, Lock, Mail, Phone, Building2, Key, Sparkles, LogIn, UserPlus, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  isMandatory?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess, isMandatory = true }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both Email/Phone and Password.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your Full Name.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp
        ? {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            department: department.trim() || 'Member',
            password: password.trim(),
          }
        : {
            email: email.trim(),
            password: password.trim(),
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (data.user) {
        // Authenticated directly
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 text-white font-sans overflow-y-auto">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden text-white my-auto">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-zinc-900 border border-zinc-700 rounded-2xl text-white mb-3 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">MK creative X</h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            {isSignUp ? 'Create Workspace Account' : 'Sign In to Workspace'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 text-xs flex items-start gap-2 font-mono">
            <Lock className="w-4 h-4 shrink-0 text-white mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3.5 bg-black border border-zinc-700 rounded-xl text-zinc-200 text-xs flex items-start gap-2">
            <Clock className="w-4 h-4 shrink-0 text-white mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="font-bold text-white block">Owner Approval Required</span>
              <p className="text-[11px] text-zinc-300">{infoMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">Department / Organization</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Engineering, Design, HQ"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">
              {isSignUp ? 'Sign-in Email *' : 'Sign-in Email or Phone *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder={isSignUp ? 'you@example.com' : 'Email address or Phone number'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">Password *</label>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition font-mono"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3 text-zinc-400" />
              Direct login saved instantly to system records.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 mt-3 shadow cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                Register & Enter Workspace
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In to Workspace
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-zinc-400 font-mono">
          {isSignUp ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(null); }}
                className="text-white font-bold underline hover:text-zinc-300 cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(null); }}
                className="text-white font-bold underline hover:text-zinc-300 cursor-pointer"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
