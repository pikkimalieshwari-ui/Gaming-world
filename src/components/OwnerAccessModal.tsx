import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertTriangle, KeyRound, ArrowRight, ShieldAlert } from 'lucide-react';

interface OwnerAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOwnerGranted: () => void;
  onBlockedTriggered: (remainingSeconds: number) => void;
}

export const OwnerAccessModal: React.FC<OwnerAccessModalProps> = ({
  isOpen,
  onClose,
  onOwnerGranted,
  onBlockedTriggered,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Owner password is required.');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch('/api/owner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await response.json();

      if (data.isBlocked) {
        // Trigger 10-minute block screen!
        onBlockedTriggered(data.remainingSeconds || 600);
        onClose();
        return;
      }

      if (response.ok && data.success) {
        setPassword('');
        onOwnerGranted();
        onClose();
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error while verifying owner credentials.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 text-white font-sans">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden text-white my-auto">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-zinc-900 border border-zinc-700 rounded-2xl text-white mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Owner Verification</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Restricted Executive Console Access
          </p>
        </div>

        {/* Security Warning Banner */}
        <div className="mb-5 p-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-300 text-xs flex items-start gap-2.5 font-mono">
          <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-white">Security Protocol:</strong> An incorrect password entry will activate a <strong className="text-white underline">10-minute lockout</strong> on this device.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-black border border-zinc-700 rounded-xl text-zinc-200 text-xs flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1">Owner Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono tracking-wider transition"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3 text-zinc-400" />
              Password encrypted & private.
            </p>
          </div>

          <div className="flex gap-3 pt-2 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs transition border border-zinc-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
              ) : (
                <>
                  Verify Access
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
