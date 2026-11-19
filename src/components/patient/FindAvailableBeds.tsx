import React, { useState } from 'react';
import {
  Search,
  Bed,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Hospital, BedRequest } from '../../types';
import {
  UPIPaymentModal,
  UPIPaymentDetails,
  NOMINAL_FEE,
  UPI_ID,
} from '../common/UPIPaymentModal';
import {
  AnimatedNumber,
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';

interface FindAvailableBedsProps {
  hospitals: Hospital[];
  onRequestBed: (
    request: Omit<BedRequest, 'id' | 'status' | 'submittedAt' | 'updatedAt'>
  ) => void;
  onEmergencyClick: () => void;
}

export const FindAvailableBeds: React.FC<FindAvailableBedsProps> = ({
  hospitals,
  onRequestBed,
  onEmergencyClick,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBedType, setSelectedBedType] = useState<string>('ALL');
  const [selectedHospitalForModal, setSelectedHospitalForModal] =
    useState<Hospital | null>(null);
  const [directionsBanner, setDirectionsBanner] = useState<string | null>(null);

  // Form state
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [contactNumber, setContactNumber] = useState('');
  const [attendantName, setAttendantName] = useState('');
  const [department, setDepartment] = useState('General Ward');
  const [bedCategory, setBedCategory] = useState('General');
  const [urgency, setUrgency] = useState<
    'ELECTIVE' | 'URGENT' | 'CRITICAL_EMERGENCY'
  >('URGENT');
  const [reason, setReason] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastPaymentRef, setLastPaymentRef] = useState('');

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedBedType === 'ALL') return true;
    const cat = h.bedCategories.find(c => c.name === selectedBedType);
    return cat ? cat.available > 0 : true;
  });

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospitalForModal || !patientName || !contactNumber) return;
    setShowPaymentModal(true);
  };

  const handlePaymentCompleted = (paymentDetails: UPIPaymentDetails) => {
    setShowPaymentModal(false);
    if (!selectedHospitalForModal) return;

    setLastPaymentRef(paymentDetails.transactionRef);

    onRequestBed({
      patientName,
      patientAge: Number(patientAge) || 35,
      patientGender,
      contactNumber,
      attendantName: attendantName || patientName,
      hospitalId: selectedHospitalForModal.id,
      hospitalName: selectedHospitalForModal.name,
      department,
      bedCategory,
      urgency,
      reason: reason || 'Bed request submitted via Patient Portal',
      feeAmount: paymentDetails.feeAmount,
      paymentStatus: 'PAID',
      upiId: paymentDetails.upiId,
      transactionRef: paymentDetails.transactionRef,
      paymentTime: paymentDetails.paymentTime,
    });

    setSelectedHospitalForModal(null);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);

    setPatientName('');
    setContactNumber('');
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div
          role="status"
          className="fixed top-20 right-6 z-50 bg-[#243346] text-[#FFFFFF] px-5 py-4 rounded-2xl shadow-2xl border border-[rgba(70, 130, 180,0.5)] flex items-center gap-3 text-xs max-w-md"
        >
          <CheckCircle2 className="w-6 h-6 text-[#B0E0E6] shrink-0" />
          <div>
            <div className="font-bold text-sm text-[#B0E0E6]">
              Bed Request &amp; ₹{NOMINAL_FEE} Payment Confirmed
            </div>
            <div className="text-[#B0E0E6] mt-0.5">
              Paid via UPI ({UPI_ID}) · Ref: {lastPaymentRef || 'CONFIRMED'}. Triage team alerted.
            </div>
          </div>
        </div>
      )}

      {/* Directions Notice Banner */}
      {directionsBanner && (
        <div className="kintsugi-card rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs border border-[rgba(70, 130, 180,0.4)]">
          <div className="flex items-center gap-2 text-[#FFFFFF]">
            <Navigation className="w-4 h-4 text-[#B0E0E6] shrink-0" />
            <span>
              <strong className="text-[#B0E0E6]">Route Address:</strong> {directionsBanner}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDirectionsBanner(null)}
            className="text-[#B0E0E6] hover:text-[#FFFFFF] cursor-pointer p-1"
            aria-label="Close directions notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="kintsugi-section-label flex items-center gap-2">
              <Bed className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Real-Time Bed Finder</span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-3">
              Find Available <span className="kintsugi-gold-word italic">Beds</span>
            </h1>
            <p className="text-[#FFFFFF]/80 text-xs sm:text-sm mt-2 leading-relaxed">
              Search verified bed availability across network hospitals and submit instant
              admission requests directly to hospital triage desks.
            </p>

            <div className="mt-4 p-3.5 bg-[#D9534F]/12 rounded-2xl border border-[rgba(217, 83, 79,0.4)] text-xs text-[#FFFFFF] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1">
                <AlertTriangle className="w-4 h-4 text-[#F08582] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#F08582]">Important Notice:</strong> Bed availability
                  shifts rapidly during emergency inflows. Final admission is confirmed upon
                  physical hospital triage.
                </span>
              </div>
              <button
                type="button"
                onClick={onEmergencyClick}
                className="kintsugi-btn-gold px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider cursor-pointer shrink-0"
              >
                Emergency Triage
              </button>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Search & Filter Toolbar */}
      <div className="kintsugi-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#B0E0E6]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search hospitals by name, area, or city"
            placeholder="Search by hospital name, area, or locality..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="kintsugi-input w-full pl-10 pr-4 py-2 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            aria-label="Filter by bed category"
            value={selectedBedType}
            onChange={e => setSelectedBedType(e.target.value)}
            className="kintsugi-input rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">All Bed Types</option>
            <option value="ICU">ICU Beds Available</option>
            <option value="General">General Beds Available</option>
            <option value="Emergency">Emergency Beds Available</option>
          </select>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <KintsugiStaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHospitals.map(hosp => {
          const icuBeds = hosp.bedCategories.find(c => c.name === 'ICU')?.available ?? 4;
          const genBeds = hosp.bedCategories.find(c => c.name === 'General')?.available ?? 25;
          const erBeds = hosp.bedCategories.find(c => c.name === 'Emergency')?.available ?? 7;

          return (
            <KintsugiStaggerItem key={hosp.id}>
              <div className="kintsugi-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="kintsugi-section-label text-[10px]">
                        Verified Network Node
                      </span>
                      <h2 className="kintsugi-serif text-xl font-semibold mt-1">
                        {hosp.name}
                      </h2>
                      <p className="text-xs text-[#B0E0E6]/75 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#B0E0E6] shrink-0" />
                        <span>{hosp.city}</span>
                      </p>
                    </div>
                    <span className="kintsugi-num text-xs font-bold text-[#B0E0E6] bg-[#4682B4]/12 px-2.5 py-0.5 rounded-full border border-[rgba(70, 130, 180,0.35)] shrink-0">
                      ★ {hosp.rating}
                    </span>
                  </div>

                  {/* Bed Breakdown */}
                  <div className="mt-4 bg-[#151F2C]/75 rounded-2xl p-4 border border-[rgba(220, 235, 245,0.14)] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[rgba(220, 235, 245,0.12)]">
                      <span className="text-[#B0E0E6]">ICU / Critical Care</span>
                      <span
                        className={`kintsugi-num font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${
                          icuBeds <= 3
                            ? 'bg-[#D9534F]/18 text-[#F08582] border-[rgba(217, 83, 79,0.45)]'
                            : 'bg-[#B0E0E6]/12 text-[#B0E0E6] border-[rgba(220, 235, 245,0.3)]'
                        }`}
                      >
                        <AnimatedNumber value={icuBeds} suffix=" open" />
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-[rgba(220, 235, 245,0.12)]">
                      <span className="text-[#B0E0E6]">General Ward</span>
                      <span className="kintsugi-num font-bold text-[#B0E0E6] bg-[#B0E0E6]/12 px-2.5 py-0.5 rounded-full text-[11px] border border-[rgba(220, 235, 245,0.3)]">
                        <AnimatedNumber value={genBeds} suffix=" open" />
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#B0E0E6]">Emergency Trauma</span>
                      <span className="kintsugi-num font-bold text-[#B0E0E6] bg-[#4682B4]/12 px-2.5 py-0.5 rounded-full text-[11px] border border-[rgba(70, 130, 180,0.35)]">
                        <AnimatedNumber value={erBeds} suffix=" open" />
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#B0E0E6]/70">
                    <span>Recently updated</span>
                    <span className="kintsugi-num">{hosp.phone}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t kintsugi-divider flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedHospitalForModal(hosp)}
                    className="flex-1 py-2.5 rounded-xl kintsugi-btn-gold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bed className="w-4 h-4" />
                    <span>Request Bed</span>
                  </button>

                  <a
                    href={`tel:${hosp.phone}`}
                    className="p-2.5 rounded-xl kintsugi-btn-celadon cursor-pointer"
                    title="Call Hospital Helpline"
                    aria-label={`Call ${hosp.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setDirectionsBanner(`${hosp.name} — ${hosp.address}`)}
                    className="px-3 py-2.5 rounded-xl kintsugi-btn-celadon text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route</span>
                  </button>
                </div>
              </div>
            </KintsugiStaggerItem>
          );
        })}
      </KintsugiStaggerGrid>

      {/* Bed Request Modal */}
      {selectedHospitalForModal && (
        <div className="fixed inset-0 z-50 bg-[#151F2C]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="kintsugi-card rounded-3xl max-w-lg w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="kintsugi-section-label text-[10px]">
                  Direct Admission Request
                </span>
                <h3 className="kintsugi-serif text-2xl font-semibold mt-1">
                  {selectedHospitalForModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHospitalForModal(null)}
                className="p-1.5 rounded-lg text-[#B0E0E6] hover:text-[#B0E0E6] cursor-pointer kintsugi-focus"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="kintsugi-section-label text-[10px] block mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="kintsugi-section-label text-[10px] block mb-1">
                    Age &amp; Gender
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Age"
                      value={patientAge}
                      onChange={e => setPatientAge(e.target.value)}
                      className="kintsugi-input w-20 px-3 py-2 rounded-xl text-xs"
                    />
                    <select
                      value={patientGender}
                      onChange={e => setPatientGender(e.target.value as any)}
                      className="kintsugi-input flex-1 px-3 py-2 rounded-xl text-xs"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="kintsugi-section-label text-[10px] block mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="kintsugi-section-label text-[10px] block mb-1">
                    Attendant / Relation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amit (Son)"
                    value={attendantName}
                    onChange={e => setAttendantName(e.target.value)}
                    className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="kintsugi-section-label text-[10px] block mb-1">
                    Bed Category
                  </label>
                  <select
                    value={bedCategory}
                    onChange={e => {
                      setBedCategory(e.target.value);
                      setDepartment(`${e.target.value} Wing`);
                    }}
                    className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                  >
                    <option value="General">General Ward</option>
                    <option value="ICU">ICU / Critical Care</option>
                    <option value="Emergency">Emergency Triage</option>
                    <option value="Pediatric">Pediatric Ward</option>
                    <option value="Private">Private Suite</option>
                  </select>
                </div>
                <div>
                  <label className="kintsugi-section-label text-[10px] block mb-1">
                    Clinical Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as any)}
                    className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
                  >
                    <option value="ELECTIVE">Elective / Scheduled</option>
                    <option value="URGENT">Urgent (Within 4 Hours)</option>
                    <option value="CRITICAL_EMERGENCY">Critical Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="kintsugi-section-label text-[10px] block mb-1">
                  Reason for Admission / Symptoms
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe primary symptoms or referral note..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="p-3.5 bg-[#151F2C]/80 rounded-2xl border border-[rgba(70, 130, 180,0.28)] text-[11px] text-[#FFFFFF]/85 space-y-1">
                <div className="font-semibold flex items-center justify-between text-[#B0E0E6]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Nominal Reservation Deposit</span>
                  </span>
                  <span className="kintsugi-num font-bold">₹{NOMINAL_FEE} via UPI</span>
                </div>
                <p className="text-[#B0E0E6]/75 leading-relaxed">
                  Paid to <strong>{UPI_ID}</strong> and 100% credited toward your admission bill.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedHospitalForModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#B0E0E6] hover:text-[#FFFFFF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl kintsugi-btn-gold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Proceed to Pay ₹{NOMINAL_FEE}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedHospitalForModal && (
        <UPIPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bookingType="BED"
          title="Confirm Bed Admission Request"
          subtitle="Pay nominal confirmation fee via UPI to initiate bed triage"
          detailsSummary={{
            patientName: patientName || 'Patient',
            hospitalName: selectedHospitalForModal.name,
            department,
            slotOrCategory: `${bedCategory} Ward (${urgency.replace('_', ' ')})`,
          }}
          onPaymentSuccess={handlePaymentCompleted}
        />
      )}
    </div>
  );
};
