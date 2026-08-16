import React, { useState, useEffect } from 'react';
import { User, NewsArticle, KnowledgeArticle, SiteFeatureFlags, AnnouncementRecord, ActivityLogItem } from '../types';
import {
  Crown,
  UserX,
  UserCheck,
  ShieldAlert,
  Users,
  Megaphone,
  CheckCircle2,
  Search,
  RefreshCw,
  Trash2,
  Clock,
  MailCheck,
  AlertTriangle,
  XCircle,
  Mail,
  ToggleLeft,
  ToggleRight,
  Radio,
  Sparkles,
  BookOpen,
  PlusCircle,
  Activity,
  Layers,
  Sliders,
  Flame,
  Zap,
  Atom,
  Rocket,
  Satellite,
  Lock,
  Eye,
  Shield
} from 'lucide-react';

interface OwnerConsoleProps {
  currentUser: User | null;
}

export const OwnerConsole: React.FC<OwnerConsoleProps> = ({ currentUser }) => {
  // Navigation Tabs in Owner Console
  const [activeSubTab, setActiveSubTab] = useState<
    'users' | 'features' | 'news' | 'knowledge' | 'announcements' | 'logs'
  >('users');

  // State: Users & Approvals
  const [users, setUsers] = useState<User[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // State: Feature Flags
  const [featureFlags, setFeatureFlags] = useState<SiteFeatureFlags>({
    chatEnabled: true,
    browserEnabled: true,
    youtubeEnabled: true,
    audioNewsEnabled: true,
    knowledgeEnabled: true,
    calculatorEnabled: true,
    calendarEnabled: true,
    clockEnabled: true,
    notesEnabled: true,
    whiteboardEnabled: true,
  });

  // State: News Articles
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newHeadline, setNewHeadline] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newCategory, setNewCategory] = useState<NewsArticle['category']>('world');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newIsBreaking, setNewIsBreaking] = useState(false);
  const [newAudioDuration, setNewAudioDuration] = useState(45);

  // State: Knowledge Articles
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [newKCategory, setNewKCategory] = useState<KnowledgeArticle['category']>('tesla');
  const [newKHeadline, setNewKHeadline] = useState('');
  const [newKSummary, setNewKSummary] = useState('');
  const [newKExplanation, setNewKExplanation] = useState('');
  const [newKSource, setNewKSource] = useState('');
  const [newKStatus, setNewKStatus] = useState<KnowledgeArticle['status']>('Official Announcement');
  const [newKFacts, setNewKFacts] = useState('');
  const [newKTags, setNewKTags] = useState('');
  const [newKImageUrl, setNewKImageUrl] = useState('');

  // State: Announcements
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'normal' | 'important' | 'emergency'>('normal');

  // State: Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // State: System Reset
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'fire' | 'block' | 'unblock';
    userId: string;
    userName: string;
    userEmail: string;
    durationMinutes?: number;
  } | null>(null);

  const handleSystemReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!resetPasswordInput.trim()) {
      setResetError('Please enter your Owner Password (Manoj X) to confirm system reset.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/system/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPasswordInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsResetModalOpen(false);
        setResetPasswordInput('');
        setActionMessage('System Reset Complete: All saved emails and Signals have been wiped cleanly.');
        fetchAllData();
      } else {
        setResetError(data.error || 'Reset authorization rejected.');
      }
    } catch {
      setResetError('Network error while requesting system reset.');
    } finally {
      setIsResetting(false);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [resUsers, resPending, resFlags, resNews, resKnowledge, resAnnouncements, resLogs] =
        await Promise.all([
          fetch('/api/owner/users'),
          fetch('/api/owner/pending-approvals'),
          fetch('/api/feature-flags'),
          fetch('/api/news'),
          fetch('/api/knowledge'),
          fetch('/api/announcements'),
          fetch('/api/owner/activity-logs'),
        ]);

      if (resUsers.ok) setUsers(await resUsers.json());
      if (resPending.ok) setPendingApprovals(await resPending.json());
      if (resFlags.ok) setFeatureFlags(await resFlags.json());
      if (resNews.ok) setNewsArticles(await resNews.json());
      if (resKnowledge.ok) setKnowledgeArticles(await resKnowledge.json());
      if (resAnnouncements.ok) setAnnouncements(await resAnnouncements.json());
      if (resLogs.ok) setActivityLogs(await resLogs.json());
    } catch (err) {
      console.error('Failed to fetch owner console data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Feature Flags Toggling ---
  const handleToggleFlag = async (key: keyof SiteFeatureFlags) => {
    const updated = { ...featureFlags, [key]: !featureFlags[key] };
    setFeatureFlags(updated);
    try {
      await fetch('/api/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setActionMessage(`Updated feature flag: ${key} = ${updated[key] ? 'ENABLED' : 'DISABLED'}`);
    } catch {
      alert('Failed to update feature flags.');
    }
  };

  // --- News Management ---
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadline || !newSummary || !newSource) {
      alert('Please fill headline, summary, and source.');
      return;
    }

    try {
      const res = await fetch('/api/owner/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: newHeadline,
          summary: newSummary,
          source: newSource,
          category: newCategory,
          imageUrl: newImageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
          isBreaking: newIsBreaking,
          audioDurationSec: Number(newAudioDuration) || 45,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setNewsArticles((prev) => [created, ...prev]);
        setNewHeadline('');
        setNewSummary('');
        setNewSource('');
        setNewImageUrl('');
        setNewIsBreaking(false);
        setActionMessage('International News Article published successfully.');
      } else {
        alert('Failed to publish news.');
      }
    } catch {
      alert('Error creating news article.');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/owner/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNewsArticles((prev) => prev.filter((a) => a.id !== id));
        setActionMessage('News article deleted.');
      }
    } catch {
      alert('Failed to delete news.');
    }
  };

  // --- Knowledge Hub Management ---
  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKHeadline || !newKSummary || !newKExplanation) {
      alert('Please fill out headline, summary, and explanation.');
      return;
    }

    const factsArray = newKFacts
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    const tagsArray = newKTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/owner/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newKCategory,
          headline: newKHeadline,
          summary: newKSummary,
          fullExplanation: newKExplanation,
          source: newKSource || 'Official Agency Data',
          status: newKStatus,
          keyFacts: factsArray,
          tags: tagsArray.length > 0 ? tagsArray : [newKCategory, 'engineering'],
          imageUrl: newKImageUrl || 'https://images.unsplash.com/photo-1517976487570-5573752e8d35?w=800&auto=format&fit=crop&q=80',
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setKnowledgeArticles((prev) => [created, ...prev]);
        setNewKHeadline('');
        setNewKSummary('');
        setNewKExplanation('');
        setNewKSource('');
        setNewKFacts('');
        setNewKTags('');
        setNewKImageUrl('');
        setActionMessage('Knowledge Hub update published successfully.');
      } else {
        alert('Failed to publish knowledge update.');
      }
    } catch {
      alert('Error creating knowledge article.');
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge article?')) return;
    try {
      const res = await fetch(`/api/owner/knowledge/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setKnowledgeArticles((prev) => prev.filter((a) => a.id !== id));
        setActionMessage('Knowledge update deleted.');
      }
    } catch {
      alert('Failed to delete knowledge update.');
    }
  };

  // --- Announcements Management ---
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementBody) {
      alert('Please fill out title and announcement text.');
      return;
    }

    try {
      const res = await fetch('/api/owner/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcementTitle,
          body: announcementBody,
          priority: announcementPriority,
          author: currentUser?.name || 'Owner (pikkimalieshwari@gmail.com)',
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setAnnouncements((prev) => [created, ...prev]);
        setAnnouncementTitle('');
        setAnnouncementBody('');
        setActionMessage('System announcement broadcasted to all users.');
      }
    } catch {
      alert('Failed to broadcast announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/owner/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setActionMessage('Announcement removed.');
      }
    } catch {
      alert('Failed to remove announcement.');
    }
  };

  // --- User Approval / Actions ---
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
        fetchAllData();
      } else {
        alert(data.error || 'Failed to approve user.');
      }
    } catch {
      alert('Error approving user registration.');
    }
  };

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
        fetchAllData();
      } else {
        alert(data.error || 'Failed to decline request.');
      }
    } catch {
      alert('Error declining user request.');
    }
  };

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
          fetchAllData();
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
          fetchAllData();
        } else {
          alert(data.error || 'Failed to fire user.');
        }
      } else if (type === 'block' || type === 'unblock') {
        const res = await fetch('/api/owner/block-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            email: userEmail,
            durationMinutes: type === 'block' ? durationMinutes || 10 : null,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setActionMessage(data.message || `${userName} status updated.`);
          fetchAllData();
        } else {
          alert(data.error || 'Failed to update block policy.');
        }
      }
    } catch {
      alert('Error executing owner command.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Executive Header Banner */}
      <div className="bg-black border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
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
                Full administrative oversight: feature switches, international audio news, scientific knowledge hubs, user deletions & 10m blocking, and real-time security audit trails.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setResetError(null);
                setResetPasswordInput('');
                setIsResetModalOpen(true);
              }}
              className="px-4 py-2 bg-zinc-950 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-xl text-xs font-mono font-bold border border-zinc-800 hover:border-red-800/60 flex items-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset & Purge All Data
            </button>

            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="self-start md:self-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-mono font-bold border border-zinc-700 flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh All Systems
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-900 overflow-x-auto no-scrollbar">
          {[
            { id: 'users', label: 'User Security & Roster', icon: Users, badge: pendingApprovals.length },
            { id: 'features', label: 'Feature Control Toggles', icon: Sliders },
            { id: 'news', label: 'Audio News Feed', icon: Radio, badge: newsArticles.length },
            { id: 'knowledge', label: 'I-Know Updates Hub', icon: Sparkles, badge: knowledgeArticles.length },
            { id: 'announcements', label: 'Broadcast Alerts', icon: Megaphone },
            { id: 'logs', label: 'Activity & Audit Trail', icon: Activity, badge: activityLogs.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-white text-black border-white shadow'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Message Alert */}
      {actionMessage && (
        <div className="p-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-zinc-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: USERS & APPROVALS */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* Pending Email Registration Approvals */}
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
                  <div
                    key={pUser.id}
                    className="p-4 bg-black border border-zinc-800 rounded-xl flex flex-col justify-between gap-3"
                  >
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
                        <div className="text-[11px] text-zinc-500 font-mono">Phone: {pUser.phone}</div>
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

          {/* User Roster Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
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
              <div className="relative min-w-[240px]">
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
                      const remainingMins = isTimedBlocked
                        ? Math.ceil((user.blockedUntil! - Date.now()) / 60000)
                        : 0;
                      const isPrimaryOwner =
                        user.email.toLowerCase() === 'pikkimalieshwari@gmail.com' || user.role === 'owner';

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
                                  {isPrimaryOwner && <Crown className="w-3.5 h-3.5 text-white inline" />}
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
                              <span className="text-[10px] font-mono text-zinc-500 italic">Protected Owner</span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {/* 10-Minute Block / Unblock Toggle */}
                                {isTimedBlocked ? (
                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        isOpen: true,
                                        type: 'unblock',
                                        userId: user.id,
                                        userName: user.name,
                                        userEmail: user.email,
                                      })
                                    }
                                    title="Unblock User Immediately"
                                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded text-[10px] font-mono border border-zinc-700 transition cursor-pointer"
                                  >
                                    Unblock
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        isOpen: true,
                                        type: 'block',
                                        userId: user.id,
                                        userName: user.name,
                                        userEmail: user.email,
                                        durationMinutes: 10,
                                      })
                                    }
                                    title="Block user login for 10 minutes"
                                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded text-[10px] font-mono border border-zinc-800 transition cursor-pointer"
                                  >
                                    10m Block
                                  </button>
                                )}

                                {/* Fire / Terminate User */}
                                {!user.isFired && (
                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        isOpen: true,
                                        type: 'fire',
                                        userId: user.id,
                                        userName: user.name,
                                        userEmail: user.email,
                                      })
                                    }
                                    title="Revoke access (Fire)"
                                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded text-[10px] font-mono border border-zinc-800 transition cursor-pointer"
                                  >
                                    Fire
                                  </button>
                                )}

                                {/* Permanently Delete Account */}
                                <button
                                  onClick={() =>
                                    setConfirmModal({
                                      isOpen: true,
                                      type: 'delete',
                                      userId: user.id,
                                      userName: user.name,
                                      userEmail: user.email,
                                    })
                                  }
                                  title="Permanently erase user record"
                                  className="p-1.5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded text-[10px] font-mono border border-zinc-800 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
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
        </div>
      )}

      {/* TAB 2: FEATURE FLAGS SWITCHES */}
      {activeSubTab === 'features' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-white" />
              Dynamic Feature Control Center
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Enable or disable specific workspace modules and consumer tabs across the entire application in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'audioNewsEnabled', label: 'International Audio News', desc: 'Real-time global news feed with TTS audio stream.' },
              { key: 'knowledgeEnabled', label: 'I-Know Knowledge Hub', desc: 'Tesla, Physics, NASA, and ISRO verified intelligence hub.' },
              { key: 'chatEnabled', label: 'AI Workspace Chat', desc: 'Multi-member team communications & AI assistant channels.' },
              { key: 'browserEnabled', label: 'In-App Web Browser', desc: 'Sandboxed search engine and web viewer.' },
              { key: 'youtubeEnabled', label: 'YouTube Media Player', desc: 'Embedded video player and search.' },
              { key: 'calculatorEnabled', label: 'Scientific Calculator', desc: 'Precision mathematical calculation engine.' },
              { key: 'calendarEnabled', label: 'Meeting Calendar', desc: 'Schedule planner and event time-tracking.' },
              { key: 'clockEnabled', label: 'World Clock & Stopwatch', desc: 'Global timezone monitoring & timer.' },
              { key: 'notesEnabled', label: 'Secure Scratchpad', desc: 'Encrypted personal note editor.' },
              { key: 'whiteboardEnabled', label: 'Interactive Whiteboard', desc: 'Collaborative canvas drawing utility.' },
            ].map((f) => {
              const isEnabled = (featureFlags as any)[f.key];
              return (
                <div
                  key={f.key}
                  className="p-4 bg-black border border-zinc-800 rounded-2xl flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-white">{f.label}</span>
                      <button
                        onClick={() => handleToggleFlag(f.key as any)}
                        className="cursor-pointer transition"
                      >
                        {isEnabled ? (
                          <ToggleRight className="w-7 h-7 text-white" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-zinc-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400">{f.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">Status</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        isEnabled ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      {isEnabled ? 'ACTIVE / ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIO NEWS MANAGER */}
      {activeSubTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add News Form */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <PlusCircle className="w-5 h-5 text-white" />
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Broadcast New Audio News
              </h2>
            </div>

            <form onSubmit={handleAddNews} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-white"
                >
                  <option value="world">World</option>
                  <option value="technology">Technology</option>
                  <option value="science">Science</option>
                  <option value="space">Space & Astronomy</option>
                  <option value="business">Business & Finance</option>
                  <option value="environment">Clean Energy & Climate</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g., Global Quantum Network Achieves Milestone"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Source Agency</label>
                <input
                  type="text"
                  placeholder="e.g., Reuters, Nature, Bloomberg"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Full Summary (Read by TTS synth)</label>
                <textarea
                  rows={4}
                  placeholder="Enter high-fidelity factual summary..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Cover Image URL (Unsplash/Direct)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={newIsBreaking}
                    onChange={(e) => setNewIsBreaking(e.target.checked)}
                    className="rounded border-zinc-700 bg-black text-white"
                  />
                  <span>Mark as Breaking Alert</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-bold rounded-xl shadow hover:bg-zinc-200 transition cursor-pointer"
              >
                Publish Audio News
              </button>
            </form>
          </div>

          {/* Existing News List */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-white" />
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Published International Broadcasts ({newsArticles.length})
                </h2>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {newsArticles.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-black border border-zinc-800 rounded-xl flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 uppercase">
                          {item.category}
                        </span>
                        {item.isBreaking && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 uppercase flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Breaking
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-zinc-500">{item.source}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.headline}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{item.summary}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteNews(item.id)}
                    className="p-2 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-800 transition cursor-pointer shrink-0"
                    title="Delete News Article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE UPDATES MANAGER */}
      {activeSubTab === 'knowledge' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Knowledge Form */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Sparkles className="w-5 h-5 text-white" />
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Add Knowledge Intelligence
              </h2>
            </div>

            <form onSubmit={handleAddKnowledge} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Knowledge Hub</label>
                <select
                  value={newKCategory}
                  onChange={(e) => setNewKCategory(e.target.value as any)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-white"
                >
                  <option value="tesla">Tesla Hub (Optimus, 4680, FSD)</option>
                  <option value="physics">Physics Hub (Fusion, Quantum, CERN)</option>
                  <option value="nasa">NASA Hub (Artemis, Europa, Mars)</option>
                  <option value="isro">ISRO Hub (Gaganyaan, Chandrayaan-4, SSLV)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g., Artemis III Human Lunar Landing Architecture"
                  value={newKHeadline}
                  onChange={(e) => setNewKHeadline(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Verification Status</label>
                <select
                  value={newKStatus}
                  onChange={(e) => setNewKStatus(e.target.value as any)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-white"
                >
                  <option value="Confirmed Mission">Confirmed Mission</option>
                  <option value="Peer-Reviewed Discovery">Peer-Reviewed Discovery</option>
                  <option value="Technology Milestone">Technology Milestone</option>
                  <option value="Official Announcement">Official Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  placeholder="Brief overview..."
                  value={newKSummary}
                  onChange={(e) => setNewKSummary(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">In-Depth Technical Explanation</label>
                <textarea
                  rows={4}
                  placeholder="Complete educational breakdown..."
                  value={newKExplanation}
                  onChange={(e) => setNewKExplanation(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Key Verified Facts (One per line)</label>
                <textarea
                  rows={2}
                  placeholder="Fact 1&#10;Fact 2"
                  value={newKFacts}
                  onChange={(e) => setNewKFacts(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="lunar, spaceflight, propulsion"
                  value={newKTags}
                  onChange={(e) => setNewKTags(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-bold rounded-xl shadow hover:bg-zinc-200 transition cursor-pointer"
              >
                Publish Knowledge Article
              </button>
            </form>
          </div>

          {/* Existing Knowledge List */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-white" />
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Knowledge Base Registry ({knowledgeArticles.length})
                </h2>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {knowledgeArticles.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-black border border-zinc-800 rounded-xl flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 uppercase">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.headline}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{item.summary}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteKnowledge(item.id)}
                    className="p-2 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-800 transition cursor-pointer shrink-0"
                    title="Delete Article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST ANNOUNCEMENTS */}
      {activeSubTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Announcement Form */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Megaphone className="w-5 h-5 text-white" />
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Create System Broadcast
              </h2>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Broadcast Title</label>
                <input
                  type="text"
                  placeholder="e.g., Scheduled Core Maintenance at 02:00 UTC"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Priority Level</label>
                <select
                  value={announcementPriority}
                  onChange={(e) => setAnnouncementPriority(e.target.value as any)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-white"
                >
                  <option value="normal">Normal Information</option>
                  <option value="important">Important Priority</option>
                  <option value="emergency">Critical / Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Message Body</label>
                <textarea
                  rows={4}
                  placeholder="Details for all workspace members..."
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-bold rounded-xl shadow hover:bg-zinc-200 transition cursor-pointer"
              >
                Broadcast to Workspace
              </button>
            </form>
          </div>

          {/* Active Broadcasts */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-white" />
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Active Broadcast Streams ({announcements.length})
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                  No active broadcasts currently queued.
                </div>
              ) : (
                announcements.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 bg-black border border-zinc-800 rounded-xl flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            a.priority === 'emergency'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : a.priority === 'important'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                          }`}
                        >
                          {a.priority}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(a.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{a.title}</h4>
                      <p className="text-xs text-zinc-300 mt-1">{a.body}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-2 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-800 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ACTIVITY & AUDIT TRAIL LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-white" />
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                System Security & Activity Audit Trail
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Showing last {activityLogs.length} events
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                No activity logs recorded yet.
              </div>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-black border border-zinc-900 rounded-xl flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        log.category === 'security'
                          ? 'bg-red-500 animate-pulse'
                          : log.category === 'admin'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    ></div>
                    <div>
                      <span className="text-white font-bold">{log.action}</span>
                      <p className="text-zinc-400 text-[11px]">{log.details}</p>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-zinc-500 shrink-0">
                    <div>{log.actorEmail}</div>
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONFIRM ACTION MODAL (Delete / Fire / Block) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 bg-white text-black rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase font-mono">
                  {confirmModal.type === 'delete'
                    ? 'Permanent User Deletion'
                    : confirmModal.type === 'fire'
                    ? 'Terminate User Access'
                    : confirmModal.type === 'unblock'
                    ? 'Unblock User Login'
                    : 'Enforce 10-Minute Block'}
                </h3>
                <p className="text-xs text-zinc-400">Owner security authorization required</p>
              </div>
            </div>

            <div className="p-4 bg-black border border-zinc-800 rounded-2xl space-y-2 text-xs font-mono">
              <div className="text-zinc-400">
                Target User: <span className="text-white font-bold">{confirmModal.userName}</span>
              </div>
              <div className="text-zinc-400">
                Target Email: <span className="text-white">{confirmModal.userEmail}</span>
              </div>
              {confirmModal.type === 'delete' && (
                <p className="text-red-400 font-bold pt-1">
                  WARNING: This will permanently delete the user login record, profile, and active sessions from data/store.json. This cannot be undone.
                </p>
              )}
              {confirmModal.type === 'block' && (
                <p className="text-amber-400 pt-1">
                  Enforces a strict 10-minute temporary lockout. The user will be blocked from logging into the workspace until the timer expires.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConfirmedAction}
                className="px-4 py-2 bg-white text-black font-bold rounded-xl text-xs font-mono hover:bg-zinc-200 transition cursor-pointer shadow"
              >
                Confirm Command
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM PURGE & RESET MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 bg-red-600 text-white rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase font-mono">
                  Full Website Reset & Purge
                </h3>
                <p className="text-xs text-zinc-400">Remove all saved emails and Signals</p>
              </div>
            </div>

            <div className="p-4 bg-black border border-zinc-800 rounded-2xl space-y-2 text-xs font-mono">
              <p className="text-red-400 font-bold">
                ⚠️ WARNING: This operation will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li>Permanently erase all registered member emails and logins.</li>
                <li>Clear all chat messages and signals across all channels.</li>
                <li>Preserve clean primary Owner account (Manoj X).</li>
              </ul>
            </div>

            {resetError && (
              <div className="p-3 bg-zinc-900 border border-red-800/80 rounded-xl text-red-400 text-xs font-mono">
                {resetError}
              </div>
            )}

            <form onSubmit={handleSystemReset} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1 uppercase">
                  Confirm Owner Password (Manoj X)
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter Manoj X to confirm"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  disabled={isResetting}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs font-mono transition cursor-pointer shadow flex items-center gap-1.5"
                >
                  {isResetting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Execute Reset & Purge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
