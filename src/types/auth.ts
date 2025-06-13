
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserRole {
  id: number;
  name: string;
  displayName: string;
  permissions: Permission[];
}

export interface Permission {
  module: string;
  actions: string[];
}

export const USER_ROLES = {
  ADMIN: 1,
  ADMINISTRATION: 2,
  SALES: 3,
} as const;

export const ROLE_DEFINITIONS: UserRole[] = [
  {
    id: USER_ROLES.ADMIN,
    name: 'admin',
    displayName: 'Administrador',
    permissions: [
      { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'sales', actions: ['create', 'read', 'update', 'delete', 'void'] },
      { module: 'inventory', actions: ['create', 'read', 'update', 'delete', 'adjust'] },
      { module: 'workshop', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'purchases', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'clients', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'suppliers', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'financial', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'reports', actions: ['read', 'export'] },
      { module: 'settings', actions: ['create', 'read', 'update', 'delete'] },
    ],
  },
  {
    id: USER_ROLES.ADMINISTRATION,
    name: 'administration',
    displayName: 'Administración',
    permissions: [
      { module: 'sales', actions: ['read', 'void'] },
      { module: 'inventory', actions: ['read', 'update'] },
      { module: 'workshop', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'purchases', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'clients', actions: ['create', 'read', 'update'] },
      { module: 'suppliers', actions: ['create', 'read', 'update'] },
      { module: 'financial', actions: ['read', 'update'] },
      { module: 'reports', actions: ['read', 'export'] },
    ],
  },
  {
    id: USER_ROLES.SALES,
    name: 'sales',
    displayName: 'Ventas',
    permissions: [
      { module: 'sales', actions: ['create', 'read'] },
      { module: 'inventory', actions: ['read'] },
      { module: 'clients', actions: ['read'] },
    ],
  },
];
