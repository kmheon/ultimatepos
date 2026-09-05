import React, { useState, useEffect, useMemo } from 'react';
import { X, Layers, Tag, AlignLeft, Hash, Sparkles, FolderTree, CornerDownRight, ArrowRight } from 'lucide-react';
import { Category } from '../../types';
import { usePOS } from '../../context/POSContext';
import { ImageUploadField } from '../common/ImageUploadField';
import { COMMON_CATEGORY_PRESETS } from '../../data/mockData';

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  defaultParentId?: string | null;
}

export const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  defaultParentId,
}) => {
  const { addCategory, updateCategory, categories } = usePOS();

  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setShortCode(categoryToEdit.shortCode);
      setDescription(categoryToEdit.description || '');
      setParentId(categoryToEdit.parentId || '');
      setImage(categoryToEdit.image || categoryToEdit.icon || '');
    } else {
      setName('');
      setShortCode('');
      setDescription('');
      setParentId(defaultParentId || '');
      setImage('');
    }
  }, [categoryToEdit, defaultParentId, isOpen]);

  // Compute invalid parent IDs to prevent cycles (self and descendants)
  const invalidParentIds = useMemo(() => {
    if (!categoryToEdit) return new Set<string>();
    const invalid = new Set<string>([categoryToEdit.id]);

    const addDescendants = (id: string) => {
      categories.forEach(c => {
        if (c.parentId === id && !invalid.has(c.id)) {
          invalid.add(c.id);
          addDescendants(c.id);
        }
      });
    };

    addDescendants(categoryToEdit.id);
    return invalid;
  }, [categoryToEdit, categories]);

  // Available parent categories (eligible categories)
  const eligibleParents = useMemo(() => {
    return categories.filter(c => !invalidParentIds.has(c.id));
  }, [categories, invalidParentIds]);

  if (!isOpen) return null;

  // Selected parent object
  const selectedParent = categories.find(c => c.id === parentId);

  // Auto-generate short code when name changes if user hasn't typed a custom short code
  const handleNameChange = (val: string) => {
    setName(val);
    if (!categoryToEdit) {
      const prefix = selectedParent ? selectedParent.shortCode.slice(0, 2) : '';
      const generated = val
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, prefix ? 3 : 4)
        .toUpperCase();
      setShortCode(prefix ? `${prefix}-${generated}` : generated);
    }
  };

  const handleParentChange = (newParentId: string) => {
    setParentId(newParentId);
    if (!categoryToEdit && name.trim()) {
      const parent = categories.find(c => c.id === newParentId);
      const prefix = parent ? parent.shortCode.slice(0, 2) : '';
      const baseCode = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, prefix ? 3 : 4).toUpperCase();
      setShortCode(prefix ? `${prefix}-${baseCode}` : baseCode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const code = shortCode.trim() || name.trim().slice(0, 3).toUpperCase();
    const targetParentId = parentId.trim() ? parentId.trim() : null;

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        name: name.trim(),
        shortCode: code,
        description: description.trim(),
        parentId: targetParentId,
        parentName: selectedParent ? selectedParent.name : undefined,
        image: image.trim() || undefined,
      });
    } else {
      addCategory({
        name: name.trim(),
        shortCode: code,
        description: description.trim() || (targetParentId ? `Subcategory of ${selectedParent?.name}` : 'Master department category'),
        parentId: targetParentId,
        parentName: selectedParent ? selectedParent.name : undefined,
        image: image.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 overflow-hidden shrink-0">
              {image ? (
                <img
                  src={image}
                  alt="Category icon"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FolderTree className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {categoryToEdit ? 'Edit Category' : 'Create Category / Subcategory'}
              </h3>
              <p className="text-xs text-slate-400">Taxonomy hierarchy & departmental nesting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Parent Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Parent Category (Hierarchy)
              </label>
              <span className="text-[10px] text-slate-400">Nest under an existing category</span>
            </div>
            <div className="relative">
              <FolderTree className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={parentId}
                onChange={e => handleParentChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-800 cursor-pointer"
              >
                <option value="">None (Top-Level Master Category)</option>
                {eligibleParents.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.parentId && c.parentName ? `↳ ${c.parentName} → ${c.name}` : `📁 ${c.name} [${c.shortCode}]`}
                  </option>
                ))}
              </select>
            </div>

            {/* Hierarchy visual preview badge */}
            {selectedParent && (
              <div className="mt-2 p-2 bg-blue-50/70 border border-blue-100 rounded-lg flex items-center gap-1.5 text-xs text-blue-800">
                <CornerDownRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-600">Subcategory of:</span>
                <span className="font-bold text-blue-700">{selectedParent.name}</span>
                {name.trim() && (
                  <>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-slate-900">{name}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder={selectedParent ? 'e.g., Wireless Chargers, Foldable Phones, Gaming Mice' : 'e.g., Hardware, Consumer Electronics, Apparel'}
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Short Code Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category Code (Short Tag)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Used for SKU prefixing</span>
            </div>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                maxLength={10}
                placeholder="e.g., PH-FOLD, ACC-CHG"
                value={shortCode}
                onChange={e => setShortCode(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-bold text-slate-800 uppercase"
              />
            </div>
          </div>

          {/* Category Icon / Thumbnail Upload */}
          <div className="pt-1">
            <ImageUploadField
              value={image}
              onChange={setImage}
              label="Category Icon / Thumbnail"
              sublabel="Upload a logo, icon, or category image (Drag & Drop or Click to Browse)"
              placeholderText="https://example.com/category-icon.png"
              presetOptions={COMMON_CATEGORY_PRESETS}
              fallbackText={shortCode || 'CAT'}
              previewShape="rounded"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <div className="relative">
              <textarea
                rows={2}
                placeholder="Brief description of product taxonomy or specifications..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-700 resize-none"
              />
            </div>
          </div>

          {/* Helpful Tip */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Organizing subcategories under parent groups streamlines point-of-sale browsing and enables targeted inventory reports.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              {categoryToEdit ? 'Save Changes' : selectedParent ? 'Create Subcategory' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
