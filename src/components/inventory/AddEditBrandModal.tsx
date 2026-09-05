import React, { useState, useEffect } from 'react';
import { X, Tag, Globe, MapPin, AlertCircle, Layers } from 'lucide-react';
import { Brand } from '../../types';
import { usePOS } from '../../context/POSContext';
import { ImageUploadField } from '../common/ImageUploadField';

interface AddEditBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandToEdit?: Brand | null;
  defaultParentId?: string | null;
}

const COMMON_BRAND_LOGOS = [
  { name: 'Apple', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { name: 'Beats', url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Beats_Electronics_logo.svg' },
  { name: 'Samsung', url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { name: 'Galaxy', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Samsung_Galaxy_logo.svg' },
  { name: 'Sony', url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
  { name: 'PlayStation', url: 'https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg' },
  { name: 'Dell', url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg' },
  { name: 'Alienware', url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Alienware_logo.svg' },
  { name: 'Anker', url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Anker_logo.svg' },
  { name: 'ASUS', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg' },
  { name: 'ROG', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Asus_Republic_of_Gamers_logo.svg/320px-Asus_Republic_of_Gamers_logo.svg.png' },
  { name: 'Nintendo', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg' },
  { name: 'Logitech', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Logitech_logo.svg' },
];

export const AddEditBrandModal: React.FC<AddEditBrandModalProps> = ({
  isOpen,
  onClose,
  brandToEdit,
  defaultParentId,
}) => {
  const { brands, addBrand, updateBrand } = usePOS();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('United States');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [parentId, setParentId] = useState<string | null>(null);
  const [logo, setLogo] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [error, setError] = useState('');

  // Parent candidate brands (exclude self to avoid loops)
  const parentCandidates = brands.filter(b => {
    if (!brandToEdit) return true;
    return b.id !== brandToEdit.id;
  });

  useEffect(() => {
    if (brandToEdit) {
      setName(brandToEdit.name || '');
      setDescription(brandToEdit.description || '');
      setCountry(brandToEdit.country || 'United States');
      setWebsite(brandToEdit.website || '');
      setStatus(brandToEdit.status || 'active');
      setParentId(brandToEdit.parentId || null);
      setLogo(brandToEdit.logo || '');
    } else {
      setName('');
      setDescription('');
      setCountry('United States');
      setWebsite('');
      setStatus('active');
      setParentId(defaultParentId || null);
      setLogo('');
    }
    setLogoError(false);
    setError('');
  }, [brandToEdit, isOpen, defaultParentId]);

  if (!isOpen) return null;

  const selectedParent = parentId ? brands.find(b => b.id === parentId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Brand name is required');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      country: country.trim() || undefined,
      website: website.trim() || undefined,
      status,
      logo: logo.trim() || undefined,
      parentId: parentId || null,
      parentName: selectedParent ? selectedParent.name : undefined,
    };

    if (brandToEdit) {
      updateBrand(brandToEdit.id, payload);
    } else {
      addBrand(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {logo && !logoError ? (
                <img
                  src={logo}
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain rounded-lg"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Tag className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {brandToEdit ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <p className="text-xs text-slate-500">
                {brandToEdit
                  ? `Modify details, parent hierarchy, and logo for ${brandToEdit.name}`
                  : 'Register a primary manufacturer or specialized sub-brand'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Brand Name & Parent Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Beats, ROG, Apple Inc."
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Parent Brand (Sub-brand of)</span>
                {parentId && (
                  <span className="text-[10px] font-bold text-blue-600">Sub-brand</span>
                )}
              </label>
              <select
                value={parentId || ''}
                onChange={e => setParentId(e.target.value ? e.target.value : null)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="">None (Primary / Parent Brand)</option>
                {parentCandidates.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.parentId ? '(Sub-brand)' : '(Primary)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hierarchy preview banner if sub-brand */}
          {selectedParent && (
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-800">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Configured as a sub-brand under <strong className="font-semibold">{selectedParent.name}</strong>
              </span>
            </div>
          )}

          {/* Brand Logo Upload & Presets */}
          <div className="pt-1">
            <ImageUploadField
              value={logo}
              onChange={val => {
                setLogo(val);
                setLogoError(false);
              }}
              label="Brand Logo / Mark"
              sublabel="Upload brand emblem or SVG vector (Drag & Drop or Click to Browse)"
              placeholderText="https://example.com/brand-logo.svg"
              presetOptions={COMMON_BRAND_LOGOS}
              fallbackText={name ? name.slice(0, 2).toUpperCase() : 'LOGO'}
              previewShape="rounded"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country of Origin
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. United States, Japan, South Korea"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="active">Active (Permitted on POS)</option>
                <option value="inactive">Inactive / Discontinued</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Website / Support Portal
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. https://www.apple.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Product Lines
            </label>
            <textarea
              rows={3}
              placeholder="Summary of product families, warranty guidelines, or OEM partner notes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs shadow-blue-200 cursor-pointer"
            >
              {brandToEdit ? 'Save Changes' : 'Create Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

