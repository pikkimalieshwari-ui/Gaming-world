import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Crown, UserX, UserCheck, ShieldAlert, Users, Megaphone, CheckCircle2, Search, RefreshCw, Trash2, Clock, MailCheck, AlertTriangle, XCircle, Mail } from 'lucide-react';

interface OwnerConsoleProps {
  currentUser: User | null;
}

export const OwnerConsole: React.FC<OwnerConsoleProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modal Confirm State for Deleting / Firing / Blocking
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'fire' | 'block' | 'unblock';
    userId: string;
    userName: string;
    userEmail: string;
    durationMinutes?: number;
  } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [resUsers, resPending] = await Promise.all([
        fetch('/api/owner/users'),
        fetch('/api/owner/pending-approvals'),
      ]);

      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data);
      }

      if (resPending.ok) {
        const pendingData = await resPending.json();
        setPendingApprovals(pendingData);
      }
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // APPROVE USER REGISTRATION REQUEST (pikkimalieshwari@gmail.com INBOX)
  const handleApproveUser = async (userId: string, email: string, name: string) => {
    try {
      const res = await fetch('/api/owner/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || `${name} registration approved.`);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to approve user.');
      }
    } catch (err) {
      alert('Error approving user registration.');
    }
  };

  // REJECT USER REGISTRATION REQUEST
  const handleRejectUser = async (userId: string, email: string, name: string) => {
    try {
      const res = await fetch('/api/owner/reject-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || `${name} registration request declined.`);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to decline request.');
      }
    } catch (err) {
      alert('Error declining user request.');
    }
  };

  // EXECUTE CONFIRMED ACTION (DELETE, FIRE, BLOCK)
  const handleExecuteConfirmedAction = async () => {
    if (!confirmModal) return;

    const { type, userId, userEmail, userName, durationMinutes } = confirmModal;
    setConfirmModal(null);

    try {
      if (type === 'delete') {
        const res = await fetch('/api/owner/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email: userEmail }),
        });
        const data = await res.json();
        if (res.ok) {
          setActionMessage(data.message || `Account for ${userName} (${userEmail}) permanently deleted.`);
          setUsers((prev) => prev.filter((u) => u.id !== userId && u.email !== userEmail));
          fetchUsers();
        } else {
          alert(data.error || 'Failed to delete user account.');
        }
      } else if (type === 'fire') {
        const res = await fetch('/api/owner/fire-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email: userEmail }),
        });
        const data = await res.json();
        if (res.ok) {
          setActionMessage(data.message || `${userName} access has been terminated.`);
          fetchUsers();
        } else {
          alert(data.error || 'Failed to fire user.');
        }
      } else if (type === 'block' || type === 'unblock') {
        const res = await fetch('/api/owner/block-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email: userEmail, durationMinutes: type === 'block' ? (durationMinutes || 10) : null }),
        });
        const data = await res.json();
        if (res.ok) {
          setActionMessage(data.message || `${userName} status updated.`);
          fetchUsers();
        } else {
          alert(data.error || 'Failed to update block policy.');
        }
      }
    } catch (err) {
      alert('Error executing owner command.');
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.phone && u.phone.includes(searchQuery))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Executive Header Banner - High Contrast B&W */}
      <div className="bg-black border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white text-black rounded-2xl shadow-lg font-black shrink-0">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight text-white">MK Executive Owner Console</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-900 text-white border border-zinc-700">
                  PRIMARY OWNER: pikkimalieshwari@gmail.com
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Full executive oversight: view all saved user logins, fire members, permanently delete user accounts, and enforce timed blocking.
              </p>
            </div>
          </div>

          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="self-start md:self-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-mono font-bold border border-zinc-700 flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Roster & Inbox
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-zinc-400 hover:text-white text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* PENDING EMAIL REGISTRATION APPROVALS (pikkimalieshwari@gmail.com INBOX) */}
      {pendingApprovals.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-700 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm uppercase font-mono tracking-wider">
              <Mail className="w-5 h-5 text-white" />
              Pending Email Registration Requests (pikkimalieshwari@gmail.com)
            </div>
            <span className="px-2.5 py-0.5 bg-white text-black font-mono font-bold text-xs rounded-full">
              {pendingApprovals.length} Pending Approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingApprovals.map((pUser) => (
              <div key={pUser.id} className="p-4 bg-black border border-zinc-800 rounded-xl flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{pUser.name}</span>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {pUser.department || 'Member'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-300 font-mono flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-500" /> {pUser.email}
                  </div>
                  {pUser.phone && (
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Phone: {pUser.phone}
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-400 font-mono pt-1">
                    Requested on: {new Date(pUser.joinedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-zinc-900">
                  <button
                    onClick={() => handleApproveUser(pUser.id, pUser.email, pUser.name)}
                    className="flex-1 py-2 bg-white text-black hover:bg-zinc-200 font-bold text-xs rounded-lg font-mono transition flex items-center justify-center gap-1 cursor-pointer shadow"
                  >
                    <MailCheck className="w-3.5 h-3.5" /> Accept & Allow Login
                  </button>
                  <button
                    onClick={() => handleRejectUser(pUser.id, pUser.email, pUser.name)}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs rounded-lg font-mono transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Roster Table & Security Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Roster Table (2 Columns) */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Registered Workspace Roster
              </h2>
              <span className="text-xs bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded font-mono border border-zinc-800">
                {users.length} members
              </span>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
              />
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-black text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="p-3">User & Contact</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Owner Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-zinc-500 font-mono">
                      No members matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isTimedBlocked = user.blockedUntil && Date.now() < user.blockedUntil;
                    const remainingMins = isTimedBlocked ? Math.ceil((user.blockedUntil! - Date.now()) / 60000) : 0;
                    const isPrimaryOwner = user.email.toLowerCase() === 'pikkimalieshwari@gmail.com' || user.role === 'owner';

                    return (
                      <tr key={user.id} className="hover:bg-zinc-900/60 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-black font-black flex items-center justify-center shrink-0 border border-zinc-300 text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {user.name}
                                {isPrimaryOwner && (
                                  <Crown className="w-3.5 h-3.5 text-white inline" />
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-[11px]">
                          <div className="text-zinc-200">{user.department || 'Member'}</div>
                          <div className="text-[9px] text-zinc-500">{user.role.toUpperCase()}</div>
                        </td>

                        <td className="p-3">
                          {user.isFired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-300 border border-zinc-700">
                              <UserX className="w-3 h-3 text-white" /> FIRED
                            </span>
                          ) : isTimedBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-200 border border-zinc-700">
                              <Clock className="w-3 h-3 animate-pulse" /> BLOCKED ({remainingMins}m)
                            </span>
                          ) : user.isApproved === false ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
                              PENDING APPROVAL
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-black">
                              <UserCheck className="w-3 h-3" /> ACTIVE
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          {isPrimaryOwner ? (
                            <span className="text-[10px] text-zinc-500 font-mono italic">Primary Owner</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Unblock / Restore */}
                              {user.isFired || isTimedBlocked ? (
                                <button
                                  onClick={() =>
                                    setConfirmModal({
                                      isOpen: true,
                                      type: 'unblock',
                                      userId: user.id,
                                      userEmail: user.email,
                                      userName: user.name,
                                    })
                                  }
                                  className="px-2.5 py-1 bg-white text-black font-bold rounded-lg text-[10px] font-mono hover:bg-zinc-200 transition cursor-pointer shadow"
                                >
                                  Unblock
                                </button>
                              ) : (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        isOpen: true,
                                        type: 'block',
                                        userId: user.id,
                                        userEmail: user.email,
                                        userName: user.name,
                                        durationMinutes: 10,
                                      })
                                    }
                                    title="Block for 10 minutes"
                                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg text-[10px] font-mono transition cursor-pointer"
                                  >
                                    10m Block
                                  </button>

                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        isOpen: true,
                                        type: 'fire',
                                        userId: user.id,
                                        userEmail: user.email,
                                        userName: user.name,
                                      })
                                    }
                                    title="Fire user and terminate access"
                                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                                  >
                                    Fire
                                  </button>
                                </div>
                              )}

                              {/* Delete Permanently Button */}
                              <button
                                onClick={() =>
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'delete',
                                    userId: user.id,
                                    userEmail: user.email,
                                    userName: user.name,
                                  })
                                }
                                title="Permanently Delete User Account"
                                className="p-1.5 bg-black hover:bg-zinc-800 text-white border border-zinc-700 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Security Policies & Broadcasts */}
        <div className="space-y-6">
          {/* Security Protocols */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              Owner System Policies
            </div>
            <div className="text-xs text-zinc-400 space-y-2">
              <div className="p-3 bg-black rounded-xl border border-zinc-800">
                <span className="font-bold text-white block mb-0.5">Instant Registration:</span> Users give their details directly, register instantly, and all login credentials are saved permanently to database records.
              </div>
              <div className="p-3 bg-black rounded-xl border border-zinc-800">
                <span className="font-bold text-white block mb-0.5">Permanent User Purge:</span> Deleting a user removes their login credentials and account records from the server store immediately.
              </div>
              <div className="p-3 bg-black rounded-xl border border-zinc-800">
                <span className="font-bold text-white block mb-0.5">Termination (Firing):</span> Firing a member permanently revokes login sessions and blocks them from accessing chat rooms or tools.
              </div>
            </div>
          </div>

          {/* Broadcast Announcement */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-mono tracking-wider">
              <Megaphone className="w-4 h-4" />
              Owner Broadcast Alert
            </div>
            <p className="text-xs text-zinc-400">
              Publish an executive alert banner to all active member sessions.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!announcement.trim()) return;
                setAnnouncementSuccess(true);
                setTimeout(() => setAnnouncementSuccess(false), 4000);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Alert Headline..."
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
              />
              <textarea
                rows={3}
                placeholder="Type broadcast text..."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white resize-none font-mono"
              ></textarea>

              <button
                type="submit"
                className="w-full py-2.5 px-3 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-mono font-bold shadow transition cursor-pointer"
              >
                Publish Broadcast
              </button>

              {announcementSuccess && (
                <div className="p-2.5 bg-black border border-white rounded-lg text-white text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Broadcast published to all sessions!</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* IN-APP CONFIRMATION MODAL (Replaces window.confirm to work 100% in all iFrames) */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 text-white font-sans">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4 font-sans border border-zinc-700">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-700">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {confirmModal.type === 'delete'
                    ? 'Confirm Permanent Account Purge'
                    : confirmModal.type === 'fire'
                    ? 'Confirm Member Access Termination'
                    : confirmModal.type === 'block'
                    ? 'Confirm Timed Account Block'
                    : 'Confirm Account Unblock'}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">Executive Owner Command</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-mono">
              Are you sure you want to {confirmModal.type === 'delete' ? 'PERMANENTLY DELETE' : confirmModal.type === 'fire' ? 'FIRE and TERMINATE' : confirmModal.type === 'block' ? 'BLOCK for 10 minutes' : 'UNBLOCK'} user account <strong className="text-white">{confirmModal.userName}</strong> ({confirmModal.userEmail})?
            </p>

            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConfirmedAction}
                className="flex-1 py-2.5 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl text-xs font-mono shadow transition cursor-pointer"
              >
                Confirm {confirmModal.type.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
