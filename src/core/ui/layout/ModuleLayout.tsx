import React from 'react';

interface ModuleLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  workspaceTabs?: React.ReactNode;
  toolbar?: React.ReactNode;
}

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  children,
  header,
  workspaceTabs,
  toolbar,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {header}
      {workspaceTabs}
      {toolbar}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};
