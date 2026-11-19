import React, { useState } from 'react';
import {
  Activity,
  Bed,
  Clock,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  Info,
  Brain,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Hospital, BedCategory, ShortageAlert, AdmissionSpike } from '../../types';
import { ForecastLineChart, OccupancyProgressBar } from '../common/ChartComponents';
import { MLForecastEngine } from '../../services/mlForecastEngine';
import {
  AnimatedNumber,
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';
import { HospitalHero3D } from './HospitalHero3D';

interface DashboardOverviewProps {
  hospital: Hospital;
  onUpdateBed: (bedCategoryId: string, occDelta: number, resDelta: number, availDelta?: number) => void;
  onNavigateTab: (tab: string) => void;
  spikeAlert: AdmissionSpike;
  alerts: ShortageAlert[];
  isStaffRole?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  hospital,
  onUpdateBed,
  onNavigateTab,
  spikeAlert,
  alerts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BedCategory | null>(null);
  const [editDeltaOcc, setEditDeltaOcc] = useState<number>(0);
  const [showEditModal, setShowEditModal] = useState(false);

  const criticalAlerts = alerts.filter(
    a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED'
  );

  // Compute 7-day forecast baseline & surge trajectories for dashboard chart
  const baseline7d = MLForecastEngine.generateTimeSeries(7, 'All', 'All', 0, 0, 0);
  const surge7d = MLForecastEngine.generateTimeSeries(7, 'All', 'All', 20, -10, 0);

  // Standard operational bed category order
  const wardDisplayOrder = ['ICU', 'Emergency', 'General', 'Private', 'Pediatric'];
  const orderedCategories = [...hospital.bedCategories].sort((a, b) => {
    const idxA = wardDisplayOrder.indexOf(a.name);
    const idxB = wardDisplayOrder.indexOf(b.name);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  const handleOpenBedModal = (cat: BedCategory) => {
    setSelectedCategory(cat);
    setEditDeltaOcc(0);
    setShowEditModal(true);
  };

  const handleApplyBedChange = () => {
    if (!selectedCategory) return;
    onUpdateBed(selectedCategory.id, editDeltaOcc, 0);
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* CINEMATIC CSS 3D LAPTOP BURST BANNER */}
      <HospitalHero3D hospital={hospital} alerts={alerts} spikeAlert={spikeAlert} />

      {/* HOSPITAL BED OPERATIONS HEADER BAR */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[#B0E0E6]">
              <Activity className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Hospital Bed Operations Overview</span>
              <span aria-hidden="true" className="text-[#DCEBF5]/40">·</span>
              <span className="text-[#DCEBF5]">{hospital.city}</span>
            </div>
            <h1 className="kintsugi-serif text-2xl sm:text-3xl font-semibold mt-1 text-[#FFFFFF]">
              {hospital.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#DCEBF5]/85">
              <span className="inline-flex items-center gap-1.5 kintsugi-num">
                <Clock className="w-3.5 h-3.5 text-[#B0E0E6]" />
                Last synced: <strong className="text-[#FFFFFF]">{hospital.lastUpdated}</strong>
              </span>
              {hospital.emergencyActive && (
                <span className="inline-flex items-center gap-1 text-[#B0E0E6]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B0E0E6]" />
                  <span>Emergency Intake Active</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('prediction')}
              className="kintsugi-btn-celadon rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>ML Predictions</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('what-if')}
              className="kintsugi-btn-gold rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>What-If Simulator</span>
            </button>
          </div>
        </div>
      </KintsugiReveal>

      {/* SUMMARY KPI CARDS */}
      <KintsugiStaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-[#DCEBF5]/85">
              <span className="uppercase tracking-[0.14em] font-semibold text-[10px]">
                Total Hospital Beds
              </span>
              <Bed className="w-4 h-4 text-[#B0E0E6]" />
            </div>
            <div className="mt-2.5 text-3xl font-bold text-[#FFFFFF]">
              <AnimatedNumber value={hospital.totalBeds} />
            </div>
            <div className="mt-1 text-xs text-[#DCEBF5]/75 kintsugi-num">
              Across {hospital.bedCategories.length} clinical categories
            </div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-[#DCEBF5]/85">
              <span className="uppercase tracking-[0.14em] font-semibold text-[10px]">
                Occupied Beds
              </span>
              <Activity className="w-4 h-4 text-[#B0E0E6]" />
            </div>
            <div className="mt-2.5 text-3xl font-bold text-[#FFFFFF]">
              <AnimatedNumber value={hospital.occupiedBeds} />
            </div>
            <div className="mt-1 text-xs text-[#DCEBF5]/75 kintsugi-num">
              Reserved: {hospital.reservedBeds} beds
            </div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-[#DCEBF5]/85">
              <span className="uppercase tracking-[0.14em] font-semibold text-[10px]">
                Available Now
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#B0E0E6]" />
            </div>
            <div className="mt-2.5 text-3xl font-bold text-[#B0E0E6]">
              <AnimatedNumber value={hospital.availableBeds} />
            </div>
            <div className="mt-1 text-xs text-[#DCEBF5]/75 kintsugi-num">
              Emergency buffer: {hospital.emergencyBeds} beds
            </div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-[#DCEBF5]/85">
              <span className="uppercase tracking-[0.14em] font-semibold text-[10px]">
                Occupancy Rate
              </span>
              <AlertTriangle className="w-4 h-4 text-[#E0A458]" />
            </div>
            <div className="mt-2.5 text-3xl font-bold text-[#FFFFFF]">
              <AnimatedNumber value={hospital.occupancyRate} decimals={1} suffix="%" />
            </div>
            <div className="mt-2">
              <OccupancyProgressBar
                rate={hospital.occupancyRate}
                status={
                  hospital.occupancyRate >= 95
                    ? 'Danger'
                    : hospital.occupancyRate >= 80
                    ? 'Warning'
                    : 'Normal'
                }
              />
            </div>
          </div>
        </KintsugiStaggerItem>
      </KintsugiStaggerGrid>

      {/* CRITICAL SHORTAGE ALERT STRIP */}
      {criticalAlerts.length > 0 && (
        <KintsugiReveal>
          <div className="kintsugi-card kintsugi-card-critical rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[rgba(217,83,79,0.18)] border border-[rgba(217,83,79,0.5)] text-[#F08582] shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold">
                  <span className="text-[#F08582]">Critical Shortage Alert</span>
                  <span aria-hidden="true" className="text-[#DCEBF5]/40">·</span>
                  <span className="text-[#DCEBF5]/85 kintsugi-num">Predicted Next 24h</span>
                </div>
                <h2 className="kintsugi-serif text-xl sm:text-2xl text-[#FFFFFF] font-semibold mt-1">
                  ICU Occupancy Projected Above <span className="text-[#E0A458]">95%</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#DCEBF5] mt-1 max-w-2xl">
                  Current ICU open:{' '}
                  <strong className="kintsugi-num text-[#FFFFFF]">
                    {hospital.bedCategories.find(c => c.name === 'ICU')?.available ?? 4} beds
                  </strong>
                  . Forecasted admissions: 15 vs 10 discharges. Preemptive surge bed allocation recommended.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateTab('what-if')}
                className="kintsugi-btn-celadon rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Simulate +Beds</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('alerts')}
                className="kintsugi-btn-gold rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Action Plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </KintsugiReveal>
      )}

      {/* BED CATEGORIES STATUS GRID */}
      <section aria-labelledby="bed-categories-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="kintsugi-section-label">REAL-TIME WARD CAPACITY</div>
            <h2 id="bed-categories-heading" className="kintsugi-serif text-2xl sm:text-3xl font-semibold mt-1">
              Bed Availability by <span className="kintsugi-gold-word">Department</span>
            </h2>
          </div>
          <span className="text-xs text-[#DCEBF5]/80 kintsugi-num">
            {hospital.bedCategories.length} Active Bed Categories
          </span>
        </div>

        <KintsugiStaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {orderedCategories.map(cat => {
            const isCritical = cat.occupancyRate >= 95 || cat.status === 'Danger';
            const isElevated = cat.occupancyRate >= 80 && cat.occupancyRate < 95;

            return (
              <KintsugiStaggerItem key={cat.id}>
                <div
                  className={`kintsugi-card rounded-2xl p-5 flex flex-col justify-between h-full ${
                    isCritical ? 'kintsugi-card-critical' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-[#DCEBF5]/75 font-semibold">
                          {cat.wing.split(',')[0]}
                        </div>
                        <h3 className="text-base font-semibold text-[#FFFFFF] mt-0.5">
                          {cat.name} Beds
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.1em] ${
                          isCritical
                            ? 'bg-[rgba(217,83,79,0.22)] text-[#F08582]'
                            : isElevated
                            ? 'bg-[rgba(224,164,88,0.18)] text-[#E0A458]'
                            : 'bg-[rgba(176,224,230,0.16)] text-[#B0E0E6]'
                        }`}
                      >
                        {cat.status}
                      </span>
                    </div>

                    <div className="mt-4 mb-3">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-xs text-[#DCEBF5]/80">Occupancy</span>
                        <span
                          className={`kintsugi-num text-lg font-bold ${
                            isCritical
                              ? 'text-[#F08582]'
                              : isElevated
                              ? 'text-[#E0A458]'
                              : 'text-[#FFFFFF]'
                          }`}
                        >
                          <AnimatedNumber value={cat.occupancyRate} decimals={1} suffix="%" />
                        </span>
                      </div>
                      <OccupancyProgressBar rate={cat.occupancyRate} status={cat.status} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t kintsugi-divider text-center">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#DCEBF5]/70 block">
                          Total
                        </span>
                        <span className="text-sm font-bold text-[#FFFFFF]">
                          <AnimatedNumber value={cat.total} />
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#DCEBF5]/70 block">
                          Occupied
                        </span>
                        <span className="text-sm font-bold text-[#DCEBF5]">
                          <AnimatedNumber value={cat.occupied} />
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#DCEBF5]/70 block">
                          Open
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            cat.available <= 5 ? 'text-[#F08582]' : 'text-[#B0E0E6]'
                          }`}
                        >
                          <AnimatedNumber value={cat.available} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Live Controls */}
                  <div className="mt-4 pt-3 border-t kintsugi-divider flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateBed(cat.id, 1, 0)}
                      className="flex-1 py-1.5 rounded-lg bg-[#151F2C] hover:bg-[#2C3E55] border border-[rgba(217,83,79,0.42)] text-[#F08582] text-[11px] font-semibold transition cursor-pointer kintsugi-focus"
                      title="Admit 1 patient"
                    >
                      + Admit
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateBed(cat.id, -1, 0)}
                      className="flex-1 py-1.5 rounded-lg bg-[#151F2C] hover:bg-[#2C3E55] border border-[rgba(176,224,230,0.34)] text-[#B0E0E6] text-[11px] font-semibold transition cursor-pointer kintsugi-focus"
                      title="Discharge 1 patient"
                    >
                      - Free
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenBedModal(cat)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#2C3E55] hover:bg-[#366C9A] border border-[#DCEBF5]/20 text-[#FFFFFF] text-[11px] font-medium transition cursor-pointer kintsugi-focus"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </KintsugiStaggerItem>
            );
          })}
        </KintsugiStaggerGrid>
      </section>

      {/* 7-DAY BED AVAILABILITY FORECAST */}
      <KintsugiReveal>
        <section className="kintsugi-card rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b kintsugi-divider pb-4">
            <div>
              <div className="kintsugi-section-label">
                PREDICTIVE AVAILABILITY CURVE · 90% CONFIDENCE
              </div>
              <h2 className="kintsugi-serif text-2xl sm:text-3xl font-semibold mt-1">
                7-Day Bed Availability <span className="kintsugi-gold-word">Forecast</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs">
              <span className="flex items-center gap-2 text-[#B0E0E6]">
                <span className="w-4 h-0.5 bg-[#B0E0E6] rounded-full" />
                Forecast Baseline
              </span>
              <span className="flex items-center gap-2 text-[#E0A458]">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-[#E0A458]" />
                +20% Surge Scenario
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('forecast-graph')}
                className="kintsugi-btn-celadon rounded-xl px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Full Forecast</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <ForecastLineChart
            data={baseline7d}
            surgeData={surge7d}
            height={290}
            showConfidence={true}
          />
        </section>
      </KintsugiReveal>

      {/* LIVE BED ALLOCATION TABLE */}
      <KintsugiReveal>
        <section className="kintsugi-card rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b kintsugi-divider">
            <div>
              <div className="kintsugi-section-label">WARD TELEMETRY LEDGER</div>
              <h3 className="kintsugi-serif text-2xl font-semibold mt-1 flex items-center gap-2.5">
                <Bed className="w-5 h-5 text-[#B0E0E6]" />
                <span>Live Bed Allocation by Category</span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#DCEBF5]/85">
              <span className="inline-flex items-center gap-1.5 kintsugi-num">
                <Clock className="w-3.5 h-3.5 text-[#B0E0E6]" />
                Updated: <strong className="text-[#FFFFFF]">{hospital.lastUpdated}</strong>
              </span>
              <div className="hidden md:flex items-center gap-3 text-[11px]">
                <span className="text-[#B0E0E6]">Normal: &lt;80%</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#E0A458]">High: 80–94%</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#F08582]">Critical: ≥95%</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b kintsugi-divider text-[#DCEBF5]/80 font-semibold uppercase tracking-[0.14em] text-[10px]">
                  <th className="py-3 px-3">Bed Category</th>
                  <th className="py-3 px-3 text-center">Total</th>
                  <th className="py-3 px-3 text-center">Occupied</th>
                  <th className="py-3 px-3 text-center">Reserved</th>
                  <th className="py-3 px-3 text-center">Available</th>
                  <th className="py-3 px-3 min-w-[190px]">Occupancy Level</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(220,235,245,0.14)]">
                {orderedCategories.map(cat => {
                  const isCritical = cat.occupancyRate >= 95 || cat.status === 'Danger';
                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-[#2C3E55]/55 transition-colors ${
                        isCritical ? 'bg-[rgba(217,83,79,0.08)]' : ''
                      }`}
                    >
                      <td className="py-4 px-3">
                        <div className="font-semibold text-[#FFFFFF] text-sm">
                          {cat.name} Beds
                        </div>
                        <div className="text-[11px] text-[#DCEBF5]/80">
                          {cat.departmentName} · {cat.wing}
                        </div>
                      </td>

                      <td className="py-4 px-3 text-center kintsugi-num font-bold text-[#FFFFFF] text-sm">
                        {cat.total}
                      </td>
                      <td className="py-4 px-3 text-center kintsugi-num font-bold text-[#DCEBF5] text-sm">
                        {cat.occupied}
                      </td>
                      <td className="py-4 px-3 text-center kintsugi-num font-semibold text-[#B0E0E6] text-sm">
                        {cat.reserved}
                      </td>
                      <td className="py-4 px-3 text-center kintsugi-num font-bold text-sm">
                        <span
                          className={
                            cat.available <= 5 ? 'text-[#F08582]' : 'text-[#B0E0E6]'
                          }
                        >
                          {cat.available}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <OccupancyProgressBar rate={cat.occupancyRate} status={cat.status} />
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateBed(cat.id, 1, 0)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#151F2C] hover:bg-[#2C3E55] border border-[rgba(217,83,79,0.42)] text-[#F08582] text-[11px] font-semibold transition cursor-pointer kintsugi-focus"
                          >
                            + Admit
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateBed(cat.id, -1, 0)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#151F2C] hover:bg-[#2C3E55] border border-[rgba(176,224,230,0.34)] text-[#B0E0E6] text-[11px] font-semibold transition cursor-pointer kintsugi-focus"
                          >
                            - Discharge
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenBedModal(cat)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#2C3E55] hover:bg-[#366C9A] text-[#FFFFFF] border border-[#DCEBF5]/20 text-[11px] font-medium transition cursor-pointer kintsugi-focus"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t kintsugi-divider flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#DCEBF5]/75">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#B0E0E6] shrink-0" />
              Simulated Operational Telemetry: Decision-support capacity planning only.
            </span>
            <span className="kintsugi-num">Telemetry Sync: Active</span>
          </div>
        </section>
      </KintsugiReveal>

      {/* ADMISSION SPIKE & EXPECTED DISCHARGES SPLIT ROW */}
      <KintsugiReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admission Spike Module */}
          <div className="kintsugi-card rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="kintsugi-section-label text-[#E0A458]">
                  ADMISSION SPIKE DETECTION
                </span>
                <span className="kintsugi-num text-[#DCEBF5]/85">Confidence: 91.2%</span>
              </div>

              <h3 className="kintsugi-serif text-2xl font-semibold mt-2">
                Admission Surge <span className="kintsugi-gold-word">Detected</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 my-5 p-4 rounded-2xl bg-[#151F2C]/85 border kintsugi-divider">
                <div>
                  <div className="text-[11px] text-[#DCEBF5]/75">Daily Baseline</div>
                  <div className="text-xl font-bold text-[#FFFFFF] mt-1">
                    <AnimatedNumber value={spikeAlert.expectedDailyAdmissions} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#DCEBF5]/75">Predicted Tomorrow</div>
                  <div className="text-xl font-bold text-[#F08582] mt-1">
                    <AnimatedNumber value={spikeAlert.predictedTomorrow} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#DCEBF5]/75">Surge Delta</div>
                  <div className="text-xl font-bold text-[#E0A458] mt-1">
                    +<AnimatedNumber value={spikeAlert.percentIncrease} suffix="%" />
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#DCEBF5] leading-relaxed">
                Primary driver: <strong className="text-[#B0E0E6]">{spikeAlert.primaryDrivers[0]}</strong>. Preemptive step-down conversion advised.
              </p>
            </div>

            <div className="pt-4 border-t kintsugi-divider flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab('spike-detection')}
                className="text-xs text-[#B0E0E6] hover:text-[#FFFFFF] font-semibold flex items-center gap-1 transition cursor-pointer kintsugi-focus"
              >
                <span>Spike Analysis &amp; Mitigations</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('what-if')}
                className="kintsugi-btn-gold rounded-xl px-4 py-2 text-xs cursor-pointer"
              >
                Simulate Surge
              </button>
            </div>
          </div>

          {/* Expected Discharges Module */}
          <div className="kintsugi-card rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="kintsugi-section-label flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#B0E0E6]" />
                  <span>EXPECTED DISCHARGES</span>
                </span>
                <span className="kintsugi-num text-[#DCEBF5]/80">Turnaround: 1.18x</span>
              </div>

              <h3 className="kintsugi-serif text-2xl font-semibold mt-2">
                Tomorrow&apos;s Discharges:{' '}
                <span className="kintsugi-gold-word">
                  <AnimatedNumber value={32} suffix=" Patients" />
                </span>
              </h3>

              <div className="mt-5 divide-y divide-[rgba(220,235,245,0.14)] text-xs">
                <div className="py-2.5 flex items-center justify-between text-[#DCEBF5]">
                  <span>General Medicine</span>
                  <span className="kintsugi-num font-semibold text-[#B0E0E6]">14 discharges · 11:00 AM</span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-[#DCEBF5]">
                  <span>General Surgery</span>
                  <span className="kintsugi-num font-semibold text-[#B0E0E6]">8 discharges · 01:00 PM</span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-[#DCEBF5]">
                  <span>Orthopedics &amp; Spine</span>
                  <span className="kintsugi-num font-semibold text-[#B0E0E6]">5 discharges</span>
                </div>
                <div className="py-2.5 flex items-center justify-between text-[#DCEBF5]">
                  <span>Cardiology &amp; CCU</span>
                  <span className="kintsugi-num font-semibold text-[#B0E0E6]">3 discharges</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t kintsugi-divider flex items-center justify-between gap-3">
              <span className="text-xs text-[#DCEBF5]/75">
                Net inflow relief fed to availability engine
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('discharge-forecast')}
                className="kintsugi-btn-celadon rounded-xl px-4 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Detailed Forecast</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* BED ADJUSTMENT MODAL */}
      {showEditModal && selectedCategory && (
        <div
          className="fixed inset-0 z-50 bg-[#151F2C]/82 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bed-modal-title"
        >
          <div className="kintsugi-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#4682B4]/55">
            <div className="kintsugi-section-label text-[10px]">LIVE BED ADJUSTMENT</div>
            <h3 id="bed-modal-title" className="kintsugi-serif text-2xl font-semibold mt-1">
              {selectedCategory.name} Beds
            </h3>
            <p className="text-xs text-[#DCEBF5]/80 mt-0.5">
              {selectedCategory.departmentName} · {selectedCategory.wing}
            </p>

            <div className="my-5 p-4 bg-[#151F2C]/90 rounded-xl border kintsugi-divider space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#DCEBF5]/80">Total Capacity</span>
                <strong className="kintsugi-num text-[#FFFFFF]">{selectedCategory.total}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#DCEBF5]/80">Current Occupied</span>
                <strong className="kintsugi-num text-[#DCEBF5]">{selectedCategory.occupied}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#DCEBF5]/80">Current Available</span>
                <strong className="kintsugi-num text-[#B0E0E6]">{selectedCategory.available}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#FFFFFF] block text-center">
                Adjust Patient Count (Admit / Discharge Delta)
              </label>
              <div className="flex items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() => setEditDeltaOcc(prev => prev - 1)}
                  className="p-2.5 rounded-full kintsugi-btn-celadon cursor-pointer"
                  aria-label="Decrease occupied beds by 1"
                >
                  <MinusCircle className="w-5 h-5" />
                </button>
                <span className="kintsugi-num text-3xl font-bold text-[#B0E0E6] w-20 text-center">
                  {editDeltaOcc > 0 ? `+${editDeltaOcc}` : editDeltaOcc}
                </span>
                <button
                  type="button"
                  onClick={() => setEditDeltaOcc(prev => prev + 1)}
                  className="p-2.5 rounded-full kintsugi-btn-celadon cursor-pointer"
                  aria-label="Increase occupied beds by 1"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[11px] text-center text-[#DCEBF5]/80 kintsugi-num">
                Resulting occupied:{' '}
                {Math.max(0, Math.min(selectedCategory.total, selectedCategory.occupied + editDeltaOcc))} beds
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="kintsugi-btn-celadon rounded-xl px-5 py-2 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBedChange}
                className="kintsugi-btn-gold rounded-xl px-6 py-2 text-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
