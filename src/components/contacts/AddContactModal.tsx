import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Building, MapPin, DollarSign } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Contact } from '../../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactToEdit?: Contact | null;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  contactToEdit,
}) => {
  const { addContact, updateContact, settings } = usePOS();

  const [type, setType] = useState<'customer' | 'supplier' | 'both'>('customer');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [creditLimit, setCreditLimit] = useState('1000.00');

  useEffect(() => {
    if (contactToEdit) {
      setType(contactToEdit.type);
      setName(contactToEdit.name);
      setBusinessName(contactToEdit.businessName || '');
      setMobile(contactToEdit.mobile || '');
      setEmail(contactToEdit.email || '');
      setTaxNumber(contactToEdit.taxNumber || '');
      setAddress(contactToEdit.address || '');
      setCity(contactToEdit.city || '');
      setCreditLimit(contactToEdit.creditLimit?.toString() || '0');
    } else {
      setType('customer');
      setName('');
      setBusinessName('');
      setMobile('');
      setEmail('');
      setTaxNumber('');
      setAddress('');
      setCity('');
      setCreditLimit('1000.00');
    }
  }, [contactToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      type,
      name: name.trim(),
      businessName: businessName.trim() || undefined,
      mobile: mobile.trim() || 'N/A',
      email: email.trim() || undefined,
      taxNumber: taxNumber.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      creditLimit: parseFloat(creditLimit) || 0,
    };

    if (contactToEdit) {
      updateContact(contactToEdit.id, payload);
    } else {
      addContact(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">
              {contactToEdit ? 'Edit Contact Profile' : 'Add New Contact (Customer / Supplier)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Contact Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Classification</label>
            <div className="grid grid-cols-3 gap-2">
              {(['customer', 'supplier', 'both'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold capitalize border transition-all ${
                    type === t
                      ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact / Person Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Johnathan Smith"
              className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Trade Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Acme Global Inc"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tax / VAT / GST Number</label>
              <input
                type="text"
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
                placeholder="TAX-893821"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone</label>
              <input
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="+1 (555) 382-9011"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Chicago, IL"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Limit ({settings.currencySymbol})</label>
              <input
                type="number"
                step="50"
                value={creditLimit}
                onChange={e => setCreditLimit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Full physical billing / shipping address..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              {contactToEdit ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
