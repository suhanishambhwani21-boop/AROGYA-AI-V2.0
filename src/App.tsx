import React, { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  Activity,
  Bed,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Stethoscope,
  Building2,
  Calendar,
  Cpu,
  SlidersHorizontal,
  Home,
  Ticket,
  FileText,
  Database,
  ShieldAlert,
  Flame,
  Landmark,
} from 'lucide-react';
import {
  UserRole,
  AuthUser,
  Hospital,
  ShortageAlert,
  AdmissionSpike,
  DischargeForecast,
  MLModelEvaluation,
  Doctor,
  OPDToken,
  BedRequest,
  EmergencySOSRequest,
} from './types';
import {
  INITIAL_HOSPITALS,
  INITIAL_ADMISSION_SPIKE,
  INITIAL_DISCHARGE_FORECAST,
  INITIAL_ALERTS,
  INITIAL_ML_METRICS,
  INITIAL_DOCTORS,
  INITIAL_OPD_TOKENS,
  INITIAL_BED_REQUESTS,
  INITIAL_EMERGENCY_LOGS,
} from './data/mockData';
import { Header } from './components/common/Header';
import { KINTSUGI_EASE } from './components/common/KintsugiPrimitives';
import { ArogyaLoginLandingPage } from './components/auth/ArogyaLoginLandingPage';
import { LandingPage } from './components/LandingPage';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { MLPredictionSection } from './components/admin/MLPredictionSection';
import { AdmissionSpikeSection } from './components/admin/AdmissionSpikeSection';
import { DischargeForecastSection } from './components/admin/DischargeForecastSection';
import { BedAvailabilityForecastPage } from './components/admin/BedAvailabilityForecastPage';
import { ShortageAlertSystem } from './components/admin/ShortageAlertSystem';
import { WhatIfSimulator } from './components/admin/WhatIfSimulator';
import { HospitalMapView } from './components/admin/HospitalMapView';
import { HospitalDataManagement } from './components/admin/HospitalDataManagement';
import { MLModelSection } from './components/admin/MLModelSection';
import { ReportsAnalytics } from './components/admin/ReportsAnalytics';
import { FindAvailableBeds } from './components/patient/FindAvailableBeds';
import { OPDTokenBooking } from './components/patient/OPDTokenBooking';
import { DoctorDirectory } from './components/patient/DoctorDirectory';
import { EmergencyModule } from './components/patient/EmergencyModule';
import { AIAssistant } from './components/patient/AIAssistant';
import { AIReportAssistant } from './components/patient/AIReportAssistant';
import { MyBookings } from './components/patient/MyBookings';

