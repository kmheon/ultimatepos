import React, { useState, useEffect } from 'react';
import { X, Building2, User, Phone, Mail, MapPin, DollarSign, Shield, AlertCircle } from 'lucide-react';
import { CRMOrganization, CRMOrgStatus, CRMPaymentTerms, CRMAMCTier } from '../../types';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';

interface AddEditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingOrg?: CRMOrganization | null;
}

export const AddEditOrganizationModal: React.FC<AddEditOrganizationModalProps> = ({
  isOpen,
  onClose,
  editingOrg
}) => {
  const { settings } = usePOS();
  const { addOrganization, updateOrganization } = useCRM();

  const [name, setName] = useState('');
  const [binOrTaxNumber, setBinOrTaxNumber] = useState('');
  const [industry, setIndustry] = useState('Retail & Supermarkets');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonRole, setContactPersonRole] = useState('Procurement Manager');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [creditLimit, setCreditLimit] = useState<number>(200000);
  const [paymentTerms, setPaymentTerms] = useState<CRMPaymentTerms>('net30');
  const [amcTier, setAmcTier] = useState<CRMAMCTier>('gold_partner');
  const [status, setStatus] = useState<CRMOrgStatus>('active');
  const [accountManager, setAccountManager] = useState('Zubair Hossain');
  const [notes, setNotes] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingOrg) {
      setName(editingOrg.name);
      setBinOrTaxNumber(editingOrg.binOrTaxNumber || '');
      setIndustry(editingOrg.industry);
      setContactPersonName(editingOrg.contactPersonName);
      setContactPersonRole(editingOrg.contactPersonRole || '');
      setEmail(editingOrg.email || '');
      setPhone(editingOrg.phone || '');
      setAddress(editingOrg.address || '');
      setCity(editingOrg.city || '');
      setState(editingOrg.state || '');
      setCountry(editingOrg.country || 'Bangladesh');
      setCreditLimit(editingOrg.creditLimit || 0);
      setPaymentTerms(editingOrg.paymentTerms || 'net30');
      setAmcTier(editingOrg.amcTier || 'standard');
      setStatus(editingOrg.status || 'active');
      setAccountManager(editingOrg.accountManager || 'Zubair Hossain');
      setNotes(editingOrg.notes || '');
      setLogoUrl(editingOrg.logoUrl || '');
    } else {
      setName('');
      setBinOrTaxNumber('');
      setIndustry('Retail & Supermarkets');
      setContactPersonName('');
      setContactPersonRole('Procurement Manager');
      setEmail('');
      setPhone('');
      setAddress('');
      setCity('');
      setState('');
      setCountry('Bangladesh');
      setCreditLimit(250000);
      setPaymentTerms('net30');
      setAmcTier('gold_partner');
      setStatus('active');
      setAccountManager('Zubair Hossain');
      setNotes('');
      setLogoUrl('');
    }
    setError('');
  }, [editingOrg, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Company / Organization Name is required');
      return;
    }
    if (!contactPersonName.trim()) {
      setError('Key contact person name is required');
      return;
    }

    if (editingOrg) {
      updateOrganization(editingOrg.id, {
        name: name.trim(),
        binOrTaxNumber: binOrTaxNumber.trim(),
        industry,
        contactPersonName: contactPersonName.trim(),
        contactPersonRole: contactPersonRole.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        creditLimit: Number(creditLimit) || 0,
        paymentTerms,
        amcTier,
        status,
        accountManager: accountManager.trim(),
        notes: notes.trim(),
        logoUrl: logoUrl.trim()
      });
    } else {
      addOrganization({
        name: name.trim(),
        binOrTaxNumber: binOrTaxNumber.trim(),
        industry,
        contactPersonName: contactPersonName.trim(),
        contactPersonRole: contactPersonRole.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        creditLimit: Number(creditLimit) || 0,
        paymentTerms,
        amcTier,
        status,
        accountManager: accountManager.trim(),
        totalRevenue: 0,
        activeContractsCount: 0,
        notes: notes.trim(),
        logoUrl: logoUrl.trim()
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingOrg ? 'Edit Corporate Account' : 'Add B2B Organization'}
              </h2>
              <p className="text-xs text-slate-500">Corporate client profile, commercial terms, and credit limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Company Name & BIN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Legal Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Apex Retail & Supermarket Chain Ltd."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tax ID / BIN / Trade License</label>
              <input
                type="text"
                value={binOrTaxNumber}
                onChange={e => setBinOrTaxNumber(e.target.value)}
                placeholder="BIN-9082341-BD"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Industry & Account Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Retail & Supermarkets">Retail & Supermarkets</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                <option value="Hospitality & Leisure">Hospitality & Leisure</option>
                <option value="Media & Production">Media & Production</option>
                <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                <option value="Financial & Banking">Financial & Banking</option>
                <option value="Education & Institutions">Education & Institutions</option>
                <option value="Government & Defense">Government & Defense</option>
                <option value="Other Enterprise">Other Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Account Manager</label>
              <input
                type="text"
                value={accountManager}
                onChange={e => setAccountManager(e.target.value)}
                placeholder="e.g. Zubair Hossain"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Key Contact Person & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <User className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Primary Decision Maker / Contact *
              </label>
              <input
                type="text"
                required
                value={contactPersonName}
                onChange={e => setContactPersonName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title / Designation</label>
              <input
                type="text"
                value={contactPersonRole}
                onChange={e => setContactPersonRole(e.target.value)}
                placeholder="e.g. VP of Operations / Procurement Head"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Mail className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Corporate Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="corporate@client-company.com"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Phone / Direct Line
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+880 1711-000000"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Office / Headquarters Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Apex Tower, 45 Gulshan Avenue"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Dhaka"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Commercial Terms: Credit Limit, Payment Terms, AMC Tier */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Financial & Contract Privileges
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Credit Limit ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={creditLimit}
                  onChange={e => setCreditLimit(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value as CRMPaymentTerms)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                >
                  <option value="due_on_receipt">Due on Receipt (Cash/Instant)</option>
                  <option value="net15">Net 15 Days</option>
                  <option value="net30">Net 30 Days (Standard Corporate)</option>
                  <option value="net60">Net 60 Days (Enterprise)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">AMC Support Tier</label>
                <select
                  value={amcTier}
                  onChange={e => setAmcTier(e.target.value as CRMAMCTier)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                >
                  <option value="enterprise_platinum">Platinum 24/7 Dedicated</option>
                  <option value="gold_partner">Gold 4-Hour Onsite</option>
                  <option value="silver_support">Silver Next-Business-Day</option>
                  <option value="standard">Standard On-Demand</option>
                  <option value="none">None (Ad-Hoc Retail)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Relationship Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as CRMOrgStatus)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active (Full Privileges)</option>
                <option value="on_hold">On Hold (Credit Review)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL (Optional)</label>
              <input
                type="url"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://... logo image"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Internal Notes & Corporate Background</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Branches operated, special invoice routing requirements, or key procurement schedules..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-200 transition-all cursor-pointer"
            >
              {editingOrg ? 'Update Account' : 'Save Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
