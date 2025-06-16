
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Wrench, 
  Users, 
  ShoppingBag,
  Calculator,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  Bike
} from 'lucide-react';

const Sidebar = () => {
  const { logout, hasPermission } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
      permission: { module: 'dashboard', action: 'read' as const }
    },
    {
      label: 'Punto de Venta',
      icon: ShoppingCart,
      href: '/pos',
      permission: { module: 'sales', action: 'create' as const }
    },
    {
      label: 'Inventario',
      icon: Package,
      href: '/inventory',
      permission: { module: 'inventory', action: 'read' as const }
    },
    {
      label: 'Taller',
      icon: Wrench,
      href: '/workshop',
      permission: { module: 'workshop', action: 'read' as const }
    },
    {
      label: 'Clientes',
      icon: Users,
      href: '/clients',
      permission: { module: 'clients', action: 'read' as const }
    },
    {
      label: 'Compras',
      icon: ShoppingBag,
      href: '/purchases',
      permission: { module: 'purchases', action: 'read' as const }
    },
    {
      label: 'Calculadora',
      icon: Calculator,
      href: '/calculator',
      permission: { module: 'tools', action: 'read' as const }
    },
    {
      label: 'Reportes',
      icon: BarChart3,
      href: '/reports',
      permission: { module: 'reports', action: 'read' as const }
    },
    {
      label: 'Configuración',
      icon: Settings,
      href: '/settings',
      permission: { module: 'settings', action: 'read' as const }
    }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    hasPermission(item.permission.module, item.permission.action)
  );

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn(
      "bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Bike className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg">BikeERP</h1>
                <p className="text-xs text-slate-400">Sistema de Gestión</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-800 text-white"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">JP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Juan Pérez</p>
              <p className="text-xs text-slate-400 truncate">Administrador</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-slate-800 hover:text-white",
                isActive 
                  ? "bg-emerald-600 text-white shadow-lg" 
                  : "text-slate-300",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <Button
          onClick={logout}
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-red-600 hover:text-white transition-colors",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
