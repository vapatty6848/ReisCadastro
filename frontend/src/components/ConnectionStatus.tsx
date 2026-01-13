'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Verifica se o backend está respondendo
        await api.get('/health');
        setStatus('online');
      } catch (error) {
        setStatus('offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (status === 'online') return null;
  if (status === 'checking') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
        <span className="font-bold">Backend Offline:</span>
        <span className="ml-1">O sistema pode não funcionar corretamente.</span>
      </div>
    </div>
  );
}