export default function App() {
  // Global Application State
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-1');

  // Active Authenticated User
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 'usr-admin-default',
    name: 'Dr. Vikram Malhotra',
    email: 'admin.vikram@arogya.health',
    phone: '9820188000',
    role: 'admin',
    hospitalId: 'hosp-1',
    hospitalName: 'Arogya Central Multi-Speciality Research Hospital',
    department: 'Hospital Administration & Chief Medical Office',
    designation: 'Chief Medical Officer & Administrator',
    badgeNumber: 'AROGYA-ADM-702',
    isLoggedIn: true,
  });

  // Dynamic Data States
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [alerts, setAlerts] = useState<ShortageAlert[]>(INITIAL_ALERTS);
  const [admissionSpike] = useState<AdmissionSpike>(INITIAL_ADMISSION_SPIKE);
  const [dischargeForecast] = useState<DischargeForecast>(INITIAL_DISCHARGE_FORECAST);
  const [mlMetrics, setMlMetrics] = useState<MLModelEvaluation>(INITIAL_ML_METRICS);
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [opdTokens, setOpdTokens] = useState<OPDToken[]>(INITIAL_OPD_TOKENS);
  const [bedRequests, setBedRequests] = useState<BedRequest[]>(INITIAL_BED_REQUESTS);
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencySOSRequest[]>(INITIAL_EMERGENCY_LOGS);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setSelectedHospitalId(user.hospitalId);
    if (user.role === 'patient') {
      setActiveTab('report-assistant');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('login');
  };

  // Live Bed Management Update handler
  const handleUpdateBed = async (
    bedCategoryId: string,
    occDelta: number,
    resDelta: number,
    availDelta?: number
  ) => {
    try {
      const res = await fetch(`/api/hospitals/${selectedHospital.id}/update-bed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bedCategoryId,
          occupiedDelta: occDelta,
          reservedDelta: resDelta,
          availableDelta: availDelta,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHospitals(prev => prev.map(h => (h.id === data.hospital.id ? data.hospital : h)));
      } else {
        // Fallback local update
        setHospitals(prev =>
          prev.map(h => {
            if (h.id !== selectedHospital.id) return h;
            const updatedCats = h.bedCategories.map(cat => {
              if (cat.id !== bedCategoryId) return cat;
              const newOcc = Math.max(0, Math.min(cat.total, cat.occupied + occDelta));
              const newAvail = Math.max(0, cat.total - newOcc - cat.reserved);
              const occRate = Math.round((newOcc / cat.total) * 1000) / 10;
              return {
                ...cat,
                occupied: newOcc,
                available: newAvail,
                occupancyRate: occRate,
                status: (occRate >= 90 ? 'Danger' : occRate >= 80 ? 'Warning' : 'Normal') as any,
                lastUpdated: 'Just now',
              };
            });
            const totOcc = updatedCats.reduce((a, c) => a + c.occupied, 0);
            const totAvail = updatedCats.reduce((a, c) => a + c.available, 0);
            const hospRate = Math.round((totOcc / h.totalBeds) * 1000) / 10;
            return {
              ...h,
              bedCategories: updatedCats,
              occupiedBeds: totOcc,
              availableBeds: totAvail,
              occupancyRate: hospRate,
              lastUpdated: 'Just now',
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Alert Action Handler
  const handleAlertAction = (
    alertId: string,
    action: 'REVIEW' | 'ASSIGN' | 'RESOLVE',
    staffName?: string,
    note?: string
  ) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          status: action === 'REVIEW' ? 'REVIEWED' : action === 'ASSIGN' ? 'ASSIGNED' : 'RESOLVED',
          assignedStaff: staffName || a.assignedStaff,
          actionTaken: note || a.actionTaken,
        };
      })
    );
  };

  // Book OPD Token Handler
  const handleBookOPDToken = async (tokenData: any): Promise<OPDToken> => {
    try {
      const res = await fetch('/api/opd/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenData),
      });
      const data = await res.json();
      if (data.token) {
        setOpdTokens(prev => [data.token, ...prev]);
        return data.token;
      }
    } catch (e) {
      console.error(e);
    }

    const fallbackToken: OPDToken = {
      id: `tok-${Date.now()}`,
      tokenNumber: `T-${Math.floor(100 + Math.random() * 900)}`,
      patientName: tokenData.patientName,
      patientAge: tokenData.patientAge,
      patientGender: tokenData.patientGender,
      patientPhone: tokenData.patientPhone,
      hospitalId: tokenData.hospitalId,
      hospitalName: tokenData.hospitalName,
      department: tokenData.department,
      doctorId: tokenData.doctorId,
      doctorName: tokenData.doctorName,
      date: tokenData.date,
      timeSlot: tokenData.timeSlot,
      reasonForVisit: tokenData.reasonForVisit,
      symptoms: tokenData.symptoms,
      queuePosition: opdTokens.length + 1,
      estimatedWaitMins: (opdTokens.length + 1) * 10,
      status: 'WAITING',
      qrCodeHash: `AROGYA-OPD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      priority: 'REGULAR',
      feeAmount: tokenData.feeAmount || 100,
      paymentStatus: tokenData.paymentStatus || 'PAID',
      upiId: tokenData.upiId || 'ajinkya70280@okicici',
      transactionRef: tokenData.transactionRef || `UPI-AJI-${Date.now().toString().slice(-6)}`,
      paymentTime: tokenData.paymentTime || new Date().toISOString(),
    };
    setOpdTokens(prev => [fallbackToken, ...prev]);
    return fallbackToken;
  };

  // Bed Request Submission Handler
  const handleRequestBed = async (
    reqData: Omit<BedRequest, 'id' | 'status' | 'submittedAt' | 'updatedAt'>
  ) => {
    try {
      const res = await fetch('/api/beds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      });
      const data = await res.json();
      if (data.request) {
        setBedRequests(prev => [data.request, ...prev]);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const fallbackReq: BedRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: 'PENDING_CONFIRMATION',
      feeAmount: reqData.feeAmount || 100,
      paymentStatus: reqData.paymentStatus || 'PAID',
      upiId: reqData.upiId || 'ajinkya70280@okicici',
      transactionRef: reqData.transactionRef || `BED-UPI-${Date.now().toString().slice(-6)}`,
      paymentTime: reqData.paymentTime || new Date().toISOString(),
      submittedAt: 'Just now',
      updatedAt: 'Just now',
    };
    setBedRequests(prev => [fallbackReq, ...prev]);
  };

  // Emergency SOS Trigger Handler
  const handleTriggerSOS = async (sosData: any): Promise<EmergencySOSRequest> => {
    try {
      const res = await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sosData),
      });
      const data = await res.json();
      if (data.sos) {
        setEmergencyLogs(prev => [data.sos, ...prev]);
        return data.sos;
      }
    } catch (e) {
      console.error(e);
    }

    const fallbackSOS: EmergencySOSRequest = {
      ...sosData,
      id: `sos-${Date.now()}`,
      timestamp: 'Just now',
      status: 'AMBULANCE_EN_ROUTE',
      etaMinutes: 5,
      ambulanceUnit: 'ALS-Unit #14',
      paramedicContact: '+91 98200 11999',
      vitalsNote: 'Emergency Triage Dispatched. Trauma team alerted.',
    };
    setEmergencyLogs(prev => [fallbackSOS, ...prev]);
    return fallbackSOS;
  };

  interface NavTabItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
  }

  const activeAlertsCount = alerts.filter(a => a.status !== 'RESOLVED').length;

  // Navigation tabs for Admin
  const adminNavTabs: NavTabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'prediction', label: 'AI Predictions', icon: Sparkles },
    { id: 'forecast-graph', label: 'Availability Forecast', icon: TrendingUp },
    { id: 'spike-detection', label: 'Admission Spike', icon: Flame },
    { id: 'discharge-forecast', label: 'Discharge Forecast', icon: Calendar },
    {
      id: 'alerts',
      label: 'Shortage Alerts',
      icon: ShieldAlert,
      badge: alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length,
    },
    { id: 'what-if', label: 'What-If Simulator', icon: SlidersHorizontal },
    { id: 'hospital-map', label: 'Hospital Overview', icon: Building2 },
    { id: 'hospital-data', label: 'Hospital Data', icon: Database },
    { id: 'ml-model', label: 'Prediction Model', icon: Cpu },
    { id: 'report-assistant', label: 'AI Report Assistant', icon: FileText },
    { id: 'analytics', label: 'Analytics & Reports', icon: FileText },
    { id: 'doctors-opd', label: 'Doctors & OPD', icon: Stethoscope },
  ];

  // Navigation tabs for Staff
  const staffNavTabs: NavTabItem[] = [
    { id: 'dashboard', label: 'Live Bed Operations', icon: Bed },
    { id: 'alerts', label: 'Shortage Alerts', icon: ShieldAlert },
    { id: 'report-assistant', label: 'AI Report Assistant', icon: FileText },
    { id: 'what-if', label: 'What-If Simulator', icon: SlidersHorizontal },
    { id: 'doctors-opd', label: 'Doctors & OPD Queue', icon: Stethoscope },
  ];

  // Navigation tabs for Patient
  const patientNavTabs: NavTabItem[] = [
    { id: 'report-assistant', label: 'AI Report Assistant', icon: FileText },
    { id: 'find-beds', label: 'Find Available Beds', icon: Bed },
    { id: 'book-opd', label: 'Book OPD Token', icon: Ticket },
    { id: 'find-doctor', label: 'Find a Doctor', icon: Stethoscope },
    { id: 'emergency', label: 'Emergency Triage', icon: AlertTriangle },
    { id: 'ai-assistant', label: 'AI Health Assistant', icon: Sparkles },
    {
      id: 'my-bookings',
      label: 'My Bookings',
      icon: Calendar,
      badge: opdTokens.length + bedRequests.length,
    },
  ];

  const currentNavTabs =
    currentRole === 'patient'
      ? patientNavTabs
      : currentRole === 'hospital_staff'
      ? staffNavTabs
      : adminNavTabs;

  // Dedicated Login Landing Page
  if (activeTab === 'login') {
    return (
      <MotionConfig reducedMotion="user">
        <ArogyaLoginLandingPage
          hospitals={hospitals}
          onLoginSuccess={handleLoginSuccess}
          onExploreDemo={() => setActiveTab('dashboard')}
          onOpenReportAssistant={() => {
            setCurrentRole('patient');
            setActiveTab('report-assistant');
          }}
        />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#1E2A3A] text-[#FFFFFF] flex flex-col relative">
        {/* Universal Header */}
        <Header
          activeTab={activeTab}
          onNavigateTab={setActiveTab}
          activeAlertsCount={activeAlertsCount}
          currentRole={currentRole}
          onRoleChange={role => {
            setCurrentRole(role);
            if (role === 'patient') {
              setActiveTab('find-beds');
            } else {
              setActiveTab('dashboard');
            }
          }}
          selectedHospital={selectedHospital}
          hospitals={hospitals}
          onHospitalChange={id => setSelectedHospitalId(id)}
          onEmergencyClick={() => {
            setCurrentRole('patient');
            setActiveTab('emergency');
          }}
          currentUser={currentUser}
          onOpenLogin={() => setActiveTab('login')}
          onLogout={handleLogout}
        />

        {/* Secondary Workspace Sub-Navigation Strip */}
        <nav
          aria-label="Workspace Modules"
          className="bg-[#151F2C]/92 border-b border-[#DCEBF5]/15 backdrop-blur-md sticky top-[102px] z-30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
              {/* Overview / Landing Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('landing')}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer kintsugi-focus ${
                  activeTab === 'landing'
                    ? 'bg-[#366C9A] text-[#FFFFFF] border border-[#B0E0E6]/60'
                    : 'text-[#DCEBF5]/80 hover:text-[#FFFFFF] hover:bg-[#243346]'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              {/* Portal Login Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap bg-[#243346] text-[#DCEBF5] hover:text-[#B0E0E6] border border-[#DCEBF5]/20 cursor-pointer kintsugi-focus"
                title="Open Arogya AI Portal Sign-In"
              >
                <Landmark className="w-3.5 h-3.5 text-[#B0E0E6]" />
                <span>Portal Access</span>
              </button>

              <span className="text-[#DCEBF5]/25 mx-1 shrink-0" aria-hidden="true">
                |
              </span>

              {/* Role-Specific Tabs */}
              {currentNavTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer kintsugi-focus ${
                      isActive
                        ? 'bg-[#366C9A] text-[#FFFFFF] border border-[#B0E0E6]/60 shadow-[0_0_14px_rgba(70,130,180,0.35)]'
                        : 'text-[#DCEBF5]/80 hover:text-[#FFFFFF] hover:bg-[#243346]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFFFFF]' : 'text-[#B0E0E6]/80'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className={`kintsugi-num px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                          isActive
                            ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                            : 'bg-[#C8433F] text-[#FFFFFF]'
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
        </nav>

        {/* Main Content Viewport with Cross-Fade + Vertical Slide */}
        <main
          className={
            activeTab === 'landing'
              ? 'relative z-10 flex-1 w-full'
              : 'relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: KINTSUGI_EASE }}
            >
              {/* LANDING PAGE */}
              {activeTab === 'landing' && (
                <LandingPage
                  onSelectRoleAndTab={(role, tab) => {
                    setCurrentRole(role);
                    setActiveTab(tab);
                  }}
                  onEmergencyClick={() => {
                    setCurrentRole('patient');
                    setActiveTab('emergency');
                  }}
                />
              )}

              {/* ADMIN & STAFF VIEWS */}
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  hospital={selectedHospital}
                  onUpdateBed={handleUpdateBed}
                  onNavigateTab={tab => setActiveTab(tab)}
                  spikeAlert={admissionSpike}
                  alerts={alerts}
                  isStaffRole={currentRole === 'hospital_staff'}
                />
              )}

              {activeTab === 'prediction' && (
                <MLPredictionSection onNavigateTab={tab => setActiveTab(tab)} />
              )}

              {activeTab === 'forecast-graph' && (
                <BedAvailabilityForecastPage
                  hospital={selectedHospital}
                  hospitals={hospitals}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'spike-detection' && (
                <AdmissionSpikeSection
                  spike={admissionSpike}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'discharge-forecast' && (
                <DischargeForecastSection
                  forecast={dischargeForecast}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'alerts' && (
                <ShortageAlertSystem
                  alerts={alerts}
                  onAlertAction={handleAlertAction}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'what-if' && <WhatIfSimulator />}

              {activeTab === 'hospital-map' && (
                <HospitalMapView
                  hospital={selectedHospital}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'hospital-data' && (
                <HospitalDataManagement
                  onRetrainSuccess={() => {
                    setMlMetrics(prev => ({
                      ...prev,
                      lastUpdated: 'Just now (Retrained)',
                      mae: 1.98,
                      rmse: 2.85,
                      mape: 4.41,
                      r2Score: 0.958,
                    }));
                  }}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'ml-model' && (
                <MLModelSection
                  metrics={mlMetrics}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'analytics' && (
                <ReportsAnalytics hospital={selectedHospital} />
              )}

              {activeTab === 'doctors-opd' && (
                <div className="space-y-6">
                  <DoctorDirectory
                    doctors={doctors}
                    onSelectDoctorToBook={() => {
                      setCurrentRole('patient');
                      setActiveTab('book-opd');
                    }}
                  />
                </div>
              )}

              {/* PATIENT & REPORT VIEWS */}
              {activeTab === 'report-assistant' && (
                <AIReportAssistant
                  onEmergencyClick={() => setActiveTab('emergency')}
                  onNavigateTab={tab => setActiveTab(tab)}
                  patientName={
                    currentUser?.role === 'patient'
                      ? currentUser.name.replace(/\s*\(.*?\)/, '').trim() || 'Suhani Shambwani'
                      : 'Suhani Shambwani'
                  }
                />
              )}

              {activeTab === 'find-beds' && (
                <FindAvailableBeds
                  hospitals={hospitals}
                  onRequestBed={handleRequestBed}
                  onEmergencyClick={() => setActiveTab('emergency')}
                />
              )}

              {activeTab === 'book-opd' && (
                <OPDTokenBooking
                  hospitals={hospitals}
                  doctors={doctors}
                  onBookToken={handleBookOPDToken}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'find-doctor' && (
                <DoctorDirectory
                  doctors={doctors}
                  onSelectDoctorToBook={() => setActiveTab('book-opd')}
                />
              )}

              {activeTab === 'emergency' && (
                <EmergencyModule
                  hospitals={hospitals}
                  onTriggerSOS={handleTriggerSOS}
                />
              )}

              {activeTab === 'ai-assistant' && (
                <AIAssistant
                  onEmergencyClick={() => setActiveTab('emergency')}
                  onNavigateTab={tab => setActiveTab(tab)}
                  patientName={
                    currentUser?.role === 'patient'
                      ? currentUser.name.replace(/\s*\(.*?\)/, '').trim() || 'Suhani Shambwani'
                      : 'Suhani Shambwani'
                  }
                />
              )}

              {activeTab === 'my-bookings' && (
                <MyBookings
                  tokens={opdTokens}
                  bedRequests={bedRequests}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Hospital Command Footer */}
        <footer
          className={`relative z-10 bg-[#151F2C] text-[#DCEBF5]/80 text-xs py-8 border-t border-[#DCEBF5]/15 ${
            activeTab === 'landing' ? 'mt-2' : 'mt-12'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#243346] border border-[#4682B4]/55 flex items-center justify-center text-[#B0E0E6]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold tracking-[0.18em] uppercase text-[#FFFFFF]">
                  Arogya AI · Predictive Healthcare Operations
                </div>
                <div className="text-[11px] text-[#DCEBF5]/70 mt-0.5">
                  Multi-Ward Capacity Intelligence &amp; Surge Triage
                </div>
              </div>
            </div>

            <div className="text-center md:text-right text-[11px] text-[#DCEBF5]/70">
              <div>Predict · Prepare · Optimize Capacity Before Saturation</div>
              <div className="text-[#DCEBF5]/55 mt-0.5">
                Decision-support interface — verify physical ward readiness before clinical emergency transfer
              </div>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
