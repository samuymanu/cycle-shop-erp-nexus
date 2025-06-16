
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'}`}>
        <Sidebar />
      </div>
      <main className="flex-1 overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
