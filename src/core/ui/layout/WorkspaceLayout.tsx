import React from 'react';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  children,
  sidebar,
  header,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {header}
      <div className="flex-1 flex overflow-hidden">
        {sidebar && <div className="shrink-0 border-r border-slate-200 bg-white">{sidebar}</div>}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
