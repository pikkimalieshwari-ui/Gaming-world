import React, { useState } from 'react';
import { ActiveTab, User } from '../types';
import {
  MessageSquare,
  Globe,
  Youtube,
  Calculator,
  Calendar,
  Clock,
  Crown,
  LogOut,
  LogIn,
  Radio,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  isOwnerAuthenticated: boolean;
  onOpenOwnerModal: () => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  isBlocked: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isOwnerAuthenticated,
  onOpenOwnerModal,
  onOpenLoginModal,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'chat' as ActiveTab, label: 'Chat & Files', icon: MessageSquare, badge: '100MB' },
    { id: 'news' as ActiveTab, label: 'Audio News', icon: Radio, badge: 'TTS Live' },
    { id: 'knowledge' as ActiveTab, label: 'I-Know Hub', icon: Sparkles, badge: 'NASA/ISRO' },
    { id: 'browser' as ActiveTab, label: 'Browser', icon: Globe },
    { id: 'youtube' as ActiveTab, label: 'YouTube', icon: Youtube },
    { id: 'calculator' as ActiveTab, label: 'Calculator', icon: Calculator },
    { id: 'calendar' as ActiveTab, label: 'Calendar', icon: Calendar },
    { id: 'clock' as ActiveTab, label: 'Time', icon: Clock },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleOwnerClick = () => {
    if (isOwnerAuthenticated) {
      handleTabClick('owner-console');
    } else {
      setIsMobileMenuOpen(false);
      onOpenOwnerModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-zinc-800 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo - High Contrast Monochrome */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-white text-black p-0.5 shadow-md">
            <div className="w-full h-full bg-black text-white rounded-[14px] flex items-center justify-center font-black text-base border border-white">
              MK
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-white tracking-tight">MK creative X</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-black font-bold">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono hidden md:block">
              Intelligent Workspace & Scientific Knowledge Portal
            </p>
          </div>
        </div>

        {/* Tab Switcher - Desktop */}
        <nav className="hidden xl:flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-2xl shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1 rounded border font-mono ${
                      isActive
                        ? 'bg-black text-white border-black'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Owner Console Tab (Opens console if verified, or prompts for password Manoj X) */}
          <button
            onClick={handleOwnerClick}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'owner-console'
                ? 'bg-amber-400 text-black shadow'
                : isOwnerAuthenticated
                ? 'text-amber-400 hover:bg-amber-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${isOwnerAuthenticated ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>{isOwnerAuthenticated ? 'Owner Console' : 'Owner Access'}</span>
          </button>
        </nav>

        {/* Right Action Bar (User Info / Logout) */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs font-mono">
                <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-black text-xs shadow border border-zinc-300">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <div className="font-bold text-white truncate max-w-[110px]">{currentUser.name}</div>
                  <div className="text-[10px] text-zinc-400 capitalize">{currentUser.role}</div>
                </div>
              </div>

              {isOwnerAuthenticated && (
                <button
                  onClick={() => handleTabClick('owner-console')}
                  className="hidden lg:flex px-3 py-1.5 bg-white text-black font-extrabold rounded-xl text-xs items-center gap-1.5 shadow border border-white cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Owner Mode</span>
                </button>
              )}

              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-3.5 py-1.5 bg-white text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow hover:bg-zinc-200 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl border border-zinc-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium flex items-center justify-between transition cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={handleOwnerClick}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'owner-console'
                ? 'bg-amber-400 text-black shadow'
                : isOwnerAuthenticated
                ? 'text-amber-400 hover:bg-amber-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80'
            }`}
          >
            <Crown className={`w-4 h-4 ${isOwnerAuthenticated ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>{isOwnerAuthenticated ? 'Executive Owner Console' : 'Owner Access (Password Required)'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
