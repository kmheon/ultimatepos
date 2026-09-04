import React from 'react';

interface TableCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const TableCard: React.FC<TableCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col ${className}`}>
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="flex-1 overflow-x-auto">
        {children}
      </div>
    </div>
  );
};
