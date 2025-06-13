
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Database, 
  Settings, 
  Search,
  Calendar,
  LogOut,
  User,
  BarChart3,
  ShoppingCart,
  Wrench,
  Home,
  Package
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      requiresPermission: null,
    },
    {
      id: 'pos',
      label: 'Punto de Venta',
      icon: ShoppingCart,
      requiresPermission: { module: 'sales', action: 'create' },
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package,
      requiresPermission: { module: 'inventory', action: 'read' },
    },
    {
      id: 'workshop',
      label: 'Taller',
      icon: Wrench,
      requiresPermission: { module: 'workshop', action: 'read' },
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      requiresPermission: { module: 'clients', action: 'read' },
    },
    {
      id: 'purchases',
      label: 'Compras',
      icon: Calendar,
      requiresPermission: { module: 'purchases', action: 'read' },
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      requiresPermission: { module: 'reports', action: 'read' },
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      requiresPermission: { module: 'settings', action: 'read' },
    },
  ];

  const filteredItems = menuItems.filter(item => {
    if (!item.requiresPermission) return true;
    return hasPermission(item.requiresPermission.module, item.requiresPermission.action);
  });

  return (
    <div className="flex flex-col h-full bg-sidebar shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sidebar-foreground">BiciCentro</h2>
            <p className="text-sm text-sidebar-accent-foreground">ERP System</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-sidebar-accent rounded-lg">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-accent-foreground truncate">{user?.role.displayName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'erp-sidebar-item w-full text-left',
                isActive && 'bg-primary text-white shadow-md'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg py-3"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
