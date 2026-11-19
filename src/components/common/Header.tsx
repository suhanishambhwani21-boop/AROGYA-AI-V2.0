import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Building2,
  ChevronDown,
  Shield,
  User,
  Clock,
  Stethoscope,
  LogIn,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { UserRole, Hospital, AuthUser } from '../../types';
import { KINTSUGI_EASE } from './KintsugiPrimitives';

interface HeaderProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  activeAlertsCount: number;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedHospital: Hospital;
  hospitals: Hospital[];
  onHospitalChange: (hospitalId: string) => void;
  onEmergencyClick: () => void;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigateTab,
  activeAlertsCount,
  currentRole,
  onRoleChange,
  selectedHospital,
  hospitals,
  onHospitalChange,
  onEmergencyClick,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showHospMenu, setShowHospMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<UserRole, { label: string; sub: string; icon: any }> = {
    admin: {
      label: 'Hospital Administrator',
      sub: 'Command Center & ML Forecasting',
      icon: Shield,
    },
    hospital_staff: {
      label: 'Staff & Bed Manager',
      sub: 'Live Operations & Bed Triage',
      icon: Stethoscope,
    },
    sysadmin: {
      label: 'System Administrator',
      sub: 'Model Pipelines & Node Config',
      icon: Activity,
    },
    patient: {
      label: 'Patient & Attendant',
      sub: 'Find Beds, OPD Tokens & Triage',
      icon: User,
    },
  };

  const CurrentRoleIcon = roleLabels[currentRole].icon;

  const primaryLinks = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'forecast-graph', label: 'FORECAST' },
    { id: 'what-if', label: 'WHAT-IF' },
    { id: 'book-opd', label: 'OPD' },
    { id: 'emergency', label: 'TRIAGE' },
  ];

  const isAlertsActive = activeTab === 'alerts';

  return (
    <header className="sticky top-0 z-40 bg-[#1E2A3A]/95 backdrop-blur-md border-b border-[#DCEBF5]/15">
      {/* Primary Top Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Left Wordmark */}
        <button
          type="button"
          onClick={() => onNavigateTab('dashboard')}
          className="text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase text-[#FFFFFF] hover:text-[#B0E0E6] transition-colors whitespace-nowrap shrink-0 cursor-pointer kintsugi-focus rounded-md py-1"
        >
          AROGYA AI
        </button>

        {/* Right Nav Links + Alerts Button */}
        <nav aria-label="Primary Navigation" className="flex items-center gap-4 sm:gap-7 overflow-x-auto no-scrollbar">
          {primaryLinks.map(link => {
            const isActive =
              activeTab === link.id ||
              (link.id === 'forecast-graph' && activeTab === 'prediction') ||
              (link.id === 'book-opd' && activeTab === 'doctors-opd');

            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  if (link.id === 'emergency') {
                    onEmergencyClick();
                  } else {
                    onNavigateTab(link.id);
                  }
                }}
                className={`relative py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer kintsugi-focus ${
                  isActive
                    ? 'text-[#FFFFFF]'
                    : 'text-[#DCEBF5]/80 hover:text-[#B0E0E6]'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="kintsugiTopNavUnderline"
                    transition={{ duration: 0.25, ease: KINTSUGI_EASE }}
                    className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-[#4682B4] shadow-[0_0_8px_rgba(176,224,230,0.65)]"
                  />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => onNavigateTab('alerts')}
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.2em] uppercase border transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 kintsugi-focus ${
              isAlertsActive
                ? 'bg-[#366C9A] text-[#FFFFFF] border-[#B0E0E6] shadow-[0_0_16px_rgba(176,224,230,0.4)]'
                : 'border-[#B0E0E6]/60 text-[#B0E0E6] hover:bg-[#4682B4]/25 hover:text-[#FFFFFF]'
            }`}
          >
            <span>ALERTS</span>
            {activeAlertsCount > 0 && (
              <span className="kintsugi-num px-1.5 py-0.5 rounded-full bg-[#C8433F] text-[#FFFFFF] text-[10px] font-bold leading-none">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Slim Context Utility Bar (Hospital Node, Role Switcher, Account & Live Clock) */}
      <div className="border-t border-[#DCEBF5]/12 bg-[#151F2C]/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-[11px] text-[#DCEBF5]/80">
            <span className="hidden md:inline truncate max-w-[320px] text-[#FFFFFF] font-medium">
              {selectedHospital.name}
            </span>
            <span className="hidden md:inline text-[#DCEBF5]/35" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 kintsugi-num text-[#B0E0E6]">
              <Clock className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>{timeStr}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Hospital Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowHospMenu(!showHospMenu);
                  setShowRoleMenu(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#243346] hover:bg-[#2C3E55] border border-[#DCEBF5]/20 text-[11px] font-medium text-[#FFFFFF] transition cursor-pointer kintsugi-focus"
              >
                <Building2 className="w-3.5 h-3.5 text-[#B0E0E6]" />
                <span className="max-w-[130px] truncate">
                  {selectedHospital.name.split(' ')[0]} {selectedHospital.name.split(' ')[1] || ''}
                </span>
                <ChevronDown className="w-3 h-3 text-[#DCEBF5]/75" />
              </button>

              {showHospMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-[#243346] rounded-xl shadow-2xl border border-[#DCEBF5]/25 p-2 z-50 text-xs"
                  onClick={() => setShowHospMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B0E0E6]">
                    Hospital Network Node
                  </div>
                  {hospitals.map(h => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => onHospitalChange(h.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-start justify-between gap-2 transition cursor-pointer ${
                        h.id === selectedHospital.id
                          ? 'bg-[#366C9A] text-[#FFFFFF] border border-[#B0E0E6]/50'
                          : 'hover:bg-[#2C3E55] text-[#DCEBF5]'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-[#FFFFFF]">{h.name}</div>
                        <div className="text-[11px] text-[#DCEBF5]/75">{h.city}</div>
                      </div>
                      <div className="text-right shrink-0 kintsugi-num">
                        <span className="font-bold text-[#B0E0E6]">{h.availableBeds}</span>
                        <span className="text-[10px] text-[#DCEBF5]/70"> / {h.totalBeds}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowHospMenu(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#243346] hover:bg-[#2C3E55] border border-[#DCEBF5]/20 text-[11px] font-medium text-[#DCEBF5] transition cursor-pointer kintsugi-focus"
              >
                <CurrentRoleIcon className="w-3.5 h-3.5 text-[#B0E0E6]" />
                <span className="hidden sm:inline">{roleLabels[currentRole].label}</span>
                <span className="sm:hidden">{currentRole === 'patient' ? 'Patient' : 'Admin'}</span>
                <ChevronDown className="w-3 h-3 text-[#DCEBF5]/75" />
              </button>

              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-[#243346] rounded-xl shadow-2xl border border-[#DCEBF5]/25 p-2 z-50 text-xs"
                  onClick={() => setShowRoleMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B0E0E6]">
                    Switch Role Workspace
                  </div>
                  {(Object.keys(roleLabels) as UserRole[]).map(role => {
                    const item = roleLabels[role];
                    const Icon = item.icon;
                    const isActive = currentRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => onRoleChange(role)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition cursor-pointer ${
                          isActive
                            ? 'bg-[#2C3E55] border border-[#4682B4] text-[#FFFFFF]'
                            : 'hover:bg-[#2C3E55]/70 text-[#DCEBF5]'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isActive
                              ? 'bg-[#366C9A] text-[#FFFFFF]'
                              : 'bg-[#151F2C] text-[#B0E0E6]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#FFFFFF]">{item.label}</div>
                          <div className="text-[11px] text-[#DCEBF5]/75">{item.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Account Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowHospMenu(false);
                    setShowRoleMenu(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#243346] hover:bg-[#2C3E55] border border-[#DCEBF5]/20 text-[11px] font-medium text-[#FFFFFF] transition cursor-pointer kintsugi-focus"
                >
                  <div className="w-5 h-5 rounded-full bg-[#366C9A] text-[#FFFFFF] border border-[#B0E0E6]/40 flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#DCEBF5]/75" />
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-[#243346] rounded-xl shadow-2xl border border-[#DCEBF5]/25 p-3 z-50 text-xs space-y-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="p-2.5 bg-[#151F2C] rounded-lg border border-[#DCEBF5]/15 space-y-1">
                      <div className="font-semibold text-[#FFFFFF]">{currentUser.name}</div>
                      <div className="text-[11px] text-[#B0E0E6]">{currentUser.designation}</div>
                      <div className="text-[10px] text-[#DCEBF5]/70 font-mono">{currentUser.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2C3E55] text-[#FFFFFF] flex items-center gap-2 transition cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#B0E0E6]" />
                      <span>Switch Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2C3E55] text-[#F08582] flex items-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="kintsugi-btn-celadon flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
