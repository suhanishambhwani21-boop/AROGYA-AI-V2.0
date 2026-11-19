import React from 'react';
import {
  Building2,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Hospital, RiskLevel } from '../../types';
import { OccupancyProgressBar } from '../common/ChartComponents';
import {
  AnimatedNumber,
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';

interface HospitalMapViewProps {
  hospital: Hospital;
  onNavigateTab: (tab: string) => void;
}

export const HospitalMapView: React.FC<HospitalMapViewProps> = ({
  hospital,
  onNavigateTab,
}) => {
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-[#D9534F]/18 text-[#F08582] border-[rgba(217, 83, 79,0.5)]';
      case 'HIGH':
      case 'MEDIUM':
        return 'bg-[#4682B4]/15 text-[#B0E0E6] border-[rgba(70, 130, 180,0.45)]';
      case 'LOW':
        return 'bg-[#B0E0E6]/12 text-[#B0E0E6] border-[rgba(220, 235, 245,0.3)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <KintsugiReveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="kintsugi-section-label flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Clinical Floor Command</span>
            </div>
            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-2">
              Department <span className="kintsugi-gold-word italic">Overview</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#FFFFFF]/75 mt-1.5 max-w-2xl">
              Department-by-department capacity grid, real-time census, and ML predicted 24-hour demand index.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('what-if')}
            className="kintsugi-btn-gold px-5 py-2.5 rounded-full text-xs tracking-wider uppercase flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Simulate Surge Allocation</span>
          </button>
        </div>
      </KintsugiReveal>

      {/* Hospital Department Cards Grid */}
      <KintsugiStaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hospital.departments.map(dept => {
          const isCritical = dept.riskLevel === 'CRITICAL';

          return (
            <KintsugiStaggerItem key={dept.id}>
              <div
                className={`kintsugi-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full ${
                  isCritical ? 'kintsugi-card-critical' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-10 h-10 rounded-xl bg-[#151F2C] border border-[rgba(220, 235, 245,0.18)] flex items-center justify-center">
                        {dept.icon}
                      </span>
                      <div>
                        <h2 className="font-semibold text-[#FFFFFF] text-base">
                          {dept.name}
                        </h2>
                        <div className="text-[11px] text-[#B0E0E6]/70">
                          Avg Stay (ALOS):{' '}
                          <strong className="kintsugi-num text-[#B0E0E6]">
                            {dept.avgStayDays} days
                          </strong>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRiskBadge(
                        dept.riskLevel
                      )}`}
                    >
                      {dept.riskLevel} RISK
                    </span>
                  </div>

                  {/* KPI Metrics */}
                  <div className="mt-4 grid grid-cols-3 gap-2 bg-[#151F2C]/75 rounded-2xl p-3 border border-[rgba(220, 235, 245,0.14)] text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#B0E0E6]/65 uppercase tracking-wider block">
                        Total
                      </span>
                      <strong className="text-base text-[#FFFFFF]">
                        <AnimatedNumber value={dept.totalBeds} />
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#F08582] uppercase tracking-wider block">
                        Occupied
                      </span>
                      <strong className="text-base text-[#F08582]">
                        <AnimatedNumber value={dept.occupiedBeds} />
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#B0E0E6] uppercase tracking-wider block">
                        Available
                      </span>
                      <strong className="text-base text-[#B0E0E6]">
                        <AnimatedNumber value={dept.availableBeds} />
                      </strong>
                    </div>
                  </div>

                  <div className="mt-4">
                    <OccupancyProgressBar rate={dept.occupancyRate} />
                  </div>

                  {/* ML Demand Projection */}
                  <div className="mt-4 p-3 bg-[#151F2C]/70 rounded-xl border border-[rgba(220, 235, 245,0.16)] text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#B0E0E6] font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#B0E0E6]" />
                      <span>Predicted 24h Demand</span>
                    </span>
                    <span className="kintsugi-num font-bold text-[#B0E0E6] text-sm">
                      {dept.predictedDemand} beds
                    </span>
                  </div>
                </div>

                {/* Floor Bed Matrix Visualizer */}
                <div className="mt-4 pt-3 border-t kintsugi-divider">
                  <div className="text-[10px] font-semibold text-[#B0E0E6]/70 uppercase tracking-[0.14em] mb-2 flex justify-between">
                    <span>Floor Bed Matrix ({dept.totalBeds} Beds)</span>
                    <span className="kintsugi-num text-[#B0E0E6] font-normal">
                      {dept.availableBeds} open
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                    {Array.from({ length: Math.min(32, dept.totalBeds) }).map((_, i) => {
                      const isOccupied =
                        i <
                        Math.floor(
                          (dept.occupiedBeds / dept.totalBeds) * Math.min(32, dept.totalBeds)
                        );
                      return (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-xs transition-colors ${
                            isOccupied
                              ? 'bg-[#D9534F]/80'
                              : 'bg-[#B0E0E6]'
                          }`}
                          title={isOccupied ? `Bed #${i + 1}: Occupied` : `Bed #${i + 1}: Available`}
                        />
                      );
                    })}
                    {dept.totalBeds > 32 && (
                      <span className="text-[9px] text-[#B0E0E6]/55 self-center pl-1 kintsugi-num">
                        +{dept.totalBeds - 32} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </KintsugiStaggerItem>
          );
        })}
      </KintsugiStaggerGrid>
    </div>
  );
};
