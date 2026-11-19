import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Bed,
  Zap,
  Info,
} from 'lucide-react';
import { MLForecastEngine } from '../../services/mlForecastEngine';
import { ForecastLineChart } from '../common/ChartComponents';
import {
  AnimatedNumber,
  KintsugiReveal,
  KintsugiWardVessel,
} from '../common/KintsugiPrimitives';

export const WhatIfSimulator: React.FC = () => {
  const [deltaAdmissions, setDeltaAdmissions] = useState<number>(20);
  const [deltaDischarges, setDeltaDischarges] = useState<number>(0);
  const [addedBeds, setAddedBeds] = useState<number>(0);
  const [emergencySurge, setEmergencySurge] = useState<number>(1.0);

  // Run simulation calculation
  const currentSim = MLForecastEngine.runWhatIfSimulation(
    deltaAdmissions,
    deltaDischarges,
    addedBeds,
    emergencySurge
  );

  // Time-series curves for baseline vs active simulation
  const baselineSeries = useMemo(
    () => MLForecastEngine.generateTimeSeries(7, 'All', 'All', 0, 0, 0),
    []
  );
  const simulatedSeries = useMemo(
    () =>
      MLForecastEngine.generateTimeSeries(
        7,
        'All',
        'All',
        deltaAdmissions + Math.round((emergencySurge - 1.0) * 20),
        deltaDischarges,
        addedBeds
      ),
    [deltaAdmissions, deltaDischarges, addedBeds, emergencySurge]
  );

  const handleReset = () => {
    setDeltaAdmissions(0);
    setDeltaDischarges(0);
    setAddedBeds(0);
    setEmergencySurge(1.0);
  };

  const applyPreset = (preset: {
    adm: number;
    dis: number;
    beds: number;
    surge: number;
  }) => {
    setDeltaAdmissions(preset.adm);
    setDeltaDischarges(preset.dis);
    setAddedBeds(preset.beds);
    setEmergencySurge(preset.surge);
  };

  const isCriticalRisk = currentSim.simulatedRisk === 'CRITICAL';
  const isHighOrElevatedRisk =
    currentSim.simulatedRisk === 'HIGH' || currentSim.simulatedRisk === 'MEDIUM';
  const isMendingScenario = addedBeds > 0 || deltaDischarges > 0;

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="kintsugi-section-label flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Operational Capacity Sandbox</span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-3">
              What-If <span className="kintsugi-gold-word italic">Simulator</span>
            </h1>
            <p className="text-[#FFFFFF]/80 text-xs sm:text-sm mt-2.5 leading-relaxed">
              Test emergency surges, seasonal admission spikes, discharge bottlenecks, and surge-bed
              expansion. Adding surge beds visibly mends capacity fractures before saturation occurs.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-[#B0E0E6] bg-[#4682B4]/10 px-3.5 py-1.5 rounded-full border border-[rgba(70, 130, 180,0.3)]">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Scenario stress testing for contingency planning; baseline ML model remains untouched.</span>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Quick Scenario Presets */}
      <KintsugiReveal delay={0.05}>
        <div className="kintsugi-card rounded-2xl p-4 sm:p-5">
          <div className="kintsugi-section-label text-[10px] mb-3">
            Quick Preset Scenarios
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => applyPreset({ adm: 20, dis: 0, beds: 0, surge: 1.0 })}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer kintsugi-focus ${
                deltaAdmissions === 20 && addedBeds === 0 && emergencySurge === 1.0
                  ? 'kintsugi-btn-gold'
                  : 'kintsugi-btn-celadon'
              }`}
            >
              +20% Admissions Surge
            </button>

            <button
              type="button"
              onClick={() => applyPreset({ adm: 0, dis: 0, beds: 15, surge: 1.0 })}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer kintsugi-focus ${
                addedBeds === 15 && deltaAdmissions === 0
                  ? 'kintsugi-btn-gold'
                  : 'kintsugi-btn-celadon'
              }`}
            >
              +15 Surge Beds Added (Mend)
            </button>

            <button
              type="button"
              onClick={() => applyPreset({ adm: 40, dis: -20, beds: 0, surge: 1.8 })}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer kintsugi-focus ${
                emergencySurge === 1.8
                  ? 'kintsugi-btn-gold'
                  : 'kintsugi-btn-celadon'
              }`}
            >
              Mass Casualty (+40% Adm, 1.8x ER)
            </button>

            <button
              type="button"
              onClick={() => applyPreset({ adm: 0, dis: -35, beds: 0, surge: 1.0 })}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer kintsugi-focus ${
                deltaDischarges === -35
                  ? 'kintsugi-btn-gold'
                  : 'kintsugi-btn-celadon'
              }`}
            >
              Weekend Discharge Lull (-35%)
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="ml-auto kintsugi-btn-celadon px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>
      </KintsugiReveal>

      {/* Main Simulation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 kintsugi-card rounded-3xl p-6 space-y-5">
          <div>
            <div className="kintsugi-section-label text-[10px]">Parameters</div>
            <h2 className="kintsugi-serif text-2xl font-semibold mt-1">
              Simulation Controls
            </h2>
            <p className="text-xs text-[#B0E0E6]/75 mt-1">
              Adjust flow parameters to observe downstream bed strain and ward mending in real time.
            </p>
          </div>

          {/* Slider 1: Admissions Surge */}
          <div className="space-y-2 p-4 bg-[#151F2C]/75 rounded-2xl border border-[rgba(220, 235, 245,0.14)]">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-admissions" className="font-semibold text-[#FFFFFF] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#F08582]" />
                <span>Change in Patient Admissions</span>
              </label>
              <span className="kintsugi-num font-bold text-sm text-[#B0E0E6]">
                {deltaAdmissions > 0 ? `+${deltaAdmissions}%` : `${deltaAdmissions}%`}
              </span>
            </div>
            <input
              id="sim-admissions"
              type="range"
              min="-30"
              max="80"
              step="5"
              value={deltaAdmissions}
              onChange={e => setDeltaAdmissions(Number(e.target.value))}
              className="w-full kintsugi-range h-2 bg-[#2C3E55] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#B0E0E6]/55 kintsugi-num">
              <span>-30% Low Season</span>
              <span>0% Baseline</span>
              <span>+80% Epidemic</span>
            </div>
          </div>

          {/* Slider 2: Discharges Delta */}
          <div className="space-y-2 p-4 bg-[#151F2C]/75 rounded-2xl border border-[rgba(220, 235, 245,0.14)]">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-discharges" className="font-semibold text-[#FFFFFF] flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#B0E0E6]" />
                <span>Change in Patient Discharges</span>
              </label>
              <span className="kintsugi-num font-bold text-sm text-[#B0E0E6]">
                {deltaDischarges > 0 ? `+${deltaDischarges}%` : `${deltaDischarges}%`}
              </span>
            </div>
            <input
              id="sim-discharges"
              type="range"
              min="-50"
              max="50"
              step="5"
              value={deltaDischarges}
              onChange={e => setDeltaDischarges(Number(e.target.value))}
              className="w-full kintsugi-range h-2 bg-[#2C3E55] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#B0E0E6]/55 kintsugi-num">
              <span>-50% Discharge Delay</span>
              <span>0% Standard</span>
              <span>+50% Expedited</span>
            </div>
          </div>

          {/* Slider 3: Additional Surge Beds */}
          <div className="space-y-2 p-4 bg-[#151F2C]/75 rounded-2xl border border-[rgba(70, 130, 180,0.22)]">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-added-beds" className="font-semibold text-[#FFFFFF] flex items-center gap-2">
                <Bed className="w-4 h-4 text-[#B0E0E6]" />
                <span>Additional Surge Beds Added</span>
              </label>
              <span className="kintsugi-num font-bold text-sm text-[#B0E0E6]">
                +{addedBeds} Beds
              </span>
            </div>
            <input
              id="sim-added-beds"
              type="range"
              min="0"
              max="60"
              step="5"
              value={addedBeds}
              onChange={e => setAddedBeds(Number(e.target.value))}
              className="w-full kintsugi-range h-2 bg-[#2C3E55] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#B0E0E6]/55 kintsugi-num">
              <span>0 Standard (500)</span>
              <span>+30 Converted Wards</span>
              <span>+60 Field Expansion</span>
            </div>
          </div>

          {/* Slider 4: Emergency Surge Multiplier */}
          <div className="space-y-2 p-4 bg-[#151F2C]/75 rounded-2xl border border-[rgba(220, 235, 245,0.14)]">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="sim-er-surge" className="font-semibold text-[#FFFFFF] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#B0E0E6]" />
                <span>Emergency &amp; Trauma Multiplier</span>
              </label>
              <span className="kintsugi-num font-bold text-sm text-[#B0E0E6]">
                {emergencySurge.toFixed(1)}x
              </span>
            </div>
            <input
              id="sim-er-surge"
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={emergencySurge}
              onChange={e => setEmergencySurge(Number(e.target.value))}
              className="w-full kintsugi-range h-2 bg-[#2C3E55] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#B0E0E6]/55 kintsugi-num">
              <span>1.0x Normal</span>
              <span>1.5x Busy Shift</span>
              <span>2.5x Mass Casualty</span>
            </div>
          </div>
        </div>

        {/* Results / Simulated Kintsugi Vessel Column */}
        <div
          className={`lg:col-span-5 kintsugi-card rounded-3xl p-6 flex flex-col justify-between ${
            isCriticalRisk ? 'kintsugi-card-critical' : ''
          }`}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="kintsugi-section-label text-[10px]">
                Simulated 48h Outcome
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] border ${
                  isCriticalRisk
                    ? 'bg-[#D9534F]/20 text-[#F08582] border-[rgba(217, 83, 79,0.5)]'
                    : isHighOrElevatedRisk
                    ? 'bg-[#4682B4]/15 text-[#B0E0E6] border-[rgba(70, 130, 180,0.45)]'
                    : 'bg-[#B0E0E6]/12 text-[#B0E0E6] border-[rgba(220, 235, 245,0.3)]'
                }`}
              >
                {currentSim.simulatedRisk} RISK
              </span>
            </div>

            {/* Interactive Kintsugi Vessel showing Fractures vs Mending */}
            <div className="flex flex-col items-center justify-center py-4 bg-[#151F2C]/65 rounded-2xl border border-[rgba(220, 235, 245,0.14)]">
              <KintsugiWardVessel
                wardName="Simulated Capacity"
                occupancyRate={currentSim.simulatedOccupancy}
                size={136}
                forceMending={isMendingScenario}
              />
              <div className="mt-2 text-[11px] text-[#B0E0E6]/75 text-center px-4">
                {isMendingScenario
                  ? 'Gold lacquer mending fractures via added beds & expedited discharges'
                  : currentSim.simulatedOccupancy >= 95
                  ? 'Critical fracture stress — activate surge expansion to mend'
                  : 'Cracks deepen dynamically as occupancy nears saturation'}
              </div>
            </div>

            {/* Scenario Impact Readouts */}
            <div className="space-y-2.5 bg-[#151F2C]/75 rounded-2xl p-4 border border-[rgba(220, 235, 245,0.15)]">
              <div className="flex items-center justify-between text-xs border-b border-[rgba(220, 235, 245,0.12)] pb-2">
                <span className="text-[#B0E0E6]/75">Baseline Available Beds</span>
                <span className="kintsugi-num font-semibold text-[#FFFFFF]">
                  88 beds (ICU: 4)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-[rgba(220, 235, 245,0.12)] pb-2">
                <span className="text-[#B0E0E6] font-medium">After Applied Scenario</span>
                <span className="text-2xl font-bold text-[#B0E0E6]">
                  <AnimatedNumber value={currentSim.simulatedAvailable} suffix=" beds" />
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-[rgba(220, 235, 245,0.12)] pb-2">
                <span className="text-[#B0E0E6]/75">Simulated Occupancy</span>
                <span className="text-base font-bold text-[#FFFFFF]">
                  <AnimatedNumber value={currentSim.simulatedOccupancy} decimals={1} suffix="%" />
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#B0E0E6]/75">Critical Bottleneck</span>
                <span className="font-semibold text-[#B0E0E6]">
                  {currentSim.bottleneckDepartment}
                </span>
              </div>
            </div>

            {/* Strategic Impact Callout */}
            <div className="p-4 bg-[#243346]/90 rounded-2xl border border-[rgba(70, 130, 180,0.28)] text-xs text-[#FFFFFF]/90 space-y-1.5">
              <div className="kintsugi-section-label text-[10px] text-[#B0E0E6]">
                Strategic Impact Assessment
              </div>
              <p className="leading-relaxed">
                {currentSim.simulatedAvailable <= 15 ? (
                  <span>
                    <strong className="text-[#F08582]">Capacity Shortage Triggered:</strong>{' '}
                    ICU and ER will exhaust open beds within 24 hours. Preemptive step-down transfers or
                    adding at least 15 surge beds is advised.
                  </span>
                ) : (
                  <span>
                    <strong className="text-[#B0E0E6]">Capacity Stable:</strong> Hospital retains a
                    healthy buffer of{' '}
                    <span className="kintsugi-num font-bold text-[#B0E0E6]">
                      {currentSim.simulatedAvailable}
                    </span>{' '}
                    available beds with manageable saturation risk.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t kintsugi-divider flex items-center justify-between text-[11px] text-[#B0E0E6]/55 kintsugi-num">
            <span>Scenario #{currentSim.id.slice(-8)}</span>
            <span>Updated: {currentSim.timestamp}</span>
          </div>
        </div>
      </div>

      {/* Live 7-Day Curve Comparison */}
      <KintsugiReveal delay={0.1}>
        <div className="kintsugi-card rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b kintsugi-divider">
            <div>
              <div className="kintsugi-section-label text-[10px]">
                Baseline vs Simulated Trajectory
              </div>
              <h3 className="kintsugi-serif text-2xl font-semibold mt-1">
                7-Day Scenario Projection
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-2 text-[#B0E0E6]">
                <span className="w-4 h-0.5 bg-[#B0E0E6] rounded-full" />
                <span>Baseline Forecast</span>
              </span>
              <span className="flex items-center gap-2 text-[#B0E0E6]">
                <span className="w-4 h-0.5 bg-[#4682B4] rounded-full border-dashed border-t border-[#4682B4]" />
                <span>Simulated Outcome</span>
              </span>
            </div>
          </div>
          <ForecastLineChart
            data={baselineSeries}
            surgeData={simulatedSeries}
            height={280}
            showConfidence={true}
          />
        </div>
      </KintsugiReveal>
    </div>
  );
};
