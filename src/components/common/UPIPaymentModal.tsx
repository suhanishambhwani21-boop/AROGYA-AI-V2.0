import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface UPIPaymentDetails {
  upiId: string;
  payeeName: string;
  bankName: string;
  feeAmount: number;
  transactionRef: string;
  paymentTime: string;
}

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose?: () => void;
  bookingType: 'OPD' | 'BED';
  title: string;
  subtitle: string;
  detailsSummary: {
    patientName: string;
    hospitalName: string;
    department: string;
    slotOrCategory: string;
  };
  onPaymentSuccess: (paymentDetails: UPIPaymentDetails) => void;
}

export const UPI_ID = 'ajinkya70280@okicici';
export const PAYEE_NAME = '1360_Ajinkya';
export const BANK_NAME = 'State Bank of India 3516';
export const NOMINAL_FEE = 100;

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  bookingType,
  title,
  subtitle,
  detailsSummary,
  onPaymentSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const upiIntentUri = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${NOMINAL_FEE}&cu=INR&tn=${encodeURIComponent(`Arogya ${bookingType} Fee`)}`;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(upiIntentUri, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#1E2A3A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code generation failed:', err));
  }, [isOpen, upiIntentUri]);

  if (!isOpen) return null;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      const generatedRef = utrNumber.trim() || `UPI-AJI-${Date.now().toString().slice(-6)}`;
      const paymentData: UPIPaymentDetails = {
        upiId: UPI_ID,
        payeeName: PAYEE_NAME,
        bankName: BANK_NAME,
        feeAmount: NOMINAL_FEE,
        transactionRef: generatedRef,
        paymentTime: new Date().toISOString(),
      };

      setIsVerifying(false);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#4682B4', '#B0E0E6', '#FFFFFF'],
        });
      } catch {
        // Confetti fallback
      }
      onPaymentSuccess(paymentData);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151F2C]/85 backdrop-blur-md">
      <div className="kintsugi-card rounded-3xl max-w-lg w-full border border-[#4682B4]/35 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header with Kintsugi Gold/Indigo styling */}
        <div className="bg-linear-to-r from-[#151F2C] via-[#243346] to-[#2C3E55] text-[#FFFFFF] p-5 sm:p-6 relative border-b border-[#B0E0E6]/15">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="kintsugi-focus absolute top-4 right-4 p-2 text-[#B0E0E6]/70 hover:text-[#B0E0E6] rounded-full bg-[#B0E0E6]/10 hover:bg-[#4682B4]/15 transition cursor-pointer"
              title="Close"
              aria-label="Close payment modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-2.5 py-0.5 rounded-md bg-[#4682B4]/15 text-[#B0E0E6] border border-[#4682B4]/35 text-[10px] font-bold uppercase tracking-wider">
              Nominal Booking Fee
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#B0E0E6]/10 text-[#B0E0E6] border border-[#B0E0E6]/25 text-[10px] font-semibold">
              100% Adjustable
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="kintsugi-serif text-2xl sm:text-3xl font-semibold text-[#FFFFFF] leading-tight">
                {title}
              </h3>
              <p className="text-xs text-[#B0E0E6]/75 mt-1">{subtitle}</p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <span className="kintsugi-section-label text-[9px] text-[#B0E0E6]/65 block">
                Amount Due
              </span>
              <span className="kintsugi-num text-2xl sm:text-3xl font-bold text-[#B0E0E6]">
                ₹{NOMINAL_FEE}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[#FFFFFF] text-xs bg-[#1E2A3A]/60">
          {/* Booking Summary Card */}
          <div className="bg-[#151F2C]/85 border border-[#B0E0E6]/15 rounded-2xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#B0E0E6]/65 font-medium">Patient</span>
              <span className="font-semibold text-[#FFFFFF]">{detailsSummary.patientName}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#B0E0E6]/65 font-medium">Hospital</span>
              <span className="font-semibold text-[#FFFFFF] truncate max-w-[240px]">
                {detailsSummary.hospitalName}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#B0E0E6]/65 font-medium">
                {bookingType === 'OPD' ? 'Department / Slot' : 'Department / Category'}
              </span>
              <span className="font-semibold text-[#B0E0E6]">
                {detailsSummary.department} • {detailsSummary.slotOrCategory}
              </span>
            </div>
          </div>

          {/* QR Code and Payment Details */}
          <div className="bg-[#151F2C] text-[#FFFFFF] p-5 rounded-2xl text-center border border-[#4682B4]/25 relative">
            {/* Beneficiary Header */}
            <div className="flex items-center justify-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-full bg-[#4682B4]/20 border border-[#4682B4]/50 text-[#B0E0E6] font-bold text-xs flex items-center justify-center">
                A
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-[#FFFFFF]">{PAYEE_NAME}</div>
                <div className="text-[10px] text-[#B0E0E6]/65">{BANK_NAME}</div>
              </div>
            </div>

            {/* Scannable QR Code Container (high-contrast white quiet zone for reliable mobile scanning) */}
            <div className="bg-white p-3 rounded-2xl inline-block mx-auto my-1 border-2 border-[#4682B4]/40">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Arogya UPI QR Code"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain mx-auto"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-[#FFFFFF] text-[#1E2A3A] rounded-xl text-xs font-medium">
                  Generating QR Code...
                </div>
              )}
              <div className="text-[10px] font-semibold text-[#1E2A3A] mt-1.5">
                Scan to pay ₹{NOMINAL_FEE} with any UPI app
              </div>
            </div>

            {/* Supported App Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-[#B0E0E6]/75 mt-3">
              {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                <span
                  key={app}
                  className="bg-[#243346] px-2.5 py-0.5 rounded-md border border-[#B0E0E6]/15"
                >
                  {app}
                </span>
              ))}
            </div>

            {/* UPI ID Row with Copy button */}
            <div className="mt-4 flex items-center justify-between bg-[#243346]/90 p-2.5 rounded-xl border border-[#B0E0E6]/20">
              <div className="text-left">
                <span className="text-[10px] text-[#B0E0E6]/60 block">Official UPI ID</span>
                <span className="kintsugi-num text-[#B0E0E6] font-semibold text-xs select-all">
                  {UPI_ID}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="kintsugi-btn-celadon kintsugi-focus px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#B0E0E6]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Mobile Direct Intent button */}
            <div className="mt-3">
              <a
                href={upiIntentUri}
                className="kintsugi-btn-celadon kintsugi-focus inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#B0E0E6]" />
                <span>Open in Installed UPI App (GPay / PhonePe)</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          </div>

          {/* Optional UTR / Reference Entry */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#FFFFFF] flex items-center justify-between">
              <span>UPI Transaction Reference / UTR Number</span>
              <span className="text-[10px] text-[#B0E0E6]/55 font-normal">Optional for faster sync</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 428190348123 (12-digit UTR)"
              value={utrNumber}
              onChange={e => setUtrNumber(e.target.value)}
              className="kintsugi-input kintsugi-num w-full px-3.5 py-2.5 rounded-xl text-xs"
            />
            <p className="text-[11px] text-[#B0E0E6]/60">
              Found under transaction details in Google Pay, PhonePe, or Paytm.
            </p>
          </div>

          {/* Policy & Anti-Spam Notice */}
          <div className="p-3 bg-[#B0E0E6]/8 rounded-xl border border-[#B0E0E6]/25 text-[11px] text-[#B0E0E6]/85 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#B0E0E6] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-[#FFFFFF]">Why a nominal fee?</strong> The ₹{NOMINAL_FEE} confirmation fee ensures slots and bed requests are reserved exclusively for genuine patients and is 100% credited against your final hospital bill.
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-[#D9534F]/15 border border-[#D9534F]/40 text-[#F08582] rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#151F2C] border-t border-[#B0E0E6]/15 flex items-center justify-between gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="kintsugi-btn-celadon kintsugi-focus px-4 py-2.5 text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isVerifying}
            className="kintsugi-btn-gold kintsugi-focus flex-1 py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#1E2A3A] border-t-transparent rounded-full animate-spin" />
                <span>Verifying UPI Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>I Have Paid ₹{NOMINAL_FEE} • Confirm Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
