
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
  Log_out,
  User
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
      icon: Database,
      requiresPermission: null,
    },
    {
      id: 'pos',
      label: 'Punto de Venta',
      icon: Search,
      requiresPermission: { module: 'sales', action: 'create' },
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Database,
      requiresPermission: { module: 'inventory', action: 'read' },
    },
    {
      id: 'workshop',
      label: 'Taller',
      icon: Settings,
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
      icon: Search,
      requiresPermission: { module: 'reports', action: 'read' },
    },
  ];

  const filteredItems = menuItems.filter(item => {
    if (!item.requiresPermission) return true;
    return hasPermission(item.requiresPermission.module, item.requiresPermission.action);
  });

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          BiciCentro ERP
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <User className="h-4 w-4 text-sidebar-accent-foreground" />
          <div className="text-sm">
            <p className="text-sidebar-foreground font-medium">{user?.name}</p>
            <p className="text-sidebar-accent-foreground text-xs">{user?.role.displayName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    'erp-sidebar-item w-full text-left',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Log_out className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
