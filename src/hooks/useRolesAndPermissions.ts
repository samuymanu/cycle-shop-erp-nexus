
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

const DEFAULT_PERMISSIONS: Permission[] = [
  // Inventario
  { id: 'inventory.create', name: 'inventory.create', displayName: 'Crear Productos', description: 'Agregar nuevos productos al inventario', module: 'inventory', action: 'create' },
  { id: 'inventory.read', name: 'inventory.read', displayName: 'Ver Inventario', description: 'Consultar productos y stock', module: 'inventory', action: 'read' },
  { id: 'inventory.update', name: 'inventory.update', displayName: 'Editar Productos', description: 'Modificar información de productos', module: 'inventory', action: 'update' },
  { id: 'inventory.delete', name: 'inventory.delete', displayName: 'Eliminar Productos', description: 'Remover productos del inventario', module: 'inventory', action: 'delete' },
  { id: 'inventory.adjust', name: 'inventory.adjust', displayName: 'Ajustar Stock', description: 'Modificar cantidades de inventario', module: 'inventory', action: 'execute' },
  
  // Ventas
  { id: 'sales.create', name: 'sales.create', displayName: 'Crear Ventas', description: 'Registrar nuevas ventas', module: 'sales', action: 'create' },
  { id: 'sales.read', name: 'sales.read', displayName: 'Ver Ventas', description: 'Consultar historial de ventas', module: 'sales', action: 'read' },
  { id: 'sales.update', name: 'sales.update', displayName: 'Editar Ventas', description: 'Modificar ventas existentes', module: 'sales', action: 'update' },
  { id: 'sales.delete', name: 'sales.delete', displayName: 'Anular Ventas', description: 'Cancelar o anular ventas', module: 'sales', action: 'delete' },
  
  // Taller
  { id: 'workshop.create', name: 'workshop.create', displayName: 'Crear Órdenes', description: 'Crear órdenes de servicio', module: 'workshop', action: 'create' },
  { id: 'workshop.read', name: 'workshop.read', displayName: 'Ver Órdenes', description: 'Consultar órdenes de servicio', module: 'workshop', action: 'read' },
  { id: 'workshop.update', name: 'workshop.update', displayName: 'Editar Órdenes', description: 'Modificar órdenes de servicio', module: 'workshop', action: 'update' },
  { id: 'workshop.delete', name: 'workshop.delete', displayName: 'Eliminar Órdenes', description: 'Cancelar órdenes de servicio', module: 'workshop', action: 'delete' },
  
  // Clientes
  { id: 'clients.create', name: 'clients.create', displayName: 'Crear Clientes', description: 'Registrar nuevos clientes', module: 'clients', action: 'create' },
  { id: 'clients.read', name: 'clients.read', displayName: 'Ver Clientes', description: 'Consultar información de clientes', module: 'clients', action: 'read' },
  { id: 'clients.update', name: 'clients.update', displayName: 'Editar Clientes', description: 'Modificar datos de clientes', module: 'clients', action: 'update' },
  { id: 'clients.delete', name: 'clients.delete', displayName: 'Eliminar Clientes', description: 'Remover clientes del sistema', module: 'clients', action: 'delete' },
  
  // Reportes
  { id: 'reports.read', name: 'reports.read', displayName: 'Ver Reportes', description: 'Acceder a reportes del sistema', module: 'reports', action: 'read' },
  { id: 'reports.export', name: 'reports.export', displayName: 'Exportar Reportes', description: 'Descargar reportes en diferentes formatos', module: 'reports', action: 'execute' },
  
  // Usuarios
  { id: 'users.create', name: 'users.create', displayName: 'Crear Usuarios', description: 'Registrar nuevos usuarios', module: 'users', action: 'create' },
  { id: 'users.read', name: 'users.read', displayName: 'Ver Usuarios', description: 'Consultar información de usuarios', module: 'users', action: 'read' },
  { id: 'users.update', name: 'users.update', displayName: 'Editar Usuarios', description: 'Modificar datos de usuarios', module: 'users', action: 'update' },
  { id: 'users.delete', name: 'users.delete', displayName: 'Eliminar Usuarios', description: 'Remover usuarios del sistema', module: 'users', action: 'delete' },
  
  // Configuración
  { id: 'settings.read', name: 'settings.read', displayName: 'Ver Configuración', description: 'Acceder a configuraciones del sistema', module: 'settings', action: 'read' },
  { id: 'settings.update', name: 'settings.update', displayName: 'Editar Configuración', description: 'Modificar configuraciones del sistema', module: 'settings', action: 'update' },
];

