import React from 'react';

interface NebulaFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export const NebulaForm: React.FC<NebulaFormProps> = ({
  children,
  onSubmit,
  className = '',
  ...props
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={`flex flex-col space-y-6 ${className}`}
      {...props}
    >
      {children}
    </form>
  );
};
