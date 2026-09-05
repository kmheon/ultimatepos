import React, { useState } from 'react';
import { Layers, Plus, Folder, Trash2 } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export const InventoryCategoriesView: React.FC = () => {
  const { categories, products, addCategory } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [localArchivedIds, setLocalArchivedIds] = useState<string[]>([]);

  const activeCategories = categories.filter(c => !localArchivedIds.includes(c.id));
  const totalCategories = activeCategories.length;
  const assignedProductsCount = products.filter(p => p.categoryId).length;
  const emptyCategoriesCount = activeCategories.filter(c => !products.some(p => p.categoryId === c.id)).length;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const shortCode = newCategoryName.trim().slice(0, 3).toUpperCase();
    addCategory({
      name: newCategoryName.trim(),
      shortCode,
      description: newCategoryDesc.trim() || 'Custom inventory category',
    });
    setNewCategoryName('');
    setNewCategoryDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Categories</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCategories}</p>
          <span className="text-[10px] font-bold text-blue-600 mt-1 block">Active taxonomies</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subcategories</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">12 Groups</p>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Nested hierarchy</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Products Assigned</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{assignedProductsCount} SKUs</p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Classified items</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empty Categories</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{emptyCategoriesCount}</p>
          <span className="text-[10px] font-bold text-amber-600 mt-1 block">Ready for stock</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Category Taxonomy & Hierarchy</h3>
          <p className="text-xs text-slate-500">Manage item classification groups for fast catalog search & reporting</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeCategories.map(cat => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          return (
            <div key={cat.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Code: {cat.shortCode}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description || 'Enterprise catalog group'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLocalArchivedIds([...localArchivedIds, cat.id])}
                  className="text-slate-300 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                  title="Archive Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">{count} Assigned SKUs</span>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Create New Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Consumer Electronics"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional details or taxonomy guidelines..."
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
