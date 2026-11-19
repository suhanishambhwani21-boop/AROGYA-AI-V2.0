import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  animate,
  useReducedMotion,
} from 'motion/react';

export const KINTSUGI_EASE = [0.22, 1, 0.36, 1] as const;

/* ==========================================================================
   1. ANIMATED COUNTING NUMBER (Counts up on load & interpolates on change)
   ========================================================================== */
interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState<number>(prefersReducedMotion ? value : 0);
  const prevValueRef = useRef<number>(prefersReducedMotion ? value : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value);
      prevValueRef.current = value;
      return;
    }

    const from = prevValueRef.current;
    const controls = animate(from, value, {
      duration: 0.9,
      ease: KINTSUGI_EASE,
      onUpdate: latest => {
        setDisplay(latest);
      },
      onComplete: () => {
        prevValueRef.current = value;
      },
    });

    return () => {
      controls.stop();
      prevValueRef.current = value;
    };
  }, [value, prefersReducedMotion]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return (
    <span className={`kintsugi-num ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

/* ==========================================================================
   2. STAGGER & SCROLL REVEAL CONTAINERS (60-80ms sequence, 60fps compositor)
   ========================================================================== */
export const KintsugiStaggerGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.07,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const KintsugiStaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: KINTSUGI_EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const KintsugiReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, delay, ease: KINTSUGI_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ==========================================================================
   3. KINTSUGI WARD VESSEL (Cracks + glowing gold veins + mend animation)
   ========================================================================== */
interface KintsugiWardVesselProps {
  wardName: string;
  occupancyRate: number;
  size?: number;
  forceMending?: boolean;
}

export const KintsugiWardVessel: React.FC<KintsugiWardVesselProps> = ({
  wardName,
  occupancyRate,
  size = 112,
  forceMending = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const prevRateRef = useRef<number>(occupancyRate);
  const [isMending, setIsMending] = useState<boolean>(false);

  useEffect(() => {
    const prev = prevRateRef.current;
    if (occupancyRate < prev - 0.3 || forceMending) {
      setIsMending(true);
      const timer = setTimeout(() => setIsMending(false), 1200);
      prevRateRef.current = occupancyRate;
      return () => clearTimeout(timer);
    }
    prevRateRef.current = occupancyRate;
  }, [occupancyRate, forceMending]);

  const clamped = Math.max(0, Math.min(100, occupancyRate));
  const isCritical = clamped >= 95;
  const isHigh = clamped >= 88 && clamped < 95;
  const isModerate = clamped >= 80 && clamped < 88;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Risk color strictly from Slate/Blue + Muted Amber / Muted Red palette
  const progressStroke = isCritical
    ? 'var(--theme-risk-critical)'
    : isHigh || isModerate
    ? 'var(--theme-risk-high)'
    : 'var(--theme-powder-blue)';

  // Fracture intensity by occupancy threshold
  const crackCount = isCritical ? 5 : isHigh ? 4 : isModerate ? 3 : clamped >= 70 ? 2 : 1;
  const veinStroke = isCritical ? '#D9534F' : isHigh || isModerate ? '#E0A458' : '#4682B4';
  const veinOpacity = isCritical ? 0.96 : isHigh ? 0.85 : isModerate ? 0.72 : 0.45;

  const crackPaths = [
    'M 60 12 L 54 24 L 62 32',
    'M 104 42 L 90 48 L 84 58',
    'M 96 92 L 82 82 L 72 86',
    'M 22 86 L 34 74 L 44 78',
    'M 16 44 L 30 48 L 38 40',
  ];

  const statusDesc = isCritical
    ? 'critical shortage'
    : isHigh || isModerate
    ? 'elevated strain'
    : 'stable';

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${wardName} ward occupancy at ${clamped.toFixed(1)} percent, status ${statusDesc}`}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
        <defs>
          <filter id={`kintsugiGlow-${wardName.replace(/\W+/g, '')}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Ring Track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="rgba(21, 31, 44, 0.65)"
          stroke="rgba(220, 235, 245, 0.22)"
          strokeWidth="6"
          strokeDasharray="24 4 18 3 30 4"
        />

        {/* Inner Core */}
        <circle
          cx="60"
          cy="60"
          r="31"
          fill="rgba(30, 42, 58, 0.92)"
          stroke="rgba(220, 235, 245, 0.16)"
          strokeWidth="1"
        />

        {/* Animated Occupancy Arc */}
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={progressStroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={prefersReducedMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.95, ease: KINTSUGI_EASE }}
          transform="rotate(-90 60 60)"
          className={isCritical && !prefersReducedMotion ? 'kintsugi-pulse' : ''}
        />

        {/* Stress Lines */}
        {crackPaths.slice(0, crackCount).map((d, idx) => (
          <g key={idx}>
            <path
              d={d}
              fill="none"
              stroke="#151F2C"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.path
              d={d}
              fill="none"
              stroke={isMending ? '#B0E0E6' : veinStroke}
              strokeWidth={isMending ? 2.4 : isCritical ? 2.1 : 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#kintsugiGlow-${wardName.replace(/\W+/g, '')})`}
              initial={prefersReducedMotion ? { pathLength: 1, opacity: veinOpacity } : { pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: isMending ? 1 : veinOpacity,
              }}
              transition={{ duration: 0.75, delay: idx * 0.08, ease: KINTSUGI_EASE }}
              className={isCritical && !prefersReducedMotion ? 'kintsugi-pulse' : ''}
            />
          </g>
        ))}

        {/* Relief Halo Pulse */}
        {isMending && !prefersReducedMotion && (
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#B0E0E6"
            strokeWidth="3"
            initial={{ opacity: 0.9, scale: 0.94 }}
            animate={{ opacity: 0, scale: 1.14 }}
            transition={{ duration: 1.05, ease: KINTSUGI_EASE }}
            style={{ transformOrigin: '60px 60px' }}
          />
        )}
      </svg>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className={`kintsugi-num text-base font-bold leading-none ${
            isCritical
              ? 'text-[#F08582]'
              : isHigh || isModerate
              ? 'text-[#E0A458]'
              : 'text-[#FFFFFF]'
          }`}
        >
          <AnimatedNumber value={clamped} decimals={1} suffix="%" />
        </span>
        <span className="text-[9px] tracking-[0.16em] uppercase text-[#DCEBF5]/80 mt-1">
          {isMending ? 'RELIEF' : isCritical ? 'CRITICAL' : isHigh || isModerate ? 'HIGH' : 'STABLE'}
        </span>
      </div>
    </div>
  );
};

