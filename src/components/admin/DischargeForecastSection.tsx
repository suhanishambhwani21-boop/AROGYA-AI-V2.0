import React from 'react';
import {
  TrendingUp,
  Info,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { DischargeForecast } from '../../types';
import {
  AnimatedNumber,
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';

interface DischargeForecastSectionProps {
  forecast: DischargeForecast;
  onNavigateTab: (tab: string) => void;
}

export const DischargeForecastSection: React.FC<DischargeForecastSectionProps> = ({
  forecast,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="kintsugi-section-label flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Discharge Forecasting Engine</span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-3">
              Expected Patient <span className="kintsugi-gold-word italic">Discharges</span>
            </h1>
            <p className="text-[#FFFFFF]/80 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Forecasting discharge timelines from department ALOS, recovery milestones, and weekend
              velocity curves—feeding released capacity directly back into ward availability.
            </p>

            {/* Top 3 Summary Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#151F2C]/75 rounded-2xl p-4 sm:p-5 border border-[rgba(220, 235, 245,0.16)]">
                <div className="kintsugi-section-label text-[10px]">Expected Today</div>
                <div className="text-3xl font-bold text-[#FFFFFF] mt-1.5">
                  <AnimatedNumber value={forecast.expectedToday} />{' '}
                  <span className="text-xs text-[#B0E0E6]/70 font-normal">Patients</span>
                </div>
                <div className="text-[11px] text-[#B0E0E6]/70 mt-1">
                  21 confirmed by morning rounds
                </div>
              </div>

              <div className="bg-[#2C3E55]/85 rounded-2xl p-4 sm:p-5 border border-[rgba(70, 130, 180,0.45)] shadow-[0_0_24px_rgba(70, 130, 180,0.12)]">
                <div className="kintsugi-section-label text-[10px] text-[#B0E0E6] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Expected Tomorrow</span>
                </div>
                <div className="text-4xl font-bold text-[#B0E0E6] mt-1.5">
                  <AnimatedNumber value={forecast.expectedTomorrow} />{' '}
                  <span className="text-xs text-[#FFFFFF]/80 font-normal">Patients</span>
                </div>
                <div className="text-[11px] text-[#B0E0E6] mt-1">
                  Peak turnaround: {forecast.peakDischargeHour}
                </div>
              </div>

              <div className="bg-[#151F2C]/75 rounded-2xl p-4 sm:p-5 border border-[rgba(220, 235, 245,0.16)]">
                <div className="kintsugi-section-label text-[10px]">Expected This Week</div>
                <div className="text-3xl font-bold text-[#B0E0E6] mt-1.5">
                  <AnimatedNumber value={forecast.expectedThisWeek} />{' '}
                  <span className="text-xs text-[#B0E0E6]/70 font-normal">Patients</span>
                </div>
                <div className="text-[11px] text-[#B0E0E6]/70 mt-1 kintsugi-num">
                  Velocity index: <strong className="text-[#B0E0E6]">{forecast.dischargeVelocityIndex}x</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Breakdown by Department */}
      <div className="kintsugi-card rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b kintsugi-divider">
          <div>
            <span className="kintsugi-section-label text-[10px]">Department Allocation</span>
            <h2 className="kintsugi-serif text-2xl font-semibold mt-1">
              Tomorrow&apos;s Discharges by Department (Total: {forecast.expectedTomorrow})
            </h2>
          </div>
          <div className="text-xs text-[#B0E0E6]/80">
            Confidence Calibration:{' '}
            <strong className="kintsugi-num text-[#B0E0E6]">{forecast.confidenceScore}%</strong>
          </div>
        </div>

        <KintsugiStaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecast.departmentBreakdown.map((dept, idx) => {
            const percentOfTotal = Math.round((dept.count / forecast.expectedTomorrow) * 100);

            return (
              <KintsugiStaggerItem key={idx}>
                <div className="bg-[#151F2C]/75 hover:bg-[#243346] rounded-2xl p-4 border border-[rgba(220, 235, 245,0.16)] transition flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-[#FFFFFF] text-sm">{dept.department}</h3>
                      <span className="kintsugi-num text-xs font-bold text-[#1E2A3A] bg-[#B0E0E6] px-2.5 py-0.5 rounded-full">
                        {dept.count} Beds
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-[#B0E0E6]/75">
                      <div className="flex justify-between">
                        <span>Avg Length of Stay (ALOS)</span>
                        <strong className="kintsugi-num text-[#FFFFFF]">{dept.alosDays} days</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Turnaround Time</span>
                        <strong className="kintsugi-num text-[#FFFFFF]">
                          {dept.expectedTurnaroundHours} hrs
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Share of Discharges</span>
                        <strong className="kintsugi-num text-[#B0E0E6]">{percentOfTotal}%</strong>
                      </div>
                    </div>

                    <div className="mt-3 w-full bg-[#243346] h-1.5 rounded-full overflow-hidden border border-[rgba(220, 235, 245,0.14)]">
                      <div
                        className="bg-[#B0E0E6] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentOfTotal}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t kintsugi-divider flex items-center justify-between text-[11px] text-[#B0E0E6]/65">
                    <span>Turnover: Pre-Cleared</span>
                    <span className="text-[#B0E0E6] font-medium">Ready by 1 PM</span>
                  </div>
                </div>
              </KintsugiStaggerItem>
            );
          })}
        </KintsugiStaggerGrid>

        {/* Pipeline Integration Note */}
        <div className="mt-4 p-4 bg-[#151F2C]/80 rounded-2xl border border-[rgba(220, 235, 245,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#FFFFFF]/85">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#B0E0E6] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#B0E0E6]">Forecasting Integration:</strong> These 32
              anticipated discharges provide immediate bed turnover offsetting predicted arrivals
              tomorrow.
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('forecast-graph')}
            className="kintsugi-btn-gold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>View Net Bed Curve</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
