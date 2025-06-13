
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Users, Search, Edit, Eye, UserCheck, UserX } from 'lucide-react';

const Clients = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock clients data
  const [clients] = useState([
    {
      id: 'CLI-001',
      name: 'Juan Pérez',
      documentType: 'DNI',
      documentNumber: '12345678',
      phone: '0414-1234567',
      email: 'juan.perez@email.com',
      address: 'Av. Principal #123, Caracas',
      balance: 0,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      totalOrders: 5,
      lastOrder: new Date('2024-06-10'),
    },
    {
      id: 'CLI-002',
      name: 'María González',
      documentType: 'DNI',
      documentNumber: '87654321',
      phone: '0426-9876543',
      email: 'maria.gonzalez@email.com',
      address: 'Calle 2 #456, Valencia',
      balance: 25000,
      isActive: true,
      createdAt: new Date('2024-02-20'),
      totalOrders: 3,
      lastOrder: new Date('2024-06-12'),
    },
    {
      id: 'CLI-003',
      name: 'Pedro Ramírez',
      documentType: 'RIF',
      documentNumber: 'J-123456789',
      phone: '0412-5555555',
      email: 'pedro.ramirez@empresa.com',
      address: 'Centro Comercial Plaza, Maracay',
      balance: -15000,
      isActive: true,
      createdAt: new Date('2024-03-10'),
      totalOrders: 8,
      lastOrder: new Date('2024-06-13'),
    },
    {
      id: 'CLI-004',
      name: 'Carmen Silva',
      documentType: 'DNI',
      documentNumber: '11223344',
      phone: '0424-7777777',
      email: 'carmen.silva@email.com',
      address: 'Urbanización Los Pinos, Barquisimeto',
      balance: 0,
      isActive: false,
      createdAt: new Date('2024-01-05'),
      totalOrders: 2,
      lastOrder: new Date('2024-04-15'),
    },
  ]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.documentNumber.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && client.isActive) ||
                         (statusFilter === 'inactive' && !client.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getClientStats = () => {
    return {
      total: clients.length,
      active: clients.filter(c => c.isActive).length,
      withCredit: clients.filter(c => c.balance > 0).length,
      withDebt: clients.filter(c => c.balance < 0).length,
    };
  };

  const stats = getClientStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
                <p className="text-gray-600">Administra tu base de clientes</p>
              </div>
            </div>
            {hasPermission('clients', 'create') && (
              <Button className="material-button-primary gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Client Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Clientes</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-gray-600">Activos</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.withCredit}</div>
              <p className="text-sm text-gray-600">Con Crédito</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.withDebt}</div>
              <p className="text-sm text-gray-600">Con Deuda</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="material-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nombre, documento, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="material-input"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="material-select"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="material-card">
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {filteredClients.length} clientes encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium">Contacto</th>
                    <th className="text-left py-3 px-4 font-medium">Balance</th>
                    <th className="text-left py-3 px-4 font-medium">Órdenes</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="material-table-row">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-500">
                            {client.documentType}: {client.documentNumber}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm">{client.phone}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          client.balance > 0 ? 'text-blue-600' :
                          client.balance < 0 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {formatCurrency(client.balance)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{client.totalOrders}</p>
                          <p className="text-sm text-gray-500">
                            Última: {formatDate(client.lastOrder)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={client.isActive ? 'default' : 'secondary'}>
                          {client.isActive ? (
                            <><UserCheck className="h-3 w-3 mr-1" />Activo</>
                          ) : (
                            <><UserX className="h-3 w-3 mr-1" />Inactivo</>
                          )}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('clients', 'update') && (
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredClients.length === 0 && (
          <Card className="material-card">
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron clientes</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Clients;
