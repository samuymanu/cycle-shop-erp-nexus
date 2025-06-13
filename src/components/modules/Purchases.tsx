
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Plus, ShoppingCart, Search, Edit, Eye, Truck, CheckCircle, Clock } from 'lucide-react';

const Purchases = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock purchases data
  const [purchases] = useState([
    {
      id: 'PUR-001',
      supplierName: 'Distribuidora Central',
      supplierRif: 'J-12345678-9',
      orderDate: new Date('2024-06-01'),
      expectedDate: new Date('2024-06-15'),
      receivedDate: new Date('2024-06-14'),
      status: 'received',
      total: 2500000,
      items: [
        { product: 'Cadenas Shimano', quantity: 20, unitPrice: 45000 },
        { product: 'Frenos V-Brake', quantity: 15, unitPrice: 65000 },
        { product: 'Llantas 26"', quantity: 10, unitPrice: 85000 },
      ],
      notes: 'Pedido completo recibido en buen estado',
    },
    {
      id: 'PUR-002',
      supplierName: 'Importadora Bikes',
      supplierRif: 'J-98765432-1',
      orderDate: new Date('2024-06-05'),
      expectedDate: new Date('2024-06-20'),
      receivedDate: null,
      status: 'pending',
      total: 1800000,
      items: [
        { product: 'Cascos MTB', quantity: 12, unitPrice: 120000 },
        { product: 'Guantes', quantity: 25, unitPrice: 24000 },
      ],
      notes: 'Esperando confirmación de envío',
    },
    {
      id: 'PUR-003',
      supplierName: 'Repuestos Venezuela',
      supplierRif: 'J-55667788-0',
      orderDate: new Date('2024-06-08'),
      expectedDate: new Date('2024-06-22'),
      receivedDate: null,
      status: 'in_transit',
      total: 950000,
      items: [
        { product: 'Cables de freno', quantity: 30, unitPrice: 15000 },
        { product: 'Pastillas de freno', quantity: 40, unitPrice: 12500 },
      ],
      notes: 'En tránsito desde Maracay',
    },
    {
      id: 'PUR-004',
      supplierName: 'Global Bike Parts',
      supplierRif: 'J-11223344-5',
      orderDate: new Date('2024-06-10'),
      expectedDate: new Date('2024-06-25'),
      receivedDate: null,
      status: 'cancelled',
      total: 750000,
      items: [
        { product: 'Pedales aluminum', quantity: 15, unitPrice: 50000 },
      ],
      notes: 'Cancelado por falta de stock del proveedor',
    },
  ]);

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplierRif.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
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

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock, color: 'text-orange-600' },
      in_transit: { label: 'En Tránsito', variant: 'default' as const, icon: Truck, color: 'text-blue-600' },
      received: { label: 'Recibido', variant: 'outline' as const, icon: CheckCircle, color: 'text-green-600' },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: Clock, color: 'text-red-600' },
    };
    return statusConfig[status as keyof typeof statusConfig];
  };

  const getPurchaseStats = () => {
    return {
      total: purchases.length,
      pending: purchases.filter(p => p.status === 'pending').length,
      inTransit: purchases.filter(p => p.status === 'in_transit').length,
      received: purchases.filter(p => p.status === 'received').length,
      totalValue: purchases.reduce((sum, p) => sum + p.total, 0),
    };
  };

  const stats = getPurchaseStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Compras</h1>
                <p className="text-gray-600">Controla tus compras y proveedores</p>
              </div>
            </div>
            {hasPermission('purchases', 'create') && (
              <Button className="material-button-primary gap-2">
                <Plus className="h-4 w-4" />
                Nueva Compra
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Purchase Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Compras</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pendientes</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
              <p className="text-sm text-gray-600">En Tránsito</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.received}</div>
              <p className="text-sm text-gray-600">Recibidas</p>
            </CardContent>
          </Card>
          <Card className="material-stat-card">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-primary">{formatCurrency(stats.totalValue)}</div>
              <p className="text-sm text-gray-600">Valor Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="material-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por proveedor, número de compra o RIF..."
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
                <option value="pending">Pendientes</option>
                <option value="in_transit">En Tránsito</option>
                <option value="received">Recibidas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Purchases List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredPurchases.map((purchase) => {
            const statusInfo = getStatusInfo(purchase.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={purchase.id} className="material-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{purchase.id}</CardTitle>
                    <Badge variant={statusInfo.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <CardDescription>
                    Fecha: {formatDate(purchase.orderDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Proveedor</h4>
                    <p className="text-sm">{purchase.supplierName}</p>
                    <p className="text-xs text-gray-500">{purchase.supplierRif}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Fecha Esperada</h4>
                      <p className="text-sm">{formatDate(purchase.expectedDate)}</p>
                    </div>
                    {purchase.receivedDate && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Fecha Recibida</h4>
                        <p className="text-sm text-green-600">{formatDate(purchase.receivedDate)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Productos ({purchase.items.length})</h4>
                    <div className="text-sm text-gray-600">
                      {purchase.items.slice(0, 2).map((item, index) => (
                        <p key={index}>{item.quantity}x {item.product}</p>
                      ))}
                      {purchase.items.length > 2 && (
                        <p className="text-xs">y {purchase.items.length - 2} más...</p>
                      )}
                    </div>
                  </div>
                  
                  {purchase.notes && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Notas</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{purchase.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <span className="text-sm font-medium">Total:</span>
                      <span className="ml-2 font-bold text-primary">
                        {formatCurrency(purchase.total)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {hasPermission('purchases', 'update') && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPurchases.length === 0 && (
          <Card className="material-card">
            <CardContent className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron compras</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Purchases;
