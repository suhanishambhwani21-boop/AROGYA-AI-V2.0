import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Hospital, ShortageAlert, AdmissionSpike } from '../../types';
import { MLForecastEngine } from '../../services/mlForecastEngine';

interface HospitalHero3DProps {
  hospital?: Hospital;
  alerts?: ShortageAlert[];
  spikeAlert?: AdmissionSpike;
}

interface DustSpec {
  id: number;
  leftPct: number;
  topPct: number;
  size: number;
  baseOpacity: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
}

const DESKTOP_DUST: DustSpec[] = [
  { id: 0, leftPct: 14, topPct: 26, size: 3, baseOpacity: 0.55, dx: 18, dy: -28, duration: 5.4, delay: 0.2 },
  { id: 1, leftPct: 22, topPct: 62, size: 2, baseOpacity: 0.4, dx: -14, dy: -22, duration: 6.1, delay: 1.1 },
  { id: 2, leftPct: 29, topPct: 38, size: 3.5, baseOpacity: 0.6, dx: 16, dy: -32, duration: 4.9, delay: 0.6 },
  { id: 3, leftPct: 35, topPct: 74, size: 2.5, baseOpacity: 0.45, dx: 10, dy: -20, duration: 5.8, delay: 2.0 },
  { id: 4, leftPct: 41, topPct: 20, size: 2, baseOpacity: 0.5, dx: -12, dy: -26, duration: 6.4, delay: 0.8 },
  { id: 5, leftPct: 48, topPct: 52, size: 3, baseOpacity: 0.65, dx: 14, dy: -30, duration: 5.1, delay: 1.4 },
  { id: 6, leftPct: 54, topPct: 28, size: 2.5, baseOpacity: 0.5, dx: -18, dy: -24, duration: 5.9, delay: 0.3 },
  { id: 7, leftPct: 59, topPct: 68, size: 3, baseOpacity: 0.55, dx: 12, dy: -28, duration: 4.8, delay: 1.9 },
  { id: 8, leftPct: 65, topPct: 22, size: 2, baseOpacity: 0.45, dx: 20, dy: -22, duration: 6.2, delay: 0.7 },
  { id: 9, leftPct: 71, topPct: 46, size: 3.5, baseOpacity: 0.6, dx: -14, dy: -30, duration: 5.3, delay: 1.5 },
  { id: 10, leftPct: 77, topPct: 70, size: 2, baseOpacity: 0.4, dx: 16, dy: -24, duration: 6.5, delay: 0.1 },
  { id: 11, leftPct: 82, topPct: 32, size: 3, baseOpacity: 0.55, dx: -16, dy: -26, duration: 5.2, delay: 2.3 },
  { id: 12, leftPct: 18, topPct: 48, size: 2, baseOpacity: 0.35, dx: 12, dy: -18, duration: 6.0, delay: 1.7 },
  { id: 13, leftPct: 44, topPct: 78, size: 2.5, baseOpacity: 0.45, dx: -10, dy: -24, duration: 5.6, delay: 0.5 },
  { id: 14, leftPct: 62, topPct: 36, size: 2, baseOpacity: 0.5, dx: 15, dy: -22, duration: 5.7, delay: 1.2 },
  { id: 15, leftPct: 74, topPct: 58, size: 2.5, baseOpacity: 0.48, dx: -12, dy: -25, duration: 6.3, delay: 2.1 },
  { id: 16, leftPct: 86, topPct: 44, size: 2, baseOpacity: 0.4, dx: -14, dy: -20, duration: 5.5, delay: 0.9 },
  { id: 17, leftPct: 26, topPct: 18, size: 2.5, baseOpacity: 0.42, dx: 14, dy: -18, duration: 6.6, delay: 1.6 },
];

const MOBILE_DUST: DustSpec[] = DESKTOP_DUST.slice(0, 10);

