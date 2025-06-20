
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import CurrencyCalculator from '@/components/modules/CurrencyCalculator';

const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Sincronizar la página actual con la URL
  useEffect(() => {
    const path = location.pathname.slice(1) || 'dashboard';
    setCurrentPage(path);
  }, [location.pathname]);

  // Función para cambiar página y actualizar URL
  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    navigate(`/${page}`);
  };

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
      case 'currency-calculator':
        return <CurrencyCalculator />;
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
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar - Now responsive */}
      <div className="flex-shrink-0">
        <Sidebar onPageChange={handlePageChange} currentPage={currentPage} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default MainLayout;
