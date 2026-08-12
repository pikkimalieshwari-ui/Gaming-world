import React from 'react';
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
  ShieldAlert
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
  isBlocked,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo - Pure High Contrast Monochrome */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-black p-0.5 shadow">
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
            <p className="text-[10px] text-zinc-400 font-mono hidden sm:block">
              Secure Monochrome Workspace & Owner Hub
            </p>
          </div>
        </div>

        {/* Tab Switcher - Desktop */}
        <nav className="hidden xl:flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveTab('chat')}
            className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat & Files</span>
            <span className="text-[9px] bg-zinc-900 text-white px-1 rounded font-mono border border-zinc-700">100MB</span>
          </button>

          <button
            onClick={() => setActiveTab('browser')}
            className={`nav-tab-btn ${activeTab === 'browser' ? 'active' : ''}`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Browser</span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`nav-tab-btn ${activeTab === 'youtube' ? 'active' : ''}`}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>YouTube</span>
            <span className="text-[9px] bg-zinc-900 text-zinc-300 px-1 rounded font-mono border border-zinc-700">@MkIndustrial</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`nav-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`nav-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('clock')}
            className={`nav-tab-btn ${activeTab === 'clock' ? 'active' : ''}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time</span>
          </button>

          {isOwnerAuthenticated && (
            <button
              onClick={() => setActiveTab('owner-console')}
              className={`nav-tab-btn ${activeTab === 'owner-console' ? 'active-owner' : ''}`}
            >
              <Crown className="w-3.5 h-3.5 text-black" />
              <span>Owner Console</span>
            </button>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Owner Access Trigger Button */}
          {isOwnerAuthenticated ? (
            <button
              onClick={() => setActiveTab('owner-console')}
              className="px-3.5 py-1.5 bg-white text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow border border-white cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-black" />
              <span>Owner Mode</span>
            </button>
          ) : (
            <button
              onClick={onOpenOwnerModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                isBlocked
                  ? 'bg-zinc-900 text-zinc-200 border-zinc-600 animate-pulse'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700'
              }`}
            >
              {isBlocked ? <ShieldAlert className="w-3.5 h-3.5 text-white" /> : <Crown className="w-3.5 h-3.5 text-white" />}
              <span>{isBlocked ? 'Owner Blocked' : 'Owner Access'}</span>
            </button>
          )}

          {/* User Profile / Logout */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs font-mono">
                <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-black text-xs shadow border border-zinc-300">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <div className="font-bold text-white truncate max-w-[100px]">{currentUser.name}</div>
                  <div className="text-[10px] text-zinc-400 capitalize">{currentUser.role}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav Scroll Ribbon */}
      <div className="xl:hidden bg-black px-4 py-2 border-t border-zinc-800 flex overflow-x-auto gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'chat' ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          <MessageSquare className="w-3 h-3" /> Chat & Files (100MB)
        </button>

        <button
          onClick={() => setActiveTab('browser')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'browser' ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          <Globe className="w-3 h-3" /> Browser
        </button>

        <button
          onClick={() => setActiveTab('youtube')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'youtube' ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          <Youtube className="w-3 h-3" /> YouTube
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'calculator' ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          <Calculator className="w-3 h-3" /> Calculator
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'calendar' ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          <Calendar className="w-3 h-3" /> Calendar
        </button>

        <button
          onClick={() => setActiveTab('clock')}
          className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'clock' ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          <Clock className="w-3 h-3" /> Time
        </button>

        {isOwnerAuthenticated && (
          <button
            onClick={() => setActiveTab('owner-console')}
            className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'owner-console' ? 'bg-white text-black' : 'bg-zinc-900 text-white'
            }`}
          >
            <Crown className="w-3 h-3" /> Owner Console
          </button>
        )}
      </div>
    </header>
  );
};
