import React, { useState, useMemo } from 'react';
import { TrendingUp, SlidersHorizontal } from 'lucide-react';
import { Hospital } from '../../types';
import { ForecastLineChart } from '../common/ChartComponents';
import { MLForecastEngine } from '../../services/mlForecastEngine';
import {
  AnimatedNumber,
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';

interface BedAvailabilityForecastPageProps {
  hospital: Hospital;
  hospitals: Hospital[];
  onNavigateTab: (tab: string) => void;
}

export const BedAvailabilityForecastPage: React.FC<BedAvailabilityForecastPageProps> = ({
  hospital,
  onNavigateTab,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<number>(7);
  const [selectedBedCategory, setSelectedBedCategory] = useState<string>('ICU');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [showConfidenceCone, setShowConfidenceCone] = useState<boolean>(true);
  const [showSurgeCurve, setShowSurgeCurve] = useState<boolean>(true);

  const timeSeries = useMemo(
    () =>
      MLForecastEngine.generateTimeSeries(
        selectedHorizon,
        selectedBedCategory,
        selectedDepartment
      ),
    [selectedHorizon, selectedBedCategory, selectedDepartment]
  );

  const surgeSeries = useMemo(
    () =>
      MLForecastEngine.generateTimeSeries(
        selectedHorizon,
        selectedBedCategory,
        selectedDepartment,
        25,
        -10,
        0
      ),
    [selectedHorizon, selectedBedCategory, selectedDepartment]
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <KintsugiReveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="kintsugi-section-label flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Time-Series Forecast Visualizer</span>
            </div>
            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-2">
              Bed Availability <span className="kintsugi-gold-word italic">Forecast</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#FFFFFF]/75 mt-1.5 max-w-2xl">
              Ensemble baseline availability alongside seasonal surge projection and 90% confidence envelope for{' '}
              <span className="text-[#B0E0E6] font-medium">{hospital.name}</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('what-if')}
            className="kintsugi-btn-gold px-5 py-2.5 rounded-full text-xs tracking-wider uppercase flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Open What-If Simulator</span>
          </button>
        </div>
      </KintsugiReveal>

      {/* Interactive Filter Control Panel */}
      <KintsugiReveal delay={0.05}>
        <div className="kintsugi-card rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Bed Category Selector */}
            <div>
              <label
                htmlFor="forecast-bed-category"
                className="kintsugi-section-label text-[10px] block mb-1.5"
              >
                Bed Category
              </label>
              <select
                id="forecast-bed-category"
                value={selectedBedCategory}
                onChange={e => setSelectedBedCategory(e.target.value)}
                className="kintsugi-input rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer"
              >
                <option value="All">Hospital-Wide (All Beds)</option>
                <option value="ICU">ICU / Critical Care</option>
                <option value="Emergency">Emergency &amp; Trauma</option>
                <option value="General">General Ward</option>
                <option value="Pediatric">Pediatrics &amp; NICU</option>
              </select>
            </div>

            {/* Department Selector */}
            <div>
              <label
                htmlFor="forecast-department"
                className="kintsugi-section-label text-[10px] block mb-1.5"
              >
                Clinical Department
              </label>
              <select
                id="forecast-department"
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="kintsugi-input rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="dept-icu">ICU / Critical Care</option>
                <option value="dept-er">Emergency &amp; Trauma</option>
                <option value="dept-gen">General Ward</option>
                <option value="dept-cardio">Cardiology</option>
                <option value="dept-surg">General Surgery</option>
              </select>
            </div>

            {/* Horizon Window */}
            <div>
              <span className="kintsugi-section-label text-[10px] block mb-1.5">
                Forecast Horizon
              </span>
              <div className="flex items-center gap-1 bg-[#151F2C] p-1 rounded-xl border border-[rgba(220, 235, 245,0.16)]">
                {[7, 14, 30].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setSelectedHorizon(days)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer kintsugi-focus ${
                      selectedHorizon === days
                        ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                        : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#FFFFFF] select-none">
              <input
                type="checkbox"
                checked={showSurgeCurve}
                onChange={e => setShowSurgeCurve(e.target.checked)}
                className="w-4 h-4 rounded accent-[#4682B4] cursor-pointer"
              />
              <span>Overlay Surge Scenario</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#B0E0E6] select-none">
              <input
                type="checkbox"
                checked={showConfidenceCone}
                onChange={e => setShowConfidenceCone(e.target.checked)}
                className="w-4 h-4 rounded accent-[#B0E0E6] cursor-pointer"
              />
              <span>90% Confidence Envelope</span>
            </label>
          </div>
        </div>
      </KintsugiReveal>

      {/* Main Graph Card */}
      <KintsugiReveal delay={0.1}>
        <div className="kintsugi-card rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b kintsugi-divider">
            <div>
              <h2 className="kintsugi-serif text-2xl font-semibold flex flex-wrap items-baseline gap-2.5">
                <span>{selectedBedCategory} Availability Trajectory</span>
                <span className="kintsugi-num text-xs font-normal text-[#B0E0E6]/70">
                  ({selectedHorizon}-Day Window)
                </span>
              </h2>
              <p className="text-xs text-[#B0E0E6]/70 mt-1">
                Hover or focus any time node to inspect forecasted admissions, discharges, and surge drift.
              </p>
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-2 text-[#B0E0E6] font-medium">
                <span className="w-4 h-0.5 bg-[#B0E0E6] rounded-full" /> Forecast Baseline
              </span>
              {showSurgeCurve && (
                <span className="flex items-center gap-2 text-[#B0E0E6] font-medium">
                  <span className="w-4 h-0.5 bg-[#4682B4] border-t border-dashed border-[#4682B4]" /> Surge Scenario
                </span>
              )}
              {showConfidenceCone && (
                <span className="flex items-center gap-2 text-[#B0E0E6]/75">
                  <span className="w-3 h-3 bg-[#B0E0E6]/20 rounded-sm border border-[rgba(220, 235, 245,0.4)]" /> Confidence Band
                </span>
              )}
            </div>
          </div>

          <div className="py-2">
            <ForecastLineChart
              data={timeSeries}
              surgeData={showSurgeCurve ? surgeSeries : undefined}
              height={340}
              showConfidence={showConfidenceCone}
            />
          </div>

          {/* Day-by-Day Forecast Breakdown */}
          <div className="pt-5 border-t kintsugi-divider">
            <div className="flex items-center justify-between mb-3">
              <span className="kintsugi-section-label text-[10px]">
                Day-by-Day Trajectory Breakdown
              </span>
              <span className="text-xs text-[#B0E0E6]/70">Predicted Open Beds &amp; Risk</span>
            </div>

            <KintsugiStaggerGrid className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {timeSeries.slice(5, 12).map((pt, idx) => {
                const isToday = pt.dayName.includes('Today');
                const isCrit = pt.riskLevel === 'CRITICAL' || pt.riskLevel === 'HIGH';

                return (
                  <KintsugiStaggerItem key={idx}>
                    <div
                      className={`p-3.5 rounded-2xl border text-center transition ${
                        isToday
                          ? 'bg-[#2C3E55] border-[rgba(70, 130, 180,0.55)] shadow-[0_0_20px_rgba(70, 130, 180,0.12)]'
                          : isCrit
                          ? 'bg-[#D9534F]/10 border-[rgba(217, 83, 79,0.42)]'
                          : 'bg-[#151F2C]/75 border-[rgba(220, 235, 245,0.14)]'
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B0E0E6]">
                        {pt.dayName.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-[#B0E0E6]/55 kintsugi-num mt-0.5">
                        {pt.date.slice(5)}
                      </div>
                      <div
                        className={`text-2xl font-bold my-1.5 ${
                          isCrit
                            ? 'text-[#F08582]'
                            : isToday
                            ? 'text-[#B0E0E6]'
                            : 'text-[#FFFFFF]'
                        }`}
                      >
                        <AnimatedNumber value={pt.predictedAvailable} />
                      </div>
                      <div className="text-[10px] text-[#B0E0E6]/65">beds open</div>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            isCrit
                              ? 'bg-[#D9534F]/18 text-[#F08582] border-[rgba(217, 83, 79,0.45)]'
                              : pt.riskLevel === 'MEDIUM'
                              ? 'bg-[#4682B4]/15 text-[#B0E0E6] border-[rgba(70, 130, 180,0.38)]'
                              : 'bg-[#B0E0E6]/12 text-[#B0E0E6] border-[rgba(220, 235, 245,0.28)]'
                          }`}
                        >
                          {pt.riskLevel}
                        </span>
                      </div>
                    </div>
                  </KintsugiStaggerItem>
                );
              })}
            </KintsugiStaggerGrid>
          </div>
        </div>
      </KintsugiReveal>
    </div>
  );
};
