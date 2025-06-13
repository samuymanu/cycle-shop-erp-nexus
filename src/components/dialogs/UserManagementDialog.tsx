
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Users, Plus, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

const UserManagementDialog = () => {
  const { user: currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'admin@bicicentro.com',
      role: 'Administrador',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
    },
    {
      id: '2',
      name: 'María González',
      email: 'administracion@bicicentro.com',
      role: 'Administración',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2024-06-12'),
    },
    {
      id: '3',
      name: 'Carlos Rodríguez',
      email: 'ventas@bicicentro.com',
      role: 'Vendedor',
      isActive: true,
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date('2024-06-13'),
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: (users.length + 1).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', password: '', role: '' });
    
    toast({
      title: "Usuario Creado",
      description: `Usuario ${newUser.name} creado exitosamente`,
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    toast({
      title: "Estado Actualizado",
      description: `Usuario ${user?.name} ${user?.isActive ? 'desactivado' : 'activado'}`,
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Users className="h-4 w-4" />
          Gestionar Usuarios
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Gestión de Usuarios
          </DialogTitle>
          <DialogDescription>
            Administra usuarios y sus permisos en el sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New User */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Nuevo Usuario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Nombre Completo</Label>
                  <Input
                    id="userName"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Nombre del usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Correo Electrónico</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userPassword">Contraseña</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Contraseña segura"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userRole">Rol</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Administración">Administración</SelectItem>
                      <SelectItem value="Vendedor">Vendedor</SelectItem>
                      <SelectItem value="Técnico">Técnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateUser} className="mt-4 bikeERP-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Crear Usuario
              </Button>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{user.role}</Badge>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? (
                              <><UserCheck className="h-3 w-3 mr-1" />Activo</>
                            ) : (
                              <><UserX className="h-3 w-3 mr-1" />Inactivo</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Último acceso: {formatDate(user.lastLogin)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Creado: {formatDate(user.createdAt)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementDialog;
