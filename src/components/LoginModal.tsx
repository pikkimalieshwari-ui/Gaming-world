import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  Building2,
  KeyRound,
  LogIn,
  UserPlus,
  ShieldCheck,
  Crown,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Layers,
  Radio,
  Server
} from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onOwnerGranted?: () => void;
  onBlockedTriggered?: (remainingSeconds: number) => void;
  isMandatory?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOwnerGranted,
  onBlockedTriggered,
  isMandatory = true,
}) => {
  // Mode: 'signin' | 'signup' | 'owner'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'owner'>('signin');

  // Form fields for User Auth
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields for Owner Master Key / PIN
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Canvas ref for background particle grid
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Particle background animation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(36, Math.floor((width * height) / 28000));
    const particles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Geometric grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 44;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Particles & connection webs
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.07 * (1 - dist / 110)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Standard User Login or Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both Email/Phone and Password.');
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your Full Name.');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = authMode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const body =
        authMode === 'signup'
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
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Owner Verification (Secret PIN / Master Key with 10-min lockout)
  const handleOwnerVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ownerPassword.trim()) {
      setError('Owner Password is required to unlock Owner Console.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/owner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ownerPassword.trim() }),
      });

      const data = await response.json();

      if (data.isBlocked) {
        // Trigger 10-minute lockout!
        if (onBlockedTriggered) {
          onBlockedTriggered(data.remainingSeconds || 600);
        }
        onClose();
        return;
      }

      if (response.ok && data.success) {
        setOwnerPassword('');
        if (data.user && onLoginSuccess) {
          onLoginSuccess(data.user);
        }
        if (onOwnerGranted) {
          onOwnerGranted();
        }
        onClose();
      } else {
        setError(data.message || 'Owner authentication rejected.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error while verifying owner credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 sm:p-6 text-white font-sans overflow-y-auto">
      {/* Background Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-60"
      />

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-zinc-700/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-zinc-800/25 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glassmorphic Portal Container (Split-Panel Layout) */}
      <div className="relative z-10 max-w-4xl w-full bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SIDE PANEL: Configured Account Card & System Overview */}
          <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900/90 to-black/90 p-6 sm:p-7 border-b lg:border-b-0 lg:border-r border-zinc-800/80 flex flex-col justify-between space-y-6">
            <div>
              {/* Brand Logo & Portal Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-white text-black font-black flex items-center justify-center text-lg shadow-lg border border-zinc-200">
                  MK
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 font-mono uppercase">
                    MK creative X
                  </h1>
                  <p className="text-[11px] text-zinc-400 font-mono">Workspace & Intelligence Portal</p>
                </div>
              </div>

              {/* ONE ACCOUNT DISPLAY CARD (Beside the login/signup form) */}
              <div className="mb-5">
                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Server className="w-3 h-3 text-zinc-300" />
                  <span>Primary Executive Account</span>
                </div>

                <div className="p-4 bg-zinc-900/90 border border-zinc-700/70 hover:border-zinc-500 rounded-2xl transition duration-200 shadow-lg space-y-3 relative group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-400 text-black font-black text-sm flex items-center justify-center shadow-md">
                        MX
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white font-mono">Manoj X</span>
                          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono truncate block max-w-[180px]">
                          pikkimalieshwari@gmail.com
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white text-black shrink-0">
                      Owner
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Password Required</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('owner');
                        setError(null);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black font-extrabold rounded-xl text-xs flex items-center gap-1 transition shadow cursor-pointer"
                    >
                      <span>Owner Login</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Workspace Capabilities */}
              <div className="space-y-2 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Real-time live Signals & Channels</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>100MB File Sharing & Location Broadcast</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>AI Audio News & Global Knowledge Vault</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee Badge */}
            <div className="p-3 bg-black/60 border border-zinc-800/80 rounded-2xl flex items-center gap-2.5 text-xs text-zinc-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px]">Protected with 10-Minute Lockout Defense</span>
            </div>
          </div>

          {/* RIGHT MAIN PANEL: Login / Signup / Owner Password Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            
            {/* Top Mode Navigation Tabs */}
            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="grid grid-cols-2 p-1 bg-black/80 border border-zinc-800 rounded-2xl flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-mono font-bold rounded-xl transition cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-mono font-bold rounded-xl transition cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('owner');
                  setError(null);
                }}
                className={`px-3 py-2 text-xs font-mono font-bold rounded-2xl border transition flex items-center gap-1.5 cursor-pointer ${
                  authMode === 'owner'
                    ? 'bg-white text-black border-white shadow'
                    : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-600 hover:text-white'
                }`}
              >
                <Crown className={`w-3.5 h-3.5 ${authMode === 'owner' ? 'text-black' : 'text-amber-400'}`} />
                <span>Owner</span>
              </button>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="mb-4 p-3.5 bg-zinc-900 border border-zinc-700 rounded-2xl text-zinc-200 text-xs flex items-start gap-2.5 font-mono animate-fadeIn">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* MODE 1: OWNER PASSWORD AUTHENTICATION (When Owner Login is clicked) */}
            {authMode === 'owner' ? (
              <form onSubmit={handleOwnerVerify} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white font-mono uppercase tracking-tight">
                      Owner Password Verification
                    </h2>
                    <span className="text-[10px] font-mono font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full">
                      Manoj X
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    Target: <strong className="text-white">pikkimalieshwari@gmail.com</strong>
                  </p>
                </div>

                {/* Security Warning Notice */}
                <div className="p-3 bg-black/80 border border-zinc-800 rounded-2xl text-zinc-300 text-xs space-y-1 font-mono">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                    <span>Protected Executive Command Key</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Enter the Owner password to unlock the console. Incorrect entry triggers a <strong className="text-white underline">10-minute server lockout</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase">
                    Owner Password (Manoj X)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showOwnerPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      placeholder="Enter Owner Password"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      className="w-full bg-black/80 border border-zinc-700 rounded-2xl py-3 pl-10 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-white text-black hover:bg-zinc-200 font-black rounded-2xl text-xs font-mono flex items-center justify-center gap-2 transition transform active:scale-95 shadow-xl disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>Verify & Unlock Owner Console</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError(null);
                  }}
                  className="w-full py-2 text-center text-xs font-mono text-zinc-400 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Member Sign In / Sign Up</span>
                </button>
              </form>
            ) : (
              /* MODE 2: STANDARD USER LOGIN / SIGNUP */
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="mb-2">
                  <h2 className="text-lg font-black text-white font-mono uppercase tracking-tight">
                    {authMode === 'signup' ? 'Create New Member Account' : 'Sign In to Workspace'}
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono">
                    {authMode === 'signup'
                      ? 'Register your profile to join team communications'
                      : 'Enter your credentials to access workspace channels'}
                  </p>
                </div>

                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-mono text-zinc-300 mb-1">Full Name *</label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Rivera"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-black/70 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-300 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-black/70 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-300 mb-1">Department</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. Engineering, Design, Research"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full bg-black/70 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    {authMode === 'signup' ? 'Email Address *' : 'Email or Phone *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder={authMode === 'signup' ? 'name@company.com' : 'Email address or Phone'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/70 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/70 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-black rounded-2xl text-xs font-mono transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-xl cursor-pointer"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  ) : authMode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Register & Enter Workspace</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Workspace</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
