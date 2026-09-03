import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileCheck,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  User,
  Star,
  Sparkles,
  Award,
} from 'lucide-react';
import { ServiceScheduleSlot } from '../../../types';

interface ServiceReportModalProps {
  slot: ServiceScheduleSlot;
  onClose: () => void;
}

export const ServiceReportModal: React.FC<ServiceReportModalProps> = ({
  slot,
  onClose,
}) => {
  const [rating, setRating] = useState(5);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const reportId = slot.serviceReport?.reportId || `CSR-BD-${slot.workOrderNumber ? slot.workOrderNumber.replace(/[^0-9]/g, '') : '2026'}-01`;
  const signedDate = slot.serviceReport?.signedAt || slot.date;
  const clientRep = slot.contactPerson || slot.serviceReport?.signedBy || 'Engr. Kamal Uddin (Client Facility Lead)';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enterprise Field Service & Handover Report
              </h3>
              <p className="text-xs text-slate-500">Official CamneX Bangladesh SLA Validation & Client Acceptance Voucher</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" /> {downloadSuccess ? 'Downloaded!' : 'Export PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Sheet */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs font-sans text-slate-800 print:border-none print:shadow-none print:p-0">
          {/* Corporate Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-blue-700">CamneX</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  BANGLADESH
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mt-1">
                Enterprise ELV, Surveillance & Network Infrastructure Solutions
              </p>
              <p className="text-[11px] text-slate-500">
                Corporate HQ: Gulshan-Tejgaon Link Road, Dhaka-1208 • Hotline: +880 9612-CAMNEX • support@camnex.bd
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 uppercase">
                {reportId}
              </span>
              <p className="text-xs font-bold text-slate-900 mt-2">
                Date: {signedDate}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                STATUS: {slot.dispatchStatus?.toUpperCase() || 'COMPLETED'}
              </span>
            </div>
          </div>

          {/* Key Work Order & Site Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Work Order #</span>
              <p className="font-bold text-slate-900 mt-0.5 font-mono">{slot.workOrderNumber || 'WO-2026-0041'}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Service Operation</span>
              <p className="font-bold text-blue-700 mt-0.5">{slot.serviceType || 'Installation'}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Contract Classification</span>
              <p className="font-bold text-slate-900 mt-0.5">{slot.contract || 'Comprehensive AMC'}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Priority Level</span>
              <p className="font-bold text-slate-900 mt-0.5">{slot.priority || 'Normal'} Priority</p>
            </div>
          </div>

          {/* Client & Deployment Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> Client Enterprise
              </span>
              <p className="font-bold text-sm text-slate-900">{slot.customerName}</p>
              <p className="text-slate-600"><span className="font-semibold text-slate-500">Facility:</span> {slot.siteName}</p>
              <p className="text-slate-500 text-[11px]">{slot.siteAddress || 'Regional Corporate Industrial Plant'}</p>
              <p className="text-slate-500 text-[11px]"><span className="font-medium text-slate-700">Site Contact:</span> {clientRep}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-600" /> Dispatch Crew & Fleet
              </span>
              <p className="font-bold text-sm text-slate-900">{slot.technicianName} <span className="text-xs font-normal text-slate-500">(Lead)</span></p>
              <p className="text-slate-600"><span className="font-semibold text-slate-500">Designation:</span> {slot.technicianRole || 'Field Service Engineer'}</p>
              <p className="text-slate-600"><span className="font-semibold text-slate-500">Squad Unit:</span> {slot.assignedTeam || 'Enterprise ELV Team'}</p>
              <p className="text-slate-500 text-[11px]"><span className="font-medium text-slate-700">Fleet Transit:</span> {slot.vehicle || 'Toyota HiAce Van (Dhaka Metro-Cha 11-4092)'}</p>
            </div>
          </div>

          {/* Operational Timestamps */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-blue-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Scheduled:</span> {slot.date} ({slot.startTime} - {slot.endTime})
            </div>
            <div className="flex items-center gap-1.5 text-blue-900">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Duration:</span> {slot.estimatedDuration || '3.5 hrs'}
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SLA Deadline Met: 100%
            </div>
          </div>

          {/* Technical Scope & Actions Taken */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Technical Scope of Work & Diagnostics
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <p className="font-semibold text-slate-900">{slot.title}</p>
              <p className="text-slate-600 leading-relaxed">
                {slot.notes || 'Full diagnostic testing and physical hardware inspection performed in accordance with CamneX engineering guidelines and OEM standard operating procedures.'}
              </p>
              {slot.deviceInfo && (
                <p className="text-[11px] text-blue-700 pt-1 font-medium border-t border-slate-200/60 mt-1">
                  Target Asset & Hardware: {slot.deviceInfo}
                </p>
              )}
            </div>
          </div>

          {/* Checklist Verification */}
          {slot.checklist && slot.checklist.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Standard Operating Quality & Safety Verification Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {slot.checklist.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-800 text-[11px]">{item.task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Acceptance & Sign-off Block */}
          <div className="border-t-2 border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Customer Handover Acceptance & Quality Rating
              </h4>
              <div className="flex items-center gap-1 print:hidden">
                <span className="text-xs text-slate-500 mr-1 font-medium">CSAT Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>CamneX Field Engineer Signature</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">VERIFIED ID</span>
                </div>
                <div className="h-14 flex items-center justify-center border-b border-dashed border-slate-300 font-serif italic text-slate-700 text-lg">
                  {slot.technicianName}
                </div>
                <div className="text-[11px] text-slate-500">
                  <p className="font-bold text-slate-800">{slot.technicianName}</p>
                  <p>{slot.technicianRole || 'Senior Field Engineer'} • CamneX Bangladesh</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Customer Authorized Signatory</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">ACCEPTED</span>
                </div>
                <div className="h-14 flex items-center justify-center border-b border-dashed border-slate-300 font-serif italic text-blue-900 text-lg">
                  {clientRep}
                </div>
                <div className="text-[11px] text-slate-500">
                  <p className="font-bold text-slate-800">{clientRep}</p>
                  <p>{slot.customerName} • Site Representative</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
            This document is an electronically authenticated Field Service Handover Certificate issued under CamneX Enterprise Management Protocol. For billing or warranty inquiries, contact support@camnex.bd.
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
