
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ServiceStatus } from '@/types/erp';
import { useAuth } from '@/hooks/useAuth';
import CreateServiceOrderDialog from '@/components/dialogs/CreateServiceOrderDialog';
import ServiceOrderDetailsDialog from '@/components/dialogs/ServiceOrderDetailsDialog';

const Workshop = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');
  
  // Mock service orders - en una app real esto vendría de una API
  const [serviceOrders, setServiceOrders] = useState([
    {
      id: 'SO-001',
      clientName: 'Juan Pérez',
      clientPhone: '0414-1234567',
      bicycleInfo: 'Trek Mountain Bike - Azul',
      openDate: new Date('2024-06-10'),
      problemDescription: 'Rueda trasera hace ruido y frenos no funcionan bien',
      diagnosis: 'Rodamientos de rueda dañados, pastillas de freno gastadas',
      status: ServiceStatus.IN_PROGRESS,
      technicianName: 'Carlos Martínez',
      estimatedTotal: 150000,
      finalTotal: null,
    },
    {
      id: 'SO-002',
      clientName: 'María González',
      clientPhone: '0426-9876543',
      bicycleInfo: 'Specialized Road Bike - Roja',
      openDate: new Date('2024-06-12'),
      problemDescription: 'Cambios no funcionan correctamente',
      diagnosis: 'Cable de cambio estirado, necesita ajuste',
      status: ServiceStatus.COMPLETED,
      technicianName: 'Luis Rodríguez',
      estimatedTotal: 85000,
      finalTotal: 85000,
    },
    {
      id: 'SO-003',
      clientName: 'Pedro Ramírez',
      clientPhone: '0412-5555555',
      bicycleInfo: 'Giant MTB - Negra',
      openDate: new Date('2024-06-13'),
      problemDescription: 'Revisión general y mantenimiento',
      diagnosis: 'Pendiente de diagnóstico completo',
      status: ServiceStatus.PENDING,
      technicianName: 'Ana Morales',
      estimatedTotal: 120000,
      finalTotal: null,
    },
    {
      id: 'SO-004',
      clientName: 'Carmen Silva',
      clientPhone: '0424-7777777',
      bicycleInfo: 'Scott Hybrid - Blanca',
      openDate: new Date('2024-06-08'),
      problemDescription: 'Cadena se sale constantemente',
      diagnosis: 'Tensor de cadena dañado, requiere repuesto',
      status: ServiceStatus.WAITING_PARTS,
      technicianName: 'Carlos Martínez',
      estimatedTotal: 95000,
      finalTotal: null,
    },
  ]);

  const handleCreateOrder = (newOrder: any) => {
    setServiceOrders(prev => [...prev, newOrder]);
    console.log('Nueva orden creada:', newOrder);
  };

  const handleUpdateOrder = (orderId: string, updatedOrder: any) => {
    setServiceOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, ...updatedOrder } : order
      )
    );
    console.log('Orden actualizada:', orderId, updatedOrder);
  };

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.bicycleInfo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: ServiceStatus) => {
    const statusConfig = {
      [ServiceStatus.PENDING]: { label: 'Pendiente', variant: 'secondary' as const, color: 'text-orange-600' },
      [ServiceStatus.IN_PROGRESS]: { label: 'En Proceso', variant: 'default' as const, color: 'text-blue-600' },
      [ServiceStatus.WAITING_PARTS]: { label: 'Esperando Repuestos', variant: 'destructive' as const, color: 'text-red-600' },
      [ServiceStatus.COMPLETED]: { label: 'Completado', variant: 'outline' as const, color: 'text-green-600' },
      [ServiceStatus.DELIVERED]: { label: 'Entregado', variant: 'default' as const, color: 'text-green-800' },
    };
    return statusConfig[status];
  };

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

  const getStatusCounts = () => {
    return {
      total: serviceOrders.length,
      pending: serviceOrders.filter(o => o.status === ServiceStatus.PENDING).length,
      inProgress: serviceOrders.filter(o => o.status === ServiceStatus.IN_PROGRESS).length,
      waiting: serviceOrders.filter(o => o.status === ServiceStatus.WAITING_PARTS).length,
      completed: serviceOrders.filter(o => o.status === ServiceStatus.COMPLETED).length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Taller de Reparaciones</h1>
              <p className="text-gray-600">Gestión de órdenes de servicio</p>
            </div>
            {hasPermission('workshop', 'create') && (
              <CreateServiceOrderDialog onCreateOrder={handleCreateOrder} />
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Service Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
              <p className="text-sm text-gray-600">Total Órdenes</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.pending}</div>
              <p className="text-sm text-gray-600">Pendientes</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</div>
              <p className="text-sm text-gray-600">En Proceso</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts.waiting}</div>
              <p className="text-sm text-gray-600">Esperando Repuestos</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <p className="text-sm text-gray-600">Completadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="material-card">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por cliente, orden o bicicleta..."
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
                <option value={ServiceStatus.PENDING}>Pendientes</option>
                <option value={ServiceStatus.IN_PROGRESS}>En Proceso</option>
                <option value={ServiceStatus.WAITING_PARTS}>Esperando Repuestos</option>
                <option value={ServiceStatus.COMPLETED}>Completadas</option>
                <option value={ServiceStatus.DELIVERED}>Entregadas</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Service Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            
            return (
              <Card key={order.id} className="material-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <CardDescription>
                    Fecha: {formatDate(order.openDate)} | Técnico: {order.technicianName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Cliente</h4>
                    <p className="text-sm">{order.clientName}</p>
                    <p className="text-xs text-gray-500">{order.clientPhone}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Bicicleta</h4>
                    <p className="text-sm">{order.bicycleInfo}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Problema Reportado</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{order.problemDescription}</p>
                  </div>
                  
                  {order.diagnosis && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Diagnóstico</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{order.diagnosis}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <span className="text-sm font-medium">
                        {order.finalTotal ? 'Total Final:' : 'Estimado:'}
                      </span>
                      <span className={`ml-2 font-bold ${order.finalTotal ? 'text-green-600' : 'text-blue-600'}`}>
                        {formatCurrency(order.finalTotal || order.estimatedTotal)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDialogMode('view');
                        }}
                      >
                        Ver
                      </Button>
                      {hasPermission('workshop', 'update') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setDialogMode('edit');
                          }}
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <Card className="material-card">
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No se encontraron órdenes de servicio</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Service Order Details Dialog */}
      {selectedOrder && (
        <ServiceOrderDetailsDialog
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdateOrder}
          mode={dialogMode}
        />
      )}
    </div>
  );
};

export default Workshop;
