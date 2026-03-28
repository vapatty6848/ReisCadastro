'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, loginSchema, LoginData } from '@/schemas';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [loadingRecovery, setLoadingRecovery] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const response = await api.post('/api/auth/login', data);
      login(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryMessage('');

    const parsed = forgotPasswordSchema.safeParse({ email: recoveryEmail });
    if (!parsed.success) {
      setRecoveryError(parsed.error.issues[0]?.message || 'Email inválido');
      return;
    }

    try {
      setLoadingRecovery(true);
      const response = await api.post('/api/auth/forgot-password', {
        email: recoveryEmail,
      });

      const message = response?.data?.message || 'Solicitação processada.';
      setRecoveryMessage(message);

      if (response?.data?.resetToken) {
        setRecoveryToken(response.data.resetToken);
        setRecoveryMessage(`${message} Token de recuperação gerado para teste (ambiente não produção).`);
      }
    } catch (err: any) {
      setRecoveryError(err.response?.data?.message || 'Erro ao solicitar recuperação de senha');
    } finally {
      setLoadingRecovery(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!recoveryToken || recoveryNewPassword.length < 6) {
      setRecoveryError('Informe token e nova senha válida (mínimo 6 caracteres).');
      return;
    }

    try {
      const response = await api.post('/api/auth/reset-password', {
        token: recoveryToken,
        newPassword: recoveryNewPassword,
      });
      setRecoveryMessage(response?.data?.message || 'Senha redefinida com sucesso.');
      setRecoveryNewPassword('');
    } catch (err: any) {
      setRecoveryError(err.response?.data?.message || 'Erro ao redefinir senha');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Login Corporação</h2>

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

          <button
            type="button"
            onClick={() => setShowRecovery((prev) => !prev)}
            className="mt-2 text-sm font-medium text-blue-600 hover:underline"
          >
            Esqueci a senha
          </button>
        </div>

        {showRecovery && (
          <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
            <h3 className="mb-2 text-sm font-semibold text-blue-900">Recuperação de senha</h3>

            {recoveryError && <p className="mb-2 text-sm text-red-600">{recoveryError}</p>}
            {recoveryMessage && <p className="mb-3 text-sm text-green-700">{recoveryMessage}</p>}

            <div className="mb-3">
              <label className="block mb-1 text-sm text-gray-700">Email</label>
              <input
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="w-full p-2 border rounded"
                type="email"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loadingRecovery}
              className="w-full p-2 mb-3 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {loadingRecovery ? 'Enviando...' : 'Solicitar recuperação'}
            </button>

            <div className="pt-3 border-t border-blue-200">
              <p className="mb-2 text-xs text-gray-600">
                Se você já tem um token de recuperação, redefina a senha abaixo.
              </p>

              <input
                value={recoveryToken}
                onChange={(e) => setRecoveryToken(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
                type="text"
                placeholder="Token de recuperação"
              />

              <input
                value={recoveryNewPassword}
                onChange={(e) => setRecoveryNewPassword(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
                type="password"
                placeholder="Nova senha"
              />

              <button
                type="button"
                onClick={handleResetPassword}
                className="w-full p-2 text-white bg-emerald-600 rounded hover:bg-emerald-700"
              >
                Redefinir senha
              </button>
            </div>
          </div>
        )}

        <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          Entrar
        </button>
      </form>
    </div>
  );
}
