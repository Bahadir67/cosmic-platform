import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  const baseStyles = 'w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const defaultStyles = 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20';
    
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '';
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-100">
          {label}
        </label>
      )}
      <input
        className={`${baseStyles} ${defaultStyles} ${errorStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}