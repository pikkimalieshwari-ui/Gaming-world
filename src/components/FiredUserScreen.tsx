import React from 'react';
import { UserX, ShieldOff, LogOut } from 'lucide-react';
import { User } from '../types';

interface FiredUserScreenProps {
  user: User;
  onLogout: () => void;
}

export const FiredUserScreen: React.FC<FiredUserScreenProps> = ({ user, onLogout }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 text-white font-sans">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex p-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-white shadow-lg">
          <UserX className="w-12 h-12" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-zinc-900 text-zinc-300 text-[10px] font-mono tracking-wider font-bold rounded-full border border-zinc-700 mb-2 uppercase">
            ACCOUNT TERMINATED BY OWNER
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">Access Terminated</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Member account <strong className="text-white">{user.name}</strong> ({user.email}) has been fired and access has been permanently revoked by the System Owner.
          </p>
        </div>

        <div className="bg-black border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 text-left space-y-2 font-mono">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShieldOff className="w-4 h-4 text-zinc-400" />
            Executive Security Protocol
          </div>
          <p>
            You can no longer post messages, transfer files, or view workspace tools. Contact the workspace owner to restore your account.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-3 px-4 bg-white hover:bg-zinc-200 text-black font-bold font-mono rounded-xl text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out & Return
        </button>
      </div>
    </div>
  );
};
