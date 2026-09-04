import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  navbar?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, sidebar, navbar }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {sidebar && <div className="shrink-0">{sidebar}</div>}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {navbar && <div className="shrink-0">{navbar}</div>}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};
