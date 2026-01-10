'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '@/lib/api';
import { Users, Home, Music, Flag } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function DashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get('/api/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Carregando estatísticas...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total Integrantes</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalIntegrantes}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-purple-50 border border-purple-100 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-xl text-white">
              <Home size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600">Corporações</p>
              <p className="text-2xl font-bold text-purple-900">{stats.totalCorporacoes}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-green-50 border border-green-100 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-xl text-white">
              <Music size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Corpo Musical</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.porTipo.find((t: any) => t.label === 'CORPO_MUSICAL')?.value || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-xl text-white">
              <Flag size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600">Linha de Frente</p>
              <p className="text-2xl font-bold text-orange-900">
                {stats.porTipo.find((t: any) => t.label === 'LINHA_FRENTE')?.value || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gráfico de Barras: Por Corporação */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-800">Integrantes por Corporação</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.porCorporacao}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza: Por Tipo */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-800">Distribuição por Categoria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.porSubtipo}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {stats.porSubtipo.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