interface MiniDashboardProps {
  hospital?: Hospital;
  alerts?: ShortageAlert[];
  spikeAlert?: AdmissionSpike;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Memoized miniature live dashboard rendered inside the 3D CSS laptop screen.
 * Only re-renders when hospital / alerts / spikeAlert data props change — never during animation frames.
 */
const MiniLaptopDashboard = memo<MiniDashboardProps>(
  ({ hospital, alerts, spikeAlert, scrollContainerRef }) => {
    const forecastPoints = useMemo(() => {
      const series = MLForecastEngine.generateTimeSeries(7, 'All', 'All', 0, 0, 0);
      const maxVal = Math.max(...series.map(p => p.predictedAvailable), 60);
      const minVal = Math.min(...series.map(p => p.predictedAvailable), 10);
      const span = Math.max(1, maxVal - minVal);
      return series
        .map((pt, idx) => {
          const x = 10 + (idx / Math.max(1, series.length - 1)) * 220;
          const y = 52 - ((pt.predictedAvailable - minVal) / span) * 38;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    }, [hospital?.availableBeds]);

    const totalBeds = hospital?.totalBeds ?? 280;
    const occupiedBeds = hospital?.occupiedBeds ?? 224;
    const availableBeds = hospital?.availableBeds ?? 44;
    const occupancyRate = hospital?.occupancyRate ?? 80.0;
    const activeAlerts = alerts?.filter(a => a.status !== 'RESOLVED').length ?? 3;
    const criticalAlerts =
      alerts?.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length ?? 1;
    const surgePct = spikeAlert?.percentIncrease ?? 12;

    const categories = hospital?.bedCategories?.slice(0, 4) ?? [
      { id: 'icu', name: 'ICU', available: 4, occupied: 34, total: 40, occupancyRate: 85, wing: 'North' },
      { id: 'er', name: 'Emergency', available: 6, occupied: 22, total: 30, occupancyRate: 73, wing: 'East' },
      { id: 'gen', name: 'General', available: 24, occupied: 108, total: 140, occupancyRate: 77, wing: 'Central' },
      { id: 'priv', name: 'Private', available: 10, occupied: 36, total: 50, occupancyRate: 72, wing: 'South' },
    ];

    return (
      <div className="relative w-full h-full bg-[#121B27] text-[#DCEBF5] overflow-hidden select-none">
        {/* Fixed Mini Top Bar inside Laptop OS Window */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#192434] border-b border-[#4682B4]/35">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9534F]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#4682B4]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#B0E0E6]" />
            <span className="ml-1.5 text-[8px] font-bold tracking-[0.18em] uppercase text-[#FFFFFF]">
              AROGYA AI · LIVE OPS
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-[#C8433F]/85 text-[#FFFFFF] text-[7px] font-bold tabular-nums">
              {activeAlerts} ALERTS ({criticalAlerts} CRIT)
            </span>
          </div>
        </div>

        {/* Auto-scrolling 3-section miniature dashboard (driven via transform: translateY by master GSAP timeline) */}
        <div
          ref={scrollContainerRef}
          className="px-3 pt-2.5 pb-6 space-y-3 will-change-transform"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          {/* Section 1: Bed Occupancy Cards */}
          <div>
            <div className="flex items-center justify-between text-[7px] uppercase tracking-[0.16em] text-[#B0E0E6] mb-1.5 font-semibold">
              <span>01 · Bed Occupancy Snapshot</span>
              <span className="tabular-nums text-[#FFFFFF]">{occupancyRate.toFixed(1)}% Full</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <div className="rounded-md bg-[#1E2A3A] border border-[#4682B4]/40 p-1.5">
                <div className="text-[6.5px] text-[#DCEBF5]/75 uppercase">Total</div>
                <div className="text-[11px] font-bold text-[#FFFFFF] tabular-nums leading-tight">
                  {totalBeds}
                </div>
              </div>
              <div className="rounded-md bg-[#1E2A3A] border border-[#4682B4]/40 p-1.5">
                <div className="text-[6.5px] text-[#DCEBF5]/75 uppercase">Occupied</div>
                <div className="text-[11px] font-bold text-[#B0E0E6] tabular-nums leading-tight">
                  {occupiedBeds}
                </div>
              </div>
              <div className="rounded-md bg-[#1E2A3A] border border-[#B0E0E6]/50 p-1.5">
                <div className="text-[6.5px] text-[#B0E0E6] uppercase">Available</div>
                <div className="text-[11px] font-bold text-[#FFFFFF] tabular-nums leading-tight">
                  {availableBeds}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              {categories.slice(0, 3).map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded bg-[#1A2636] px-2 py-1 border border-[#DCEBF5]/10 text-[7.5px]"
                >
                  <span className="font-semibold text-[#FFFFFF]">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-[#121B27] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, cat.occupancyRate)}%`,
                          backgroundColor:
                            cat.occupancyRate >= 90
                              ? '#D9534F'
                              : cat.occupancyRate >= 78
                              ? '#4682B4'
                              : '#B0E0E6',
                        }}
                      />
                    </div>
                    <span className="tabular-nums text-[#B0E0E6] font-bold">
                      {cat.available} free
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: 7-Day Forecast Line Chart */}
          <div className="rounded-lg bg-[#1A2636] border border-[#4682B4]/35 p-2">
            <div className="flex items-center justify-between text-[7px] uppercase tracking-[0.14em] mb-1">
              <span className="text-[#B0E0E6] font-semibold">02 · 7-Day Bed Forecast</span>
              <span className="text-[#FFFFFF] font-bold tabular-nums">+{surgePct}% Surge</span>
            </div>
            <svg viewBox="0 0 240 64" className="w-full h-14 overflow-visible">
              <defs>
                <linearGradient id="miniChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4682B4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#1E2A3A" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <line x1="8" y1="16" x2="232" y2="16" stroke="#DCEBF5" strokeOpacity="0.12" strokeWidth="0.7" />
              <line x1="8" y1="34" x2="232" y2="34" stroke="#DCEBF5" strokeOpacity="0.12" strokeWidth="0.7" />
              <line x1="8" y1="52" x2="232" y2="52" stroke="#DCEBF5" strokeOpacity="0.12" strokeWidth="0.7" />
              <polygon
                points={`10,58 ${forecastPoints} 230,58`}
                fill="url(#miniChartFill)"
              />
              <polyline
                fill="none"
                stroke="#B0E0E6"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={forecastPoints}
              />
            </svg>
          </div>

          {/* Section 3: Live Ward Map */}
          <div className="rounded-lg bg-[#1A2636] border border-[#4682B4]/35 p-2">
            <div className="flex items-center justify-between text-[7px] uppercase tracking-[0.14em] mb-1.5">
              <span className="text-[#B0E0E6] font-semibold">03 · Ward Wing Allocation</span>
              <span className="text-[#DCEBF5]/80">4 Wings Active</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="rounded border border-[#4682B4]/35 bg-[#151F2C] px-2 py-1.5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-[7px] font-bold text-[#FFFFFF]">{cat.name}</div>
                    <div className="text-[6px] text-[#DCEBF5]/70">{cat.wing || `Wing ${idx + 1}`}</div>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        cat.occupancyRate >= 90
                          ? '#D9534F'
                          : idx % 2 === 0
                          ? '#B0E0E6'
                          : '#4682B4',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MiniLaptopDashboard.displayName = 'MiniLaptopDashboard';

function createCubicBezierEase(x1: number, y1: number, x2: number, y2: number) {
  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const mt = 1 - t;
      const cx = 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t - x;
      const dx = 3 * mt * mt * x1 + 6 * mt * t * (x2 - x1) + 3 * t * t * (1 - x2);
      if (Math.abs(dx) < 1e-6) break;
      t = Math.max(0, Math.min(1, t - cx / dx));
    }
    const mt = 1 - t;
    return 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t;
  };
}

export const HospitalHero3D: React.FC<HospitalHero3DProps> = ({
  hospital,
  alerts,
  spikeAlert,
}) => {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);

  // Parallax depth containers (4 distinct rates)
  const bgParallaxRef = useRef<HTMLDivElement | null>(null);
  const laptopParallaxRef = useRef<HTMLDivElement | null>(null);
  const burstParallaxRef = useRef<HTMLDivElement | null>(null);
  const fgParallaxRef = useRef<HTMLDivElement | null>(null);

  // Screen & reflection refs
  const screenScrollRef = useRef<HTMLDivElement | null>(null);
  const reflectionStreakRef = useRef<HTMLDivElement | null>(null);
  const lensFlareRef = useRef<HTMLDivElement | null>(null);
  const laptopShadowRef = useRef<HTMLDivElement | null>(null);

  // Burst element refs (driven strictly by GSAP transform & opacity)
  const burstGlowRef = useRef<HTMLDivElement | null>(null);
  const buildingRef = useRef<HTMLDivElement | null>(null);
  const buildingShadowRef = useRef<HTMLDivElement | null>(null);

  const bedAvailRef = useRef<HTMLDivElement | null>(null);
  const bedAvailShadowRef = useRef<HTMLDivElement | null>(null);
  const bedAvailPulseRef = useRef<HTMLDivElement | null>(null);
  const bedAssignedBadgeRef = useRef<HTMLDivElement | null>(null);

  const bedOccRef = useRef<HTMLDivElement | null>(null);
  const bedOccShadowRef = useRef<HTMLDivElement | null>(null);

  const bedCritRef = useRef<HTMLDivElement | null>(null);
  const bedCritShadowRef = useRef<HTMLDivElement | null>(null);
  const bedCritRingRef = useRef<HTMLDivElement | null>(null);

  const ecgCardRef = useRef<HTMLDivElement | null>(null);
  const ecgPathRef = useRef<SVGPathElement | null>(null);

  const cardIcuRef = useRef<HTMLDivElement | null>(null);
  const cardOpdRef = useRef<HTMLDivElement | null>(null);
  const cardSurgeRef = useRef<HTMLDivElement | null>(null);

  const floatCross1Ref = useRef<HTMLDivElement | null>(null);
  const floatCross2Ref = useRef<HTMLDivElement | null>(null);
  const floatIvRef = useRef<HTMLDivElement | null>(null);

  const ribbonPathRef = useRef<SVGPathElement | null>(null);
  const assignLinePathRef = useRef<SVGPathElement | null>(null);
  const assignOrbRef = useRef<SVGCircleElement | null>(null);

  const dustLayerRef = useRef<HTMLDivElement | null>(null);
  const dustNodesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lowPerfMode, setLowPerfMode] = useState(false);

  // Live telemetry values for popped-out translucent glass data cards
  const icuCategory =
    hospital?.bedCategories.find(c => c.name === 'ICU') ?? hospital?.bedCategories[0];
  const icuFree = icuCategory?.available ?? 4;
  const opdWaiting = hospital
    ? Math.max(8, Math.round(hospital.occupiedBeds * 0.085))
    : 13;
  const opdWaitMins = Math.max(12, Math.round(opdWaiting * 1.4));
  const surgePct = spikeAlert?.percentIncrease ?? 12;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Master GSAP 14s Timeline + IntersectionObserver + Visibility + FPS Safeguard + Mouse Parallax
  useEffect(() => {
    const bannerEl = bannerRef.current;
    const cameraEl = cameraRef.current;
    if (!bannerEl || !cameraEl) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const easeOut = createCubicBezierEase(0.22, 1, 0.36, 1);
    const easeInOut = 'sine.inOut';

    // Pre-configure SVG stroke dash lengths cleanly once
    const ecgPath = ecgPathRef.current;
    const ecgLen = ecgPath ? ecgPath.getTotalLength() : 260;
    if (ecgPath) {
      gsap.set(ecgPath, { strokeDasharray: ecgLen, strokeDashoffset: ecgLen });
    }

    const ribbonPath = ribbonPathRef.current;
    const ribbonLen = ribbonPath ? ribbonPath.getTotalLength() : 960;
    if (ribbonPath) {
      gsap.set(ribbonPath, {
        strokeDasharray: `${ribbonLen * 0.36} ${ribbonLen}`,
        strokeDashoffset: ribbonLen,
        opacity: 0,
      });
    }

    const assignPath = assignLinePathRef.current;
    const assignLen = assignPath ? assignPath.getTotalLength() : 320;
    if (assignPath) {
      gsap.set(assignPath, {
        strokeDasharray: assignLen,
        strokeDashoffset: assignLen,
        opacity: 0,
      });
    }

    // Initial resting state inside screen plane (dark, premium, layered)
    const burstCards = [
      buildingRef.current,
      bedAvailRef.current,
      bedOccRef.current,
      bedCritRef.current,
      ecgCardRef.current,
      cardIcuRef.current,
      cardOpdRef.current,
      cardSurgeRef.current,
      floatCross1Ref.current,
      floatCross2Ref.current,
      floatIvRef.current,
    ].filter(Boolean) as HTMLElement[];

    const burstShadows = [
      buildingShadowRef.current,
      bedAvailShadowRef.current,
      bedOccShadowRef.current,
      bedCritShadowRef.current,
    ].filter(Boolean) as HTMLElement[];

    gsap.set(cameraEl, {
      scale: 1,
      z: 0,
      rotationX: 1.5,
      rotationY: -1,
      force3D: true,
    });

    gsap.set(burstCards, {
      opacity: 0,
      scale: 0.38,
      x: 0,
      y: 28,
      z: -80,
      rotationX: 14,
      rotationY: -10,
      force3D: true,
    });

    gsap.set(burstShadows, {
      opacity: 0,
      scale: 0.4,
      force3D: true,
    });

    if (burstGlowRef.current) {
      gsap.set(burstGlowRef.current, { opacity: 0.25, scale: 0.72, force3D: true });
    }
    if (bedAssignedBadgeRef.current) {
      gsap.set(bedAssignedBadgeRef.current, {
        opacity: 0,
        scale: 0.78,
        y: 12,
        force3D: true,
      });
    }
    if (bedAvailPulseRef.current) {
      gsap.set(bedAvailPulseRef.current, { opacity: 0, scale: 0.85, force3D: true });
    }
    if (bedCritRingRef.current) {
      gsap.set(bedCritRingRef.current, { opacity: 0.2, scale: 0.9, force3D: true });
    }
    if (assignOrbRef.current) {
      gsap.set(assignOrbRef.current, { opacity: 0, scale: 0.6 });
    }

    // Master 14.0-second synced timeline
    const masterTl = gsap.timeline({
      repeat: -1,
      paused: prefersReducedMotion,
      defaults: { force3D: true },
    });

    // =========================================================================
    // PHASE 1 (0s – 4s): Camera dolly in & tilt + Screen dashboard smooth scroll
    // =========================================================================
    masterTl
      .to(
        cameraEl,
        {
          scale: isMobile ? 1.05 : 1.08,
          z: isMobile ? 48 : 88,
          rotationX: -2.2,
          rotationY: 1.8,
          duration: 3.8,
          ease: easeOut,
        },
        0
      )
      .to(
        laptopShadowRef.current,
        {
          scale: 1.07,
          opacity: 0.78,
          duration: 3.8,
          ease: easeOut,
        },
        0
      )
      .to(
        screenScrollRef.current,
        {
          y: -74,
          duration: 1.6,
          ease: easeInOut,
        },
        0.35
      )
      .to(
        screenScrollRef.current,
        {
          y: -148,
          duration: 1.65,
          ease: easeInOut,
        },
        2.1
      )
      .fromTo(
        reflectionStreakRef.current,
        { x: -240, opacity: 0.14 },
        { x: 360, opacity: 0.28, duration: 3.6, ease: easeInOut },
        0.2
      )
      .to(
        lensFlareRef.current,
        {
          opacity: 0.65,
          duration: 2.2,
          ease: easeInOut,
        },
        1.2
      );

    // =========================================================================
    // PHASE 2 (4s – 9s): Pop-out burst into CSS 3D Z-space + Light Ribbon
    // =========================================================================
    if (burstGlowRef.current) {
      masterTl.to(
        burstGlowRef.current,
        { opacity: 0.92, scale: 1.06, duration: 1.8, ease: easeOut },
        4.0
      );
    }

    // 2a. Glass 3D Hospital Building (left-upper background depth z: +140 relative to burst container)
    masterTl
      .to(
        buildingRef.current,
        {
          opacity: 1,
          scale: 1,
          x: isMobile ? -115 : -240,
          y: isMobile ? -42 : -62,
          z: isMobile ? 95 : 155,
          rotationX: -4,
          rotationY: 10,
          rotationZ: -1.5,
          duration: 1.4,
          ease: easeOut,
        },
        4.05
      )
      .to(
        buildingShadowRef.current,
        { opacity: 0.52, scale: 1, duration: 1.4, ease: easeOut },
        4.05
      );

    // 2b. 3 Hospital Beds at staggered 3D depths (Available, Occupied, Critical)
    masterTl
      .to(
        bedAvailRef.current,
        {
          opacity: 1,
          scale: 1,
          x: isMobile ? -78 : -165,
          y: isMobile ? 54 : 84,
          z: isMobile ? 120 : 210,
          rotationX: 6,
          rotationY: 12,
          rotationZ: -2,
          duration: 1.35,
          ease: easeOut,
        },
        4.3
      )
      .to(
        bedAvailShadowRef.current,
        { opacity: 0.56, scale: 1, duration: 1.35, ease: easeOut },
        4.3
      )
      .to(
        bedOccRef.current,
        {
          opacity: 1,
          scale: 1,
          x: isMobile ? 4 : -8,
          y: isMobile ? 76 : 108,
          z: isMobile ? 100 : 185,
          rotationX: 8,
          rotationY: 4,
          rotationZ: 1,
          duration: 1.35,
          ease: easeOut,
        },
        4.55
      )
      .to(
        bedOccShadowRef.current,
        { opacity: 0.54, scale: 1, duration: 1.35, ease: easeOut },
        4.55
      )
      .to(
        bedCritRef.current,
        {
          opacity: 1,
          scale: 1,
          x: isMobile ? 86 : 162,
          y: isMobile ? 58 : 88,
          z: isMobile ? 125 : 225,
          rotationX: 6,
          rotationY: -12,
          rotationZ: 2,
          duration: 1.35,
          ease: easeOut,
        },
        4.8
      )
      .to(
        bedCritShadowRef.current,
        { opacity: 0.58, scale: 1, duration: 1.35, ease: easeOut },
        4.8
      );

    // Critical Bed muted-red pulse (transform + opacity only)
    if (bedCritRingRef.current) {
      masterTl
        .to(
          bedCritRingRef.current,
          { opacity: 0.85, scale: 1.24, duration: 0.9, ease: easeInOut },
          5.6
        )
        .to(
          bedCritRingRef.current,
          { opacity: 0.25, scale: 0.94, duration: 0.9, ease: easeInOut },
          6.5
        )
        .to(
          bedCritRingRef.current,
          { opacity: 0.85, scale: 1.22, duration: 0.9, ease: easeInOut },
          7.4
        )
        .to(
          bedCritRingRef.current,
          { opacity: 0.28, scale: 0.96, duration: 0.9, ease: easeInOut },
          8.3
        );
    }

    // 2c. Floating ECG Heartbeat Card + Self-Drawing ECG SVG
    masterTl.to(
      ecgCardRef.current,
      {
        opacity: 1,
        scale: 1,
        x: isMobile ? 96 : 220,
        y: isMobile ? -48 : -86,
        z: isMobile ? 140 : 255,
        rotationX: -5,
        rotationY: -12,
        rotationZ: 1.5,
        duration: 1.3,
        ease: easeOut,
      },
      4.65
    );
    if (ecgPath) {
      masterTl.to(
        ecgPath,
        {
          strokeDashoffset: 0,
          duration: 2.3,
          ease: 'power2.out',
        },
        5.1
      );
    }

    // 2d. 3 Translucent Glass Telemetry Cards (live data)
    masterTl
      .to(
        cardIcuRef.current,
        {
          opacity: 1,
          scale: 1,
          x: isMobile ? 105 : 235,
          y: isMobile ? 4 : -14,
          z: isMobile ? 155 : 275,
          rotationX: -2,
          rotationY: -14,
          duration: 1.25,
          ease: easeOut,
        },
        4.95
      )
      .to(
        cardOpdRef.current,
        {
          opacity: 1,
          scale: 1,
          x: isMobile ? -98 : -225,
          y: isMobile ? 8 : 16,
          z: isMobile ? 150 : 265,
          rotationX: 2,
          rotationY: 13,
          duration: 1.25,
          ease: easeOut,
        },
        5.2
      )
      .to(
        cardSurgeRef.current,
        {
          opacity: 1,
          scale: 1,
          x: isMobile ? 0 : 12,
          y: isMobile ? -78 : -118,
          z: isMobile ? 160 : 290,
          rotationX: -6,
          rotationY: -3,
          duration: 1.25,
          ease: easeOut,
        },
        5.45
      );

    // Subtle 3D float drift while hovering in space (5.8s – 9.2s)
    masterTl
      .to(buildingRef.current, { y: isMobile ? -48 : -70, rotationY: 7, duration: 2.8, ease: easeInOut }, 5.7)
      .to(cardIcuRef.current, { y: isMobile ? -2 : -22, rotationY: -10, duration: 2.6, ease: easeInOut }, 6.0)
      .to(cardOpdRef.current, { y: isMobile ? 2 : 8, rotationY: 10, duration: 2.6, ease: easeInOut }, 6.1)
      .to(cardSurgeRef.current, { y: isMobile ? -84 : -126, duration: 2.4, ease: easeInOut }, 6.2);

    // 2e. Medical Crosses & IV Drops drifting upward (desktop only to stay well under mobile limit)
    if (!isMobile) {
      masterTl
        .fromTo(
          floatCross1Ref.current,
          { opacity: 0, x: -135, y: 40, z: 185, scale: 0.7, rotationZ: -12 },
          { opacity: 0.88, x: -150, y: -76, z: 235, scale: 1, rotationZ: 8, duration: 3.4, ease: easeOut },
          5.0
        )
        .fromTo(
          floatCross2Ref.current,
          { opacity: 0, x: 145, y: 36, z: 195, scale: 0.7, rotationZ: 14 },
          { opacity: 0.86, x: 168, y: -88, z: 245, scale: 1, rotationZ: -6, duration: 3.5, ease: easeOut },
          5.3
        )
        .fromTo(
          floatIvRef.current,
          { opacity: 0, x: -58, y: 48, z: 220, scale: 0.72, rotationY: -14 },
          { opacity: 0.9, x: -72, y: -64, z: 265, scale: 1, rotationY: 10, duration: 3.3, ease: easeOut },
          5.5
        );
    }

    // 2f. Powder-Blue Light Ribbon Orbital Sweep
    if (ribbonPath) {
      masterTl
        .to(ribbonPath, { opacity: 0.9, duration: 0.6, ease: easeOut }, 5.6)
        .to(
          ribbonPath,
          {
            strokeDashoffset: -ribbonLen * 0.45,
            duration: 3.6,
            ease: easeInOut,
          },
          5.6
        );
    }

    // =========================================================================
    // PHASE 3 (9s – 12s): Glowing Data Line to Available Bed + "BED ASSIGNED"
    // =========================================================================
    if (assignPath) {
      masterTl
        .to(assignPath, { opacity: 0.95, duration: 0.35, ease: easeOut }, 8.95)
        .to(
          assignPath,
          {
            strokeDashoffset: 0,
            duration: 1.25,
            ease: easeOut,
          },
          9.0
        );
    }
    if (assignOrbRef.current) {
      masterTl
        .to(assignOrbRef.current, { opacity: 1, scale: 1.15, duration: 0.35 }, 9.85)
        .to(assignOrbRef.current, { opacity: 0.5, scale: 0.9, duration: 0.8 }, 10.6);
    }
    if (bedAvailPulseRef.current) {
      masterTl
        .to(
          bedAvailPulseRef.current,
          { opacity: 0.95, scale: 1.28, duration: 0.7, ease: easeOut },
          9.95
        )
        .to(
          bedAvailPulseRef.current,
          { opacity: 0.38, scale: 1.0, duration: 0.75, ease: easeInOut },
          10.65
        )
        .to(
          bedAvailPulseRef.current,
          { opacity: 0.88, scale: 1.22, duration: 0.6, ease: easeInOut },
          11.4
        );
    }
    if (bedAssignedBadgeRef.current) {
      masterTl.to(
        bedAssignedBadgeRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.65,
          ease: easeOut,
        },
        10.05
      );
    }

    // =========================================================================
    // PHASE 4 (12s – 14s): Seamless return to exact 0.0s rest pose
    // =========================================================================
    masterTl
      .to(
        [bedAssignedBadgeRef.current, bedAvailPulseRef.current, assignOrbRef.current].filter(
          Boolean
        ),
        {
          opacity: 0,
          scale: 0.78,
          duration: 0.75,
          ease: easeInOut,
        },
        12.0
      )
      .to(
        [ribbonPath, assignPath].filter(Boolean),
        {
          opacity: 0,
          duration: 0.85,
          ease: easeInOut,
        },
        12.05
      )
      .to(
        burstCards,
        {
          opacity: 0,
          scale: 0.38,
          x: 0,
          y: 28,
          z: -80,
          rotationX: 14,
          rotationY: -10,
          rotationZ: 0,
          duration: 1.65,
          stagger: 0.025,
          ease: easeInOut,
        },
        12.1
      )
      .to(
        burstShadows,
        {
          opacity: 0,
          scale: 0.4,
          duration: 1.4,
          ease: easeInOut,
        },
        12.1
      )
      .to(
        burstGlowRef.current,
        {
          opacity: 0.25,
          scale: 0.72,
          duration: 1.6,
          ease: easeInOut,
        },
        12.1
      )
      .to(
        screenScrollRef.current,
        {
          y: 0,
          duration: 1.5,
          ease: easeInOut,
        },
        12.2
      )
      .to(
        lensFlareRef.current,
        {
          opacity: 0.18,
          duration: 1.4,
          ease: easeInOut,
        },
        12.2
      )
      .to(
        cameraEl,
        {
          scale: 1,
          z: 0,
          rotationX: 1.5,
          rotationY: -1,
          duration: 1.75,
          ease: easeInOut,
        },
        12.25
      )
      .to(
        laptopShadowRef.current,
        {
          scale: 1,
          opacity: 0.65,
          duration: 1.75,
          ease: easeInOut,
        },
        12.25
      );

    // Ensure exact 14.0s cycle completion
    if (ecgPath) {
      masterTl.set(ecgPath, { strokeDashoffset: ecgLen }, 13.95);
    }
    if (ribbonPath) {
      masterTl.set(ribbonPath, { strokeDashoffset: ribbonLen }, 13.95);
    }
    if (assignPath) {
      masterTl.set(assignPath, { strokeDashoffset: assignLen }, 13.95);
    }

    // Independent low-cost ambient dust tweens (all paused together with GSAP global or off-screen)
    const dustTweens: gsap.core.Tween[] = [];
    const activeDust = isMobile ? MOBILE_DUST : DESKTOP_DUST;
    if (!prefersReducedMotion) {
      activeDust.forEach((d, idx) => {
        const node = dustNodesRef.current[idx];
        if (!node) return;
        const tw = gsap.fromTo(
          node,
          { x: 0, y: 0, opacity: d.baseOpacity * 0.4 },
          {
            x: d.dx,
            y: d.dy,
            opacity: d.baseOpacity,
            duration: d.duration,
            delay: d.delay,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            force3D: true,
          }
        );
        dustTweens.push(tw);
      });
    }

    // Reduced motion: snap directly to popped-out showcase frame (~7.8s -> progress 0.56)
    if (prefersReducedMotion) {
      masterTl.progress(0.56);
    }

    // Parallax state (4 depth rates, lerped at 60fps only when active)
    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;
    let isInViewport = true;
    let isPageVisible = !document.hidden;

    // Frame-rate guard: auto-reduce particles + disable lens flare if sustained fps < ~35fps
    let lastTickMs = performance.now();
    let slowFrames = 0;
    let perfDegraded = false;

    const bgSetX = bgParallaxRef.current ? gsap.quickSetter(bgParallaxRef.current, 'x', 'px') : null;
    const bgSetY = bgParallaxRef.current ? gsap.quickSetter(bgParallaxRef.current, 'y', 'px') : null;

    const lapSetX = laptopParallaxRef.current ? gsap.quickSetter(laptopParallaxRef.current, 'x', 'px') : null;
    const lapSetY = laptopParallaxRef.current ? gsap.quickSetter(laptopParallaxRef.current, 'y', 'px') : null;
    const lapSetRx = laptopParallaxRef.current ? gsap.quickSetter(laptopParallaxRef.current, 'rotationX', 'deg') : null;
    const lapSetRy = laptopParallaxRef.current ? gsap.quickSetter(laptopParallaxRef.current, 'rotationY', 'deg') : null;

    const burstSetX = burstParallaxRef.current ? gsap.quickSetter(burstParallaxRef.current, 'x', 'px') : null;
    const burstSetY = burstParallaxRef.current ? gsap.quickSetter(burstParallaxRef.current, 'y', 'px') : null;
    const burstSetRx = burstParallaxRef.current ? gsap.quickSetter(burstParallaxRef.current, 'rotationX', 'deg') : null;
    const burstSetRy = burstParallaxRef.current ? gsap.quickSetter(burstParallaxRef.current, 'rotationY', 'deg') : null;

    const fgSetX = fgParallaxRef.current ? gsap.quickSetter(fgParallaxRef.current, 'x', 'px') : null;
    const fgSetY = fgParallaxRef.current ? gsap.quickSetter(fgParallaxRef.current, 'y', 'px') : null;

    const tickerFn = () => {
      if (!isInViewport || !isPageVisible || prefersReducedMotion) {
        lastTickMs = performance.now();
        return;
      }

      const now = performance.now();
      const deltaMs = now - lastTickMs;
      lastTickMs = now;

      if (!perfDegraded && deltaMs > 29 && deltaMs < 250) {
        slowFrames += 1;
        if (slowFrames >= 18) {
          perfDegraded = true;
          setLowPerfMode(true);
          if (lensFlareRef.current) {
            gsap.set(lensFlareRef.current, { opacity: 0 });
          }
        }
      } else if (deltaMs <= 22 && slowFrames > 0) {
        slowFrames = Math.max(0, slowFrames - 1);
      }

      // Smooth lerp for multi-layer mouse parallax (limited to +-18px and +-3.2deg)
      smoothMouseX += (targetMouseX - smoothMouseX) * 0.08;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.08;

      if (bgSetX && bgSetY) {
        bgSetX(smoothMouseX * -6);
        bgSetY(smoothMouseY * -4);
      }
      if (lapSetX && lapSetY && lapSetRx && lapSetRy) {
        lapSetX(smoothMouseX * 8);
        lapSetY(smoothMouseY * 5);
        lapSetRx(-smoothMouseY * 2.2);
        lapSetRy(smoothMouseX * 3.0);
      }
      if (burstSetX && burstSetY && burstSetRx && burstSetRy) {
        burstSetX(smoothMouseX * 15);
        burstSetY(smoothMouseY * 10);
        burstSetRx(-smoothMouseY * 2.6);
        burstSetRy(smoothMouseX * 3.4);
      }
      if (fgSetX && fgSetY) {
        fgSetX(smoothMouseX * 20);
        fgSetY(smoothMouseY * 12);
      }
    };

    gsap.ticker.add(tickerFn);

    const syncPlayback = () => {
      if (prefersReducedMotion) return;
      const shouldRun = isInViewport && isPageVisible;
      if (shouldRun) {
        lastTickMs = performance.now();
        masterTl.play();
        dustTweens.forEach(t => t.play());
      } else {
        masterTl.pause();
        dustTweens.forEach(t => t.pause());
      }
    };

    const io = new IntersectionObserver(
      entries => {
        isInViewport = entries[0]?.isIntersecting ?? true;
        syncPlayback();
      },
      { threshold: 0.05 }
    );
    io.observe(bannerEl);

    const onVisChange = () => {
      isPageVisible = !document.hidden;
      syncPlayback();
    };
    document.addEventListener('visibilitychange', onVisChange);

    const onPointerMove = (e: PointerEvent) => {
      const rect = bannerEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      targetMouseX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      targetMouseY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
    };
    const onPointerLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    bannerEl.addEventListener('pointermove', onPointerMove, { passive: true });
    bannerEl.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const loadTimer = window.setTimeout(() => setIsLoaded(true), 120);

    return () => {
      window.clearTimeout(loadTimer);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisChange);
      bannerEl.removeEventListener('pointermove', onPointerMove);
      bannerEl.removeEventListener('pointerleave', onPointerLeave);
      gsap.ticker.remove(tickerFn);
      masterTl.kill();
      dustTweens.forEach(t => t.kill());
    };
  }, [isMobile]);

  const activeDust = useMemo(() => {
    const base = isMobile ? MOBILE_DUST : DESKTOP_DUST;
    return lowPerfMode ? base.slice(0, Math.ceil(base.length / 2)) : base;
  }, [isMobile, lowPerfMode]);

  return (
    <div
      ref={bannerRef}
      className="relative w-full h-[340px] md:h-[520px] rounded-3xl overflow-hidden bg-[#151F2C] border border-[#DCEBF5]/18 shadow-[0_28px_64px_-24px_rgba(10,16,26,0.9)] select-none"
      aria-label="Arogya AI Predictive Hospital Operations Showcase"
    >
      {/* Shimmer Loading Skeleton (fades out cleanly once scene mounts) */}
      <div
        className={`pointer-events-none absolute inset-0 z-30 bg-[#151F2C] transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <div className="h-full w-full p-6 flex flex-col justify-between animate-pulse">
          <div className="flex justify-between">
            <div className="h-4 w-32 rounded bg-[#1E2A3A]" />
            <div className="h-4 w-24 rounded bg-[#1E2A3A]" />
          </div>
          <div className="w-64 md:w-96 h-36 md:h-52 mx-auto rounded-2xl bg-[#1E2A3A] border border-[#4682B4]/25" />
          <div className="h-12 w-full rounded-xl bg-[#101722]" />
        </div>
      </div>

      {/* =================================================================== */}
      {/* CSS 3D PERSPECTIVE SCENE STAGE                                      */}
      {/* =================================================================== */}
      <div
        className={`pointer-events-none relative w-full h-full flex items-center justify-center transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ perspective: '1400px' }}
      >
        {/* Camera Dolly & Tilt Wrapper */}
        <div
          ref={cameraRef}
          className="relative w-full h-full flex items-center justify-center will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* --------------------------------------------------------------- */}
          {/* LAYER Z0: BLURRED MODERN HOSPITAL OFFICE BACKGROUND SCENE       */}
          {/* --------------------------------------------------------------- */}
          <div
            ref={bgParallaxRef}
            className="absolute -inset-6 will-change-transform"
            style={{
              transform: 'translate3d(0, 0, -90px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Rich dark slate navy to muted steel blue wall gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 78% 60% at 50% 34%, #2B486B 0%, #1E2A3A 54%, #121B27 100%)',
              }}
            />

            {/* Static Pre-Blurred Office Windows + Distant Hospital Silhouette + Pendant Glows */}
            <svg
              viewBox="0 0 1200 540"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full opacity-90"
              style={{ filter: 'blur(3.5px)' }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="officeGlassSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E2A3A" />
                  <stop offset="55%" stopColor="#32587D" stopOpacity="0.72" />
                  <stop offset="100%" stopColor="#162130" />
                </linearGradient>
                <radialGradient id="pendantGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#B0E0E6" stopOpacity="0.45" />
                  <stop offset="45%" stopColor="#4682B4" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#1E2A3A" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="deskSurface" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B2838" />
                  <stop offset="35%" stopColor="#141E2B" />
                  <stop offset="100%" stopColor="#0D141D" />
                </linearGradient>
              </defs>

              {/* Recessed Hospital Office Window Bays */}
              <rect x="70" y="24" width="320" height="350" rx="8" fill="url(#officeGlassSky)" stroke="#4682B4" strokeOpacity="0.22" strokeWidth="2" />
              <rect x="425" y="24" width="350" height="350" rx="8" fill="url(#officeGlassSky)" stroke="#4682B4" strokeOpacity="0.22" strokeWidth="2" />
              <rect x="810" y="24" width="320" height="350" rx="8" fill="url(#officeGlassSky)" stroke="#4682B4" strokeOpacity="0.22" strokeWidth="2" />

              {/* Distant Blurred Hospital Tower Silhouette Outside Window */}
              <rect x="135" y="165" width="145" height="205" fill="#182433" opacity="0.9" />
              <rect x="465" y="128" width="270" height="245" fill="#16212F" opacity="0.92" />
              <rect x="870" y="152" width="175" height="218" fill="#182433" opacity="0.9" />
              {/* Subtle lit hospital tower windows */}
              <g fill="#B0E0E6" fillOpacity="0.32">
                <rect x="490" y="155" width="28" height="12" rx="2" />
                <rect x="532" y="155" width="28" height="12" rx="2" />
                <rect x="615" y="155" width="28" height="12" rx="2" />
                <rect x="490" y="185" width="28" height="12" rx="2" />
                <rect x="574" y="185" width="28" height="12" rx="2" />
                <rect x="656" y="185" width="28" height="12" rx="2" />
                <rect x="160" y="195" width="24" height="10" rx="2" />
                <rect x="200" y="195" width="24" height="10" rx="2" />
                <rect x="900" y="188" width="26" height="11" rx="2" />
                <rect x="955" y="188" width="26" height="11" rx="2" />
              </g>
              {/* Distant Medical Cross Beacon */}
              <g opacity="0.45" fill="#B0E0E6">
                <rect x="594" y="102" width="12" height="4" rx="1" />
                <rect x="598" y="98" width="4" height="12" rx="1" />
              </g>

              {/* Hanging Office Pendant Lamps + Cool Glows */}
              <line x1="250" y1="0" x2="250" y2="62" stroke="#101822" strokeWidth="3" />
              <path d="M222 62 H278 L286 78 H214 Z" fill="#182433" />
              <circle cx="250" cy="95" r="105" fill="url(#pendantGlow)" />

              <line x1="950" y1="0" x2="950" y2="62" stroke="#101822" strokeWidth="3" />
              <path d="M922 62 H978 L986 78 H914 Z" fill="#182433" />
              <circle cx="950" cy="95" r="105" fill="url(#pendantGlow)" />

              {/* Dark Desk Plane at Bottom with Subtle Steel Reflection */}
              <rect x="0" y="370" width="1200" height="175" fill="url(#deskSurface)" />
              <line x1="0" y1="371" x2="1200" y2="371" stroke="#4682B4" strokeOpacity="0.32" strokeWidth="2" />
              <ellipse cx="600" cy="402" rx="340" ry="34" fill="#4682B4" fillOpacity="0.14" />
            </svg>

            {/* Atmospheric Deep Haze Gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 48%, rgba(70,130,180,0.14) 0%, rgba(30,42,58,0.42) 60%, rgba(16,24,35,0.88) 100%)',
              }}
            />
          </div>

          {/* --------------------------------------------------------------- */}
          {/* LAYER Z1: ATMOSPHERIC GLOW BEHIND POPPED-OUT BURST              */}
          {/* --------------------------------------------------------------- */}
          <div
            ref={burstGlowRef}
            className="absolute w-[340px] h-[240px] md:w-[620px] md:h-[340px] rounded-full will-change-transform"
            style={{
              transform: 'translate3d(0, -18px, 60px)',
              background:
                'radial-gradient(ellipse at center, rgba(176,224,230,0.28) 0%, rgba(70,130,180,0.18) 45%, rgba(30,42,58,0) 76%)',
            }}
          />

          {/* --------------------------------------------------------------- */}
          {/* LAYER Z2: CSS 3D SLEEK DARK LAPTOP (translateZ: 120px)          */}
          {/* --------------------------------------------------------------- */}
          <div
            ref={laptopParallaxRef}
            className="relative flex flex-col items-center justify-center will-change-transform"
            style={{
              transform: 'translate3d(0, 34px, 120px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Contact Shadow Beneath Laptop on Desk */}
            <div
              ref={laptopShadowRef}
              className="absolute w-[300px] h-[64px] md:w-[490px] md:h-[96px] rounded-full will-change-transform"
              style={{
                transform: 'translate3d(0, 126px, -22px) rotateX(78deg)',
                background:
                  'radial-gradient(ellipse at center, rgba(6,10,16,0.88) 0%, rgba(12,18,28,0.48) 55%, rgba(12,18,28,0) 80%)',
              }}
            />

            {/* Laptop Body Group (slight cinematic 3D angle) */}
            <div
              className="relative flex flex-col items-center"
              style={{
                transform: 'rotateX(6deg) rotateY(-8deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* LAPTOP SCREEN LID */}
              <div
                className="relative w-[248px] h-[154px] md:w-[396px] md:h-[238px] rounded-t-2xl p-[7px] md:p-[10px] border border-[#B0E0E6]/35 shadow-[0_22px_50px_rgba(8,13,22,0.85)]"
                style={{
                  background:
                    'linear-gradient(145deg, #27384D 0%, #1B2737 45%, #121B27 100%)',
                  transformOrigin: 'bottom center',
                  transform: 'rotateX(-5deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Top Bezel Rim Highlight + Camera Notch */}
                <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#101822] flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-[#4682B4]" />
                </div>

                {/* Screen Viewport Housing */}
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-[#121B27] border border-[#4682B4]/40">
                  {/* Live Scaled HTML Miniature Dashboard */}
                  <div
                    className="w-[295px] h-[182px] md:w-[376px] md:h-[218px] origin-top-left"
                    style={{
                      transform: isMobile ? 'scale(0.79)' : 'scale(1)',
                    }}
                  >
                    <MiniLaptopDashboard
                      hospital={hospital}
                      alerts={alerts}
                      spikeAlert={spikeAlert}
                      scrollContainerRef={screenScrollRef}
                    />
                  </div>

                  {/* Soft Glass Reflection Streak (transform only, static soft gradient) */}
                  <div
                    ref={reflectionStreakRef}
                    className="absolute -top-12 -bottom-12 w-24 pointer-events-none will-change-transform"
                    style={{
                      background:
                        'linear-gradient(105deg, transparent 0%, rgba(220,235,245,0.14) 48%, rgba(176,224,230,0.08) 58%, transparent 100%)',
                      transform: 'translate3d(-240px, 0, 0) skewX(-18deg)',
                    }}
                  />

                  {/* Subtle Inner Rim Vignette */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: 'inset 0 0 18px rgba(10,16,26,0.65)',
                    }}
                  />
                </div>

                {/* Subtle Lens Flare on Screen Corner (opacity animated only) */}
                <div
                  ref={lensFlareRef}
                  className="absolute -top-5 -right-5 w-24 h-24 rounded-full pointer-events-none will-change-transform"
                  style={{
                    opacity: 0.18,
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(176,224,230,0.28) 28%, rgba(70,130,180,0) 70%)',
                  }}
                />
              </div>

              {/* HINGE BAR */}
              <div
                className="w-[216px] md:w-[344px] h-[5px] md:h-[6px] rounded-sm border-y border-[#B0E0E6]/20"
                style={{
                  background: 'linear-gradient(90deg, #101822 0%, #2C3E55 50%, #101822 100%)',
                  transform: 'translate3d(0, -1px, 3px)',
                }}
              />

              {/* LAPTOP KEYBOARD DECK (CSS 3D Tilted Base) */}
              <div
                className="relative w-[274px] h-[112px] md:w-[436px] md:h-[164px] rounded-b-2xl rounded-t-sm border border-[#B0E0E6]/25 px-4 py-3 md:px-6 md:py-4 flex flex-col justify-between shadow-[0_14px_24px_rgba(8,13,22,0.7)]"
                style={{
                  transformOrigin: 'top center',
                  transform: 'rotateX(72deg) translate3d(0, -2px, 0)',
                  background:
                    'linear-gradient(180deg, #223246 0%, #1A2636 60%, #121B27 100%)',
                }}
              >
                {/* Recessed Keyboard Key Grid (simplified cleanly on mobile) */}
                <div
                  className={`w-full h-[54%] rounded-md bg-[#111924] border border-[#4682B4]/25 p-1.5 grid gap-[2px] md:gap-1 ${
                    isMobile ? 'grid-cols-8 grid-rows-3' : 'grid-cols-12 grid-rows-4'
                  }`}
                >
                  {Array.from({ length: isMobile ? 24 : 48 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-[2px] bg-[#1E2A3A] border-t border-[#B0E0E6]/15"
                    />
                  ))}
                </div>

                {/* Trackpad Recess */}
                <div className="w-[34%] h-[32%] mx-auto rounded-md bg-[#162130] border border-[#B0E0E6]/22" />

                {/* Front Chassis Thickness Lip */}
                <div
                  className="absolute inset-x-0 -bottom-[5px] h-[5px] rounded-b-xl bg-[#101722] border-t border-[#4682B4]/30"
                />
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* LAYER Z3: POPPED-OUT 3D ELEMENTS + RIBBON + DATA LINE           */}
          {/* (Base layer at translateZ(200px); children offset up to +290px) */}
          {/* --------------------------------------------------------------- */}
          <div
            ref={burstParallaxRef}
            className="absolute inset-0 flex items-center justify-center will-change-transform"
            style={{
              transform: 'translate3d(0, 0, 200px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Dynamic SVG Data Stream Ribbon & Assignment Beam */}
            <svg
              viewBox="-420 -210 840 420"
              className="absolute w-[620px] h-[310px] md:w-[860px] md:h-[430px] overflow-visible pointer-events-none"
              style={{ transform: 'translate3d(0, 0, 145px)' }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ribbonStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4682B4" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#B0E0E6" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
                </linearGradient>
                <filter id="staticGlowSmall" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Sweeping Powder-Blue Light Ribbon */}
              <path
                ref={ribbonPathRef}
                d="M -290 45 C -330 -125, -45 -185, 195 -125 C 345 -85, 340 85, 130 125 C -85 162, -230 112, -290 45"
                fill="none"
                stroke="url(#ribbonStrokeGrad)"
                strokeWidth="3.2"
                strokeLinecap="round"
                filter="url(#staticGlowSmall)"
              />

              {/* Phase 3 Assignment Data Beam (from ribbon node to Available Bed) */}
              <path
                ref={assignLinePathRef}
                d="M 105 -120 C 12 -98, -95 -34, -158 72"
                fill="none"
                stroke="#B0E0E6"
                strokeWidth="2.8"
                strokeLinecap="round"
                filter="url(#staticGlowSmall)"
              />

              {/* Target Node Orb at Available Bed */}
              <circle
                ref={assignOrbRef}
                cx="-158"
                cy="72"
                r="6.5"
                fill="#FFFFFF"
                stroke="#B0E0E6"
                strokeWidth="3"
              />
            </svg>

            {/* Ground Contact Shadows for Burst Objects */}
            <div
              ref={buildingShadowRef}
              className="absolute w-28 h-8 rounded-full will-change-transform"
              style={{
                transform: isMobile
                  ? 'translate3d(-115px, 95px, 20px)'
                  : 'translate3d(-240px, 128px, 20px)',
                background:
                  'radial-gradient(ellipse, rgba(6,10,16,0.72) 0%, transparent 72%)',
              }}
            />
            <div
              ref={bedAvailShadowRef}
              className="absolute w-20 h-6 rounded-full will-change-transform"
              style={{
                transform: isMobile
                  ? 'translate3d(-78px, 108px, 24px)'
                  : 'translate3d(-165px, 146px, 24px)',
                background:
                  'radial-gradient(ellipse, rgba(70,130,180,0.34) 0%, transparent 72%)',
              }}
            />
            <div
              ref={bedOccShadowRef}
              className="absolute w-20 h-6 rounded-full will-change-transform"
              style={{
                transform: isMobile
                  ? 'translate3d(4px, 118px, 20px)'
                  : 'translate3d(-8px, 158px, 20px)',
                background:
                  'radial-gradient(ellipse, rgba(6,10,16,0.68) 0%, transparent 72%)',
              }}
            />
            <div
              ref={bedCritShadowRef}
              className="absolute w-20 h-6 rounded-full will-change-transform"
              style={{
                transform: isMobile
                  ? 'translate3d(86px, 110px, 24px)'
                  : 'translate3d(162px, 148px, 24px)',
                background:
                  'radial-gradient(ellipse, rgba(217,83,79,0.28) 0%, transparent 72%)',
              }}
            />

            {/* 1. GLASS-STYLE 3D HOSPITAL BUILDING */}
            <div
              ref={buildingRef}
              className="absolute will-change-transform rounded-2xl p-2.5 md:p-3 border border-[#B0E0E6]/45 shadow-[0_18px_36px_rgba(8,14,24,0.8)]"
              style={{
                background:
                  'linear-gradient(155deg, rgba(46,74,106,0.92) 0%, rgba(30,42,58,0.95) 65%, rgba(20,30,44,0.98) 100%)',
                boxShadow:
                  'inset 0 1px 0 rgba(220,235,245,0.35), 0 18px 36px rgba(8,14,24,0.8)',
              }}
            >
              <svg
                viewBox="0 0 120 96"
                className="w-[82px] h-[66px] md:w-[118px] md:h-[94px]"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="hospGlassFront" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4682B4" stopOpacity="0.88" />
                    <stop offset="100%" stopColor="#1E2A3A" stopOpacity="0.96" />
                  </linearGradient>
                  <linearGradient id="hospGlassSide" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2C4A6B" />
                    <stop offset="100%" stopColor="#151F2C" />
                  </linearGradient>
                </defs>
                {/* 3D Isometric Hospital Tower */}
                <polygon points="18,24 68,14 68,86 18,86" fill="url(#hospGlassFront)" stroke="#B0E0E6" strokeOpacity="0.55" strokeWidth="1.2" />
                <polygon points="68,14 102,26 102,86 68,86" fill="url(#hospGlassSide)" stroke="#4682B4" strokeOpacity="0.55" strokeWidth="1.2" />
                {/* Rooftop Helipad/Crown */}
                <polygon points="18,24 68,14 102,26 54,34" fill="#325375" stroke="#B0E0E6" strokeOpacity="0.45" strokeWidth="1" />
                {/* Lit Floor Windows */}
                {[34, 48, 62, 74].map((yPos, r) => (
                  <g key={yPos}>
                    <rect x="25" y={yPos} width="10" height="6" rx="1" fill={r === 1 ? '#FFFFFF' : '#B0E0E6'} fillOpacity={r % 2 === 0 ? 0.85 : 0.65} />
                    <rect x="39" y={yPos} width="10" height="6" rx="1" fill="#DCEBF5" fillOpacity="0.72" />
                    <rect x="53" y={yPos} width="10" height="6" rx="1" fill="#B0E0E6" fillOpacity="0.82" />
                    <rect x="74" y={yPos + 2} width="8" height="5" rx="1" fill="#4682B4" fillOpacity="0.85" />
                    <rect x="86" y={yPos + 2} width="8" height="5" rx="1" fill="#B0E0E6" fillOpacity="0.5" />
                  </g>
                ))}
                {/* Illuminated Medical Cross */}
                <rect x="39" y="10" width="8" height="2.6" rx="1" fill="#B0E0E6" />
                <rect x="41.7" y="7.3" width="2.6" height="8" rx="1" fill="#B0E0E6" />
              </svg>
              <div className="mt-1 text-[8px] md:text-[9px] font-bold tracking-[0.16em] uppercase text-[#DCEBF5] text-center">
                Arogya Tower
              </div>
            </div>

            {/* 2a. AVAILABLE HOSPITAL BED (Powder Blue Glow + "BED ASSIGNED") */}
            <div ref={bedAvailRef} className="absolute will-change-transform">
              {/* Available Pulse Halo (transform + opacity only) */}
              <div
                ref={bedAvailPulseRef}
                className="absolute -inset-3 rounded-2xl pointer-events-none will-change-transform"
                style={{
                  background:
                    'radial-gradient(circle, rgba(176,224,230,0.45) 0%, rgba(70,130,180,0.12) 58%, transparent 80%)',
                }}
              />
              {/* "BED ASSIGNED" Callout (Phase 3) */}
              <div
                ref={bedAssignedBadgeRef}
                className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#B0E0E6] text-[#1E2A3A] text-[8px] md:text-[9px] font-extrabold tracking-[0.15em] uppercase whitespace-nowrap shadow-lg will-change-transform"
              >
                BED ASSIGNED
              </div>

              <div
                className="relative rounded-xl p-2 md:p-2.5 border border-[#B0E0E6]/75 shadow-[0_14px_28px_rgba(10,16,26,0.75)]"
                style={{
                  background:
                    'linear-gradient(155deg, rgba(44,68,94,0.95) 0%, rgba(26,38,54,0.96) 100%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(176,224,230,0.5), 0 14px 28px rgba(10,16,26,0.75)',
                }}
              >
                <svg viewBox="0 0 84 48" className="w-[64px] h-[36px] md:w-[86px] md:h-[48px]" aria-hidden="true">
                  <rect x="8" y="22" width="68" height="8" rx="2" fill="#1E2A3A" stroke="#B0E0E6" strokeWidth="1.2" />
                  <rect x="8" y="10" width="6" height="28" rx="2" fill="#4682B4" />
                  <rect x="70" y="16" width="6" height="22" rx="2" fill="#4682B4" />
                  {/* Crisp Powder Blue Available Mattress */}
                  <rect x="14" y="16" width="56" height="8" rx="3" fill="#B0E0E6" />
                  <rect x="16" y="13" width="12" height="4" rx="2" fill="#FFFFFF" />
                  {/* Wheels */}
                  <circle cx="15" cy="40" r="2.5" fill="#B0E0E6" />
                  <circle cx="69" cy="40" r="2.5" fill="#B0E0E6" />
                </svg>
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[7.5px] md:text-[8.5px] font-bold tracking-[0.14em] uppercase text-[#B0E0E6]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B0E0E6]" />
                  <span>Available</span>
                </div>
              </div>
            </div>

            {/* 2b. OCCUPIED HOSPITAL BED (Steel Blue) */}
            <div ref={bedOccRef} className="absolute will-change-transform">
              <div
                className="relative rounded-xl p-2 md:p-2.5 border border-[#4682B4]/75 shadow-[0_14px_28px_rgba(10,16,26,0.75)]"
                style={{
                  background:
                    'linear-gradient(155deg, rgba(35,54,78,0.95) 0%, rgba(22,33,47,0.96) 100%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(220,235,245,0.28), 0 14px 28px rgba(10,16,26,0.75)',
                }}
              >
                <svg viewBox="0 0 84 48" className="w-[64px] h-[36px] md:w-[86px] md:h-[48px]" aria-hidden="true">
                  <rect x="8" y="22" width="68" height="8" rx="2" fill="#182332" stroke="#4682B4" strokeWidth="1.2" />
                  <rect x="8" y="10" width="6" height="28" rx="2" fill="#2F587C" />
                  <rect x="70" y="16" width="6" height="22" rx="2" fill="#2F587C" />
                  <rect x="14" y="16" width="56" height="8" rx="3" fill="#4682B4" />
                  <rect x="16" y="13" width="12" height="4" rx="2" fill="#DCEBF5" />
                  {/* Patient Blanket Silhouette */}
                  <path d="M28 16 Q46 11 66 17 L66 23 L28 23 Z" fill="#2F587C" />
                  <circle cx="15" cy="40" r="2.5" fill="#4682B4" />
                  <circle cx="69" cy="40" r="2.5" fill="#4682B4" />
                </svg>
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[7.5px] md:text-[8.5px] font-bold tracking-[0.14em] uppercase text-[#DCEBF5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4682B4]" />
                  <span>Occupied</span>
                </div>
              </div>
            </div>

            {/* 2c. CRITICAL HOSPITAL BED (Muted Red Pulse) */}
            <div ref={bedCritRef} className="absolute will-change-transform">
              {/* Muted Red Pulse Ring (transform + opacity only) */}
              <div
                ref={bedCritRingRef}
                className="absolute -inset-2.5 rounded-2xl border border-[#D9534F]/75 pointer-events-none will-change-transform"
                style={{
                  background:
                    'radial-gradient(circle, rgba(217,83,79,0.28) 0%, transparent 72%)',
                }}
              />
              <div
                className="relative rounded-xl p-2 md:p-2.5 border border-[#D9534F]/70 shadow-[0_14px_28px_rgba(10,16,26,0.75)]"
                style={{
                  background:
                    'linear-gradient(155deg, rgba(46,42,54,0.95) 0%, rgba(25,31,44,0.97) 100%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(240,133,130,0.35), 0 14px 28px rgba(10,16,26,0.75)',
                }}
              >
                <svg viewBox="0 0 84 48" className="w-[64px] h-[36px] md:w-[86px] md:h-[48px]" aria-hidden="true">
                  <rect x="8" y="22" width="68" height="8" rx="2" fill="#1A2230" stroke="#D9534F" strokeWidth="1.2" />
                  <rect x="8" y="10" width="6" height="28" rx="2" fill="#4682B4" />
                  <rect x="70" y="16" width="6" height="22" rx="2" fill="#4682B4" />
                  <rect x="14" y="16" width="56" height="8" rx="3" fill="#D9534F" fillOpacity="0.88" />
                  <rect x="16" y="13" width="12" height="4" rx="2" fill="#FFFFFF" />
                  <circle cx="15" cy="40" r="2.5" fill="#F08582" />
                  <circle cx="69" cy="40" r="2.5" fill="#F08582" />
                </svg>
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[7.5px] md:text-[8.5px] font-bold tracking-[0.14em] uppercase text-[#F08582]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9534F]" />
                  <span>Critical</span>
                </div>
              </div>
            </div>

            {/* 3. FLOATING SELF-DRAWING ECG HEARTBEAT CARD */}
            <div
              ref={ecgCardRef}
              className="absolute will-change-transform rounded-2xl px-3 py-2.5 md:px-4 md:py-3 border border-[#B0E0E6]/50 shadow-[0_18px_34px_rgba(8,13,22,0.8)]"
              style={{
                background:
                  'linear-gradient(145deg, rgba(36,54,76,0.92) 0%, rgba(21,31,44,0.96) 100%)',
                boxShadow:
                  'inset 0 1px 0 rgba(176,224,230,0.42), 0 18px 34px rgba(8,13,22,0.8)',
              }}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[7.5px] md:text-[8.5px] font-bold tracking-[0.18em] uppercase text-[#B0E0E6]">
                  ICU Telemetry
                </span>
                <span className="text-[8px] md:text-[9px] font-bold tabular-nums text-[#FFFFFF]">
                  74 BPM
                </span>
              </div>
              <svg viewBox="0 0 160 44" className="w-[116px] h-[32px] md:w-[154px] md:h-[40px]" aria-hidden="true">
                <line x1="0" y1="26" x2="160" y2="26" stroke="#4682B4" strokeOpacity="0.28" strokeWidth="1" />
                <path
                  ref={ecgPathRef}
                  d="M 4 26 L 28 26 L 36 18 L 44 35 L 52 7 L 60 39 L 68 26 L 94 26 L 102 19 L 110 33 L 118 9 L 126 36 L 134 26 L 156 26"
                  fill="none"
                  stroke="#B0E0E6"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 4. TRANSLUCENT GLASS TELEMETRY CARDS (Real App Values) */}
            <div
              ref={cardIcuRef}
              className="absolute will-change-transform rounded-xl px-3 py-2 md:px-4 md:py-2.5 border border-[#B0E0E6]/55 shadow-[0_16px_32px_rgba(8,13,22,0.8)]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(42,66,94,0.92) 0%, rgba(25,37,54,0.96) 100%)',
                boxShadow:
                  'inset 0 1px 0 rgba(220,235,245,0.4), 0 16px 32px rgba(8,13,22,0.8)',
              }}
            >
              <div className="text-[7px] md:text-[8px] uppercase tracking-[0.18em] text-[#DCEBF5]/80 font-semibold">
                Critical Capacity
              </div>
              <div className="text-[11px] md:text-xs font-bold text-[#FFFFFF] tabular-nums whitespace-nowrap mt-0.5">
                ICU: <span className="text-[#B0E0E6]">{icuFree} beds free</span>
              </div>
            </div>

            <div
              ref={cardOpdRef}
              className="absolute will-change-transform rounded-xl px-3 py-2 md:px-4 md:py-2.5 border border-[#4682B4]/65 shadow-[0_16px_32px_rgba(8,13,22,0.8)]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(35,54,78,0.92) 0%, rgba(21,31,44,0.96) 100%)',
                boxShadow:
                  'inset 0 1px 0 rgba(176,224,230,0.35), 0 16px 32px rgba(8,13,22,0.8)',
              }}
            >
              <div className="text-[7px] md:text-[8px] uppercase tracking-[0.18em] text-[#B0E0E6] font-semibold">
                Live Intake Flow
              </div>
              <div className="text-[10px] md:text-xs font-bold text-[#FFFFFF] tabular-nums whitespace-nowrap mt-0.5">
                OPD queue: {opdWaiting} waiting · est. {opdWaitMins}m
              </div>
            </div>

            <div
              ref={cardSurgeRef}
              className="absolute will-change-transform rounded-xl px-3.5 py-2 md:px-4 md:py-2.5 border border-[#B0E0E6]/60 shadow-[0_18px_36px_rgba(8,13,22,0.82)]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(48,79,112,0.92) 0%, rgba(24,36,52,0.96) 100%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 18px 36px rgba(8,13,22,0.82)',
              }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#B0E0E6]" />
                <span className="text-[10px] md:text-xs font-bold text-[#FFFFFF] tabular-nums">
                  Surge +{surgePct}% at 6 PM
                </span>
              </div>
            </div>

            {/* 5. MEDICAL CROSSES & IV DROPS DRIFTING UPWARD (Desktop only) */}
            {!isMobile && (
              <>
                <div
                  ref={floatCross1Ref}
                  className="absolute will-change-transform rounded-xl p-2 border border-[#B0E0E6]/45 bg-[#1E2A3A]/90 shadow-lg"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                    <rect x="9.5" y="3" width="5" height="18" rx="1.5" fill="#B0E0E6" />
                    <rect x="3" y="9.5" width="18" height="5" rx="1.5" fill="#B0E0E6" />
                  </svg>
                </div>

                <div
                  ref={floatCross2Ref}
                  className="absolute will-change-transform rounded-xl p-2 border border-[#4682B4]/55 bg-[#1E2A3A]/90 shadow-lg"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                    <rect x="9.5" y="3" width="5" height="18" rx="1.5" fill="#DCEBF5" />
                    <rect x="3" y="9.5" width="18" height="5" rx="1.5" fill="#DCEBF5" />
                  </svg>
                </div>

                <div
                  ref={floatIvRef}
                  className="absolute will-change-transform rounded-xl p-2 border border-[#B0E0E6]/45 bg-[#1E2A3A]/90 shadow-lg"
                >
                  <svg viewBox="0 0 24 28" className="w-5 h-6" aria-hidden="true">
                    <rect x="6" y="4" width="12" height="15" rx="3" fill="#4682B4" fillOpacity="0.45" stroke="#B0E0E6" strokeWidth="1.4" />
                    <path d="M8 12 H16 V17 H8 Z" fill="#B0E0E6" fillOpacity="0.85" />
                    <line x1="12" y1="19" x2="12" y2="26" stroke="#DCEBF5" strokeWidth="1.4" />
                    <circle cx="12" cy="2.5" r="1.5" fill="#FFFFFF" />
                  </svg>
                </div>
              </>
            )}
          </div>

          {/* --------------------------------------------------------------- */}
          {/* LAYER Z4: AMBIENT DUST PARTICLES (Max 18 desktop / 10 mobile)   */}
          {/* --------------------------------------------------------------- */}
          <div
            ref={dustLayerRef}
            className="absolute inset-0 pointer-events-none"
            style={{ transform: 'translate3d(0, 0, 310px)' }}
            aria-hidden="true"
          >
            {activeDust.map((d, idx) => (
              <div
                key={d.id}
                ref={el => {
                  dustNodesRef.current[idx] = el;
                }}
                className="absolute rounded-full bg-[#B0E0E6] will-change-transform"
                style={{
                  left: `${d.leftPct}%`,
                  top: `${d.topPct}%`,
                  width: `${d.size}px`,
                  height: `${d.size}px`,
                  opacity: d.baseOpacity,
                }}
              />
            ))}
          </div>

          {/* --------------------------------------------------------------- */}
          {/* LAYER Z5: FOREGROUND DESK PROPS (Static blurred SVGs at z:500px)*/}
          {/* --------------------------------------------------------------- */}
          <div
            ref={fgParallaxRef}
            className="absolute -inset-4 pointer-events-none will-change-transform"
            style={{
              transform: 'translate3d(0, 0, 480px)',
              filter: 'blur(2.5px)',
            }}
            aria-hidden="true"
          >
            {/* Bottom-Left: Stethoscope Draped on Desk */}
            <svg
              viewBox="0 0 220 140"
              className="hidden sm:block absolute left-2 -bottom-2 w-[170px] md:w-[215px] opacity-85"
            >
              <path
                d="M 28 128 C 30 62, 68 38, 102 68 C 128 92, 114 128, 152 118"
                fill="none"
                stroke="#111924"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 28 128 C 30 62, 68 38, 102 68 C 128 92, 114 128, 152 118"
                fill="none"
                stroke="#4682B4"
                strokeOpacity="0.48"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="158" cy="116" r="14" fill="#1E2A3A" stroke="#B0E0E6" strokeOpacity="0.55" strokeWidth="2.5" />
              <circle cx="158" cy="116" r="6" fill="#4682B4" />
            </svg>

            {/* Bottom-Right: Minimalist Potted Plant + Folded Clinical Coat Edge */}
            <svg
              viewBox="0 0 230 170"
              className="absolute right-0 -bottom-2 w-[140px] sm:w-[185px] md:w-[220px] opacity-85"
            >
              {/* Folded White Coat in Dim Clinical Office Light */}
              <path
                d="M 10 170 Q 48 118 118 134 L 138 170 Z"
                fill="#283A50"
                stroke="#DCEBF5"
                strokeOpacity="0.28"
                strokeWidth="1.5"
              />
              <path d="M 32 168 L 62 128 L 96 136 L 78 168 Z" fill="#DCEBF5" fillOpacity="0.2" />
              <path d="M 38 168 L 78 132 L 98 168 Z" fill="#1F2F42" />
              {/* Small Desk Plant */}
              <polygon points="154,116 196,116 190,158 160,158" fill="#16212F" stroke="#4682B4" strokeOpacity="0.4" strokeWidth="1.5" />
              <path d="M175 116 C165 86, 145 78, 140 62 C156 68, 168 86, 175 116 Z" fill="#2A4D69" />
              <path d="M175 116 C175 82, 178 62, 184 48 C188 68, 184 92, 175 116 Z" fill="#3B6B91" />
              <path d="M175 116 C188 90, 206 80, 214 68 C202 88, 188 100, 175 116 Z" fill="#234059" />
            </svg>
          </div>
        </div>
      </div>

      {/* Soft Dark Slate Navy Edge Fade Vignette (keeps framing dark and grounded) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          boxShadow: 'inset 0 0 56px 14px rgba(16,24,35,0.92)',
          background:
            'linear-gradient(90deg, rgba(21,31,44,0.72) 0%, transparent 12%, transparent 88%, rgba(21,31,44,0.72) 100%), linear-gradient(180deg, rgba(21,31,44,0.45) 0%, transparent 14%, transparent 84%, rgba(16,24,35,0.82) 100%)',
        }}
      />
    </div>
  );
};
