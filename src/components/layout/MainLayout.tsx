
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import POS from '@/components/modules/POS';
import Inventory from '@/components/modules/Inventory';
import Workshop from '@/components/modules/Workshop';

// Placeholder components for other modules
const Clients = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Gestión de Clientes</h1>
    <p className="text-muted-foreground">Módulo de clientes en desarrollo...</p>
  </div>
);

const Purchases = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Gestión de Compras</h1>
    <p className="text-muted-foreground">Módulo de compras en desarrollo...</p>
  </div>
);

const Reports = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Reportes y Análisis</h1>
    <p className="text-muted-foreground">Módulo de reportes en desarrollo...</p>
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
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
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
