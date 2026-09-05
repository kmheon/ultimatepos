import React from 'react';
import { PurchaseOrdersView } from './PurchaseOrdersView';

export const PurchasesList: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
      <PurchaseOrdersView />
    </div>
  );
};

export default PurchasesList;
