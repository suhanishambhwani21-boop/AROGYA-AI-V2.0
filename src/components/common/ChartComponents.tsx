import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ForecastTimePoint } from '../../types';
import { KINTSUGI_EASE } from './KintsugiPrimitives';

interface ForecastChartProps {
  data: ForecastTimePoint[];
  surgeData?: ForecastTimePoint[];
  height?: number;
  showConfidence?: boolean;
  ariaLabel?: string;
}

export const ForecastLineChart: React.FC<ForecastChartProps> = ({
  data,
  surgeData,
  height = 330,
  showConfidence = true,
  ariaLabel = 'Hospital bed availability forecast and surge scenario time-series chart',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-[#DCEBF5]/75 text-sm">
        No time series data available
      </div>
    );
  }

  const padding = { top: 32, right: 36, bottom: 48, left: 56 };
  const chartWidth = 820;
  const chartHeight = height;

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const allValues = [
    ...data.flatMap(d => [
      d.predictedAvailable,
      d.historicalAvailable ?? d.predictedAvailable,
      d.upperConfidence ?? d.predictedAvailable,
      d.lowerConfidence ?? d.predictedAvailable,
    ]),
    ...(surgeData ? surgeData.map(d => d.predictedAvailable) : []),
  ];

  const minY = Math.max(0, Math.floor(Math.min(...allValues) * 0.78));
  const maxY = Math.ceil(Math.max(...allValues, 10) * 1.12);

  const getX = (index: number) =>
    padding.left + (index / Math.max(1, data.length - 1)) * innerWidth;
  const getY = (val: number) =>
    padding.top + innerHeight - ((val - minY) / (maxY - minY || 1)) * innerHeight;

  // Soft 90% Confidence Band
  let confidencePath = '';
  if (showConfidence) {
    const upperPoints = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.upperConfidence)}`)
      .join(' ');
    const lowerPoints = data
      .slice()
      .reverse()
      .map((d, i) => `L ${getX(data.length - 1 - i)} ${getY(d.lowerConfidence)}`)
      .join(' ');
    confidencePath = `${upperPoints} ${lowerPoints} Z`;
  }

  // Steel Blue Forecast Path
  const predictedPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.predictedAvailable)}`)
    .join(' ');

  // Powder Blue Surge Scenario Path (from Today onward if provided)
  const todayIdx = data.findIndex(d => d.dayName.includes('Today'));
  const surgeStartIdx = todayIdx !== -1 ? todayIdx : 0;
  const surgeSlice = surgeData ? surgeData.slice(surgeStartIdx) : [];
  const surgePath =
    surgeSlice.length > 1
      ? surgeSlice
          .map(
            (d, i) =>
              `${i === 0 ? 'M' : 'L'} ${getX(surgeStartIdx + i)} ${getY(d.predictedAvailable)}`
          )
          .join(' ')
      : '';

  // Historical Dashed Path
  const histCutoff = todayIdx !== -1 ? todayIdx + 1 : 0;
  const histData = data.slice(0, histCutoff);
  const historicalPath =
    histData.length > 1
      ? histData
          .map(
            (d, i) =>
              `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(
                d.historicalAvailable ?? d.predictedAvailable
              )}`
          )
          .join(' ')
      : '';

  const yTicks = [minY, Math.round((minY + maxY) / 2), maxY];

  const hoveredPoint = hoveredIdx !== null ? data[hoveredIdx] : null;
  const hoveredSurgePoint =
    hoveredIdx !== null && surgeData ? surgeData[hoveredIdx] : null;

  return (
    <div className="relative w-full overflow-x-auto select-none">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full min-w-[640px] overflow-visible"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id="kintsugiConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4682B4" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#B0E0E6" stopOpacity="0.03" />
          </linearGradient>

          <filter id="kintsugiGoldDotGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle Pale Blue Gridlines */}
        {yTicks.map(t => (
          <g key={t}>
            <line
              x1={padding.left}
              y1={getY(t)}
              x2={chartWidth - padding.right}
              y2={getY(t)}
              stroke="rgba(220, 235, 245, 0.16)"
              strokeDasharray="4 5"
            />
            <text
              x={padding.left - 12}
              y={getY(t) + 4}
              textAnchor="end"
              className="text-[11px] fill-[#DCEBF5]/80 font-mono"
            >
              {t} beds
            </text>
          </g>
        ))}

        {/* Today Anchor Marker */}
        {todayIdx !== -1 && (
          <g>
            <line
              x1={getX(todayIdx)}
              y1={padding.top}
              x2={getX(todayIdx)}
              y2={padding.top + innerHeight}
              stroke="rgba(176, 224, 230, 0.55)"
              strokeWidth="1.2"
              strokeDasharray="3 4"
            />
            <text
              x={getX(todayIdx)}
              y={padding.top - 10}
              textAnchor="middle"
              className="text-[10px] font-semibold fill-[#B0E0E6] tracking-[0.18em] uppercase"
            >
              TODAY
            </text>
          </g>
        )}

        {/* Confidence Envelope */}
        {showConfidence && confidencePath && (
          <motion.path
            d={confidencePath}
            fill="url(#kintsugiConfidenceGrad)"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: KINTSUGI_EASE }}
          />
        )}

        {/* Surge Scenario Line (Powder Blue / Muted Amber accent) */}
        {surgePath && (
          <motion.path
            key={`surge-${surgePath.slice(0, 28)}`}
            d={surgePath}
            fill="none"
            stroke="#E0A458"
            strokeWidth="2.4"
            strokeDasharray="6 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.25, delay: 0.15, ease: KINTSUGI_EASE }}
          />
        )}

        {/* Baseline Forecast Line (Steel Blue #4682B4 / Powder Blue highlight) */}
        <motion.path
          key={`pred-${predictedPath.slice(0, 28)}`}
          d={predictedPath}
          fill="none"
          stroke="#B0E0E6"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: KINTSUGI_EASE }}
        />

        {/* Historical Context Trail */}
        {historicalPath && (
          <path
            d={historicalPath}
            fill="none"
            stroke="rgba(220, 235, 245, 0.45)"
            strokeWidth="2"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
        )}

        {/* Vertical Hover Crosshair & Glowing Powder Blue Dot */}
        {hoveredIdx !== null && hoveredPoint && (
          <g className="pointer-events-none">
            <line
              x1={getX(hoveredIdx)}
              y1={padding.top}
              x2={getX(hoveredIdx)}
              y2={padding.top + innerHeight}
              stroke="rgba(176, 224, 230, 0.55)"
              strokeWidth="1"
            />
            {hoveredSurgePoint && hoveredIdx >= surgeStartIdx && (
              <circle
                cx={getX(hoveredIdx)}
                cy={getY(hoveredSurgePoint.predictedAvailable)}
                r="5.5"
                fill="#1E2A3A"
                stroke="#E0A458"
                strokeWidth="2.5"
              />
            )}
            <circle
              cx={getX(hoveredIdx)}
              cy={getY(hoveredPoint.predictedAvailable)}
              r="11"
              fill="rgba(176, 224, 230, 0.22)"
            />
            <circle
              cx={getX(hoveredIdx)}
              cy={getY(hoveredPoint.predictedAvailable)}
              r="6"
              fill="#B0E0E6"
              stroke="#1E2A3A"
              strokeWidth="2.5"
              filter="url(#kintsugiGoldDotGlow)"
            />
          </g>
        )}

        {/* Interactive Nodes */}
        {data.map((d, i) => {
          const isToday = i === todayIdx;
          const isCrit = d.riskLevel === 'CRITICAL' || d.riskLevel === 'HIGH';
          const cx = getX(i);
          const cy = getY(d.predictedAvailable);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={d.date}
              tabIndex={0}
              role="button"
              aria-label={`${d.dayName} ${d.date}: ${d.predictedAvailable} beds available, ${d.occupancyPercent}% occupancy, ${d.riskLevel} risk`}
              className="cursor-pointer focus:outline-none"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onFocus={() => setHoveredIdx(i)}
              onBlur={() => setHoveredIdx(null)}
            >
              <circle cx={cx} cy={cy} r="17" fill="transparent" />

              {!isHovered && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isToday ? 5.5 : 4}
                  fill={
                    isToday
                      ? '#FFFFFF'
                      : isCrit
                      ? '#D9534F'
                      : '#4682B4'
                  }
                  stroke="#1E2A3A"
                  strokeWidth="2"
                />
              )}

              <text
                x={cx}
                y={chartHeight - 16}
                textAnchor="middle"
                className={`text-[10px] ${
                  isToday
                    ? 'fill-[#FFFFFF] font-bold'
                    : 'fill-[#DCEBF5]/85 font-medium'
                }`}
              >
                {d.dayName.split(' ')[0]}
              </text>
              <text
                x={cx}
                y={chartHeight - 4}
                textAnchor="middle"
                className="text-[9px] fill-[#DCEBF5]/55 font-mono"
              >
                {d.date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Slate Glass Tooltip */}
      {hoveredIdx !== null && hoveredPoint && (
        <div
          className="absolute z-20 pointer-events-none bg-[#151F2C]/95 text-[#FFFFFF] p-3.5 rounded-xl shadow-2xl backdrop-blur-md border border-[#B0E0E6]/45 text-xs -translate-x-1/2 -translate-y-full min-w-[235px]"
          style={{
            left: `${(getX(hoveredIdx) / chartWidth) * 100}%`,
            top: `${(getY(hoveredPoint.predictedAvailable) / chartHeight) * 100}%`,
            marginTop: '-16px',
          }}
        >
          <div className="font-semibold text-[#B0E0E6] flex items-center justify-between gap-3 border-b border-[#DCEBF5]/20 pb-1.5 mb-2">
            <span>
              {hoveredPoint.dayName} ({hoveredPoint.date})
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                hoveredPoint.riskLevel === 'CRITICAL'
                  ? 'text-[#F08582]'
                  : hoveredPoint.riskLevel === 'HIGH' || hoveredPoint.riskLevel === 'MEDIUM'
                  ? 'text-[#E0A458]'
                  : 'text-[#B0E0E6]'
              }`}
            >
              {hoveredPoint.riskLevel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#DCEBF5] kintsugi-num">
            <div>
              Forecast Open:{' '}
              <strong className="text-[#FFFFFF]">{hoveredPoint.predictedAvailable}</strong>
            </div>
            <div>
              Occupancy:{' '}
              <strong className="text-[#FFFFFF]">{hoveredPoint.occupancyPercent}%</strong>
            </div>
            {hoveredSurgePoint && hoveredIdx >= surgeStartIdx && (
              <div className="col-span-2 text-[#E0A458]">
                Surge Scenario:{' '}
                <strong>{hoveredSurgePoint.predictedAvailable} beds</strong> ({hoveredSurgePoint.occupancyPercent}% occ)
              </div>
            )}
            <div>
              Admissions: <strong className="text-[#B0E0E6]">+{hoveredPoint.admissions}</strong>
            </div>
            <div>
              Discharges: <strong className="text-[#DCEBF5]">-{hoveredPoint.discharges}</strong>
            </div>
            {showConfidence && (
              <div className="col-span-2 text-[10px] text-[#DCEBF5]/75 mt-1 pt-1 border-t border-[#DCEBF5]/15">
                90% Confidence: {hoveredPoint.lowerConfidence} – {hoveredPoint.upperConfidence} beds
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   OCCUPANCY PROGRESS BAR (Powder Blue / Steel Blue / Amber / Muted Red)
   ========================================================================== */
export const OccupancyProgressBar: React.FC<{
  rate: number;
  status?: string;
  showLabel?: boolean;
}> = ({ rate, status, showLabel = true }) => {
  let barColor = 'bg-[#4682B4]';
  let textColor = 'text-[#B0E0E6]';
  let statusText = status || 'Normal';

  if (rate >= 95) {
    barColor = 'bg-[#D9534F]';
    textColor = 'text-[#F08582]';
    statusText = 'Critical';
  } else if (rate >= 80) {
    barColor = 'bg-[#E0A458]';
    textColor = 'text-[#E0A458]';
    statusText = 'High';
  }

  return (
    <div className="w-full" role="meter" aria-valuenow={rate} aria-valuemin={0} aria-valuemax={100} aria-label={`Ward occupancy ${rate}%`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#DCEBF5]/85">
            Occupancy <strong className="kintsugi-num text-[#FFFFFF] ml-1">{rate}%</strong>
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${textColor}`}>
            {statusText}
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-[#151F2C] rounded-full overflow-hidden border border-[#DCEBF5]/20">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(2, rate))}%` }}
        />
      </div>
    </div>
  );
};
