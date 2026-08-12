import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, RefreshCw, Key, CheckCircle2, Lock } from 'lucide-react';

interface BlockedScreenProps {
  remainingSeconds: number;
  onTimerExpire: () => void;
}

export const BlockedScreen: React.FC<BlockedScreenProps> = ({
  remainingSeconds: initialSeconds,
  onTimerExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [stopPassword, setStopPassword] = useState('');
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimerExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimerExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimerExpire]);

  const handleEmergencyStop = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    setUnlockMessage(null);

    if (!stopPassword.trim()) {
      setUnlockError('Please enter the Emergency Unlock Password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/owner/unlock-lockout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stopPassword: stopPassword.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUnlockMessage(data.message || 'Security lockout cleared successfully!');
        setTimeout(() => {
          onTimerExpire();
        }, 1200);
      } else {
        setUnlockError(data.message || 'Invalid Emergency Password.');
      }
    } catch (err) {
      setUnlockError('Network error while processing unlock request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.max(0, Math.min(100, ((600 - timeLeft) / 600) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 text-white font-sans overflow-y-auto">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden my-auto">
        <div className="relative z-10 space-y-6">
          <div className="inline-flex p-3.5 bg-zinc-900 border border-zinc-700 rounded-2xl text-white shadow-lg">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-zinc-900 text-zinc-300 text-[10px] font-mono tracking-wider font-bold rounded-full border border-zinc-700 mb-2.5 uppercase">
              SECURITY LOCKOUT ACTIVATED
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">Access Suspended</h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              System locked due to incorrect Owner password entry. Wait for countdown or enter your Emergency Unlock Password.
            </p>
          </div>

          {/* Countdown Clock Display - High Contrast B&W */}
          <div className="bg-black border border-zinc-800 rounded-xl p-5 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-center gap-2 text-zinc-400 text-[11px] font-mono font-bold uppercase tracking-widest mb-1">
              <Clock className="w-4 h-4 text-white animate-spin" />
              Lockout Timer
            </div>

            <div className="text-4xl font-mono font-black text-white tracking-widest my-2">
              {formattedTime}
            </div>

            {/* Monochrome Progress Bar */}
            <div className="w-full bg-zinc-900 h-2 rounded-full mt-3 overflow-hidden border border-zinc-800">
              <div
                className="bg-white h-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>00:00</span>
              <span>10:00</span>
            </div>
          </div>

          {/* Secure Emergency Unlock Section - No plaintext hint displayed */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Lock className="w-4 h-4 text-zinc-400" />
              Emergency Unlock Password
            </div>
            <p className="text-[11px] text-zinc-400">
              Authorized personnel may enter the Emergency Unlock Password to override the countdown immediately.
            </p>

            {unlockError && (
              <div className="p-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200 text-xs flex items-center gap-2 font-mono">
                <span>{unlockError}</span>
              </div>
            )}

            {unlockMessage && (
              <div className="p-2.5 bg-zinc-950 border border-white rounded-lg text-white text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{unlockMessage}</span>
              </div>
            )}

            <form onSubmit={handleEmergencyStop} className="flex gap-2">
              <div className="relative flex-1">
                <Key className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={stopPassword}
                  onChange={(e) => setStopPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg py-2 pl-8 pr-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg text-xs transition disabled:opacity-50 shrink-0"
              >
                {isSubmitting ? 'Unlocking...' : 'Unlock'}
              </button>
            </form>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-mono font-medium transition flex items-center justify-center gap-2 border border-zinc-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Check Server Status
          </button>
        </div>
      </div>
    </div>
  );
};
