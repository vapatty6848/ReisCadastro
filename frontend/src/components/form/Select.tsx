import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
  options: { value: string; label: string }[];
}

export const Select = ({ label, error, register, options, ...props }: SelectProps) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 mb-1 font-medium">{label}</label>
      <select
        {...register}
        {...props}
        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
      >
        <option value="">Selecione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
