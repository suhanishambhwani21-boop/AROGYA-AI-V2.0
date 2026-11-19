import React, { useState } from 'react';
import { Search, Stethoscope, Building2, Clock, Ticket } from 'lucide-react';
import { Doctor } from '../../types';
import {
  KintsugiReveal,
  KintsugiStaggerGrid,
  KintsugiStaggerItem,
} from '../common/KintsugiPrimitives';

interface DoctorDirectoryProps {
  doctors: Doctor[];
  onSelectDoctorToBook: (doctor: Doctor) => void;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  doctors,
  onSelectDoctorToBook,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      selectedDept === 'ALL' ||
      doc.department.toLowerCase().includes(selectedDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="kintsugi-section-label flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-[#B0E0E6]" />
              <span>Specialist Directory</span>
            </div>

            <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-3">
              Specialists &amp; <span className="kintsugi-gold-word italic">Clinicians</span>
            </h1>
            <p className="text-[#FFFFFF]/80 text-xs sm:text-sm mt-2 leading-relaxed">
              Search verified consultants, critical care intensivists, surgeons, and pediatricians
              across participating network hospitals.
            </p>
          </div>
        </div>
      </KintsugiReveal>

      {/* Search & Filter Toolbar */}
      <div className="kintsugi-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#B0E0E6]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search doctors by name, specialization, or hospital"
            placeholder="Search by doctor name, specialization, or hospital..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="kintsugi-input w-full pl-10 pr-4 py-2 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            aria-label="Filter doctors by department"
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="kintsugi-input rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">All Specialities</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pediatrics">Pediatrics &amp; NICU</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="ICU">Critical Care / ICU</option>
            <option value="Surgery">General Surgery</option>
            <option value="Emergency">Emergency Medicine</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <KintsugiStaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map(doc => (
          <KintsugiStaggerItem key={doc.id}>
            <div className="kintsugi-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-start gap-3.5">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-[rgba(220, 235, 245,0.28)] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="kintsugi-num text-xs font-bold text-[#B0E0E6] bg-[#4682B4]/12 px-2 py-0.5 rounded-full border border-[rgba(70, 130, 180,0.35)]">
                        ★ {doc.rating}
                      </span>
                      <span className="text-[10px] text-[#B0E0E6]/65 kintsugi-num">
                        {doc.experienceYears}y exp
                      </span>
                    </div>
                    <h2 className="text-base font-semibold text-[#FFFFFF] mt-1.5 truncate">
                      {doc.name}
                    </h2>
                    <div className="text-[11px] text-[#B0E0E6] font-medium mt-0.5">
                      {doc.specialization}
                    </div>
                    <div className="text-[10px] text-[#B0E0E6]/60 truncate mt-0.5">
                      {doc.qualification}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-[#151F2C]/75 rounded-2xl border border-[rgba(220, 235, 245,0.14)] space-y-2 text-xs text-[#B0E0E6]/80">
                  <div className="flex items-start gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#B0E0E6] shrink-0 mt-0.5" />
                    <span className="font-medium text-[#FFFFFF] text-[11px] line-clamp-1">
                      {doc.hospitalName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B0E0E6]/70 shrink-0" />
                    <span className="text-[11px]">{doc.availableTime}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(220, 235, 245,0.12)] text-[11px]">
                    <span>Consultation Fee</span>
                    <strong className="kintsugi-num text-[#B0E0E6] text-xs">₹{doc.fee}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span>OPD Tokens Open</span>
                    <span className="kintsugi-num font-semibold text-[#B0E0E6] bg-[#B0E0E6]/12 px-2 py-0.5 rounded-full border border-[rgba(220, 235, 245,0.28)]">
                      {doc.opdTokensAvailable} Available
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t kintsugi-divider flex items-center justify-between">
                <span className="text-[10px] text-[#B0E0E6]/70">
                  Next: <strong className="text-[#FFFFFF]">{doc.nextAvailableSlot}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => onSelectDoctorToBook(doc)}
                  className="px-4 py-2 rounded-xl kintsugi-btn-gold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Book Token</span>
                </button>
              </div>
            </div>
          </KintsugiStaggerItem>
        ))}
      </KintsugiStaggerGrid>
    </div>
  );
};
