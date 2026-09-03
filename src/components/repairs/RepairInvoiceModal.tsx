import React, { useRef } from 'react';
import { X, Printer, Wrench, ShieldCheck, QrCode, Phone, Mail, MapPin, Smartphone } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { RepairJobSheet } from '../../types';

interface RepairInvoiceModalProps {
  job: RepairJobSheet;
  onClose: () => void;
}

export const RepairInvoiceModal: React.FC<RepairInvoiceModalProps> = ({ job, onClose }) => {
  const { settings, currentLocation } = usePOS();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const balanceDue = Math.max(0, job.finalTotal - job.amountPaid);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Top control bar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-sm">
              Repair Job Sheet & Gate Pass: {job.jobSheetNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div ref={printRef} className="p-8 space-y-6 text-slate-900 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                {settings.businessName}
              </h1>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">
                ELECTRONICS SERVICE CENTER & HARDWARE LAB
              </p>
              <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {currentLocation.landmark || settings.address}</p>
                <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {settings.phone} | <Mail className="w-3 h-3 text-slate-400" /> {settings.email}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black rounded-md tracking-wider">
                JOB SHEET & GATE PASS
              </div>
              <p className="text-lg font-black text-slate-900 mt-2">{job.jobSheetNumber}</p>
              <p className="text-xs text-slate-500">Date: {job.createdAt}</p>
              <p className="text-xs text-slate-500 font-medium">Est. Delivery: {job.estimatedDeliveryDate}</p>
            </div>
          </div>

          {/* Customer & Device Dual Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Customer Details</p>
              <p className="font-extrabold text-slate-900 text-sm">{job.customerName}</p>
              <p className="text-slate-600">Mobile: {job.customerMobile}</p>
              <p className="text-slate-500">Location: {job.locationName}</p>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 text-xs space-y-1">
              <p className="font-bold text-blue-700 uppercase tracking-wider text-[10px]">Device & Serial Details</p>
              <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-blue-600" />
                {job.deviceBrand} {job.deviceModel}
              </p>
              <p className="text-slate-700 font-mono font-semibold">IMEI/Serial: {job.serialNumberOrIMEI}</p>
              {job.securityPasswordOrPattern && (
                <p className="text-slate-600">PIN/Lock: {job.securityPasswordOrPattern}</p>
              )}
            </div>
          </div>

          {/* Diagnostics and Defect Description */}
          <div className="border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div>
              <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">Customer Reported Problem:</span>
              <p className="text-slate-900 font-medium mt-0.5">{job.defectsDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">Physical Condition:</span>
                <p className="text-slate-700">{job.physicalCondition || 'Normal wear'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">Accessories Handed Over:</span>
                <p className="text-slate-700">
                  {job.accessoriesHandedOver.length > 0 ? job.accessoriesHandedOver.join(', ') : 'None (Device only)'}
                </p>
              </div>
            </div>

            {job.technicianNotes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-blue-800 uppercase text-[10px] tracking-wider block">Technician Bench Notes:</span>
                <p className="text-slate-700 font-mono text-[11px] whitespace-pre-line">{job.technicianNotes}</p>
              </div>
            )}
          </div>

          {/* Pricing & Estimate Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Service Description</th>
                  <th className="py-2.5 px-4 text-center">Technician</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-4">
                    <p className="font-bold text-slate-900">Diagnostic Inspection & Labor Charge</p>
                    <p className="text-[11px] text-slate-500">Hardware disassembly, fault isolation, and solder bench service</p>
                  </td>
                  <td className="py-2.5 px-4 text-center text-slate-700 font-medium">
                    {job.technicianAssigned}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    {settings.currencySymbol}{job.laborCost.toFixed(2)}
                  </td>
                </tr>
                {job.partsCost > 0 && (
                  <tr>
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-slate-900">OEM Hardware Replacement Parts</p>
                      <p className="text-[11px] text-slate-500">Components, replacement display/IC or battery module</p>
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-700 font-medium">
                      Apex / OEM Supply
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {settings.currencySymbol}{job.partsCost.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan={2} className="py-2.5 px-4 text-right text-slate-700">Total Service Estimate:</td>
                  <td className="py-2.5 px-4 text-right text-slate-900 font-extrabold text-sm">
                    {settings.currencySymbol}{job.finalTotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="py-2 px-4 text-right text-emerald-700">Advance Paid:</td>
                  <td className="py-2 px-4 text-right text-emerald-700">
                    {settings.currencySymbol}{job.amountPaid.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td colSpan={2} className="py-2.5 px-4 text-right text-slate-900 font-black">Balance Due on Collection:</td>
                  <td className="py-2.5 px-4 text-right text-rose-600 font-black text-sm">
                    {settings.currencySymbol}{balanceDue.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Warranty & Terms */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Repair Warranty & Workshop Policy</span>
            </div>
            <p className="text-slate-800 font-medium">{job.warrantyTerms || '90-day warranty on replaced hardware components.'}</p>
            <p className="text-slate-500 text-[10px]">
              • Please present this original Job Sheet / Gate Pass when collecting your device.
              <br />
              • Devices not collected within 30 days of completion notification may be subject to storage fees.
              <br />
              • ElectroTech is not responsible for unsaved customer data. Backups are strongly advised.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs text-slate-500">
            <div>
              <div className="border-b border-slate-300 w-48 mb-1"></div>
              <p className="font-semibold text-slate-700">Customer Signature</p>
              <p className="text-[10px]">Acknowledged device condition & terms</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-300 w-48 ml-auto mb-1"></div>
              <p className="font-semibold text-slate-700">Authorized Workshop Tech</p>
              <p className="text-[10px]">{job.technicianAssigned}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
