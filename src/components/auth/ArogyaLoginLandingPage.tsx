import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Brain,
  Shield,
  User,
  Stethoscope,
  Building,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Smartphone,
  Database,
  Landmark,
  Sparkles,
  FileText,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import hospitalCampusImg from '../../assets/images/hospital_campus_bg_1791432957328.jpg';
import { UserRole, AuthUser, Hospital } from '../../types';
import { KintsugiReveal } from '../common/KintsugiPrimitives';

interface ArogyaLoginLandingPageProps {
  hospitals?: Hospital[];
  onLoginSuccess: (user: AuthUser) => void;
  onExploreDemo?: () => void;
  onOpenReportAssistant?: () => void;
}

export const ArogyaLoginLandingPage: React.FC<ArogyaLoginLandingPageProps> = ({
  hospitals = [],
  onLoginSuccess,
  onExploreDemo,
  onOpenReportAssistant,
}) => {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'staff'>('patient');
  const [loginMethod, setLoginMethod] = useState<'login' | 'otp'>('login');

  const [identifier, setIdentifier] = useState<string>('patient.demo@arogya.gov.in');
  const [password, setPassword] = useState<string>('Patient@Arogya2026');
  const [otpPhone, setOtpPhone] = useState<string>('+91 98201 44552');
  const [otpCode, setOtpCode] = useState<string>('884210');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOtpSentBanner, setShowOtpSentBanner] = useState<boolean>(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const handleRoleSelect = (role: 'patient' | 'doctor' | 'staff') => {
    setSelectedRole(role);
    if (role === 'patient') {
      setIdentifier('patient.demo@arogya.gov.in');
      setPassword('Patient@Arogya2026');
      setOtpPhone('+91 98201 44552');
    } else if (role === 'doctor') {
      setIdentifier('dr.malhotra@arogya.gov.in');
      setPassword('Doctor@Arogya2026');
      setOtpPhone('+91 98201 88000');
    } else {
      setIdentifier('staff.opd@arogya.gov.in');
      setPassword('Staff@Arogya2026');
      setOtpPhone('+91 98112 44331');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const targetRole: UserRole =
        selectedRole === 'doctor'
          ? 'admin'
          : selectedRole === 'staff'
          ? 'hospital_staff'
          : 'patient';

      const userName =
        selectedRole === 'doctor'
          ? 'Dr. Vikram Malhotra (Senior Consultant)'
          : selectedRole === 'staff'
          ? 'Anjali Nair (Hospital Queue Staff)'
          : 'Suhani Shambwani (Patient)';

      const user: AuthUser = {
        id: `user-${selectedRole}-${Date.now()}`,
        name: userName,
        email: identifier.includes('@') ? identifier : `${identifier}@arogya.gov.in`,
        phone: otpPhone,
        role: targetRole,
        hospitalId: hospitals[0]?.id || 'hosp-1',
        hospitalName: hospitals[0]?.name || 'Government District Hospital & Medical College',
        department:
          selectedRole === 'doctor'
            ? 'Cardiology & Outpatient Medicine'
            : selectedRole === 'staff'
            ? 'OPD Central Registration & Bed Triage'
            : 'Outpatient Care',
        designation:
          selectedRole === 'doctor'
            ? 'Senior Medical Officer'
            : selectedRole === 'staff'
            ? 'OPD & Bed Allocation Staff'
            : 'Ayushman Registered Citizen',
        badgeNumber: selectedRole !== 'patient' ? `GOV-MED-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        abhaId: selectedRole === 'patient' ? '91-4421-8890-1234' : undefined,
        isLoggedIn: true,
      };

      onLoginSuccess(user);
    }, 500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1E2A3A] text-[#FFFFFF] overflow-x-hidden flex flex-col justify-between">
      {/* Subtle Kintsugi Indigo & Gold Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#B0E0E6]/6 blur-3xl" />
        <div className="absolute top-20 right-10 w-[520px] h-[600px] rounded-full bg-[#4682B4]/6 blur-3xl" />

        {/* Faint ECG Kintsugi Gold/Celadon Line */}
        <svg
          className="absolute top-1/2 left-0 w-full h-32 opacity-12 stroke-[#4682B4] fill-none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M0,60 L280,60 L295,45 L310,75 L325,10 L340,110 L355,50 L370,68 L385,60 L780,60 L795,45 L810,75 L825,10 L840,110 L855,50 L870,68 L885,60 L1200,60"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-10 pt-5 pb-8 flex-1 flex flex-col justify-between">
        {/* TOP PORTAL HEADER */}
        <header className="w-full flex items-center justify-between pb-4 border-b border-[#B0E0E6]/15">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 rounded-2xl bg-[#243346] border border-[#4682B4]/40 flex items-center justify-center p-2 text-[#B0E0E6]">
              <svg viewBox="0 0 24 24" className="w-full h-full stroke-current fill-none stroke-[1.9]">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 11 h4 l2 -3 l2 6 l2 -4 l1.5 2 h6.5"
                  className="stroke-[#4682B4] stroke-[2]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="kintsugi-section-label text-sm font-bold text-[#FFFFFF]">
                  AROGYA AI
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#4682B4]/12 text-[#B0E0E6] text-[10px] font-semibold uppercase tracking-wider border border-[#4682B4]/30">
                  Health Access Portal
                </span>
              </div>
              <p className="text-[11px] text-[#B0E0E6]/70">
                Smart Care · Predictive Bed Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-[#FFFFFF]">
                Government &amp; Tertiary Care Network
              </div>
              <div className="text-[11px] text-[#B0E0E6]/75">
                Unified Appointment &amp; Bed Telemetry System
              </div>
            </div>

            <div className="w-10 h-10 rounded-xl bg-[#243346] border border-[#B0E0E6]/25 flex items-center justify-center text-[#B0E0E6]">
              <Landmark className="w-5 h-5" />
            </div>

            {onOpenReportAssistant && (
              <button
                type="button"
                onClick={onOpenReportAssistant}
                className="kintsugi-btn-celadon kintsugi-focus hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#B0E0E6]" />
                <span>AI Report Assistant</span>
              </button>
            )}

            {onExploreDemo && (
              <button
                type="button"
                onClick={onExploreDemo}
                className="kintsugi-btn-gold kintsugi-focus hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs cursor-pointer"
              >
                <span>Live System</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* MAIN BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center my-6 lg:my-8">
          {/* LEFT HERO */}
          <KintsugiReveal className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="kintsugi-section-label text-[10px] text-[#B0E0E6] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Hospital &amp; Patient Access</span>
              </div>

              <h1 className="kintsugi-serif text-4xl sm:text-5xl lg:text-6xl font-semibold uppercase tracking-tight text-[#B0E0E6] leading-[1.03]">
                Care Delivered, <br />
                Capacity <span className="kintsugi-gold-word">Foreseen.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#B0E0E6]/80 max-w-xl leading-relaxed">
                Sign in to manage predictive ward occupancy, reserve OPD tokens, and review real-time clinical readiness across connected hospitals.
              </p>
            </div>

            {/* Four Feature Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { icon: Calendar, title: 'Online Appointments', desc: 'Book & manage your visits' },
                { icon: Users, title: 'Live Queue Tracking', desc: 'Know your turn in real-time' },
                { icon: Brain, title: 'AI Assisted Routing', desc: 'Right care, right time' },
                { icon: Shield, title: 'Role-Based Security', desc: 'Protected clinical access' },
              ].map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="kintsugi-card p-3.5 rounded-2xl transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#4682B4]/12 border border-[#4682B4]/30 text-[#B0E0E6] flex items-center justify-center mb-2.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-xs text-[#FFFFFF] leading-tight">
                      {feat.title}
                    </div>
                    <div className="text-[11px] text-[#B0E0E6]/65 mt-1 leading-snug">
                      {feat.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hospital Campus Visual Card with Indigo Glass Overlay */}
            <div className="relative rounded-3xl overflow-hidden border border-[#B0E0E6]/20 min-h-[220px] sm:min-h-[245px] flex flex-col justify-end p-5 group">
              <img
                src={hospitalCampusImg}
                alt="Modern Government Hospital Campus"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              <div className="absolute inset-0 bg-linear-to-t from-[#151F2C]/95 via-[#1E2A3A]/75 to-[#1E2A3A]/40" />
              <div className="absolute inset-0 bg-linear-to-r from-[#151F2C]/85 via-transparent to-transparent" />

              {/* Floating Live Queue Card */}
              <div className="kintsugi-card relative z-10 max-w-sm rounded-2xl p-4 border border-[#4682B4]/35">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#B0E0E6] text-[#1E2A3A] flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#FFFFFF] flex items-center gap-1.5">
                        <span>Live Queue</span>
                        <span className="w-2 h-2 rounded-full bg-[#4682B4] animate-ping" />
                      </div>
                      <div className="kintsugi-num text-sm font-bold text-[#B0E0E6]">
                        Token No. A034
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="kintsugi-section-label text-[9px] text-[#B0E0E6]/65">
                      Est. Wait
                    </div>
                    <div className="kintsugi-num text-base font-bold text-[#FFFFFF]">
                      18 mins
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#B0E0E6]/15 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#B0E0E6] bg-[#B0E0E6]/10 px-2 py-0.5 rounded-md border border-[#B0E0E6]/25">
                    Bed telemetry active
                  </span>

                  <svg className="w-24 h-4 stroke-[#4682B4] fill-none" viewBox="0 0 100 20">
                    <path
                      d="M0,10 L30,10 L35,4 L40,16 L45,2 L50,18 L55,10 L100,10"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative z-10 mt-4 flex flex-wrap items-end justify-between gap-3">
                <div className="kintsugi-serif text-xl sm:text-2xl italic text-[#B0E0E6]">
                  &ldquo;Resilient care, mended with foresight.&rdquo;
                </div>

                <div className="flex items-center gap-2 bg-[#151F2C]/90 px-3 py-1.5 rounded-xl border border-[#B0E0E6]/20 text-xs text-[#B0E0E6]">
                  <span className="text-[#FFFFFF] font-semibold">Powered by Arogya</span>
                  <span className="h-3 w-px bg-[#B0E0E6]/25" />
                  <span className="text-[#B0E0E6]">Public Health Grid</span>
                </div>
              </div>
            </div>
          </KintsugiReveal>

          {/* RIGHT LOGIN PANEL */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="kintsugi-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#4682B4]/30 space-y-5 relative">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#151F2C] border border-[#4682B4]/40 mb-1 text-[#B0E0E6]">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none stroke-[1.9]">
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 11 h4 l2 -3 l2 6 l2 -4 l1.5 2 h6.5"
                      className="stroke-[#4682B4] stroke-[2.2]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="kintsugi-section-label text-[10px] text-[#B0E0E6]">
                  Arogya AI Access
                </div>
                <h2 className="kintsugi-serif text-3xl font-semibold text-[#FFFFFF]">
                  Welcome <span className="kintsugi-gold-word">Back</span>
                </h2>
                <p className="text-xs text-[#B0E0E6]/70">
                  Choose your role and sign in to continue
                </p>
              </div>

              {/* ROLE SELECTION */}
              <div className="space-y-1.5">
                <div className="kintsugi-section-label text-[9px] text-[#B0E0E6]/65">
                  Select Role
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'patient' as const, label: 'Patient', desc: 'Book & track visits', icon: User },
                    { key: 'doctor' as const, label: 'Doctor', desc: 'Admin & patient care', icon: Stethoscope },
                    { key: 'staff' as const, label: 'Hospital Staff', desc: 'Queues & OPD ops', icon: Building },
                  ].map((r) => {
                    const Icon = r.icon;
                    const active = selectedRole === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => handleRoleSelect(r.key)}
                        className={`kintsugi-focus p-2.5 rounded-2xl text-left transition flex flex-col justify-between cursor-pointer ${
                          active
                            ? 'bg-[#2C3E55] border-2 border-[#4682B4] ring-1 ring-[#4682B4]/35'
                            : 'bg-[#151F2C]/80 hover:bg-[#243346] border border-[#B0E0E6]/20'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${active ? 'bg-[#4682B4]/20 text-[#B0E0E6]' : 'bg-[#B0E0E6]/12 text-[#B0E0E6]'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {active && <span className="w-2 h-2 rounded-full bg-[#4682B4]" />}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#FFFFFF] leading-tight">
                            {r.label}
                          </div>
                          <div className="text-[9px] text-[#B0E0E6]/65 line-clamp-2 mt-0.5 leading-tight">
                            {r.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LOGIN METHOD TOGGLE */}
              <div className="p-1 rounded-2xl bg-[#151F2C] border border-[#B0E0E6]/20 flex items-center">
                <button
                  type="button"
                  onClick={() => setLoginMethod('login')}
                  className={`kintsugi-focus flex-1 py-1.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === 'login'
                      ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                      : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setShowOtpSentBanner(true);
                  }}
                  className={`kintsugi-focus flex-1 py-1.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === 'otp'
                      ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                      : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>OTP Login</span>
                </button>
              </div>

              {showOtpSentBanner && loginMethod === 'otp' && (
                <div className="p-2.5 rounded-xl bg-[#B0E0E6]/10 border border-[#B0E0E6]/25 text-[11px] text-[#B0E0E6] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B0E0E6] shrink-0" />
                  <span>Demo OTP 884210 is pre-filled for rapid verification.</span>
                </div>
              )}

              {resetNotice && (
                <div className="p-2.5 rounded-xl bg-[#4682B4]/12 border border-[#4682B4]/35 text-[11px] text-[#B0E0E6] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{resetNotice}</span>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                {loginMethod === 'login' ? (
                  <>
                    <div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#B0E0E6]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Mobile Number / Email"
                          className="kintsugi-input w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs"
                        />
                      </div>
                      <p className="text-[10px] text-[#B0E0E6]/55 mt-1 pl-1">
                        Enter your registered mobile number or email ID
                      </p>
                    </div>

                    <div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#B0E0E6]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="kintsugi-input w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="kintsugi-focus absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0E0E6]/60 hover:text-[#B0E0E6] p-0.5 cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-[#B0E0E6]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value)}
                          placeholder="Mobile Number (10 digits)"
                          className="kintsugi-input w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs"
                        />
                      </div>
                      <p className="text-[10px] text-[#B0E0E6]/55 mt-1 pl-1">
                        6-digit one-time code via SMS gateway
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP (Demo: 884210)"
                        className="kintsugi-input kintsugi-num w-full px-4 py-2.5 rounded-2xl text-xs font-bold tracking-widest text-center"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-[#B0E0E6]/80 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#4682B4]"
                    />
                    <span className="font-medium text-[11px]">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setResetNotice(`Password reset verification link prepared for ${identifier}.`)
                    }
                    className="kintsugi-focus text-[11px] font-semibold text-[#B0E0E6] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="kintsugi-btn-gold kintsugi-focus w-full py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Authenticating...' : 'Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="w-full border-t border-[#B0E0E6]/15" />
                  <span className="bg-[#243346] px-3 text-[10px] font-semibold text-[#B0E0E6]/55 uppercase tracking-widest absolute">
                    OR
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setLoginMethod(loginMethod === 'login' ? 'otp' : 'login')}
                  className="kintsugi-btn-celadon kintsugi-focus w-full py-3 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-[#B0E0E6]" />
                  <span>{loginMethod === 'login' ? 'Login with OTP' : 'Login with Password'}</span>
                </button>

                <div className="text-center pt-2 text-xs text-[#B0E0E6]/65">
                  <span>New here? </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleRoleSelect('patient');
                      handleLoginSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    className="kintsugi-focus font-semibold text-[#B0E0E6] hover:underline cursor-pointer"
                  >
                    Create an account →
                  </button>
                </div>

                {/* Quick 1-Click Evaluation Logins */}
                <div className="pt-2 border-t border-[#B0E0E6]/15 space-y-1.5">
                  <div className="kintsugi-section-label text-[9px] text-[#B0E0E6]/65 flex items-center justify-between">
                    <span>Quick Demo Logins</span>
                    <span className="text-[#B0E0E6]">Instant Access</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleSelect('patient');
                        setTimeout(() => handleLoginSubmit({ preventDefault: () => {} } as React.FormEvent), 50);
                      }}
                      className="kintsugi-btn-celadon kintsugi-focus py-1.5 px-2 rounded-lg text-[10px] truncate cursor-pointer"
                      title="Login immediately as Patient (Suhani Shambwani)"
                    >
                      Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleSelect('doctor');
                        setTimeout(() => handleLoginSubmit({ preventDefault: () => {} } as React.FormEvent), 50);
                      }}
                      className="kintsugi-btn-celadon kintsugi-focus py-1.5 px-2 rounded-lg text-[10px] truncate cursor-pointer"
                      title="Login immediately as Doctor (Dr. Vikram Malhotra)"
                    >
                      Doctor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleSelect('staff');
                        setTimeout(() => handleLoginSubmit({ preventDefault: () => {} } as React.FormEvent), 50);
                      }}
                      className="kintsugi-btn-celadon kintsugi-focus py-1.5 px-2 rounded-lg text-[10px] truncate cursor-pointer"
                      title="Login immediately as Hospital Staff (Anjali Nair)"
                    >
                      Staff
                    </button>
                  </div>
                </div>

                {/* AI Health Report Assistant Spotlight */}
                {onOpenReportAssistant && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#151F2C]/85 border border-[#B0E0E6]/20 flex items-center justify-between gap-2 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#4682B4]/15 border border-[#4682B4]/35 text-[#B0E0E6] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-[#FFFFFF] flex items-center gap-1.5">
                          <span>AI Report Assistant</span>
                          <span className="text-[9px] px-1 rounded bg-[#4682B4]/15 text-[#B0E0E6] font-semibold">
                            Voice
                          </span>
                        </div>
                        <div className="text-[10px] text-[#B0E0E6]/65">
                          Upload report • Voice narration &amp; short summary
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenReportAssistant}
                      className="kintsugi-btn-celadon kintsugi-focus px-2.5 py-1.5 rounded-lg text-[10px] shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3 text-[#B0E0E6]" />
                      <span>Try Voice</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <footer className="w-full bg-[#151F2C] text-[#B0E0E6]/75 py-3.5 px-6 sm:px-10 lg:px-12 z-20 border-t border-[#B0E0E6]/15">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-medium">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#B0E0E6]" />
              <span>Encrypted Healthcare Data</span>
            </div>

            <span className="hidden sm:inline w-px h-3.5 bg-[#B0E0E6]/20" />

            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#B0E0E6]" />
              <span>Role-based Access</span>
            </div>

            <span className="hidden sm:inline w-px h-3.5 bg-[#B0E0E6]/20" />

            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#B0E0E6]" />
              <span>Secure &amp; Reliable</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#B0E0E6]">
            <span className="kintsugi-serif text-lg sm:text-xl italic text-[#FFFFFF]">
              Arogya AI — Care Beyond Technology
            </span>

            <svg className="w-12 h-3.5 stroke-[#4682B4] fill-none" viewBox="0 0 60 20">
              <path
                d="M0,10 L18,10 L22,4 L26,16 L30,2 L34,18 L38,10 L60,10"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </footer>
    </div>
  );
};
