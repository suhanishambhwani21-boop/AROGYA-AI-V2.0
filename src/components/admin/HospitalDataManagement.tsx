import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  Database,
  ArrowRight,
  Download,
  RefreshCw,
  Cpu,
  Table,
} from 'lucide-react';
import { MLForecastEngine } from '../../services/mlForecastEngine';
import { KintsugiReveal } from '../common/KintsugiPrimitives';

interface HospitalDataManagementProps {
  onRetrainSuccess: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HospitalDataManagement: React.FC<HospitalDataManagementProps> = ({
  onRetrainSuccess,
  onNavigateTab,
}) => {
  const [pipelineStep, setPipelineStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>(
    'sample_hospital_ehr_12months.csv'
  );
  const [sampleDataRows] = useState<number>(360);
  const [trainComplete, setTrainComplete] = useState<boolean>(false);

  const sampleCsvContent = MLForecastEngine.generateSampleCSV();

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'arogya_historical_hospital_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateUpload = (fileName?: string) => {
    setUploadedFileName(fileName || 'historical_admissions_discharges_2025_2026.csv');
    setPipelineStep(2);
  };

  const handleRunPipeline = async () => {
    setIsProcessing(true);
    setPipelineStep(2);

    setTimeout(() => {
      setPipelineStep(3);
      setTimeout(() => {
        setPipelineStep(4);
        setTimeout(() => {
          setPipelineStep(5);
          setIsProcessing(false);
          setTrainComplete(true);
          onRetrainSuccess();
        }, 1200);
      }, 1000);
    }, 900);
  };

  const pipelineSteps = [
    { num: 1, title: 'Upload Dataset', desc: 'CSV/EHR data ingestion' },
    { num: 2, title: 'Validate Data', desc: 'Schema & null checks' },
    { num: 3, title: 'Analyze Features', desc: 'Decompose ALOS & seasonality' },
    { num: 4, title: 'Train / Update Model', desc: 'Ensemble gradient boosting' },
    { num: 5, title: 'Generate Forecast', desc: 'Deploy active horizons' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="kintsugi-section-label flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Hospital EHR Ingestion &amp; Retraining</span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-3">
              Historical Data <span className="kintsugi-gold-word italic">Pipeline</span>
            </h1>
            <p className="text-[#FFFFFF]/80 text-xs sm:text-sm mt-2 leading-relaxed">
              Upload institutional admissions, discharges, and bed log histories to retrain the
              machine learning forecasting models and refresh continuous demand projections.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="kintsugi-btn-celadon px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#B0E0E6]" />
                <span>Download 12-Month Sample Dataset (.CSV)</span>
              </button>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Visual Pipeline Workflow */}
      <KintsugiReveal delay={0.05}>
        <div className="kintsugi-card rounded-3xl p-6">
          <div className="kintsugi-section-label text-[10px] mb-4">
            Machine Learning Pipeline Workflow
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {pipelineSteps.map(step => {
              const isDone = pipelineStep > step.num || trainComplete;
              const isCurrent = pipelineStep === step.num && !trainComplete;

              return (
                <div
                  key={step.num}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-[#2C3E55] border-[rgba(70, 130, 180,0.55)] shadow-[0_0_20px_rgba(70, 130, 180,0.14)]'
                      : isDone
                      ? 'bg-[#B0E0E6]/10 border-[rgba(220, 235, 245,0.38)]'
                      : 'bg-[#151F2C]/70 border-[rgba(220, 235, 245,0.12)] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`kintsugi-num w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center ${
                        isDone
                          ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                          : isCurrent
                          ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                          : 'bg-[#243346] text-[#B0E0E6]/70'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                    </span>
                    {isCurrent && isProcessing && (
                      <RefreshCw className="w-3.5 h-3.5 text-[#B0E0E6] animate-spin" />
                    )}
                  </div>

                  <div className="font-semibold text-[#FFFFFF] text-xs">{step.title}</div>
                  <div className="text-[11px] text-[#B0E0E6]/70 mt-0.5">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </KintsugiReveal>

      {/* Upload Zone & Dataset Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 kintsugi-card rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="kintsugi-serif text-2xl font-semibold">Upload Historical Dataset</h2>
            <p className="text-xs text-[#B0E0E6]/75 mt-1">
              Supports CSV containing Date, Department, Bed Type, Total Beds, Occupied, Admissions,
              Discharges, Emergency, and ALOS.
            </p>

            <button
              type="button"
              onClick={() => handleSimulateUpload()}
              className="w-full mt-4 border-2 border-dashed border-[rgba(220, 235, 245,0.32)] hover:border-[#4682B4] bg-[#151F2C]/70 hover:bg-[#243346] rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 kintsugi-focus"
            >
              <UploadCloud className="w-10 h-10 text-[#B0E0E6]" />
              <div className="text-xs font-semibold text-[#FFFFFF]">
                Click to attach historical CSV file
              </div>
              <div className="text-[11px] text-[#B0E0E6]/70 kintsugi-num">
                {uploadedFileName
                  ? `Attached: ${uploadedFileName}`
                  : 'sample_hospital_ehr_12months.csv ready'}
              </div>
            </button>

            <div className="mt-4 space-y-2 text-xs text-[#B0E0E6] bg-[#151F2C]/75 p-4 rounded-xl border border-[rgba(220, 235, 245,0.14)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B0E0E6]" />
                <span>Date &amp; Time Series Continuity Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B0E0E6]" />
                <span>Department Schema &amp; ALOS Headers Validated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B0E0E6]" />
                <span>Outlier Imputation Ready (360 Daily Observations)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t kintsugi-divider">
            <button
              type="button"
              onClick={handleRunPipeline}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl kintsugi-btn-gold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing &amp; Retraining Ensemble...</span>
                </>
              ) : trainComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Model Retrained · Run Again</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Run Data Validation &amp; Train Model</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dataset Preview Table */}
        <div className="lg:col-span-7 kintsugi-card rounded-3xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="kintsugi-serif text-2xl font-semibold flex items-center gap-2">
                <Table className="w-5 h-5 text-[#B0E0E6]" />
                <span>Ingested Dataset Preview</span>
              </h2>
              <p className="text-xs text-[#B0E0E6]/75">
                Displaying leading records ({sampleDataRows} total patient-bed days)
              </p>
            </div>
            <span className="kintsugi-num text-xs font-semibold text-[#B0E0E6] bg-[#B0E0E6]/12 px-2.5 py-1 rounded-full border border-[rgba(220, 235, 245,0.3)]">
              Schema: Valid (11 Cols)
            </span>
          </div>

          <div className="overflow-x-auto border border-[rgba(220, 235, 245,0.16)] rounded-xl bg-[#151F2C]/70">
            <table className="w-full text-left text-xs kintsugi-num">
              <thead className="bg-[#243346] text-[#B0E0E6] uppercase text-[10px] tracking-[0.14em]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3 text-center">Occupied</th>
                  <th className="py-2.5 px-3 text-center">Admissions</th>
                  <th className="py-2.5 px-3 text-center">Discharges</th>
                  <th className="py-2.5 px-3 text-center">ALOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(220, 235, 245,0.1)] text-[#FFFFFF]">
                {[
                  ['2026-09-28', 'General Ward', 250, 208, '+26', '-24', '4.2d'],
                  ['2026-09-28', 'ICU / Critical Care', 80, 69, '+14', '-11', '6.8d'],
                  ['2026-09-29', 'Emergency Trauma', 40, 29, '+24', '-22', '1.5d'],
                  ['2026-09-30', 'Cardiology CCU', 35, 31, '+6', '-4', '5.1d'],
                  ['2026-10-01', 'Pediatrics & NICU', 50, 37, '+7', '-8', '3.4d'],
                ].map(([date, dept, tot, occ, adm, dis, alos], i) => (
                  <tr key={i} className="hover:bg-[#243346]/60 transition-colors">
                    <td className="py-2.5 px-3 text-[#FFFFFF]">{date}</td>
                    <td className="py-2.5 px-3 font-sans">{dept}</td>
                    <td className="py-2.5 px-3 text-center">{tot}</td>
                    <td className="py-2.5 px-3 text-center text-[#B0E0E6] font-semibold">{occ}</td>
                    <td className="py-2.5 px-3 text-center text-[#F08582]">{adm}</td>
                    <td className="py-2.5 px-3 text-center text-[#B0E0E6]">{dis}</td>
                    <td className="py-2.5 px-3 text-center">{alos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => onNavigateTab('ml-model')}
              className="text-xs text-[#B0E0E6] hover:text-[#B0E0E6] font-semibold inline-flex items-center gap-1 cursor-pointer kintsugi-focus rounded-md"
            >
              <span>View Prediction Model Metrics &amp; Evaluation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
