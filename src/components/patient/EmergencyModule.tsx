import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Ambulance,
  Info,
} from 'lucide-react';
import { Hospital, EmergencySOSRequest } from '../../types';
import { KintsugiReveal } from '../common/KintsugiPrimitives';

interface EmergencyModuleProps {
  hospitals: Hospital[];
  onTriggerSOS: (sosData: any) => Promise<EmergencySOSRequest>;
}

export const EmergencyModule: React.FC<EmergencyModuleProps> = ({
  hospitals,
  onTriggerSOS,
}) => {
  const [patientName, setPatientName] = useState<string>('');
  const [age] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [location, setLocation] = useState<string>('Live GPS Location (Sector 4, West Bypass)');
  const [emergencyType, setEmergencyType] = useState<
    | 'Accident'
    | 'Breathing difficulty'
    | 'Chest pain'
    | 'Severe bleeding'
    | 'Unconsciousness'
    | 'Other'
  >('Chest pain');
  const [symptoms, setSymptoms] = useState<string>('');
  const [preferredHospitalId, setPreferredHospitalId] = useState<string>(
    hospitals[0]?.id || 'hosp-1'
  );

  const [activeSOS, setActiveSOS] = useState<EmergencySOSRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const emergencyCategories = [
    { type: 'Chest pain', code: 'CARDIAC' },
    { type: 'Breathing difficulty', code: 'RESPIRATORY' },
    { type: 'Accident', code: 'TRAUMA' },
    { type: 'Severe bleeding', code: 'HEMORRHAGE' },
    { type: 'Unconsciousness', code: 'NEURO' },
    { type: 'Other', code: 'GENERAL ER' },
  ] as const;

  const handleSOSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const prefHosp = hospitals.find(h => h.id === preferredHospitalId);

    try {
      const sos = await onTriggerSOS({
        patientName: patientName || 'Emergency Patient',
        age: Number(age) || 45,
        contactNumber: contactNumber || '+91 99999 99999',
        location,
        emergencyType,
        symptoms: symptoms || 'Urgent emergency triage triggered via SOS',
        preferredHospitalId,
        preferredHospitalName: prefHosp?.name || 'Arogya Central Hospital',
      });
      setActiveSOS(sos);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Alert Header */}
      <KintsugiReveal>
        <div className="kintsugi-card kintsugi-card-critical rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9534F]/20 text-[#F08582] border border-[rgba(217, 83, 79,0.5)] text-[10px] font-bold uppercase tracking-[0.18em] mb-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Emergency Triage &amp; Ambulance Dispatch</span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase">
              Immediate <span className="kintsugi-gold-word italic">Triage</span>
            </h1>
            <p className="text-[#FFFFFF]/85 text-xs sm:text-sm mt-2 leading-relaxed">
              For life-threatening emergencies, dial national emergency services immediately. Arogya AI
              simultaneously notifies nearest trauma teams to hold ER resuscitation bays.
            </p>

            {/* National Emergency Helplines */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="tel:108"
                className="kintsugi-btn-gold p-3.5 rounded-2xl text-xs text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>DIAL 108 (Ambulance)</span>
              </a>
              <a
                href="tel:112"
                className="kintsugi-btn-celadon p-3.5 rounded-2xl text-xs text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#B0E0E6]" />
                <span>DIAL 112 (Emergency)</span>
              </a>
              <a
                href="tel:911"
                className="kintsugi-btn-celadon p-3.5 rounded-2xl text-xs text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Universal 911</span>
              </a>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Regulatory Disclaimer */}
      <div className="kintsugi-card rounded-2xl p-4 text-xs text-[#FFFFFF]/80 flex items-start gap-3 border border-[rgba(70, 130, 180,0.28)]">
        <Info className="w-5 h-5 text-[#B0E0E6] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#B0E0E6]">Mandatory Safety Notice:</strong> Arogya AI
          coordinates trauma bed readiness and does not replace municipal emergency services or
          guarantee admission. For unconscious or critical patients, dial 108/112 first.
        </div>
      </div>

      {/* Active SOS Tracker */}
      {activeSOS && (
        <div className="kintsugi-card kintsugi-card-critical rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b kintsugi-divider pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D9534F]/20 text-[#F08582] border border-[rgba(217, 83, 79,0.5)] text-[10px] font-bold uppercase tracking-wider">
                ACTIVE AMBULANCE DISPATCH
              </span>
              <h2 className="kintsugi-serif text-2xl font-semibold mt-1.5">
                Emergency Unit #{activeSOS.ambulanceUnit} En Route
              </h2>
              <p className="text-xs text-[#B0E0E6]/75">
                Paramedics linked with {activeSOS.preferredHospitalName} Trauma Bay
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#B0E0E6]/65 block uppercase tracking-wider">
                Estimated Arrival
              </span>
              <span className="kintsugi-num text-3xl font-bold text-[#B0E0E6]">
                ~{activeSOS.etaMinutes} Mins
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#151F2C]/75 p-4 rounded-2xl border border-[rgba(220, 235, 245,0.15)]">
            <div>
              <span className="text-[10px] text-[#B0E0E6]/65 block">Patient Name</span>
              <strong className="text-[#FFFFFF] text-sm">
                {activeSOS.patientName} ({activeSOS.age}y)
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-[#B0E0E6]/65 block">Emergency Type</span>
              <strong className="text-[#F08582] text-sm">{activeSOS.emergencyType}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#B0E0E6]/65 block">Paramedic Direct</span>
              <a
                href={`tel:${activeSOS.paramedicContact}`}
                className="text-[#B0E0E6] kintsugi-num font-bold hover:underline"
              >
                {activeSOS.paramedicContact}
              </a>
            </div>
          </div>

          <div className="p-3.5 bg-[#D9534F]/12 rounded-xl border border-[rgba(217, 83, 79,0.35)] text-xs text-[#FFFFFF]">
            <strong className="text-[#F08582]">Trauma Bay Preparation:</strong> 2 resuscitation
            bays and 1 ICU standby bed flagged at {activeSOS.preferredHospitalName}.
          </div>
        </div>
      )}

      {/* Triage Submission Form */}
      {!activeSOS && (
        <form onSubmit={handleSOSSubmit} className="kintsugi-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="kintsugi-serif text-2xl font-semibold">
              Emergency Triage &amp; Bed Hold Form
            </h2>
            <p className="text-xs text-[#B0E0E6]/75 mt-0.5">
              Transmit urgent patient vitals and category to alert hospital trauma reception.
            </p>
          </div>

          <div>
            <span className="kintsugi-section-label text-[10px] block mb-2.5">
              Select Emergency Category *
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {emergencyCategories.map(cat => (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => setEmergencyType(cat.type)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition text-left flex flex-col gap-1 kintsugi-focus ${
                    emergencyType === cat.type
                      ? 'bg-[#D9534F]/18 border-[rgba(217, 83, 79,0.65)] text-[#F08582]'
                      : 'bg-[#151F2C]/75 hover:bg-[#243346] border-[rgba(220, 235, 245,0.16)] text-[#FFFFFF]'
                  }`}
                >
                  <span className="text-[9px] font-bold tracking-[0.18em] text-[#B0E0E6]">
                    {cat.code}
                  </span>
                  <span className="text-xs font-semibold">{cat.type}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="kintsugi-section-label text-[10px] block mb-1">
                Patient Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Nair"
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
                placeholder="+91 99XXX XXXXX"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs kintsugi-num"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="kintsugi-section-label text-[10px] block mb-1">
                Current Location / GPS *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="kintsugi-section-label text-[10px] block mb-1">
                Target Emergency Hospital
              </label>
              <select
                value={preferredHospitalId}
                onChange={e => setPreferredHospitalId(e.target.value)}
                className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs font-semibold"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} (
                    {h.bedCategories.find(c => c.name === 'Emergency')?.available || 5} ER Beds)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="kintsugi-section-label text-[10px] block mb-1">
              Critical Symptoms
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Severe chest tightness, shortness of breath..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              className="kintsugi-input w-full px-3 py-2 rounded-xl text-xs"
            />
          </div>

          <div className="pt-4 border-t kintsugi-divider flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-[#B0E0E6]/70">
              Immediate hospital ER telemetry alert triggers upon dispatch.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#D9534F] hover:bg-[#F08582] text-[#1E2A3A] text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer kintsugi-focus"
            >
              <Ambulance className="w-4 h-4" />
              <span>{isSubmitting ? 'Dispatching...' : 'Trigger SOS & Hold ER Bay'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
