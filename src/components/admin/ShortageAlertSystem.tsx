import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  FileDown,
  SlidersHorizontal,
} from 'lucide-react';
import { ShortageAlert, AlertSeverity } from '../../types';
import {
  AnimatedNumber,
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';

interface ShortageAlertSystemProps {
  alerts: ShortageAlert[];
  onAlertAction: (
    alertId: string,
    action: 'REVIEW' | 'ASSIGN' | 'RESOLVE',
    staffName?: string,
    note?: string
  ) => void;
  onNavigateTab: (tab: string) => void;
}

export const ShortageAlertSystem: React.FC<ShortageAlertSystemProps> = ({
  alerts,
  onAlertAction,
  onNavigateTab,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [assigningAlertId, setAssigningAlertId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>('Dr. Vikram Malhotra (Cardiology / CMO)');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const filteredAlerts =
    filterSeverity === 'ALL'
      ? alerts
      : alerts.filter(a => a.severity === filterSeverity);

  const handleAssign = (alertId: string) => {
    onAlertAction(alertId, 'ASSIGN', selectedStaff);
    setAssigningAlertId(null);
  };

  const handleExportIncidentReport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          cardExtra: 'kintsugi-card-critical',
          badge: 'bg-[#D9534F]/18 text-[#F08582] border-[rgba(217, 83, 79,0.5)]',
          dot: 'bg-[#F08582]',
        };
      case 'HIGH':
      case 'MEDIUM':
        return {
          cardExtra: 'border-[rgba(70, 130, 180,0.35)]',
          badge: 'bg-[#4682B4]/14 text-[#B0E0E6] border-[rgba(70, 130, 180,0.45)]',
          dot: 'bg-[#4682B4]',
        };
      case 'INFO':
        return {
          cardExtra: '',
          badge: 'bg-[#B0E0E6]/12 text-[#B0E0E6] border-[rgba(220, 235, 245,0.35)]',
          dot: 'bg-[#B0E0E6]',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <KintsugiReveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="kintsugi-section-label flex items-center gap-2 text-[#F08582]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Proactive Risk Intelligence</span>
            </div>
            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-2">
              Shortage <span className="kintsugi-gold-word italic">Alerts</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#FFFFFF]/75 mt-1.5 max-w-2xl">
              Automated capacity surveillance detecting impending ward saturations, surge risks, and positive discharge inflows.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportIncidentReport}
            className="kintsugi-btn-celadon px-4 py-2.5 rounded-full text-xs tracking-wider uppercase flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#B0E0E6]" />
            <span>{exportSuccess ? 'Incident Ledger Exported' : 'Export Incident Report'}</span>
          </button>
        </div>
      </KintsugiReveal>

      {/* Filter Tabs */}
      <KintsugiReveal delay={0.05}>
        <div className="kintsugi-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#151F2C] rounded-xl border border-[rgba(220, 235, 245,0.16)]">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map(sev => (
              <button
                key={sev}
                type="button"
                onClick={() => setFilterSeverity(sev)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer kintsugi-focus ${
                  filterSeverity === sev
                    ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                    : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                }`}
              >
                {sev === 'ALL' ? 'All Alerts' : sev}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#B0E0E6]/80">
            Showing <strong className="kintsugi-num text-[#B0E0E6]">{filteredAlerts.length}</strong> active alerts
          </div>
        </div>
      </KintsugiReveal>

      {/* Alert Cards List */}
      <KintsugiStaggerGrid className="space-y-4">
        {filteredAlerts.map(alert => {
          const style = getSeverityStyle(alert.severity);

          return (
            <KintsugiStaggerItem key={alert.id}>
              <div className={`kintsugi-card rounded-2xl p-5 sm:p-6 ${style.cardExtra}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2.5 max-w-3xl">
                    {/* Badge & Timestamp */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${style.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        <span>{alert.severity} ALERT</span>
                      </span>
                      <span className="text-xs font-semibold text-[#FFFFFF]">
                        {alert.department}
                      </span>
                      <span className="text-[#B0E0E6]/35" aria-hidden="true">·</span>
                      <span className="text-xs text-[#B0E0E6]/70 kintsugi-num">
                        {alert.timestamp}
                      </span>
                      <span className="text-[#B0E0E6]/35" aria-hidden="true">·</span>
                      <span className="text-xs text-[#B0E0E6]">
                        Horizon: <strong className="text-[#B0E0E6]">{alert.predictedTimeframe}</strong>
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h2 className="kintsugi-serif text-2xl font-semibold">
                      {alert.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#FFFFFF]/80 leading-relaxed">
                      {alert.description}
                    </p>

                    {/* Status & Assigned Staff info */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#B0E0E6]/80">
                      <span className="inline-flex items-center gap-1.5">
                        <span>Status</span>
                        <span
                          className={`kintsugi-num px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            alert.status === 'RESOLVED'
                              ? 'bg-[#B0E0E6]/15 text-[#B0E0E6] border-[rgba(220, 235, 245,0.35)]'
                              : alert.status === 'ASSIGNED'
                              ? 'bg-[#4682B4]/15 text-[#B0E0E6] border-[rgba(70, 130, 180,0.4)]'
                              : 'bg-[#151F2C] text-[#FFFFFF] border-[rgba(220, 235, 245,0.2)]'
                          }`}
                        >
                          {alert.status}
                        </span>
                      </span>

                      {alert.assignedStaff && (
                        <span className="inline-flex items-center gap-1.5 text-[#B0E0E6] font-medium">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assigned: {alert.assignedStaff}</span>
                        </span>
                      )}

                      <span className="kintsugi-num text-[#B0E0E6]/85">
                        Occupancy: <strong className="text-[#FFFFFF]"><AnimatedNumber value={alert.currentOccupancyPercent} suffix="%" /></strong> → Predicted:{' '}
                        <strong className={alert.predictedOccupancyPercent >= 95 ? 'text-[#F08582]' : 'text-[#B0E0E6]'}>
                          <AnimatedNumber value={alert.predictedOccupancyPercent} suffix="%" />
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {alert.status === 'UNREVIEWED' && (
                      <button
                        type="button"
                        onClick={() => onAlertAction(alert.id, 'REVIEW')}
                        className="kintsugi-btn-celadon px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Reviewed</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setAssigningAlertId(assigningAlertId === alert.id ? null : alert.id)
                      }
                      className="kintsugi-btn-celadon px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#B0E0E6]" />
                      <span>Assign Staff</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateTab('what-if')}
                      className="kintsugi-btn-gold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Simulate Mitigation</span>
                    </button>
                  </div>
                </div>

                {/* Inline Assignment Drawer */}
                {assigningAlertId === alert.id && (
                  <div className="mt-4 pt-4 border-t kintsugi-divider flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#151F2C]/85 p-3.5 rounded-xl border border-[rgba(220, 235, 245,0.16)]">
                    <div className="w-full sm:w-auto">
                      <label
                        htmlFor={`assign-select-${alert.id}`}
                        className="kintsugi-section-label text-[10px] block mb-1.5"
                      >
                        Assign Incident Response To
                      </label>
                      <select
                        id={`assign-select-${alert.id}`}
                        value={selectedStaff}
                        onChange={e => setSelectedStaff(e.target.value)}
                        className="kintsugi-input rounded-lg px-3 py-1.5 text-xs font-medium w-full sm:w-auto cursor-pointer"
                      >
                        <option>Dr. Vikram Malhotra (Cardiology / CMO)</option>
                        <option>Dr. Shweta Kulkarni (Lead Intensivist ICU)</option>
                        <option>Dr. Farhan Siddiqui (Emergency Physician)</option>
                        <option>Nurse Supervisor Anjali Nair (General Ward)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAssigningAlertId(null)}
                        className="px-3 py-1.5 text-xs text-[#B0E0E6] hover:text-[#FFFFFF] font-semibold cursor-pointer kintsugi-focus rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAssign(alert.id)}
                        className="kintsugi-btn-gold px-4 py-1.5 text-xs rounded-lg cursor-pointer"
                      >
                        Confirm Assignment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </KintsugiStaggerItem>
          );
        })}
      </KintsugiStaggerGrid>
    </div>
  );
};
