import React from 'react';
import {
  Cpu,
  Zap,
  Info,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import { MLModelEvaluation } from '../../types';
import {
  AnimatedNumber,
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';

interface MLModelSectionProps {
  metrics: MLModelEvaluation;
  onNavigateTab: (tab: string) => void;
}

export const MLModelSection: React.FC<MLModelSectionProps> = ({
  metrics,
  onNavigateTab,
}) => {
  const pipelineFlow = [
    { title: 'Historical Hospital Data', sub: 'Admissions, discharges, triage records' },
    { title: 'Data Cleaning & Imputation', sub: 'Anomaly scrubbing & normalization' },
    { title: 'Feature Engineering', sub: 'ALOS lags, seasonal Fourier terms' },
    { title: 'ML Forecasting Engine', sub: 'Hybrid Gradient Boosting + Poisson' },
    { title: 'Arrival & Discharge Vectors', sub: 'Concurrent net patient flows' },
    { title: 'Bed Demand Forecast', sub: '24h, 3d, 7d, 30d distributions' },
    { title: 'Predicted Bed Availability', sub: 'Category & ward open envelopes' },
    { title: 'Shortage Risk & Spike Alert', sub: 'Automatic threshold surveillance' },
    { title: 'Hospital Admin Action', sub: 'Surge mitigation & transfers' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="kintsugi-section-label flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Model Architecture &amp; Validation</span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-3">
              Prediction Model <span className="kintsugi-gold-word italic">Governance</span>
            </h1>
            <p className="text-[#FFFFFF]/80 text-xs sm:text-sm mt-2 leading-relaxed">
              Transparent validation metrics, feature importance weights, and end-to-end algorithmic
              pipeline governance for Arogya AI&apos;s bed capacity engine.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-[#B0E0E6] bg-[#4682B4]/10 px-3.5 py-1.5 rounded-full border border-[rgba(70, 130, 180,0.3)]">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Demo Prediction Mode with calibrated synthetic validation benchmarks.</span>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Top Benchmark Metrics */}
      <KintsugiStaggerGrid className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <KintsugiStaggerItem className="col-span-2">
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <div className="kintsugi-section-label text-[10px]">Model Status</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B0E0E6]" />
              <span className="text-xl font-bold text-[#FFFFFF] kintsugi-num">{metrics.status}</span>
              <span className="text-[11px] bg-[#B0E0E6]/15 text-[#B0E0E6] px-2 py-0.5 rounded-full border border-[rgba(220, 235, 245,0.3)] font-semibold">
                v{metrics.version.split('-')[0]}
              </span>
            </div>
            <div className="text-[11px] text-[#B0E0E6]/65 mt-1 truncate">
              {metrics.lastUpdated}
            </div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <div className="kintsugi-section-label text-[10px]">Training Horizon</div>
            <div className="text-2xl font-bold text-[#FFFFFF] kintsugi-num mt-2">12 Mos</div>
            <div className="text-[11px] text-[#B0E0E6]/65 mt-1">146k Bed-Days</div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <div className="kintsugi-section-label text-[10px]">MAE</div>
            <div className="text-2xl font-bold text-[#B0E0E6] mt-2">
              <AnimatedNumber value={metrics.mae} decimals={2} />
            </div>
            <div className="text-[11px] text-[#B0E0E6]/65 mt-1">±2.14 beds err</div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <div className="kintsugi-section-label text-[10px]">RMSE</div>
            <div className="text-2xl font-bold text-[#B0E0E6] mt-2">
              <AnimatedNumber value={metrics.rmse} decimals={2} />
            </div>
            <div className="text-[11px] text-[#B0E0E6]/65 mt-1">Root Mean Sq</div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <div className="kintsugi-section-label text-[10px]">MAPE</div>
            <div className="text-2xl font-bold text-[#B0E0E6] mt-2">
              <AnimatedNumber value={metrics.mape} decimals={2} suffix="%" />
            </div>
            <div className="text-[11px] text-[#B0E0E6]/80 mt-1">95.18% Accuracy</div>
          </div>
        </KintsugiStaggerItem>

        <KintsugiStaggerItem>
          <div className="kintsugi-card rounded-2xl p-4 h-full">
            <div className="kintsugi-section-label text-[10px]">R² Coefficient</div>
            <div className="text-2xl font-bold text-[#B0E0E6] mt-2">
              <AnimatedNumber value={metrics.r2Score} decimals={3} />
            </div>
            <div className="text-[11px] text-[#B0E0E6]/80 mt-1">Fit Quality</div>
          </div>
        </KintsugiStaggerItem>
      </KintsugiStaggerGrid>

      {/* Feature Importance & Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 kintsugi-card rounded-3xl p-6 space-y-4">
          <div>
            <span className="kintsugi-section-label text-[10px]">Feature Contribution</span>
            <h2 className="kintsugi-serif text-2xl font-semibold mt-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#B0E0E6]" />
              <span>Predictive Feature Importance</span>
            </h2>
            <p className="text-xs text-[#B0E0E6]/75 mt-1">
              Relative weight assigned by the Gradient Boosted Tree ensemble when projecting bed turnover.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {metrics.featureImportance.map((feat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#FFFFFF]">{feat.feature}</span>
                  <span className="kintsugi-num font-bold text-[#B0E0E6]">
                    {Math.round(feat.importance * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#151F2C] h-2 rounded-full overflow-hidden border border-[rgba(220, 235, 245,0.14)]">
                  <div
                    className="bg-gradient-to-r from-[#B0E0E6] to-[#4682B4] h-full rounded-full transition-all"
                    style={{ width: `${feat.importance * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#B0E0E6]/65">{feat.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 kintsugi-card rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <span className="kintsugi-section-label text-[10px]">Architecture &amp; Extensibility</span>
            <h2 className="kintsugi-serif text-2xl font-semibold mt-1 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-[#B0E0E6]" />
              <span>Multi-Model Forecasting Methodology</span>
            </h2>

            <div className="mt-4 space-y-3 text-xs text-[#FFFFFF]/85 leading-relaxed">
              <p>
                <strong className="text-[#B0E0E6]">Algorithm Selection:</strong> Arogya AI blends
                statistical and gradient-boosted ensembles based on institutional volatility:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#B0E0E6]/80">
                <li><strong className="text-[#FFFFFF]">Poisson Arrival Queueing:</strong> Models non-stationary emergency surges.</li>
                <li><strong className="text-[#FFFFFF]">SARIMAX &amp; Prophet:</strong> Decomposes weekly scheduling cycles and holiday dips.</li>
                <li><strong className="text-[#FFFFFF]">XGBoost / LightGBM:</strong> Captures cross-department inflow and ALOS distributions.</li>
                <li><strong className="text-[#FFFFFF]">LSTM Sequence Models:</strong> Optional neural backend for multi-campus networks.</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-[#151F2C]/85 rounded-2xl border border-[rgba(220, 235, 245,0.18)] text-xs space-y-2">
              <div className="kintsugi-section-label text-[10px] text-[#B0E0E6]">
                FastAPI Integration Endpoint
              </div>
              <pre className="text-[#B0E0E6] kintsugi-num text-[11px] overflow-x-auto leading-relaxed">
{`POST /api/v1/ml/predict_bed_demand
${JSON.stringify({ hospital_id: 'hosp-1', horizon_days: 7, ensemble_weights: [0.4, 0.35, 0.25] }, null, 2)}`}
              </pre>
            </div>
          </div>

          <div className="pt-4 border-t kintsugi-divider">
            <button
              type="button"
              onClick={() => onNavigateTab('hospital-data')}
              className="kintsugi-btn-gold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload New Training Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Prediction Pipeline */}
      <KintsugiReveal delay={0.1}>
        <div className="kintsugi-card rounded-3xl p-6 space-y-4">
          <div>
            <span className="kintsugi-section-label text-[10px]">Pipeline Architecture</span>
            <h2 className="kintsugi-serif text-2xl font-semibold mt-1">
              End-to-End Predictive Bed Management Flow
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5 pt-2">
            {pipelineFlow.map((step, idx) => (
              <div
                key={idx}
                className="bg-[#151F2C]/75 rounded-2xl p-3 border border-[rgba(220, 235, 245,0.16)] text-center flex flex-col justify-between"
              >
                <div>
                  <span className="kintsugi-num text-[10px] font-bold text-[#B0E0E6] uppercase tracking-widest block">
                    0{idx + 1}
                  </span>
                  <div className="font-semibold text-[#FFFFFF] text-[11px] mt-1.5 leading-snug">
                    {step.title}
                  </div>
                </div>
                <div className="text-[10px] text-[#B0E0E6]/65 mt-2">{step.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </KintsugiReveal>
    </div>
  );
};
