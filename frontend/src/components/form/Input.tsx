import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
}

export const Input = ({ label, error, register, ...props }: InputProps) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 mb-1 font-medium">{label}</label>
      <input
        {...register}
        {...props}
        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
