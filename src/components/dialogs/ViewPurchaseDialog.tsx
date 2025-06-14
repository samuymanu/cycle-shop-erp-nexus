
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Truck } from 'lucide-react';

interface PurchaseItem {
  product: string;
  quantity: number;
  unitPrice: number;
}

interface Purchase {
  id: string;
  supplierName: string;
  supplierRif: string;
  orderDate: Date;
  expectedDate: Date;
  receivedDate: Date | null;
  status: string;
  total: number;
  items: PurchaseItem[];
  notes?: string;
}

interface ViewPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: Purchase | null;
}

const ViewPurchaseDialog: React.FC<ViewPurchaseDialogProps> = ({
  open,
  onOpenChange,
  purchase,
}) => {
  if (!purchase) return null;

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

  const statusInfo = getStatusInfo(purchase.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Detalles de Compra - {purchase.id}
            <Badge variant={statusInfo.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Información completa de la orden de compra
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información del Proveedor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Proveedor</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Proveedor</label>
                <p className="text-sm font-semibold">{purchase.supplierName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">RIF</label>
                <p className="text-sm">{purchase.supplierRif}</p>
              </div>
            </CardContent>
          </Card>

          {/* Fechas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cronología</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Orden</label>
                <p className="text-sm">{formatDate(purchase.orderDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha Esperada</label>
                <p className="text-sm">{formatDate(purchase.expectedDate)}</p>
              </div>
              {purchase.receivedDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha Recibida</label>
                  <p className="text-sm text-green-600 font-medium">{formatDate(purchase.receivedDate)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos Ordenados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {purchase.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.unitPrice)}</p>
                      <p className="text-sm text-gray-600">c/u</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-primary">{formatCurrency(item.quantity * item.unitPrice)}</p>
                      <p className="text-sm text-gray-600">subtotal</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(purchase.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          {purchase.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{purchase.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Resumen */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-blue-600">Total de Productos</p>
                  <p className="text-xl font-bold text-blue-800">{purchase.items.length}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Unidades Totales</p>
                  <p className="text-xl font-bold text-blue-800">
                    {purchase.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewPurchaseDialog;
