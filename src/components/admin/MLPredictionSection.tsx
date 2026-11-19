import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Filter,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  AnimatedNumber,
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';

interface MLPredictionSectionProps {
  onNavigateTab: (tab: string) => void;
}

type Horizon = '24h' | '3d' | '7d' | '30d';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface ForecastSummary {
  horizon: string;
  bedType: string;
  department: string;
  currentAvailable: number;
  predictedAdmissions: number;
  predictedDischarges: number;
  expectedAvailable: number;
  predictedOccupancy: number;
  riskLevel: RiskLevel;
  confidenceLower: number | null;
  confidenceUpper: number | null;
  lastUpdated: string;
  notes: string;
}

interface ForecastSummaries {
  '24h': ForecastSummary[];
  '3d': ForecastSummary[];
  '7d': ForecastSummary[];
  '30d': ForecastSummary[];
}

interface PredictionApiResponse {
  success: boolean;
  source?: string;
  summaries: ForecastSummaries;
  error?: string;
}

async function fetchPredictionSummaries(): Promise<ForecastSummaries> {
  const response = await fetch('/api/predictions');

  if (!response.ok) {
    throw new Error(`Prediction API failed: ${response.status}`);
  }

  const data: PredictionApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to load predictions');
  }

  return data.summaries;
}

