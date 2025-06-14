
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Add missing import for cn:
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Users, Plus, Edit, Trash2, Shield, UserCheck, UserX, XCircle, Save } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo válido." }),
  role: z.string({ required_error: "Debes seleccionar un rol." }).min(1, { message: "Debes seleccionar un rol." }),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.id && (!data.password || data.password.length < 8)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["password"],
      message: "La contraseña debe tener al menos 8 caracteres.",
    });
  }
});

type UserFormValues = z.infer<typeof formSchema>;

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

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      password: '',
    },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        id: editingUser.id,
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        password: '',
      });
    } else {
      form.reset({
        id: undefined,
        name: '',
        email: '',
        role: '',
        password: '',
      });
    }
  }, [editingUser, form]);

  const onSubmit = (data: UserFormValues) => {
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, name: data.name, email: data.email, role: data.role } 
          : u
      ));
      toast({ title: "Usuario Actualizado", description: `Usuario ${data.name} actualizado.` });
      setEditingUser(null);
    } else {
      const newUser: User = {
        id: (users.length + 1).toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
      };
      setUsers([...users, newUser]);
      toast({ title: "Usuario Creado", description: `Usuario ${data.name} creado.` });
    }
    form.reset();
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

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: "Usuario Eliminado",
      description: `El usuario ${user?.name} ha sido eliminado.`,
      variant: "destructive",
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
          {/* Create/Edit User Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {editingUser ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </div>
                {editingUser && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Edición
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del usuario" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="usuario@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {!editingUser && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Contraseña segura" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rol</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Administrador">Administrador</SelectItem>
                              <SelectItem value="Administración">Administración</SelectItem>
                              <SelectItem value="Vendedor">Vendedor</SelectItem>
                              <SelectItem value="Técnico">Técnico</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="mt-4 bikeERP-button-primary gap-2">
                    {editingUser ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                  </Button>
                </form>
              </Form>
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
                  <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
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
                    <div className="w-full sm:w-auto flex flex-col items-start sm:items-end">
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-muted-foreground">
                          Último acceso: {formatDate(user.lastLogin)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Creado: {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={cn(user.isActive && "border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700")}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                         <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
