'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginData } from '@/schemas';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', data);
      login(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Login Fanfarra</h2>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <div className="mb-4">
          <label className="block mb-2 text-gray-700">Email</label>
          <input
            {...register('email')}
            className="w-full p-2 border rounded"
            type="email"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-gray-700">Senha</label>
          <input
            {...register('password')}
            className="w-full p-2 border rounded"
            type="password"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          Entrar
        </button>
      </form>
    </div>
  );
}
