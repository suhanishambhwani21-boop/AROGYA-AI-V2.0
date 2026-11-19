import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Hospital } from '../../types';
import {
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';

interface ReportsAnalyticsProps {
  hospital: Hospital;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ hospital }) => {
  const [reportPeriod, setReportPeriod] = useState<'WEEK' | 'MONTH' | 'QUARTER'>('WEEK');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleExport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapDepts = ['ICU', 'Emergency', 'General Ward', 'Pediatrics', 'Cardiology', 'Surgery'];

  // Strict Celadon / Gold / Warm Amber-Red utilization heatmap matrix
  const getHeatmapColor = (dIdx: number, dayIdx: number) => {
    const matrix = [
      [92, 95, 96, 94, 91, 86, 88], // ICU
      [84, 88, 91, 85, 82, 95, 94], // ER
      [86, 88, 89, 85, 80, 72, 74], // General
      [74, 76, 75, 78, 72, 68, 70], // Peds
      [88, 89, 92, 87, 84, 78, 80], // Cardio
      [90, 94, 95, 92, 88, 65, 60], // Surgery
    ];
    const val = matrix[dIdx][dayIdx];
    if (val >= 93)
      return {
        bg: 'bg-[#D9534F]/25 text-[#F08582] border border-[rgba(217, 83, 79,0.55)]',
        val,
      };
    if (val >= 85)
      return {
        bg: 'bg-[#4682B4]/20 text-[#B0E0E6] border border-[rgba(70, 130, 180,0.45)]',
        val,
      };
    if (val >= 75)
      return {
        bg: 'bg-[#B0E0E6]/18 text-[#FFFFFF] border border-[rgba(220, 235, 245,0.35)]',
        val,
      };
    return {
      bg: 'bg-[#B0E0E6]/8 text-[#B0E0E6] border border-[rgba(220, 235, 245,0.2)]',
      val,
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <KintsugiReveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="kintsugi-section-label flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Executive Healthcare Operations · {hospital.name}</span>
            </div>
            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-2">
              Analytics &amp; <span className="kintsugi-gold-word italic">Reports</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#FFFFFF]/75 mt-1.5 max-w-2xl">
              Aggregate bed occupancy velocity, weekly department heatmaps, and admission-discharge equilibrium audits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 bg-[#151F2C] p-1 rounded-xl border border-[rgba(220, 235, 245,0.16)]">
              {(['WEEK', 'MONTH', 'QUARTER'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReportPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer kintsugi-focus ${
                    reportPeriod === p
                      ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                      : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="kintsugi-btn-gold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'Exporting Report...' : 'Export Full Report'}</span>
            </button>
          </div>
        </div>
      </KintsugiReveal>

      {/* Summary KPI Ribbon */}
      <KintsugiStaggerGrid className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <span className="kintsugi-section-label text-[10px]">Avg Bed Turnover</span>
            <div className="text-2xl font-bold text-[#FFFFFF] kintsugi-num mt-1.5">1.8 Hours</div>
            <div className="text-[11px] text-[#B0E0E6] mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-15 mins vs prior {reportPeriod.toLowerCase()}</span>
            </div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <span className="kintsugi-section-label text-[10px]">Admission Volume</span>
            <div className="text-2xl font-bold text-[#B0E0E6] kintsugi-num mt-1.5">294 Patients</div>
            <div className="text-[11px] text-[#F08582] mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18% seasonal demand</span>
            </div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <span className="kintsugi-section-label text-[10px]">Mean Hospital ALOS</span>
            <div className="text-2xl font-bold text-[#FFFFFF] kintsugi-num mt-1.5">4.3 Days</div>
            <div className="text-[11px] text-[#B0E0E6]/70 mt-1">Benchmark: 4.5 days</div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <span className="kintsugi-section-label text-[10px]">ER Bed Absorption</span>
            <div className="text-2xl font-bold text-[#F08582] kintsugi-num mt-1.5">94.2%</div>
            <div className="text-[11px] text-[#B0E0E6] mt-1">Elevated strain threshold</div>
          </div>
        </KintsugiStaggerItem>
      </KintsugiStaggerGrid>

      {/* Heatmap */}
      <KintsugiReveal delay={0.1}>
        <div className="kintsugi-card rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b kintsugi-divider">
            <div>
              <h2 className="kintsugi-serif text-2xl font-semibold">
                Department Occupancy Heatmap (% Bed Utilization)
              </h2>
              <p className="text-xs text-[#B0E0E6]/75 mt-0.5">
                Weekly peak demand distribution and weekend discharge turnaround cycles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#B0E0E6]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#B0E0E6]/20 border border-[rgba(220, 235, 245,0.4)]" /> &lt;75%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#B0E0E6]/45" /> 75–84%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#4682B4]/55" /> 85–92%
              </span>
              <span className="flex items-center gap-1.5 text-[#F08582]">
                <span className="w-3 h-3 rounded-xs bg-[#D9534F]/65" /> ≥93% Critical
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="text-[#B0E0E6]/75 uppercase text-[10px] tracking-[0.14em] border-b kintsugi-divider">
                  <th className="py-3 px-3 text-left">Department</th>
                  {heatmapDays.map(d => (
                    <th key={d} className="py-3 px-3">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(220, 235, 245,0.1)]">
                {heatmapDepts.map((dept, dIdx) => (
                  <tr key={dept} className="hover:bg-[#243346]/50 transition-colors">
                    <td className="py-3 px-3 text-left font-semibold text-[#FFFFFF]">{dept}</td>
                    {heatmapDays.map((day, dayIdx) => {
                      const item = getHeatmapColor(dIdx, dayIdx);
                      return (
                        <td key={day} className="py-2.5 px-2">
                          <span
                            className={`inline-block w-13 py-1.5 rounded-lg kintsugi-num font-bold text-xs ${item.bg}`}
                          >
                            {item.val}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </KintsugiReveal>
    </div>
  );
};
