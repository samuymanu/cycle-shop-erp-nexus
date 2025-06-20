import React from 'react';
import {
  BarChart3,
  LayoutDashboard,
  ListChecks,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  PackageIcon,
  Coins,
  FileText,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  permissions?: string[];
}

const Sidebar = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: '/pos',
      label: 'Punto de Venta',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      path: '/inventory',
      label: 'Inventario',
      icon: <PackageIcon className="h-5 w-5" />,
    },
    {
      path: '/clients',
      label: 'Clientes',
      icon: <Users className="h-5 w-5" />,
      permissions: ['clients', 'read'],
    },
    {
      path: '/services',
      label: 'Servicios',
      icon: <ListChecks className="h-5 w-5" />,
      permissions: ['services', 'read'],
    },
    {
      path: '/finances',
      label: 'Finanzas',
      icon: <Coins className="h-5 w-5" />,
      permissions: ['finances', 'read'],
    },
    {
      path: '/reports',
      label: 'Reportes',
      icon: <FileText className="h-5 w-5" />,
      permissions: ['reports', 'read'],
    },
    {
      path: '/settings',
      label: 'Configuración',
      icon: <Settings className="h-5 w-5" />,
      permissions: ['settings', 'read'],
    },
  ];

  const handleLogout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await logout();
      navigate('/login');
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="bikeERP-sidebar">
      {/* Header Section */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <BarChart3 className="h-8 w-8 text-primary" />
        <span className="ml-2 text-lg font-bold text-gray-900">BikeERP</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            if (item.permissions && !hasPermission(item.permissions[0], item.permissions[1] || 'read')) {
              return null;
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-left text-gray-700 rounded-lg transition-colors duration-200 group
                  ${isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Sign Out Section - agregado al final */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200 group"
        >
          <LogOut className="h-5 w-5 group-hover:text-red-600" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
        
        {/* User info */}
        <div className="mt-3 px-4 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Conectado como:</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.email || 'Usuario'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
