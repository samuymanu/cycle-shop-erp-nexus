
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, ROLE_DEFINITIONS, USER_ROLES } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'admin@bicicentro.com',
    role: ROLE_DEFINITIONS[0], // Admin
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date(),
  },
  {
    id: '2',
    name: 'María González',
    email: 'administracion@bicicentro.com',
    role: ROLE_DEFINITIONS[1], // Administration
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date(),
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'ventas@bicicentro.com',
    role: ROLE_DEFINITIONS[2], // Sales
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('erp_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    console.log('Attempting login:', email, password);
    
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser && password === '123456') { // Simple mock password
      const loginUser = { ...foundUser, lastLogin: new Date() };
      setUser(loginUser);
      localStorage.setItem('erp_user', JSON.stringify(loginUser));
      console.log('Login successful for user:', loginUser);
      return true;
    }
    
    console.log('Login failed for email:', email);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    
    const permission = user.role.permissions.find(p => p.module === module);
    return permission ? permission.actions.includes(action) : false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
