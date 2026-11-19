import React from 'react';
import {
  Activity,
  Bed,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
  FileText,
  KeyRound,
} from 'lucide-react';
import { UserRole } from '../types';
import { HospitalBackground3D } from './background3d/HospitalBackground3D';
import { KintsugiReveal, KintsugiStaggerGrid, KintsugiStaggerItem } from './common/KintsugiPrimitives';

interface LandingPageProps {
  onSelectRoleAndTab: (role: UserRole, tab: string) => void;
  onEmergencyClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRoleAndTab,
  onEmergencyClick,
}) => {
  return (
    <div className="flex flex-col w-full bg-[#1E2A3A] text-[#FFFFFF]">
      {/* Compact Editorial Top Banner */}
      <section className="w-full bg-[#151F2C]/90 border-b border-[#B0E0E6]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="kintsugi-section-label text-[10px] text-[#B0E0E6]/80">
              Predictive Hospital Bed Management · Real-Time Operations
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="kintsugi-serif text-3xl sm:text-4xl font-semibold uppercase tracking-tight text-[#B0E0E6]">
                Arogya <span className="kintsugi-gold-word">AI</span>
              </h1>
              <span className="text-sm sm:text-base font-semibold text-[#B0E0E6] tracking-wide">
                Predict. Prepare. Provide.
              </span>
            </div>
            <p className="text-[#B0E0E6]/75 text-xs sm:text-sm leading-relaxed">
              Hospital bed demand forecasting, emergency triage, OPD queue routing, and ward capacity optimization.
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectRoleAndTab('admin', 'dashboard')}
              className="kintsugi-btn-gold kintsugi-focus px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRoleAndTab('patient', 'report-assistant')}
              className="kintsugi-btn-celadon kintsugi-focus px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>AI Report Assistant</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRoleAndTab('patient', 'find-beds')}
              className="kintsugi-btn-celadon kintsugi-focus px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bed className="w-4 h-4" />
              <span>Find Beds</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRoleAndTab('admin', 'login')}
              className="kintsugi-btn-celadon kintsugi-focus px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={onEmergencyClick}
              className="kintsugi-focus px-4 py-2.5 rounded-xl bg-[#C8433F] hover:bg-[#D9534F] text-[#FFFFFF] text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Full-Width 70vh Non-Interactive 3D Living Hospital Cutaway Stage */}
      <section
        className="w-full h-[70vh] min-h-[460px] max-h-[820px] relative border-b border-[#4682B4]/25 bg-[#151F2C] overflow-hidden"
        aria-label="Live 3D Hospital Operations Visualization"
      >
        <HospitalBackground3D mode="contained" />
      </section>

      {/* Bottom Persona Launcher Strip */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <KintsugiReveal className="mb-4">
          <div className="kintsugi-section-label text-[10px] text-[#B0E0E6]/75">
            Role Workspaces · Instant Access
          </div>
        </KintsugiReveal>

        <KintsugiStaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Persona 1: Hospital Administrator */}
          <KintsugiStaggerItem>
            <button
              type="button"
              onClick={() => onSelectRoleAndTab('admin', 'dashboard')}
              className="kintsugi-card kintsugi-focus w-full h-full text-left p-4 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#B0E0E6]/12 border border-[#B0E0E6]/25 text-[#B0E0E6] flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="kintsugi-section-label text-[9px] text-[#B0E0E6]/70">
                    Command
                  </span>
                </div>
                <h3 className="font-semibold text-[#FFFFFF] text-sm">
                  Hospital Administrator
                </h3>
                <p className="text-[11px] text-[#B0E0E6]/65 mt-1 leading-snug">
                  Predictive analytics, ICU alerts, spike detection &amp; simulator.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#B0E0E6]/12 flex items-center justify-between text-[11px] font-semibold text-[#B0E0E6]">
                <span>Launch Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </KintsugiStaggerItem>

          {/* Persona 2: Hospital Staff / Bed Manager */}
          <KintsugiStaggerItem>
            <button
              type="button"
              onClick={() => onSelectRoleAndTab('hospital_staff', 'dashboard')}
              className="kintsugi-card kintsugi-focus w-full h-full text-left p-4 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#B0E0E6]/12 border border-[#B0E0E6]/25 text-[#B0E0E6] flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <span className="kintsugi-section-label text-[9px] text-[#B0E0E6]/70">
                    Operations
                  </span>
                </div>
                <h3 className="font-semibold text-[#FFFFFF] text-sm">
                  Staff &amp; Bed Manager
                </h3>
                <p className="text-[11px] text-[#B0E0E6]/65 mt-1 leading-snug">
                  Live bed updates, admissions, ward buffers &amp; OPD queues.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#B0E0E6]/12 flex items-center justify-between text-[11px] font-semibold text-[#B0E0E6]">
                <span>Launch Staff View</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </KintsugiStaggerItem>

          {/* Persona 3: Patient & Attendant */}
          <KintsugiStaggerItem>
            <button
              type="button"
              onClick={() => onSelectRoleAndTab('patient', 'find-beds')}
              className="kintsugi-card kintsugi-focus w-full h-full text-left p-4 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#4682B4]/12 border border-[#4682B4]/30 text-[#B0E0E6] flex items-center justify-center">
                    <Bed className="w-4 h-4" />
                  </div>
                  <span className="kintsugi-section-label text-[9px] text-[#B0E0E6]">
                    Services
                  </span>
                </div>
                <h3 className="font-semibold text-[#FFFFFF] text-sm">
                  Patient &amp; Attendant
                </h3>
                <p className="text-[11px] text-[#B0E0E6]/65 mt-1 leading-snug">
                  Find available beds, reserve OPD tokens &amp; health assistant.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#B0E0E6]/12 flex items-center justify-between text-[11px] font-semibold text-[#B0E0E6]">
                <span>Launch Patient Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </KintsugiStaggerItem>

          {/* Persona 4: AI Report Assistant */}
          <KintsugiStaggerItem>
            <button
              type="button"
              onClick={() => onSelectRoleAndTab('patient', 'report-assistant')}
              className="kintsugi-card kintsugi-focus w-full h-full text-left p-4 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#B0E0E6]/12 border border-[#B0E0E6]/25 text-[#B0E0E6] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="kintsugi-section-label text-[9px] text-[#B0E0E6]/70">
                    Vision AI
                  </span>
                </div>
                <h3 className="font-semibold text-[#FFFFFF] text-sm">
                  AI Report Assistant
                </h3>
                <p className="text-[11px] text-[#B0E0E6]/65 mt-1 leading-snug">
                  Scan reports, extract OCR values &amp; multilingual narration.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#B0E0E6]/12 flex items-center justify-between text-[11px] font-semibold text-[#B0E0E6]">
                <span>Analyze Report</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </KintsugiStaggerItem>

          {/* Persona 5: Emergency SOS */}
          <KintsugiStaggerItem>
            <button
              type="button"
              onClick={onEmergencyClick}
              className="kintsugi-card kintsugi-card-critical kintsugi-focus w-full h-full text-left p-4 rounded-2xl cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D9534F]/20 border border-[#D9534F]/45 text-[#F08582] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="kintsugi-section-label text-[9px] text-[#F08582]">
                    Dispatch
                  </span>
                </div>
                <h3 className="font-semibold text-[#FFFFFF] text-sm">
                  Emergency SOS &amp; Triage
                </h3>
                <p className="text-[11px] text-[#B0E0E6]/70 mt-1 leading-snug">
                  1-tap dispatch, trauma bay alert &amp; nearest bed routing.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#D9534F]/25 flex items-center justify-between text-[11px] font-semibold text-[#F08582]">
                <span>Trigger Emergency</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </KintsugiStaggerItem>
        </KintsugiStaggerGrid>
      </section>
    </div>
  );
};
