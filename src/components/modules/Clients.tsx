import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useClientsData } from '@/hooks/useClientsData';
import { useClientDebtSummary } from '@/hooks/useClientCredits';
import CreateClientDialog from '@/components/dialogs/CreateClientDialog';
import ViewClientDialog from '@/components/dialogs/ViewClientDialog';
import EditClientDialog from '@/components/dialogs/EditClientDialog';
import DeleteClientDialog from '@/components/dialogs/DeleteClientDialog';
import AdjustClientBalanceDialog from '@/components/dialogs/AdjustClientBalanceDialog';
import { Plus, Users, Search, Edit, Eye, UserCheck, UserX, Trash2, Calendar, AlertTriangle } from 'lucide-react';

const Clients = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: clients = [], isLoading, error } = useClientsData();
  const { data: debtSummaries = [] } = useClientDebtSummary();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar clientes</p>
          <p className="text-gray-600">Verifica que el backend esté ejecutándose</p>
        </div>
      </div>
    );
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.documentNumber || '').includes(searchTerm) ||
                         (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.phone || '').includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && client.isActive) ||
                         (statusFilter === 'inactive' && !client.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount / 36); // Convertir de Bs.S a USD
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getClientDebtInfo = (clientId: number) => {
    return debtSummaries.find(debt => debt.clientId === clientId);
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
              <CreateClientDialog />
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Client Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bikeERP-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Clientes</p>
            </CardContent>
          </Card>
          <Card className="bikeERP-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-gray-600">Activos</p>
            </CardContent>
          </Card>
          <Card className="bikeERP-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.withCredit}</div>
              <p className="text-sm text-gray-600">Con Crédito</p>
            </CardContent>
          </Card>
          <Card className="bikeERP-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.withDebt}</div>
              <p className="text-sm text-gray-600">Con Deuda</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bikeERP-card">
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
                  className="bikeERP-input"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bikeERP-select"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="bikeERP-card">
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
                    <th className="text-left py-3 px-4 font-medium">Balance (USD)</th>
                    <th className="text-left py-3 px-4 font-medium">Deuda/Vencimiento</th>
                    <th className="text-left py-3 px-4 font-medium">Fecha Registro</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const debtInfo = getClientDebtInfo(client.id);
                    
                    return (
                      <tr key={client.id} className="bikeERP-table-row">
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
                          {debtInfo ? (
                            <div className="space-y-1">
                              <div className={`text-sm font-medium ${
                                debtInfo.status === 'overdue' ? 'text-red-600' :
                                debtInfo.status === 'due_soon' ? 'text-orange-600' :
                                'text-gray-600'
                              }`}>
                                {formatCurrency(debtInfo.totalDebt * 36)}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {debtInfo.nextDueDate && formatDate(debtInfo.nextDueDate)}
                              </div>
                              {debtInfo.status === 'overdue' && (
                                <div className="flex items-center gap-1 text-xs text-red-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  Vencida hace {debtInfo.daysPastDue} días
                                </div>
                              )}
                              {debtInfo.status === 'due_soon' && (
                                <div className="flex items-center gap-1 text-xs text-orange-600">
                                  <Calendar className="h-3 w-3" />
                                  Vence en {debtInfo.daysUntilDue} días
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Sin deuda</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{formatDate(client.createdAt)}</p>
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
                            <ViewClientDialog client={client} />
                            {hasPermission('clients', 'update') && (
                              <>
                                <EditClientDialog client={client} />
                                <AdjustClientBalanceDialog client={client} />
                              </>
                            )}
                            {hasPermission('clients', 'delete') && (
                              <DeleteClientDialog client={client} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* No clients found */}
        {filteredClients.length === 0 && (
          <Card className="bikeERP-card">
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
