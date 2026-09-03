import React from 'react';
import {
  X,
  MapPin,
  Navigation,
  Truck,
  Phone,
  Clock,
  Gauge,
  Compass,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ServiceScheduleSlot } from '../../../types';

interface RouteTelemetryModalProps {
  slot: ServiceScheduleSlot;
  onClose: () => void;
  onUpdateStatus?: (status: 'En Route' | 'On Site') => void;
}

export const RouteTelemetryModal: React.FC<RouteTelemetryModalProps> = ({
  slot,
  onClose,
  onUpdateStatus,
}) => {
  const route = slot.routeCoordinates || {
    from: slot.branch || 'Dhaka Central Hub',
    to: slot.siteAddress || slot.siteName || 'Client Site Location',
    distanceKm: 24.5,
    etaMinutes: 38,
    trafficCondition: 'Moderate',
    driverName: 'Md. Alamgir Hossain',
  };

  const isMoving = slot.dispatchStatus === 'En Route';
  const isOnSite = slot.dispatchStatus === 'On Site';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {slot.workOrderNumber || slot.serviceRequestId || 'WO-DISPATCH'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    slot.dispatchStatus === 'En Route'
                      ? 'bg-purple-100 text-purple-800'
                      : slot.dispatchStatus === 'On Site'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {slot.dispatchStatus || 'Scheduled'}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">
                Fleet Transit & GPS Route Telemetry
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-500" /> Transit Distance
            </span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {route.distanceKm} <span className="text-xs font-normal text-slate-500">km</span>
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Estimated ETA
            </span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {route.etaMinutes} <span className="text-xs font-normal text-slate-500">mins</span>
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-500" /> Traffic State
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  route.trafficCondition === 'Clear'
                    ? 'bg-emerald-500'
                    : route.trafficCondition === 'Moderate'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              <p className="text-sm font-bold text-slate-900">{route.trafficCondition}</p>
            </div>
          </div>
        </div>

        {/* Interactive Map Visual Representation */}
        <div className="relative rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden text-white p-5 space-y-4">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Fleet Dispatch Vector
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
              GPS Satellite Fix: Active (9 Satellites)
            </span>
          </div>

          {/* Route Milestones */}
          <div className="relative z-10 space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-blue-300 text-xs font-bold">
                A
              </div>
              <div>
                <span className="text-[10px] font-semibold text-blue-400 uppercase">Origin Hub</span>
                <p className="text-sm font-semibold text-slate-100">{route.from}</p>
                <p className="text-xs text-slate-400">CamneX Enterprise Regional Fleet Depot</p>
              </div>
            </div>

            {/* Transit Line */}
            <div className="ml-3 pl-6 border-l-2 border-dashed border-blue-500/50 py-2 space-y-2">
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-2.5 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400 animate-bounce" />
                  <span className="text-slate-200 font-medium">
                    {slot.vehicle || 'Toyota HiAce Van (Dhaka Metro-Cha 11-4092)'}
                  </span>
                </div>
                <span className="text-emerald-400 font-mono font-bold text-[11px]">
                  {isOnSite ? 'ARRIVED ON SITE' : isMoving ? 'IN TRANSIT (44 km/h)' : 'READY AT DEPOT'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-rose-300 text-xs font-bold">
                B
              </div>
              <div>
                <span className="text-[10px] font-semibold text-rose-400 uppercase">Target Client Site</span>
                <p className="text-sm font-semibold text-slate-100">{slot.siteName || route.to}</p>
                <p className="text-xs text-slate-400">{slot.siteAddress || 'Industrial Zone Facility Gate 1'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet & Crew Dispatch Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Assigned Fleet & Field Personnel
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
              <img
                src={slot.technicianAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={slot.technicianName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Lead Engineer</span>
                <p className="font-bold text-slate-900 truncate">{slot.technicianName}</p>
                <p className="text-[11px] text-blue-600 truncate">{slot.technicianRole || slot.department || 'Field Engineer'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Fleet Transit Vehicle</span>
                <p className="font-bold text-slate-900 truncate">{slot.vehicle || 'Fleet Van Unit'}</p>
                <p className="text-[11px] text-slate-500 truncate">Driver: {route.driverName || 'Depot Logistics Team'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(slot.siteAddress || slot.siteName || 'Dhaka')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Navigation
            </a>
            <button
              type="button"
              onClick={() => alert(`Calling driver (${route.driverName || 'Logistics'}): +880 1711-000293`)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call Driver
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onUpdateStatus && slot.dispatchStatus !== 'On Site' && (
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus('On Site');
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Arrived On-Site
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all"
            >
              Close Telemetry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