const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'admin',
    displayName: 'Administrador',
    description: 'Acceso completo a todas las funciones del sistema',
    permissions: DEFAULT_PERMISSIONS.map(p => p.id),
    isSystem: true,
  },
  {
    id: 'manager',
    name: 'manager',
    displayName: 'Gerente',
    description: 'Acceso a ventas, inventario y reportes',
    permissions: [
      'inventory.read', 'inventory.update', 'inventory.adjust',
      'sales.create', 'sales.read', 'sales.update',
      'workshop.create', 'workshop.read', 'workshop.update',
      'clients.create', 'clients.read', 'clients.update',
      'reports.read', 'reports.export',
    ],
    isSystem: true,
  },
  {
    id: 'cashier',
    name: 'cashier',
    displayName: 'Cajero',
    description: 'Acceso a ventas y consulta de inventario',
    permissions: [
      'inventory.read',
      'sales.create', 'sales.read',
      'clients.create', 'clients.read', 'clients.update',
    ],
    isSystem: true,
  },
  {
    id: 'technician',
    name: 'technician',
    displayName: 'Técnico',
    description: 'Acceso al taller y consulta de inventario',
    permissions: [
      'inventory.read',
      'workshop.create', 'workshop.read', 'workshop.update',
      'clients.read',
    ],
    isSystem: true,
  },
];

export function useRolesAndPermissions() {
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_PERMISSIONS);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    try {
      const storedRoles = localStorage.getItem('systemRoles');
      const storedPermissions = localStorage.getItem('systemPermissions');
      
      if (storedRoles) {
        setRoles(JSON.parse(storedRoles));
      }
      
      if (storedPermissions) {
        setPermissions(JSON.parse(storedPermissions));
      }
    } catch (error) {
      console.error('Error loading roles and permissions:', error);
    }
  }, []);

  const saveToStorage = (newRoles: Role[], newPermissions: Permission[]) => {
    try {
      localStorage.setItem('systemRoles', JSON.stringify(newRoles));
      localStorage.setItem('systemPermissions', JSON.stringify(newPermissions));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const createRole = (roleData: Omit<Role, 'id'>) => {
    const id = `custom_${Date.now()}`;
    const newRole: Role = { ...roleData, id };
    const updatedRoles = [...roles, newRole];
    
    setRoles(updatedRoles);
    saveToStorage(updatedRoles, permissions);
    
    toast({
      title: "Rol Creado",
      description: `El rol "${newRole.displayName}" ha sido creado exitosamente`,
    });
    
    return newRole;
  };

  const updateRole = (roleId: string, updates: Partial<Role>) => {
    const updatedRoles = roles.map(role => 
      role.id === roleId ? { ...role, ...updates } : role
    );
    
    setRoles(updatedRoles);
    saveToStorage(updatedRoles, permissions);
    
    toast({
      title: "Rol Actualizado",
      description: "Los cambios han sido guardados exitosamente",
    });
  };

  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    
    if (role?.isSystem) {
      toast({
        title: "Error",
        description: "No se pueden eliminar roles del sistema",
        variant: "destructive",
      });
      return;
    }
    
    const updatedRoles = roles.filter(role => role.id !== roleId);
    setRoles(updatedRoles);
    saveToStorage(updatedRoles, permissions);
    
    toast({
      title: "Rol Eliminado",
      description: "El rol ha sido eliminado exitosamente",
    });
  };

  const createPermission = (permissionData: Omit<Permission, 'id'>) => {
    const id = `custom_${Date.now()}`;
    const newPermission: Permission = { ...permissionData, id };
    const updatedPermissions = [...permissions, newPermission];
    
    setPermissions(updatedPermissions);
    saveToStorage(roles, updatedPermissions);
    
    toast({
      title: "Permiso Creado",
      description: `El permiso "${newPermission.displayName}" ha sido creado exitosamente`,
    });
    
    return newPermission;
  };

  const assignPermissionToRole = (roleId: string, permissionId: string) => {
    const updatedRoles = roles.map(role => {
      if (role.id === roleId && !role.permissions.includes(permissionId)) {
        return { ...role, permissions: [...role.permissions, permissionId] };
      }
      return role;
    });
    
    setRoles(updatedRoles);
    saveToStorage(updatedRoles, permissions);
  };

  const removePermissionFromRole = (roleId: string, permissionId: string) => {
    const updatedRoles = roles.map(role => {
      if (role.id === roleId) {
        return { 
          ...role, 
          permissions: role.permissions.filter(p => p !== permissionId) 
        };
      }
      return role;
    });
    
    setRoles(updatedRoles);
    saveToStorage(updatedRoles, permissions);
  };

  const getRolePermissions = (roleId: string): Permission[] => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return [];
    
    return permissions.filter(p => role.permissions.includes(p.id));
  };

  const hasPermission = (roleId: string, permissionId: string): boolean => {
    const role = roles.find(r => r.id === roleId);
    return role?.permissions.includes(permissionId) ?? false;
  };

  const getPermissionsByModule = () => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach(permission => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = [];
      }
      grouped[permission.module].push(permission);
    });
    return grouped;
  };

  const resetToDefaults = () => {
    setRoles(DEFAULT_ROLES);
    setPermissions(DEFAULT_PERMISSIONS);
    localStorage.removeItem('systemRoles');
    localStorage.removeItem('systemPermissions');
    
    toast({
      title: "Sistema Restablecido",
      description: "Se han restaurado los roles y permisos por defecto",
    });
  };

  return {
    permissions,
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    createPermission,
    assignPermissionToRole,
    removePermissionFromRole,
    getRolePermissions,
    hasPermission,
    getPermissionsByModule,
    resetToDefaults,
  };
}
