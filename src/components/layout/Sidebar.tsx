
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  ShoppingCart, 
  Package, 
  Wrench, 
  Users, 
  ShoppingBag, 
  Calculator,
  BarChart3, 
  Settings,
  Bike
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/',
      permission: null,
    },
    {
      icon: ShoppingCart,
      label: 'Punto de Venta',
      path: '/pos',
      permission: { module: 'sales', action: 'create' },
    },
    {
      icon: Package,
      label: 'Inventario',
      path: '/inventory',
      permission: { module: 'inventory', action: 'read' },
    },
    {
      icon: Wrench,
      label: 'Taller',
      path: '/workshop',
      permission: { module: 'workshop', action: 'read' },
      highlight: true,
    },
    {
      icon: Users,
      label: 'Clientes',
      path: '/clients',
      permission: { module: 'clients', action: 'read' },
    },
    {
      icon: ShoppingBag,
      label: 'Compras',
      path: '/purchases',
      permission: { module: 'purchases', action: 'read' },
    },
    {
      icon: Calculator,
      label: 'Calculadora',
      path: '/calculator',
      permission: null,
    },
    {
      icon: BarChart3,
      label: 'Reportes',
      path: '/reports',
      permission: { module: 'reports', action: 'read' },
    },
    {
      icon: Settings,
      label: 'Configuración',
      path: '/settings',
      permission: { module: 'settings', action: 'read' },
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission.module, item.permission.action);
  });

  const getUserRole = () => {
    if (user?.role) {
      if (typeof user.role === 'string') return user.role;
      if (typeof user.role === 'object' && user.role.name) return user.role.name;
    }
    return 'Admin';
  };

  return (
    <div className="w-64 bg-slate-800 text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Bike className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">BikeERP</h1>
            <p className="text-xs text-slate-400">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium text-sm">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-slate-400">{getUserRole()}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? item.highlight
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
