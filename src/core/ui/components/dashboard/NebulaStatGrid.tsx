import React from 'react';

export interface NebulaStatGridProps {
  children: React.ReactNode;
}

export const NebulaStatGrid: React.FC<NebulaStatGridProps> = ({ children }) => {
  return (
    <div 
      className="grid gap-5 w-full"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
      }}
    >
      {children}
    </div>
  );
};

