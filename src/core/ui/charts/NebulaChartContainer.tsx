import React from 'react';

interface NebulaChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: string;
}

export const NebulaChartContainer: React.FC<NebulaChartContainerProps> = ({
  title,
  subtitle,
  children,
  height = 'h-64',
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className={`w-full ${height} flex items-center justify-center`}>
        {children}
      </div>
    </div>
  );
};
