import React, { useState, useEffect } from 'react';
import { ActiveTab, User } from './types';
import { Navbar } from './components/Navbar';
import { ChatTab } from './components/ChatTab';
import { BrowserTab } from './components/BrowserTab';
import { YouTubeTab } from './components/YouTubeTab';
import { CalculatorTab } from './components/CalculatorTab';
import { CalendarTab } from './components/CalendarTab';
import { ClockTab } from './components/ClockTab';
import { AudioNewsTab } from './components/AudioNewsTab';
import { KnowledgeTab } from './components/KnowledgeTab';
import { OwnerConsole } from './components/OwnerConsole';
import { LoginModal } from './components/LoginModal';
import { OwnerAccessModal } from './components/OwnerAccessModal';
import { BlockedScreen } from './components/BlockedScreen';
import { FiredUserScreen } from './components/FiredUserScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);

  // Security Lockout states (10-minute temporary block)
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedRemainingSeconds, setBlockedRemainingSeconds] = useState(0);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  // Check lockout status from server
  const checkLockoutStatus = async () => {
    try {
      const res = await fetch('/api/owner/lock-status');
      if (res.ok) {
        const data = await res.json();
        if (data.isBlocked) {
          setIsBlocked(true);
          setBlockedRemainingSeconds(data.remainingSeconds || 600);
        } else {
          setIsBlocked(false);
          setBlockedRemainingSeconds(0);
        }
      }
    } catch {
      // Transient error fallback
    }
  };

  useEffect(() => {
    checkLockoutStatus();

    // Check if valid user session stored in localStorage
    const savedUser = localStorage.getItem('mk_user_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.id || parsed.email)) {
          // Verify session status with server
          fetch(`/api/auth/me?id=${parsed.id || ''}&email=${encodeURIComponent(parsed.email || '')}`)
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                setCurrentUser(data.user);
                localStorage.setItem('mk_user_session', JSON.stringify(data.user));
                // Do NOT automatically authenticate owner console - must explicitly enter password Manoj X
                setIsOwnerAuthenticated(false);
                setIsLoginModalOpen(false);
              } else {
                localStorage.removeItem('mk_user_session');
                setCurrentUser(null);
                setIsOwnerAuthenticated(false);
                setIsLoginModalOpen(true);
              }
            })
            .catch(() => {
              localStorage.removeItem('mk_user_session');
              setCurrentUser(null);
              setIsOwnerAuthenticated(false);
              setIsLoginModalOpen(true);
            });
        } else {
          setCurrentUser(null);
          setIsOwnerAuthenticated(false);
          setIsLoginModalOpen(true);
        }
      } catch (e) {
        localStorage.removeItem('mk_user_session');
        setCurrentUser(null);
        setIsOwnerAuthenticated(false);
        setIsLoginModalOpen(true);
      }
    } else {
      // First visit: Show Login / Sign up modal first
      setCurrentUser(null);
      setIsOwnerAuthenticated(false);
      setIsLoginModalOpen(true);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('mk_user_session', JSON.stringify(user));
    // Standard login does NOT automatically unlock Owner Console; password Manoj X required
    setIsOwnerAuthenticated(false);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsOwnerAuthenticated(false);
    localStorage.removeItem('mk_user_session');
    setActiveTab('chat');
    setIsLoginModalOpen(true);
  };

  const handleOwnerGranted = () => {
    setIsOwnerAuthenticated(true);
    setActiveTab('owner-console');

    // Upgrade current user if logged in, or create executive session
    if (currentUser) {
      const updated = {
        ...currentUser,
        name: currentUser.role === 'owner' ? currentUser.name : 'Manoj X',
        role: 'owner' as const,
        department: 'Executive Authority',
      };
      setCurrentUser(updated);
      localStorage.setItem('mk_user_session', JSON.stringify(updated));
    } else {
      const executiveUser: User = {
        id: 'usr_owner_primary',
        email: 'pikkimalieshwari@gmail.com',
        name: 'Manoj X',
        role: 'owner',
        department: 'Executive Authority',
        isFired: false,
        joinedAt: new Date().toISOString(),
        avatarColor: 'from-zinc-100 to-zinc-400',
        isApproved: true,
        approvalStatus: 'accepted',
      };
      setCurrentUser(executiveUser);
      localStorage.setItem('mk_user_session', JSON.stringify(executiveUser));
    }
    setIsLoginModalOpen(false);
  };

  const handleBlockedTriggered = (seconds: number) => {
    setIsBlocked(true);
    setBlockedRemainingSeconds(seconds);
  };

  // If user is marked as fired by owner
  if (currentUser && currentUser.isFired) {
    return <FiredUserScreen user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans antialiased flex flex-col selection:bg-white selection:text-black">
      {/* Blocked Guard Screen (10-Minute Lockout) */}
      {isBlocked && (
        <BlockedScreen
          remainingSeconds={blockedRemainingSeconds}
          onTimerExpire={() => {
            setIsBlocked(false);
            setBlockedRemainingSeconds(0);
          }}
        />
      )}

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        isOwnerAuthenticated={isOwnerAuthenticated}
        onOpenOwnerModal={() => setIsOwnerModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        isBlocked={isBlocked}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 pb-12">
        {activeTab === 'chat' && <ChatTab currentUser={currentUser} />}
        {activeTab === 'news' && <AudioNewsTab />}
        {activeTab === 'knowledge' && <KnowledgeTab />}
        {activeTab === 'browser' && <BrowserTab />}
        {activeTab === 'youtube' && <YouTubeTab />}
        {activeTab === 'calculator' && <CalculatorTab />}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'clock' && <ClockTab />}
        {activeTab === 'owner-console' && <OwnerConsole currentUser={currentUser} />}
      </main>

      {/* Animated Login Modal with Owner Security Portal */}
      <LoginModal
        isOpen={isLoginModalOpen || !currentUser}
        onClose={() => {
          if (currentUser) {
            setIsLoginModalOpen(false);
          }
        }}
        onLoginSuccess={handleLoginSuccess}
        onOwnerGranted={handleOwnerGranted}
        onBlockedTriggered={handleBlockedTriggered}
      />

      {/* Owner Access Fallback Modal */}
      <OwnerAccessModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        onOwnerGranted={handleOwnerGranted}
        onBlockedTriggered={handleBlockedTriggered}
      />
    </div>
  );
}
