
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import POS from '@/components/modules/POS';
import Inventory from '@/components/modules/Inventory';
import Workshop from '@/components/modules/Workshop';
import Settings from '@/components/modules/Settings';
import Clients from '@/components/modules/Clients';
import Purchases from '@/components/modules/Purchases';
import Reports from '@/components/modules/Reports';

const MainLayout = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
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
        return <Dashboard onPageChange={setCurrentPage} />;
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
