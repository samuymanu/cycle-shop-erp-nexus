
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import POS from '@/components/modules/POS';
import Inventory from '@/components/modules/Inventory';
import Workshop from '@/components/modules/Workshop';
import Settings from '@/components/modules/Settings';

// Placeholder components for other modules
const Clients = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
        <p className="text-gray-600">Administra tu base de clientes</p>
      </div>
    </div>
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">Módulo de clientes en desarrollo...</p>
      </div>
    </div>
  </div>
);

const Purchases = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Compras</h1>
        <p className="text-gray-600">Controla tus compras y proveedores</p>
      </div>
    </div>
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">Módulo de compras en desarrollo...</p>
      </div>
    </div>
  </div>
);

const Reports = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
        <p className="text-gray-600">Genera reportes detallados del negocio</p>
      </div>
    </div>
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">Módulo de reportes en desarrollo...</p>
      </div>
    </div>
  </div>
);

const MainLayout = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POS />;
      case 'inventory':
        return <Inventory />;
      case 'workshop':
        return <Workshop />;
      case 'clients':
        return <Clients />;
      case 'purchases':
        return <Purchases />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default MainLayout;
