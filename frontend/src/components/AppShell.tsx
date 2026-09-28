import React, { useState } from 'react';
import { Home as HomeIcon, LayoutDashboard, ShieldAlert, RefreshCw, Layers, User, X, Building2, CheckCircle2 } from 'lucide-react';

interface AppShellProps {
  currentTab: 'home' | 'dashboard' | 'alerts' | 'company';
  selectedCompanyId: number | null;
  onTabChange: (tab: 'home' | 'dashboard' | 'alerts') => void;
  isFallback: boolean;
  alertCount: number;
  lastUpdated: string | null;
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  isFallback,
  alertCount,
  lastUpdated,
  onRefresh,
  children
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#292721] flex flex-col font-sans relative overflow-x-hidden">
      {/* Header Bar */}
      <header className="bg-[#FFFDF8] border-b border-[#DED6C8] sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {/* Ventra Logo Only */}
          <div
            onClick={() => onTabChange('home')}
            className="flex items-center cursor-pointer group py-0.5"
            title="Ventra - Go to Home"
          >
            <img src="/ventra-logo.png" alt="Ventra Logo" className="h-9 object-contain transition-transform group-hover:scale-105" />
          </div>
        </div>

        {/* Header Right Actions & Data Status */}
        <div className="flex items-center gap-4">
          {/* Data Connectivity Mode Badge */}
          <div className="flex items-center gap-2 text-xs">
            {isFallback ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                Demo Data (Offline Mode)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Live Model API Connected
              </span>
            )}
          </div>

          <div className="text-right text-[11px] text-[#746E63] hidden md:block">
            <span>Last updated: </span>
            <span className="font-bold text-[#4C3B2A]">{formattedDate}</span>
          </div>

          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#8A6A43] hover:bg-[#4C3B2A] disabled:opacity-50 text-[#FFFDF8] text-xs font-bold rounded shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing signals...' : 'Refresh Pipeline'}
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#FFFDF8] border-r border-[#DED6C8] hidden md:flex flex-col justify-between p-4">
          <div className="space-y-6">
            <div>
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#9A9387] mb-2">
                Navigation
              </div>
              <nav className="space-y-1">
                {/* Home Navigation Button */}
                <button
                  onClick={() => onTabChange('home')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-bold transition-colors ${
                    currentTab === 'home'
                      ? 'bg-[#F1EBDD] text-[#4C3B2A] border border-[#DED6C8]'
                      : 'text-[#746E63] hover:bg-[#F7F3EA] hover:text-[#292721]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HomeIcon className="w-4 h-4 text-[#8A6A43]" />
                    <span>Home</span>
                  </div>
                </button>

                {/* Dashboard Navigation Button */}
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-bold transition-colors ${
                    currentTab === 'dashboard'
                      ? 'bg-[#F1EBDD] text-[#4C3B2A] border border-[#DED6C8]'
                      : 'text-[#746E63] hover:bg-[#F7F3EA] hover:text-[#292721]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-[#8A6A43]" />
                    <span>Dashboard</span>
                  </div>
                </button>

                {/* Risk Alerts Navigation Button */}
                <button
                  onClick={() => onTabChange('alerts')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-bold transition-colors ${
                    currentTab === 'alerts'
                      ? 'bg-[#F1EBDD] text-[#4C3B2A] border border-[#DED6C8]'
                      : 'text-[#746E63] hover:bg-[#F7F3EA] hover:text-[#292721]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-[#A95145]" />
                    <span>Alerts</span>
                  </div>
                  {alertCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#A95145] text-[#FFFDF8]">
                      {alertCount}
                    </span>
                  )}
                </button>

                {/* Profile Navigation Button */}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-bold transition-colors ${
                    isProfileOpen
                      ? 'bg-[#F1EBDD] text-[#4C3B2A] border border-[#DED6C8]'
                      : 'text-[#746E63] hover:bg-[#F7F3EA] hover:text-[#292721]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#8A6A43]" />
                    <span>Profile</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Architecture Summary Card */}
            <div className="p-3.5 bg-[#F7F3EA] rounded-md border border-[#DED6C8] text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#4C3B2A] mb-1">
                <Layers className="w-4 h-4 text-[#8A6A43]" />
                <span>System Pipeline</span>
              </div>
              <p className="text-[11px] text-[#746E63] leading-relaxed">
                6 Signal Scrapers → Normalizer → Authoritative Scorer → SQLite → FastAPI → React.
              </p>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-[#DED6C8] text-[11px] text-[#9A9387]">
            <p className="font-bold text-[#4C3B2A]">VENTRA Intelligence</p>
            <p className="mt-0.5 text-[10px]">SRMIST Capital Craft Summit 2026</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Right Slide-over Profile Panel Backdrop */}
      {isProfileOpen && (
        <div
          onClick={() => setIsProfileOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Right Slide-over Profile Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#F5F0E8] border-l border-[#DED6C8] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between p-6 ${
          isProfileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="space-y-5 overflow-y-auto">
          {/* Header Bar of Panel */}
          <div className="flex items-center justify-between pb-3 border-b border-[#DED6C8]">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#8A6A43]" />
              <h2 className="text-base font-extrabold text-[#292721]">Account Profile</h2>
            </div>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="p-1 rounded-full text-[#746E63] hover:text-[#292721] hover:bg-[#DED6C8]/50 transition-colors"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Company Profile Card */}
          <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-xl overflow-hidden shadow-xs">
            {/* Card Section Header Bar */}
            <div className="bg-[#3B2A1A] text-[#FFFDF8] px-4 py-3 flex items-center gap-2 font-bold text-sm">
              <Building2 className="w-4 h-4 text-[#C8873A]" />
              <span>Company Information</span>
            </div>

            {/* Profile Fields List */}
            <div className="p-4 space-y-3.5 text-xs text-[#292721]">
              <div className="flex justify-between items-baseline border-b border-[#F1EBDD] pb-2">
                <span className="text-[#746E63] font-medium">Company Name:</span>
                <span className="font-semibold text-[#3B2A1A] text-right">Razorpay Pvt. Ltd.</span>
              </div>

              <div className="flex justify-between items-baseline border-b border-[#F1EBDD] pb-2">
                <span className="text-[#746E63] font-medium">GSTIN:</span>
                <span className="font-semibold text-[#3B2A1A] font-mono text-[11px] text-right">29AABCR1234A1Z5</span>
              </div>

              <div className="flex justify-between items-baseline border-b border-[#F1EBDD] pb-2">
                <span className="text-[#746E63] font-medium">CIN:</span>
                <span className="font-semibold text-[#3B2A1A] font-mono text-[11px] text-right">U72200KA2013PTC070123</span>
              </div>

              <div className="flex justify-between items-baseline border-b border-[#F1EBDD] pb-2">
                <span className="text-[#746E63] font-medium">Contact Person:</span>
                <span className="font-semibold text-[#3B2A1A] text-right">Arjun Mehta</span>
              </div>

              <div className="flex justify-between items-baseline border-b border-[#F1EBDD] pb-2">
                <span className="text-[#746E63] font-medium">Email:</span>
                <span className="font-semibold text-[#3B2A1A] text-right">contact@razorpay.com</span>
              </div>

              <div className="flex justify-between items-baseline border-b border-[#F1EBDD] pb-2">
                <span className="text-[#746E63] font-medium">Phone:</span>
                <span className="font-semibold text-[#3B2A1A] text-right">+91 98765 43210</span>
              </div>

              <div className="flex justify-between items-start border-b border-[#F1EBDD] pb-2">
                <span className="text-[#746E63] font-medium">Address:</span>
                <span className="font-semibold text-[#3B2A1A] text-right max-w-[200px] leading-snug">
                  SJR iTech Park, Bangalore 560068
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[#F1EBDD] pb-2">
                <span className="text-[#746E63] font-medium">Category:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  Healthy ✓
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-[#746E63] font-medium">Onboarded:</span>
                <span className="font-semibold text-[#3B2A1A] text-right">12 Jan 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Button Footer */}
        <div className="pt-4 border-t border-[#DED6C8]">
          <button
            onClick={() => alert("Profile edit feature available in enterprise edition.")}
            className="w-full py-3 px-4 bg-[#C8873A] hover:bg-[#8A6A43] text-[#FFFDF8] font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            Edit Profile
          </button>
        </div>
      </aside>
    </div>
  );
};
