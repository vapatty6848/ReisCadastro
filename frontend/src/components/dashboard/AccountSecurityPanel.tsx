'use client';

import {
  changePasswordSchema,
  ChangePasswordData,
  createAdminSchema,
  CreateAdminData,
} from '@/schemas';
import api from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';

export function AccountSecurityPanel() {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const {
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
    reset: resetAdmin,
    formState: { errors: adminFormErrors, isSubmitting: isSubmittingAdmin },
  } = useForm<CreateAdminData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      role: 'ADMIN',
    },
  });

  const onSubmit = async (data: ChangePasswordData) => {
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setSuccess(response?.data?.message || 'Senha alterada com sucesso');
      reset();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao alterar senha');
    }
  };

  const onSubmitAdmin = async (data: CreateAdminData) => {
    setAdminError('');
    setAdminSuccess('');

    try {
      const response = await api.post('/api/auth/admins', {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role,
      });

      setAdminSuccess(response?.data?.message || 'Administrador criado com sucesso');
      resetAdmin({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        role: 'ADMIN',
      });
    } catch (err: any) {
      setAdminError(err?.response?.data?.message || 'Erro ao criar administrador');
    }
  };

  return (
    <section className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800">Conta e Segurança</h2>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Altere sua senha com segurança. Use uma senha forte e única.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-3 text-sm text-emerald-600">{success}</p>}

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Senha atual</label>
          <input
            {...register('currentPassword')}
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Digite sua senha atual"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Nova senha</label>
          <input
            {...register('newPassword')}
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Mínimo de 6 caracteres"
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">Confirmar nova senha</label>
          <input
            {...register('confirmPassword')}
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Repita a nova senha"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando...' : 'Alterar senha'}
        </button>
      </form>

      {user?.role === 'SUPER_ADMIN' && (
        <form
          onSubmit={handleSubmitAdmin(onSubmitAdmin)}
          className="p-6 mt-6 bg-white border border-gray-200 shadow-sm rounded-2xl"
        >
          <h3 className="mb-1 text-lg font-semibold text-gray-800">Criar novo administrador</h3>
          <p className="mb-4 text-sm text-gray-500">
            Apenas SUPER_ADMIN pode criar novos administradores.
          </p>

          {adminError && <p className="mb-3 text-sm text-red-600">{adminError}</p>}
          {adminSuccess && <p className="mb-3 text-sm text-emerald-600">{adminSuccess}</p>}

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Nome</label>
            <input
              {...registerAdmin('name')}
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Nome do administrador"
            />
            {adminFormErrors.name && (
              <p className="mt-1 text-sm text-red-500">{adminFormErrors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              {...registerAdmin('email')}
              type="email"
              className="w-full p-2 border rounded"
              placeholder="email@dominio.com"
            />
            {adminFormErrors.email && (
              <p className="mt-1 text-sm text-red-500">{adminFormErrors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Perfil</label>
            <select {...registerAdmin('role')} className="w-full p-2 border rounded">
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Senha inicial</label>
            <input
              {...registerAdmin('password')}
              type="password"
              className="w-full p-2 border rounded"
              placeholder="Mínimo de 8 caracteres"
            />
            {adminFormErrors.password && (
              <p className="mt-1 text-sm text-red-500">{adminFormErrors.password.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Confirmar senha inicial</label>
            <input
              {...registerAdmin('confirmPassword')}
              type="password"
              className="w-full p-2 border rounded"
              placeholder="Repita a senha inicial"
            />
            {adminFormErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{adminFormErrors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmittingAdmin}
            className="w-full p-2 font-medium text-white rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmittingAdmin ? 'Criando...' : 'Criar administrador'}
          </button>
        </form>
      )}
    </section>
  );
}
