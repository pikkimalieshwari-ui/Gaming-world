import React, { useState, useEffect } from 'react';
import { ActiveTab, User } from './types';
import { Navbar } from './components/Navbar';
import { ChatTab } from './components/ChatTab';
import { BrowserTab } from './components/BrowserTab';
import { YouTubeTab } from './components/YouTubeTab';
import { CalculatorTab } from './components/CalculatorTab';
import { CalendarTab } from './components/CalendarTab';
import { ClockTab } from './components/ClockTab';
import { OwnerConsole } from './components/OwnerConsole';
import { LoginModal } from './components/LoginModal';
import { OwnerAccessModal } from './components/OwnerAccessModal';
import { BlockedScreen } from './components/BlockedScreen';
import { FiredUserScreen } from './components/FiredUserScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);

  // Security Lockout states
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
      // Ignore transient errors on startup or lock status check
    }
  };

  useEffect(() => {
    checkLockoutStatus();

    // Check if user session stored in localStorage
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
                if (data.user.role === 'owner' || data.user.email.toLowerCase() === 'pikkimalieshwari@gmail.com') {
                  setIsOwnerAuthenticated(true);
                }
                setIsLoginModalOpen(false);
              } else {
                // User was deleted, rejected, or blocked on server
                localStorage.removeItem('mk_user_session');
                setCurrentUser(null);
                setIsOwnerAuthenticated(false);
                setIsLoginModalOpen(true);
              }
            })
            .catch(() => {
              // Network fallback
              setCurrentUser(parsed);
              if (parsed.role === 'owner' || parsed.email === 'pikkimalieshwari@gmail.com') {
                setIsOwnerAuthenticated(true);
              }
            });
        } else {
          setIsLoginModalOpen(true);
        }
      } catch (e) {
        localStorage.removeItem('mk_user_session');
        setIsLoginModalOpen(true);
      }
    } else {
      // Force Login/Signup Modal on startup so user must sign in or register
      setIsLoginModalOpen(true);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('mk_user_session', JSON.stringify(user));
    if (user.role === 'owner') {
      setIsOwnerAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsOwnerAuthenticated(false);
    localStorage.removeItem('mk_user_session');
    setActiveTab('chat');
  };

  const handleOwnerGranted = () => {
    setIsOwnerAuthenticated(true);
    setActiveTab('owner-console');

    // Upgrade current user if needed
    if (currentUser) {
      const updated = { ...currentUser, role: 'owner' as const };
      setCurrentUser(updated);
      localStorage.setItem('mk_user_session', JSON.stringify(updated));
    }
  };

  const handleBlockedTriggered = (seconds: number) => {
    setIsBlocked(true);
    setBlockedRemainingSeconds(seconds);
  };

  // If user is fired by owner
  if (currentUser && currentUser.isFired) {
    return <FiredUserScreen user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Blocked Guard Screen (10 Minute Lockout) */}
      {isBlocked && (
        <BlockedScreen
          remainingSeconds={blockedRemainingSeconds}
          onTimerExpire={() => {
            setIsBlocked(false);
            setBlockedRemainingSeconds(0);
          }}
        />
      )}

      {/* Main App Bar */}
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

      {/* Active Tab View Frame */}
      <main className="flex-1 pb-10">
        {activeTab === 'chat' && <ChatTab currentUser={currentUser} />}
        {activeTab === 'browser' && <BrowserTab />}
        {activeTab === 'youtube' && <YouTubeTab />}
        {activeTab === 'calculator' && <CalculatorTab />}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'clock' && <ClockTab />}
        {activeTab === 'owner-console' && <OwnerConsole currentUser={currentUser} />}
      </main>

      {/* Authentication & Access Modals */}
      <LoginModal
        isOpen={isLoginModalOpen || !currentUser}
        onClose={() => {
          if (currentUser) {
            setIsLoginModalOpen(false);
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <OwnerAccessModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        onOwnerGranted={handleOwnerGranted}
        onBlockedTriggered={handleBlockedTriggered}
      />
    </div>
  );
}
