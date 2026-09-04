import React from 'react';
import { CheckSquare, Trash2, Edit, Download } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onDelete?: () => void;
  onExport?: () => void;
  onEdit?: () => void;
  onClearSelection: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onDelete,
  onExport,
  onEdit,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-2xl animate-fade-in">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-bold text-blue-900">{selectedCount} items selected</span>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-xs text-blue-600 hover:underline ml-2 cursor-pointer font-medium"
        >
          Clear
        </button>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 hover:bg-blue-100/50 transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 hover:bg-blue-100/50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};