export const MLPredictionSection: React.FC<MLPredictionSectionProps> = ({
  onNavigateTab,
}) => {
  const [horizon, setHorizon] = useState<Horizon>('24h');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [summariesMap, setSummariesMap] = useState<ForecastSummaries>({
    '24h': [],
    '3d': [],
    '7d': [],
    '30d': [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadForecasts = async () => {
      try {
        setLoading(true);
        setError(null);
        const summaries = await fetchPredictionSummaries();
        if (isMounted) {
          setSummariesMap(summaries);
        }
      } catch (err) {
        console.error('Failed to load ML forecasts:', err);
        if (isMounted) {
          setError('Unable to load the latest ML forecast.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadForecasts();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentSummaries = summariesMap[horizon] || [];
  const filteredSummaries =
    filterCategory === 'ALL'
      ? currentSummaries
      : currentSummaries.filter(summary =>
          summary.bedType.toLowerCase().includes(filterCategory.toLowerCase())
        );

  const horizonLabels: Record<Horizon, { title: string; subtitle: string }> = {
    '24h': {
      title: 'Next 24 Hours',
      subtitle: 'Short-term immediate shift & emergency absorption',
    },
    '3d': {
      title: 'Next 3 Days',
      subtitle: 'Mid-week operational planning & elective scheduling',
    },
    '7d': {
      title: 'Next 7 Days',
      subtitle: 'Weekly cyclical demand & weekend discharge curves',
    },
    '30d': {
      title: 'Next 30 Days',
      subtitle: 'Macro seasonal trend & staff resource planning',
    },
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-[#D9534F]/18 text-[#F08582] border-[rgba(217, 83, 79,0.5)]';
      case 'HIGH':
      case 'MEDIUM':
        return 'bg-[#4682B4]/15 text-[#B0E0E6] border-[rgba(70, 130, 180,0.45)]';
      case 'LOW':
      default:
        return 'bg-[#B0E0E6]/12 text-[#B0E0E6] border-[rgba(220, 235, 245,0.3)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="kintsugi-section-label flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>AI Bed Demand Prediction Engine</span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-3">
              Predictive Bed <span className="kintsugi-gold-word italic">Demand</span>
            </h1>

            <p className="text-[#FFFFFF]/80 text-xs sm:text-sm mt-2.5 leading-relaxed">
              Continuously analyzing 12 months of historical admissions, discharges, emergency ratios,
              ALOS, and seasonality patterns to forecast bed availability before saturation hits.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-[#B0E0E6]">
              {[
                'Daily Admissions & Discharges',
                'Emergency Triage Ratios',
                'Dept Avg Length of Stay',
                'Day-of-Week Seasonality',
                'Historical Occupancy Baseline',
              ].map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-[#151F2C]/75 border border-[rgba(220, 235, 245,0.18)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Control Bar */}
      <KintsugiReveal delay={0.05}>
        <div className="kintsugi-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="kintsugi-section-label text-[10px] mb-2">
              Select Prediction Horizon
            </div>
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#151F2C] rounded-xl border border-[rgba(220, 235, 245,0.16)]">
              {(['24h', '3d', '7d', '30d'] as const).map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer kintsugi-focus ${
                    horizon === h
                      ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                      : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                  }`}
                >
                  {horizonLabels[h].title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-[#151F2C] px-3 py-2 rounded-xl border border-[rgba(220, 235, 245,0.22)] text-xs w-full md:w-auto">
              <Filter className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <select
                aria-label="Filter predictions by bed category"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-transparent text-[#FFFFFF] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#1E2A3A]">All Bed Types</option>
                <option value="ICU" className="bg-[#1E2A3A]">ICU Only</option>
                <option value="Emergency" className="bg-[#1E2A3A]">Emergency Only</option>
                <option value="General" className="bg-[#1E2A3A]">General Ward</option>
                <option value="Pediatric" className="bg-[#1E2A3A]">Pediatric</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('forecast-graph')}
              className="kintsugi-btn-celadon px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>View Graph Curve</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </KintsugiReveal>

      {/* Active Horizon Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#B0E0E6]/80 px-1">
        <div>
          Showing forecast for{' '}
          <strong className="text-[#B0E0E6]">{horizonLabels[horizon].title}</strong> —{' '}
          {horizonLabels[horizon].subtitle}
        </div>
        <div className="text-[11px] kintsugi-num text-[#B0E0E6]/60">
          Model: <span className="text-[#B0E0E6]">XGBoost-v1</span> · Active Horizon
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="kintsugi-card rounded-2xl p-8 text-center">
          <div className="text-sm font-semibold text-[#FFFFFF]">
            Loading latest ML forecasts...
          </div>
          <div className="text-xs text-[#B0E0E6]/65 mt-1">
            Reading predictions from Arogya AI backend
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="kintsugi-card kintsugi-card-critical rounded-2xl p-6 text-center">
          <div className="text-sm font-semibold text-[#F08582]">Forecast unavailable</div>
          <div className="text-xs text-[#FFFFFF]/80 mt-1">{error}</div>
        </div>
      )}

      {!loading && !error && filteredSummaries.length === 0 && (
        <div className="kintsugi-card rounded-2xl p-8 text-center">
          <div className="text-sm font-semibold text-[#FFFFFF]">No forecast data available</div>
          <div className="text-xs text-[#B0E0E6]/65 mt-1">
            No ML forecast matches the selected horizon or filter.
          </div>
        </div>
      )}

      {/* Prediction Cards */}
      {!loading && !error && filteredSummaries.length > 0 && (
        <KintsugiStaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSummaries.map((item, idx) => {
            const isCrit = item.riskLevel === 'CRITICAL';
            return (
              <KintsugiStaggerItem key={`${item.bedType}-${idx}`}>
                <div
                  className={`kintsugi-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full ${
                    isCrit ? 'kintsugi-card-critical' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="kintsugi-section-label text-[10px]">
                          {item.department}
                        </span>
                        <h3 className="kintsugi-serif text-2xl font-semibold mt-0.5">
                          {item.bedType}
                        </h3>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRiskBadge(
                          item.riskLevel
                        )}`}
                      >
                        {item.riskLevel} RISK
                      </span>
                    </div>

                    <div className="my-4 bg-[#151F2C]/75 rounded-2xl p-4 border border-[rgba(220, 235, 245,0.14)] space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-[#B0E0E6]/80">
                        <span>Current Available</span>
                        <strong className="text-sm text-[#FFFFFF]">
                          <AnimatedNumber value={item.currentAvailable} suffix=" beds" />
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-[#F08582] bg-[#D9534F]/10 px-2.5 py-1.5 rounded-lg border border-[rgba(217, 83, 79,0.22)]">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Predicted Admissions</span>
                        </span>
                        <strong className="kintsugi-num text-sm">
                          +<AnimatedNumber value={item.predictedAdmissions} />
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-[#B0E0E6] bg-[#B0E0E6]/10 px-2.5 py-1.5 rounded-lg border border-[rgba(220, 235, 245,0.2)]">
                        <span className="flex items-center gap-1.5">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Predicted Discharges</span>
                        </span>
                        <strong className="kintsugi-num text-sm">
                          -<AnimatedNumber value={item.predictedDischarges} />
                        </strong>
                      </div>

                      <div className="pt-2.5 border-t border-[rgba(220, 235, 245,0.14)] flex items-center justify-between">
                        <span className="font-semibold text-[#FFFFFF]">
                          Expected Available Beds
                        </span>
                        <span
                          className={`kintsugi-num font-bold text-base px-2.5 py-0.5 rounded-lg ${
                            item.expectedAvailable <= 3
                              ? 'bg-[#D9534F] text-[#1E2A3A]'
                              : 'bg-[#B0E0E6] text-[#1E2A3A]'
                          }`}
                        >
                          <AnimatedNumber value={item.expectedAvailable} />
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#B0E0E6]/80 pt-1">
                        <span>Predicted Occupancy</span>
                        <strong className="text-[#B0E0E6]">
                          <AnimatedNumber value={item.predictedOccupancy} decimals={1} suffix="%" />
                        </strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#B0E0E6]/70 flex items-center justify-between px-1">
                      <span>Forecast Confidence</span>
                      <span className="kintsugi-num font-semibold text-[#FFFFFF]">
                        {item.confidenceLower !== null && item.confidenceUpper !== null
                          ? `[${item.confidenceLower} – ${item.confidenceUpper} beds]`
                          : 'Not calculated'}
                      </span>
                    </div>

                    <p className="text-xs text-[#B0E0E6]/85 mt-3 italic bg-[#151F2C]/60 p-3 rounded-xl border border-[rgba(220, 235, 245,0.12)]">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t kintsugi-divider flex items-center justify-between">
                    <span className="text-[10px] text-[#B0E0E6]/55 kintsugi-num">
                      Updated: {item.lastUpdated}
                    </span>

                    <button
                      type="button"
                      onClick={() => onNavigateTab('what-if')}
                      className="text-xs text-[#B0E0E6] hover:text-[#B0E0E6] font-semibold flex items-center gap-1 cursor-pointer kintsugi-focus rounded-md"
                    >
                      <span>Simulate Buffer</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </KintsugiStaggerItem>
            );
          })}
        </KintsugiStaggerGrid>
      )}

      {/* Methodology Note */}
      <div className="kintsugi-card rounded-2xl p-4 flex items-start gap-3 text-xs text-[#FFFFFF]/80">
        <Info className="w-5 h-5 text-[#B0E0E6] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#B0E0E6]">ML Forecasting Principle:</strong> Predictions are generated
          using trained XGBoost forecasting ensembles over historical hospital-flow data. Forecasts support
          preemptive resource planning and complement clinical judgement.
        </div>
      </div>
    </div>
  );
};