import React from 'react';
import {
  Ticket,
  Bed,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { OPDToken, BedRequest } from '../../types';
import { KintsugiReveal } from '../common/KintsugiPrimitives';

interface MyBookingsProps {
  tokens: OPDToken[];
  bedRequests: BedRequest[];
  onNavigateTab: (tab: string) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  tokens,
  bedRequests,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <KintsugiReveal>
        <div>
          <div className="kintsugi-section-label">Patient Ledger</div>
          <h1 className="kintsugi-serif text-3xl sm:text-5xl font-semibold uppercase mt-2">
            My <span className="kintsugi-gold-word italic">Bookings</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#B0E0E6]/75 mt-1">
            Live tracking for outpatient OPD token queues and inpatient bed admission requests.
          </p>
        </div>
      </KintsugiReveal>

      {/* OPD Tokens Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="kintsugi-serif text-2xl font-semibold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#B0E0E6]" />
            <span>Digital OPD Tokens ({tokens.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('book-opd')}
            className="text-xs text-[#B0E0E6] hover:text-[#B0E0E6] font-semibold cursor-pointer kintsugi-focus"
          >
            + Book New Token
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="kintsugi-card rounded-3xl p-8 text-center text-[#B0E0E6]/70 text-xs">
            No active OPD tokens found. Book a token to consult with hospital specialists.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tokens.map(token => (
              <div
                key={token.id}
                className="kintsugi-card rounded-3xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between border-b kintsugi-divider pb-3">
                    <div>
                      <span className="kintsugi-section-label text-[10px]">OPD Pass</span>
                      <h3 className="font-semibold text-[#FFFFFF] text-sm mt-1">
                        {token.doctorName}
                      </h3>
                      <p className="text-[11px] text-[#B0E0E6]/75">{token.department}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#B0E0E6]/60 block">Token</span>
                      <span className="kintsugi-num text-2xl font-bold text-[#B0E0E6]">
                        {token.tokenNumber}
                      </span>
                    </div>
                  </div>

                  <div className="my-3.5 space-y-2 text-xs text-[#B0E0E6]/80">
                    <div className="flex justify-between gap-2">
                      <span>Hospital</span>
                      <strong className="text-[#FFFFFF] text-right truncate max-w-[200px]">
                        {token.hospitalName}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Patient</span>
                      <strong className="text-[#FFFFFF]">
                        {token.patientName} ({token.patientAge}y)
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Appointment</span>
                      <strong className="text-[#FFFFFF]">
                        {token.date} · {token.timeSlot}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Queue Status</span>
                      <span className="font-semibold text-[#B0E0E6] kintsugi-num">
                        #{token.queuePosition} (~{token.estimatedWaitMins}m wait)
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[rgba(220, 235, 245,0.12)]">
                      <span className="text-[11px]">Deposit</span>
                      <span className="kintsugi-num text-[10px] font-semibold text-[#B0E0E6] bg-[#B0E0E6]/12 px-2.5 py-0.5 rounded-full border border-[rgba(220, 235, 245,0.28)]">
                        ₹{token.feeAmount || 100} Paid ({token.transactionRef || 'UPI'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t kintsugi-divider flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[#B0E0E6] font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B0E0E6]" />
                    <span>Status: {token.status}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="kintsugi-btn-celadon px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bed Requests Section */}
      <div className="space-y-4 pt-4 border-t kintsugi-divider">
        <div className="flex items-center justify-between">
          <h2 className="kintsugi-serif text-2xl font-semibold flex items-center gap-2">
            <Bed className="w-5 h-5 text-[#B0E0E6]" />
            <span>Bed Admission Requests ({bedRequests.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('find-beds')}
            className="text-xs text-[#B0E0E6] hover:text-[#B0E0E6] font-semibold cursor-pointer kintsugi-focus"
          >
            + Request Bed
          </button>
        </div>

        {bedRequests.length === 0 ? (
          <div className="kintsugi-card rounded-3xl p-8 text-center text-[#B0E0E6]/70 text-xs">
            No active bed admission requests.
          </div>
        ) : (
          <div className="space-y-3">
            {bedRequests.map(req => {
              const isAllocated =
                req.status === 'BED_ALLOCATED' || req.status === 'APPROVED';

              return (
                <div
                  key={req.id}
                  className="kintsugi-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          req.urgency === 'CRITICAL_EMERGENCY'
                            ? 'bg-[#D9534F]/18 text-[#F08582] border-[rgba(217, 83, 79,0.5)]'
                            : 'bg-[#4682B4]/14 text-[#B0E0E6] border-[rgba(70, 130, 180,0.4)]'
                        }`}
                      >
                        {req.urgency.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-[#FFFFFF] text-sm">
                        {req.patientName} ({req.patientAge}y)
                      </span>
                    </div>

                    <p className="text-xs text-[#B0E0E6]">
                      <strong className="text-[#FFFFFF]">{req.hospitalName}</strong> ·{' '}
                      {req.department} ({req.bedCategory} Bed)
                    </p>
                    <p className="text-[11px] text-[#B0E0E6]/70 italic">&ldquo;{req.reason}&rdquo;</p>

                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#B0E0E6] bg-[#B0E0E6]/12 px-2.5 py-0.5 rounded-full border border-[rgba(220, 235, 245,0.28)]">
                        <CheckCircle2 className="w-3 h-3 text-[#B0E0E6]" />
                        <span>
                          Deposit Verified: ₹{req.feeAmount || 100} Paid ({req.transactionRef || 'UPI'})
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                        isAllocated
                          ? 'bg-[#B0E0E6]/15 text-[#B0E0E6] border-[rgba(220, 235, 245,0.35)]'
                          : 'bg-[#4682B4]/15 text-[#B0E0E6] border-[rgba(70, 130, 180,0.4)]'
                      }`}
                    >
                      {isAllocated
                        ? 'Bed Allocated: ' + (req.allocatedBedNumber || 'GW-314B')
                        : 'Pending Confirmation'}
                    </span>
                    <div className="text-[10px] text-[#B0E0E6]/60 mt-1.5 kintsugi-num">
                      Submitted: {req.submittedAt}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
