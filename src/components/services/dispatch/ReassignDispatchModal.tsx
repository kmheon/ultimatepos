import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Truck,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { ServiceScheduleSlot, ServiceTechnician } from '../../../types';

interface ReassignDispatchModalProps {
  slot: ServiceScheduleSlot;
  technicians: ServiceTechnician[];
  onClose: () => void;
  onSave: (updates: Partial<ServiceScheduleSlot>) => void;
}

export const ReassignDispatchModal: React.FC<ReassignDispatchModalProps> = ({
  slot,
  technicians,
  onClose,
  onSave,
}) => {
  const [selectedTechId, setSelectedTechId] = useState<string>(slot.technicianId || technicians[0]?.id || '');
  const [assignedTeam, setAssignedTeam] = useState<string>(slot.assignedTeam || 'Enterprise CCTV Alpha Squad');
  const [vehicle, setVehicle] = useState<string>(slot.vehicle || 'Toyota HiAce Van (Dhaka Metro-Cha 11-4092)');
  const [date, setDate] = useState<string>(slot.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>(slot.startTime || '09:30');
  const [endTime, setEndTime] = useState<string>(slot.endTime || '13:00');
  const [reassignReason, setReassignReason] = useState<string>('');

  const selectedTech = technicians.find(t => t.id === selectedTechId) || technicians[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;

    onSave({
      technicianId: selectedTech.id,
      technicianName: selectedTech.name,
      technicianRole: selectedTech.designation || selectedTech.role,
      technicianAvatar: selectedTech.avatar,
      assignedTeam,
      vehicle,
      date,
      startTime,
      endTime,
      notes: reassignReason ? `${slot.notes ? slot.notes + ' • ' : ''}Reassigned: ${reassignReason}` : slot.notes,
    });
    onClose();
  };

  const vehicleOptions = [
    'Toyota HiAce Van (Dhaka Metro-Cha 11-4092)',
    'Nissan Caravan Van (Dhaka Metro-Ga 14-8821)',
    'Suzuki Carry Rapid Response Van (Dhaka Metro-Da 19-3011)',
    'Mahindra Bolero Pickup Unit (Dhaka Metro-Tha 13-0941)',
    'Mitsubishi L300 Dedicated Cable Van (Dhaka Metro-Na 12-4402)',
  ];

  const teamOptions = [
    'Enterprise CCTV Alpha Squad',
    'Fire & Life Safety Unit 1',
    'Critical Network Response Unit',
    'Turnkey Survey & Engineering Unit',
    'ELV Commissioning & Systems Integration Team',
    'Fiber Optic Deployment & Splicing Unit',
    'Field Warranty Assurance Squad',
    'Enterprise AMC Field Squad Bravo',
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Reassign Dispatch & Field Resource
              </h3>
              <p className="text-xs text-slate-500">
                Work Order {slot.workOrderNumber || 'WO-001'} • {slot.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Lead Field Engineer */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Reassign Lead Engineer *
            </label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} — {tech.designation || tech.role} ({tech.currentBranch || 'Dhaka Central'})
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Squad / Team */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Assigned Field Team / Squad *
            </label>
            <select
              value={assignedTeam}
              onChange={(e) => setAssignedTeam(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              {teamOptions.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* Fleet Vehicle */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-500" /> Assigned Fleet Transit Vehicle *
            </label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              {vehicleOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Schedule Window */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Dispatch Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Start Time *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">End Time *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Reason for Reassignment */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Reassignment Audit Reason (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lead engineer reassigned due to specialized OTDR splicing certification"
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Reassignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
