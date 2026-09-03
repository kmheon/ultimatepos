import React, { useState } from 'react';
import { X, Wrench, Smartphone, User, DollarSign, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface AddRepairModalProps {
  onClose: () => void;
}

export const AddRepairModal: React.FC<AddRepairModalProps> = ({ onClose }) => {
  const { contacts, currentLocation, addRepairJobSheet, addContact, settings } = usePOS();

  const [customerId, setCustomerId] = useState(contacts[1]?.id || contacts[0]?.id || '');
  const [customerName, setCustomerName] = useState(contacts[1]?.name || 'New Customer');
  const [customerMobile, setCustomerMobile] = useState(contacts[1]?.mobile || '');
  
  const [deviceBrand, setDeviceBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('');
  const [serialNumberOrIMEI, setSerialNumberOrIMEI] = useState('');
  const [securityPasswordOrPattern, setSecurityPasswordOrPattern] = useState('');
  const [defectsDescription, setDefectsDescription] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState('Clean, normal wear and tear');
  const [technicianAssigned, setTechnicianAssigned] = useState('David Chen (Senior Tech)');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const [partsCost, setPartsCost] = useState('0');
  const [laborCost, setLaborCost] = useState('50');
  const [amountPaid, setAmountPaid] = useState('0');
  const [warrantyTerms, setWarrantyTerms] = useState('90-Day Repair Warranty on replaced parts & service.');

  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(['Charger']);

  const accessoryOptions = [
    'Charger / Power Cable',
    'Original Box',
    'Protective Case / Sleeve',
    'SIM Card Tray',
    'Stylus / S-Pen',
    'Keyboard / Mouse'
  ];

  const toggleAccessory = (acc: string) => {
    if (selectedAccessories.includes(acc)) {
      setSelectedAccessories(selectedAccessories.filter(a => a !== acc));
    } else {
      setSelectedAccessories([...selectedAccessories, acc]);
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setCustomerId(cid);
    const found = contacts.find(c => c.id === cid);
    if (found) {
      setCustomerName(found.name);
      setCustomerMobile(found.mobile || '');
    }
  };

  const numPartsCost = parseFloat(partsCost) || 0;
  const numLaborCost = parseFloat(laborCost) || 0;
  const finalTotal = numPartsCost + numLaborCost;
  const numAmountPaid = parseFloat(amountPaid) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceModel.trim() || !defectsDescription.trim()) {
      alert('Please enter Device Model and Defect Description');
      return;
    }

    addRepairJobSheet({
      customerId,
      customerName,
      customerMobile,
      deviceBrand,
      deviceModel,
      serialNumberOrIMEI: serialNumberOrIMEI || 'N/A',
      securityPasswordOrPattern: securityPasswordOrPattern || undefined,
      accessoriesHandedOver: selectedAccessories,
      defectsDescription,
      physicalCondition,
      technicianAssigned,
      estimatedCost: finalTotal,
      partsCost: numPartsCost,
      laborCost: numLaborCost,
      finalTotal,
      amountPaid: numAmountPaid,
      status: 'pending',
      priority,
      estimatedDeliveryDate,
      warrantyTerms,
      locationId: currentLocation.id,
      locationName: currentLocation.name,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white">
                New Electronics Repair Job Sheet
              </h2>
              <p className="text-xs text-slate-400">
                Log customer device diagnostics, serials/IMEI, technician assignment & estimate.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Customer Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <User className="w-4 h-4 text-blue-600" />
              <span>Customer Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Customer</label>
                <select
                  value={customerId}
                  onChange={handleCustomerChange}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Mobile</label>
                <input
                  type="text"
                  value={customerMobile}
                  onChange={e => setCustomerMobile(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Device & Hardware Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Device & Hardware Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Brand</label>
                <select
                  value={deviceBrand}
                  onChange={e => setDeviceBrand(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Sony">Sony</option>
                  <option value="Dell">Dell</option>
                  <option value="ASUS / ROG">ASUS / ROG</option>
                  <option value="Nintendo">Nintendo</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="HP">HP</option>
                  <option value="Other">Other Custom Brand</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Device Model <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 15 Pro, MacBook Pro M1 16, PS5 Slim"
                  value={deviceModel}
                  onChange={e => setDeviceModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Serial Number / IMEI</label>
                <input
                  type="text"
                  placeholder="e.g. IMEI: 359102849182910 or Serial #"
                  value={serialNumberOrIMEI}
                  onChange={e => setSerialNumberOrIMEI(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Security PIN / Screen Lock</label>
                <input
                  type="text"
                  placeholder="e.g. 123456 or Pattern details"
                  value={securityPasswordOrPattern}
                  onChange={e => setSecurityPasswordOrPattern(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Accessories Received with Device</label>
              <div className="flex flex-wrap gap-1.5">
                {accessoryOptions.map(acc => {
                  const isSelected = selectedAccessories.includes(acc);
                  return (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleAccessory(acc)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{acc}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Customer Problem / Defect Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Flashing screen, won't charge past 10%, water spill on keyboard..."
                value={defectsDescription}
                onChange={e => setDefectsDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Physical Inspection Condition</label>
              <input
                type="text"
                placeholder="e.g. Minor scratches on back glass, screen frame dented..."
                value={physicalCondition}
                onChange={e => setPhysicalCondition(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Technician & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assign Technician</label>
              <select
                value={technicianAssigned}
                onChange={e => setTechnicianAssigned(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="David Chen (Senior Tech)">David Chen (Senior Tech)</option>
                <option value="Alex Rivera (Mobile Tech)">Alex Rivera (Mobile Tech)</option>
                <option value="Sarah Jenkins (Store Admin)">Sarah Jenkins (Store Admin)</option>
                <option value="Workshop Bench 2">Workshop Bench 2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent / Express VIP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Est. Delivery Date</label>
              <input
                type="date"
                value={estimatedDeliveryDate}
                onChange={e => setEstimatedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Financials / Estimate */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                Service Estimate & Advance Paid
              </span>
              <span className="text-xs font-black text-blue-900">
                Total: {settings.currencySymbol}{finalTotal.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parts Cost ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={partsCost}
                  onChange={e => setPartsCost(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Labor Charge ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={laborCost}
                  onChange={e => setLaborCost(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Received ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-bold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Warranty Guarantee Terms</label>
              <input
                type="text"
                value={warrantyTerms}
                onChange={e => setWarrantyTerms(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
            >
              Create Job Sheet & Gate Pass
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
