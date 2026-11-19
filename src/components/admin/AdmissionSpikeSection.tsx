import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  CheckSquare,
  Square,
  Sparkles,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { AdmissionSpike } from '../../types';
import { AnimatedNumber, KintsugiReveal } from '../common/KintsugiPrimitives';

interface AdmissionSpikeSectionProps {
  spike: AdmissionSpike;
  onNavigateTab: (tab: string) => void;
}

export const AdmissionSpikeSection: React.FC<AdmissionSpikeSectionProps> = ({
  spike,
  onNavigateTab,
}) => {
  const [completedActions, setCompletedActions] = useState<number[]>([]);

  const toggleAction = (index: number) => {
    setCompletedActions(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Box */}
      <KintsugiReveal>
        <div className="kintsugi-card kintsugi-card-critical rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full bg-[#D9534F]/20 text-[#F08582] border border-[rgba(217, 83, 79,0.5)] text-[10px] font-bold uppercase tracking-[0.18em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F08582] kintsugi-pulse" />
                <span>ML Surge Anomaly Detector</span>
              </span>
              <span className="text-xs text-[#B0E0E6] kintsugi-num flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B0E0E6]" />
                <span>Detected for {spike.expectedDate}</span>
              </span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-4">
              Potential Admission <span className="kintsugi-gold-word italic">Spike</span>
            </h1>
            <p className="text-[#FFFFFF]/80 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Statistical surge detected in expected patient admissions across{' '}
              <strong className="text-[#B0E0E6]">{spike.department}</strong>. Preemptive resource
              allocation and diversion protocols are advised.
            </p>

            {/* Metric Comparison Ribbon */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#151F2C]/80 rounded-2xl p-5 border border-[rgba(220, 235, 245,0.16)]">
              <div className="border-b sm:border-b-0 sm:border-r border-[rgba(220, 235, 245,0.14)] pb-3 sm:pb-0 sm:pr-4">
                <div className="kintsugi-section-label text-[10px]">Expected Daily Baseline</div>
                <div className="text-3xl font-bold text-[#FFFFFF] mt-1.5">
                  <AnimatedNumber value={spike.expectedDailyAdmissions} />{' '}
                  <span className="text-xs text-[#B0E0E6]/70 font-normal">pts/day</span>
                </div>
                <div className="text-[11px] text-[#B0E0E6]/60 mt-1">30-day moving average</div>
              </div>

              <div className="border-b sm:border-b-0 sm:border-r border-[rgba(220, 235, 245,0.14)] pb-3 sm:pb-0 sm:px-4">
                <div className="kintsugi-section-label text-[10px] text-[#F08582]">
                  Predicted Tomorrow
                </div>
                <div className="text-3xl font-bold text-[#F08582] mt-1.5">
                  <AnimatedNumber value={spike.predictedTomorrow} />{' '}
                  <span className="text-xs text-[#B0E0E6]/70 font-normal">pts</span>
                </div>
                <div className="text-[11px] text-[#B0E0E6]/75 mt-1 kintsugi-num">
                  90% Range: <strong className="text-[#FFFFFF]">{spike.confidenceRange[0]} – {spike.confidenceRange[1]}</strong>
                </div>
              </div>

              <div className="sm:pl-4">
                <div className="kintsugi-section-label text-[10px] text-[#B0E0E6]">
                  Expected Surge Increase
                </div>
                <div className="text-3xl font-bold text-[#B0E0E6] mt-1.5">
                  +<AnimatedNumber value={spike.percentIncrease} suffix="%" />
                </div>
                <div className="text-[11px] text-[#B0E0E6]/75 mt-1">
                  +23 patients above threshold
                </div>
              </div>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Grid: Primary Drivers + Suggested Operational Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KintsugiReveal delay={0.05}>
          <div className="kintsugi-card rounded-3xl p-6 space-y-4 h-full">
            <div>
              <span className="kintsugi-section-label text-[10px]">Underlying Drivers</span>
              <h2 className="kintsugi-serif text-2xl font-semibold mt-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B0E0E6]" />
                <span>Statistical &amp; Clinical Surge Causes</span>
              </h2>
            </div>

            <div className="space-y-3">
              {spike.primaryDrivers.map((driver, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#151F2C]/75 rounded-xl border border-[rgba(220, 235, 245,0.14)] flex items-start gap-3"
                >
                  <span className="kintsugi-num w-6 h-6 rounded-lg bg-[#4682B4]/15 text-[#B0E0E6] border border-[rgba(70, 130, 180,0.35)] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-[#FFFFFF]/85 leading-relaxed">{driver}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t kintsugi-divider text-xs text-[#B0E0E6]/70">
              <strong className="text-[#B0E0E6]">Confidence Calibration:</strong> 90% probabilistic
              prediction window.
            </div>
          </div>
        </KintsugiReveal>

        <KintsugiReveal delay={0.1}>
          <div className="kintsugi-card rounded-3xl p-6 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="kintsugi-section-label text-[10px]">Action Protocol</span>
                  <h2 className="kintsugi-serif text-2xl font-semibold mt-1 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#B0E0E6]" />
                    <span>Suggested Operational Actions</span>
                  </h2>
                </div>
                <span className="kintsugi-num text-xs font-semibold text-[#B0E0E6]">
                  {completedActions.length} / {spike.suggestedActions.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {spike.suggestedActions.map((action, idx) => {
                  const isChecked = completedActions.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleAction(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 kintsugi-focus ${
                        isChecked
                          ? 'bg-[#B0E0E6]/12 border-[rgba(220, 235, 245,0.4)] text-[#B0E0E6]'
                          : 'bg-[#151F2C]/75 hover:bg-[#2C3E55] border-[rgba(220, 235, 245,0.16)] text-[#FFFFFF]'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#B0E0E6]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#B0E0E6]/60" />
                        )}
                      </span>
                      <span
                        className={`text-xs font-medium leading-relaxed ${
                          isChecked ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {action}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t kintsugi-divider flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigateTab('what-if')}
                className="kintsugi-btn-gold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Simulate Mitigation Scenarios</span>
              </button>
            </div>
          </div>
        </KintsugiReveal>
      </div>

      {/* Operational Guideline */}
      <div className="kintsugi-card rounded-2xl p-4 text-xs text-[#FFFFFF]/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#B0E0E6] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#B0E0E6]">Operational Guideline:</strong> Machine learning
          forecasts identify risk vectors with quantifiable uncertainty bounds; combine algorithmic
          projections with on-ground clinical rounds.
        </div>
      </div>
    </div>
  );
};
