import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Tag, Barcode, Layers, Image as ImageIcon } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, brands, addProduct, updateProduct, settings } = usePOS();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [unit, setUnit] = useState('Pc');
  const [purchasePrice, setPurchasePrice] = useState('0.00');
  const [sellingPrice, setSellingPrice] = useState('0.00');
  const [currentStock, setCurrentStock] = useState('10');
  const [alertQuantity, setAlertQuantity] = useState('5');
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imeiTracking, setImeiTracking] = useState(false);
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [specs, setSpecs] = useState('');
  const [serialNumbersText, setSerialNumbersText] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setBarcode(productToEdit.barcode);
      setCategoryId(productToEdit.categoryId);
      setBrandId(productToEdit.brandId || '');
      setUnit(productToEdit.unit);
      setPurchasePrice(productToEdit.purchasePrice.toString());
      setSellingPrice(productToEdit.sellingPrice.toString());
      setCurrentStock(productToEdit.currentStock.toString());
      setAlertQuantity(productToEdit.alertQuantity.toString());
      setTaxRate(productToEdit.taxRate.toString());
      setDescription(productToEdit.description || '');
      setImage(productToEdit.image || '');
      setImeiTracking(productToEdit.imeiTracking || false);
      setWarrantyMonths((productToEdit.warrantyMonths || 12).toString());
      setSpecs(productToEdit.specs || '');
      setSerialNumbersText((productToEdit.serialNumbers || []).join('\n'));
    } else {
      setName('');
      setSku(`SKU-${Date.now().toString().slice(-6)}`);
      setBarcode(`890${Date.now().toString().slice(-10)}`);
      setCategoryId(categories[0]?.id || '');
      setBrandId(brands[0]?.id || '');
      setUnit('Pc');
      setPurchasePrice('10.00');
      setSellingPrice('19.99');
      setCurrentStock('20');
      setAlertQuantity('5');
      setTaxRate(settings.taxRate.toString());
      setDescription('');
      setImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60');
      setImeiTracking(false);
      setWarrantyMonths('12');
      setSpecs('');
      setSerialNumbersText('');
    }
  }, [productToEdit, isOpen, categories, brands, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedCat = categories.find(c => c.id === categoryId) || categories[0];
    const matchedBrand = brands.find(b => b.id === brandId);

    const serials = serialNumbersText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      barcode: barcode.trim(),
      categoryId: matchedCat?.id || 'cat-1',
      categoryName: matchedCat?.name || 'General',
      brandId: matchedBrand?.id,
      brandName: matchedBrand?.name,
      unit: unit.trim() || 'Pc',
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      currentStock: parseInt(currentStock) || 0,
      alertQuantity: parseInt(alertQuantity) || 0,
      taxRate: parseFloat(taxRate) || 0,
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      imeiTracking,
      warrantyMonths: parseInt(warrantyMonths) || 12,
      specs: specs.trim() || undefined,
      serialNumbers: serials.length > 0 ? serials : undefined,
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  const marginPercent = parseFloat(sellingPrice) > 0 && parseFloat(purchasePrice) > 0
    ? (((parseFloat(sellingPrice) - parseFloat(purchasePrice)) / parseFloat(sellingPrice)) * 100).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">
              {productToEdit ? 'Edit Product & Pricing' : 'Add New Product to Catalog'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ergonomic Bluetooth Mouse"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode (UPC/EAN-13)</label>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                <select
                  value={brandId}
                  onChange={e => setBrandId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="">No Brand / Generic</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="Pc, Bag, Kg, Box"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Margins */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Pricing & Stock Float</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase / Cost Price ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selling / Retail Price ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={sellingPrice}
                  onChange={e => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-lg text-blue-600"
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-700">Gross Margin</span>
                  <p className="text-sm font-black text-blue-800">{marginPercent}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={currentStock}
                  onChange={e => setCurrentStock(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Quantity Threshold</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={alertQuantity}
                  onChange={e => setAlertQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Electronics & IMEI / Serial Number Tracking */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                Electronics & Serial Number / IMEI Tracking
              </h4>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-blue-800">
                <input
                  type="checkbox"
                  checked={imeiTracking}
                  onChange={e => setImeiTracking(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Enable IMEI / Serial Capture on POS</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warranty Duration (Months)
                </label>
                <input
                  type="number"
                  min="0"
                  value={warrantyMonths}
                  onChange={e => setWarrantyMonths(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  placeholder="e.g. 12, 24, 36"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hardware Specifications Summary
                </label>
                <input
                  type="text"
                  value={specs}
                  onChange={e => setSpecs(e.target.value)}
                  placeholder="e.g. 256GB SSD, 16GB RAM, A17 Pro Chip"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {imeiTracking && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Stock Serial Numbers / IMEIs (One per line)
                </label>
                <textarea
                  rows={3}
                  value={serialNumbersText}
                  onChange={e => setSerialNumbersText(e.target.value)}
                  placeholder="359810293847581&#10;359810293847582&#10;359810293847583"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Each scanned or entered serial will automatically be deducted during POS checkout.
                </p>
              </div>
            )}
          </div>

          {/* Media & Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Image URL (Optional)</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short product overview or specification notes..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm shadow-blue-500/30 transition-colors"
            >
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
