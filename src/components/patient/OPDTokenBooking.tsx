import React, { useState } from 'react';
import {
  Ticket,
  QrCode,
  CheckCircle2,
  Printer,
  Info,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Hospital, Doctor, OPDToken } from '../../types';
import {
  UPIPaymentModal,
  UPIPaymentDetails,
  NOMINAL_FEE,
  UPI_ID,
} from '../common/UPIPaymentModal';
import { KintsugiReveal } from '../common/KintsugiPrimitives';

interface OPDTokenBookingProps {
  hospitals: Hospital[];
  doctors: Doctor[];
  onBookToken: (tokenData: any) => Promise<OPDToken>;
  onNavigateTab: (tab: string) => void;
}

export const OPDTokenBooking: React.FC<OPDTokenBookingProps> = ({
  hospitals,
  doctors,
  onBookToken,
  onNavigateTab,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    hospitals[0]?.id || 'hosp-1'
  );
  const [selectedDepartment, setSelectedDepartment] =
    useState<string>('Cardiology & CCU');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctors[0]?.id || 'doc-1'
  );
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-03');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    '11:00 AM - 11:30 AM'
  );

  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [symptomsInput, setSymptomsInput] = useState<string>('');

  const [generatedToken, setGeneratedToken] = useState<OPDToken | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const selectedHospital =
    hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  const filteredDoctors = doctors.filter(
    d => d.hospitalId === selectedHospitalId || selectedHospitalId === 'hosp-1'
  );
  const selectedDoctor =
    doctors.find(d => d.id === selectedDoctorId) ||
    filteredDoctors[0] ||
    doctors[0];

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;
    setShowPaymentModal(true);
  };

  const handlePaymentCompleted = async (paymentDetails: UPIPaymentDetails) => {
    setShowPaymentModal(false);
    setIsSubmitting(true);

    const symptomsList = symptomsInput
      ? symptomsInput
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : ['General Consultation'];

    const tokenPayload = {
      patientName,
      patientAge: Number(patientAge) || 32,
      patientGender,
      patientPhone,
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      department: selectedDepartment,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      reasonForVisit: reasonForVisit || 'Routine Clinical Follow-up',
      symptoms: symptomsList,
      priority: 'REGULAR',
      feeAmount: paymentDetails.feeAmount,
      paymentStatus: 'PAID',
      upiId: paymentDetails.upiId,
      transactionRef: paymentDetails.transactionRef,
      paymentTime: paymentDetails.paymentTime,
    };

    try {
      const created = await onBookToken(tokenPayload);
      setGeneratedToken(created);
      setStep(4);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="kintsugi-section-label flex items-center gap-2">
              <Ticket className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Digital Outpatient Queue</span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-3">
              Book OPD <span className="kintsugi-gold-word italic">Token</span>
            </h1>
            <p className="text-[#FFFFFF]/80 text-xs sm:text-sm mt-2 leading-relaxed">
              Reserve your consultation slot with hospital specialists, track live queue wait
              times, and receive a verified digital token pass.
            </p>

            <div className="mt-4 p-3 bg-[#151F2C]/75 rounded-2xl border border-[rgba(220, 235, 245,0.18)] text-xs text-[#B0E0E6] flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[#B0E0E6] shrink-0" />
              <span>
                Arogya AI facilitates queue scheduling and symptom organization, not medical diagnosis.
              </span>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Step Wizard Bar */}
      {!generatedToken && (
        <div className="kintsugi-card rounded-2xl p-4 flex items-center justify-between text-xs font-semibold">
          {[
            { num: 1, label: 'Hospital & Dept' },
            { num: 2, label: 'Doctor & Time' },
            { num: 3, label: 'Patient & Symptoms' },
          ].map((item, idx) => (
            <React.Fragment key={item.num}>
              <button
                type="button"
                onClick={() => setStep(item.num)}
                className={`flex items-center gap-2 cursor-pointer kintsugi-focus rounded-lg px-2 py-1 ${
                  step >= item.num ? 'text-[#B0E0E6]' : 'text-[#B0E0E6]/50'
                }`}
              >
                <span
                  className={`kintsugi-num w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= item.num
                      ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                      : 'bg-[#151F2C] text-[#B0E0E6]/60 border border-[rgba(220, 235, 245,0.2)]'
                  }`}
                >
                  {item.num}
                </span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
              {idx < 2 && <span className="text-[#B0E0E6]/30">→</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && !generatedToken && (
        <div className="kintsugi-card rounded-3xl p-6 sm:p-7 space-y-5">
          <div>
            <h2 className="kintsugi-serif text-2xl font-semibold">
              Step 1 · Choose Hospital &amp; Department
            </h2>
            <p className="text-xs text-[#B0E0E6]/75 mt-0.5">
              Select your preferred healthcare facility and clinical specialty.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="kintsugi-section-label text-[10px] block mb-2">
                Select Hospital
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hospitals.map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHospitalId(h.id)}
                    className={`text-left p-4 rounded-2xl border cursor-pointer transition kintsugi-focus ${
                      selectedHospitalId === h.id
                        ? 'bg-[#2C3E55] border-[rgba(70, 130, 180,0.55)] shadow-[0_0_20px_rgba(70, 130, 180,0.12)]'
                        : 'bg-[#151F2C]/75 hover:bg-[#243346] border-[rgba(220, 235, 245,0.16)]'
                    }`}
                  >
                    <div className="font-semibold text-[#FFFFFF] text-xs">{h.name}</div>
                    <div className="text-[11px] text-[#B0E0E6]/70 mt-0.5">{h.city}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="kintsugi-section-label text-[10px] block mb-2">
                Select Clinical Department
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'General Medicine',
                  'Cardiology & CCU',
                  'Pediatrics & NICU',
                  'Orthopedics & Spine',
                  'ICU / Critical Care',
                  'General Surgery',
                  'Pulmonology',
                  'Emergency & Trauma',
                ].map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDepartment(dept)}
                    className={`p-3 rounded-xl text-xs font-semibold border text-left transition cursor-pointer kintsugi-focus ${
                      selectedDepartment === dept
                        ? 'bg-[#B0E0E6] text-[#1E2A3A] border-[#B0E0E6]'
                        : 'bg-[#151F2C]/75 hover:bg-[#243346] text-[#B0E0E6] border-[rgba(220, 235, 245,0.16)]'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t kintsugi-divider flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl kintsugi-btn-gold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Select Doctor</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && !generatedToken && (
        <div className="kintsugi-card rounded-3xl p-6 sm:p-7 space-y-5">
          <div>
            <h2 className="kintsugi-serif text-2xl font-semibold">
              Step 2 · Doctor &amp; Appointment Slot
            </h2>
            <p className="text-xs text-[#B0E0E6]/75 mt-0.5">
              Choose an available specialist and consultation window.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredDoctors.map(doc => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`text-left p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 kintsugi-focus ${
                    selectedDoctorId === doc.id
                      ? 'bg-[#2C3E55] border-[rgba(70, 130, 180,0.55)]'
                      : 'bg-[#151F2C]/75 hover:bg-[#243346] border-[rgba(220, 235, 245,0.16)]'
                  }`}
                >
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[rgba(220, 235, 245,0.25)] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#FFFFFF] text-xs truncate">
                      {doc.name}
                    </div>
                    <div className="text-[11px] text-[#B0E0E6] font-medium truncate">
                      {doc.specialization}
                    </div>
                    <div className="text-[10px] text-[#B0E0E6]/75 mt-1 kintsugi-num">
                      {doc.experienceYears}y exp · ₹{doc.fee} · {doc.availableTime}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="kintsugi-section-label text-[10px] block mb-1.5">
                  Consultation Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="kintsugi-section-label text-[10px] block mb-1.5">
                  Time Slot
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={e => setSelectedTimeSlot(e.target.value)}
                  className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  <option>09:30 AM - 10:00 AM</option>
                  <option>10:30 AM - 11:00 AM</option>
                  <option>11:00 AM - 11:30 AM</option>
                  <option>12:00 PM - 12:30 PM</option>
                  <option>02:00 PM - 02:30 PM</option>
                  <option>03:30 PM - 04:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t kintsugi-divider flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="kintsugi-btn-celadon px-4 py-2 text-xs rounded-xl cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl kintsugi-btn-gold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Patient Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && !generatedToken && (
        <form onSubmit={handleOpenPayment} className="kintsugi-card rounded-3xl p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b kintsugi-divider pb-4">
            <div>
              <h2 className="kintsugi-serif text-2xl font-semibold">
                Step 3 · Patient Info &amp; Symptoms
              </h2>
              <p className="text-xs text-[#B0E0E6]/75 mt-0.5">
                Provide patient details and reason for consultation to prepare the OPD desk.
              </p>
            </div>
            <div className="bg-[#151F2C] border border-[rgba(70, 130, 180,0.4)] rounded-2xl px-4 py-2 text-right">
              <span className="text-[10px] text-[#B0E0E6] uppercase tracking-wider block">
                Confirmation Deposit
              </span>
              <span className="kintsugi-num text-lg font-bold text-[#B0E0E6]">₹{NOMINAL_FEE}</span>
              <span className="text-[10px] text-[#B0E0E6]/70 block">100% Adjusted</span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="kintsugi-section-label text-[10px] block mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suhani Shambwani"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="kintsugi-section-label text-[10px] block mb-1">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98XXX XXXXX"
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="kintsugi-section-label text-[10px] block mb-1">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={patientAge}
                  onChange={e => setPatientAge(e.target.value)}
                  className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="kintsugi-section-label text-[10px] block mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={e => setPatientGender(e.target.value as any)}
                  className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="kintsugi-section-label text-[10px] block mb-1">
                Reason for Visit *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Describe symptoms, existing condition, or follow-up reason..."
                value={reasonForVisit}
                onChange={e => setReasonForVisit(e.target.value)}
                className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="kintsugi-section-label text-[10px] block mb-1">
                Specific Symptoms (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Mild headache, fever for 3 days, throat pain"
                value={symptomsInput}
                onChange={e => setSymptomsInput(e.target.value)}
                className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div className="p-3.5 bg-[#151F2C]/75 rounded-2xl border border-[rgba(220, 235, 245,0.2)] text-[11px] text-[#B0E0E6] space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-[#B0E0E6]">
                <ShieldCheck className="w-4 h-4" />
                <span>Nominal ₹{NOMINAL_FEE} UPI Confirmation Policy</span>
              </div>
              <p className="leading-relaxed">
                Paid via UPI to <strong>{UPI_ID}</strong> and credited toward{' '}
                <strong>{selectedDoctor.name}</strong>&apos;s fee (₹{selectedDoctor.fee}), leaving
                only <strong>₹{Math.max(0, selectedDoctor.fee - NOMINAL_FEE)}</strong> payable on arrival.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t kintsugi-divider flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="kintsugi-btn-celadon px-4 py-2 text-xs rounded-xl cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl kintsugi-btn-gold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Proceed to Pay ₹{NOMINAL_FEE} &amp; Confirm</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Digital Pass */}
      {generatedToken && (
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#B0E0E6]/15 text-[#B0E0E6] border border-[rgba(70, 130, 180,0.4)] mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="kintsugi-serif text-3xl font-semibold">
              Digital OPD Token Confirmed
            </h2>
            <p className="text-xs text-[#B0E0E6]/75 mt-1">
              Present this pass at the hospital OPD registration desk or scan the QR hash.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-[#151F2C] rounded-3xl p-6 border border-[rgba(70, 130, 180,0.45)] shadow-[0_16px_44px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between border-b kintsugi-divider pb-4">
              <div>
                <span className="kintsugi-section-label text-[10px]">
                  Arogya AI · OPD Pass
                </span>
                <div className="text-base font-semibold text-[#FFFFFF] mt-1">
                  {generatedToken.hospitalName}
                </div>
                <div className="text-xs text-[#B0E0E6]/75">{generatedToken.department}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#B0E0E6]/65 block">Token</span>
                <span className="kintsugi-num text-3xl font-bold text-[#B0E0E6]">
                  {generatedToken.tokenNumber}
                </span>
              </div>
            </div>

            <div className="my-5 grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-[#B0E0E6]">
              <div>
                <span className="text-[10px] text-[#B0E0E6]/60 block">Patient</span>
                <strong className="text-[#FFFFFF] text-sm">{generatedToken.patientName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#B0E0E6]/60 block">Doctor</span>
                <strong className="text-[#FFFFFF] text-sm">{generatedToken.doctorName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#B0E0E6]/60 block">Date &amp; Slot</span>
                <strong className="text-[#FFFFFF]">
                  {generatedToken.date} · {generatedToken.timeSlot}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-[#B0E0E6]/60 block">Queue Position</span>
                <strong className="text-[#B0E0E6] kintsugi-num">
                  #{generatedToken.queuePosition} (~{generatedToken.estimatedWaitMins}m)
                </strong>
              </div>
            </div>

            <div className="bg-[#B0E0E6]/10 border border-[rgba(220, 235, 245,0.3)] rounded-2xl p-3 my-4 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#B0E0E6]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B0E0E6]" />
                  <span>Fee Verified: ₹{generatedToken.feeAmount || NOMINAL_FEE} Paid</span>
                </span>
                <span className="kintsugi-num text-[10px] text-[#B0E0E6]">
                  Ref: {generatedToken.transactionRef || 'UPI-CONFIRMED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#B0E0E6]/75 pt-1 border-t border-[rgba(220, 235, 245,0.15)]">
                <span>UPI: {generatedToken.upiId || UPI_ID}</span>
                <span>Adjusted in invoice</span>
              </div>
            </div>

            <div className="pt-4 border-t kintsugi-divider flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-[#B0E0E6]/60 block">Verification Hash</span>
                <span className="text-[10px] kintsugi-num text-[#B0E0E6]">
                  {generatedToken.qrCodeHash.slice(0, 22)}...
                </span>
                <div className="text-[10px] text-[#B0E0E6] font-medium">
                  Status: ACTIVE (Waiting)
                </div>
              </div>

              <div className="w-16 h-16 bg-[#FFFFFF] p-1.5 rounded-xl flex items-center justify-center shrink-0">
                <QrCode className="w-full h-full text-[#1E2A3A]" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="kintsugi-btn-gold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Token Pass</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setGeneratedToken(null);
                setStep(1);
              }}
              className="kintsugi-btn-celadon px-4 py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Book Another Token
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('my-bookings')}
              className="kintsugi-btn-celadon px-4 py-2.5 rounded-xl text-xs cursor-pointer"
            >
              View in My Bookings
            </button>
          </div>
        </div>
      )}

      <UPIPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingType="OPD"
        title="Confirm OPD Token Booking"
        subtitle="Pay nominal confirmation fee to reserve your consultation slot"
        detailsSummary={{
          patientName,
          hospitalName: selectedHospital.name,
          department: selectedDepartment,
          slotOrCategory: `${selectedDoctor.name} · ${selectedTimeSlot}`,
        }}
        onPaymentSuccess={handlePaymentCompleted}
      />
    </div>
  );
};
