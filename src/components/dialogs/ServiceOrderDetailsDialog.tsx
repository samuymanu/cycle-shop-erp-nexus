
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ServiceStatus } from '@/types/erp';
import { Save, Edit, Eye } from 'lucide-react';

interface ServiceOrderDetailsDialogProps {
  order: any;
  open: boolean;
  onClose: () => void;
  onUpdate: (orderId: string, updatedOrder: any) => void;
  mode: 'view' | 'edit';
}

const ServiceOrderDetailsDialog: React.FC<ServiceOrderDetailsDialogProps> = ({
  order,
  open,
  onClose,
  onUpdate,
  mode: initialMode
}) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState(order);

  const getStatusInfo = (status: ServiceStatus) => {
    const statusConfig = {
      [ServiceStatus.PENDING]: { label: 'Pendiente', variant: 'secondary' as const },
      [ServiceStatus.IN_PROGRESS]: { label: 'En Proceso', variant: 'default' as const },
      [ServiceStatus.WAITING_PARTS]: { label: 'Esperando Repuestos', variant: 'destructive' as const },
      [ServiceStatus.COMPLETED]: { label: 'Completado', variant: 'outline' as const },
      [ServiceStatus.DELIVERED]: { label: 'Entregado', variant: 'default' as const },
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

  const handleSave = () => {
    onUpdate(order.id, formData);
    setMode('view');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              {mode === 'edit' ? <Edit className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              Orden de Servicio {order.id}
            </DialogTitle>
            <Badge variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cliente Information */}
          <div className="material-card p-4">
            <h3 className="font-semibold mb-3">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                {mode === 'edit' ? (
                  <Input
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className="material-input"
                  />
                ) : (
                  <p className="text-sm font-medium">{order.clientName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                {mode === 'edit' ? (
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    className="material-input"
                  />
                ) : (
                  <p className="text-sm font-medium">{order.clientPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bicycle Information */}
          <div className="material-card p-4">
            <h3 className="font-semibold mb-3">Información de la Bicicleta</h3>
            <div className="space-y-2">
              <Label>Descripción</Label>
              {mode === 'edit' ? (
                <Input
                  value={formData.bicycleInfo}
                  onChange={(e) => handleInputChange('bicycleInfo', e.target.value)}
                  className="material-input"
                />
              ) : (
                <p className="text-sm font-medium">{order.bicycleInfo}</p>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div className="material-card p-4">
            <h3 className="font-semibold mb-3">Detalles del Servicio</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Problema Reportado</Label>
                {mode === 'edit' ? (
                  <Textarea
                    value={formData.problemDescription}
                    onChange={(e) => handleInputChange('problemDescription', e.target.value)}
                    className="material-input"
                  />
                ) : (
                  <p className="text-sm">{order.problemDescription}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Diagnóstico</Label>
                {mode === 'edit' ? (
                  <Textarea
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                    className="material-input"
                    placeholder="Diagnóstico del técnico..."
                  />
                ) : (
                  <p className="text-sm">{order.diagnosis}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  {mode === 'edit' ? (
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="material-select w-full"
                    >
                      <option value={ServiceStatus.PENDING}>Pendiente</option>
                      <option value={ServiceStatus.IN_PROGRESS}>En Proceso</option>
                      <option value={ServiceStatus.WAITING_PARTS}>Esperando Repuestos</option>
                      <option value={ServiceStatus.COMPLETED}>Completado</option>
                      <option value={ServiceStatus.DELIVERED}>Entregado</option>
                    </select>
                  ) : (
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Técnico Asignado</Label>
                  {mode === 'edit' ? (
                    <Input
                      value={formData.technicianName}
                      onChange={(e) => handleInputChange('technicianName', e.target.value)}
                      className="material-input"
                    />
                  ) : (
                    <p className="text-sm font-medium">{order.technicianName}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="material-card p-4">
            <h3 className="font-semibold mb-3">Información de Costos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimado Inicial</Label>
                {mode === 'edit' ? (
                  <Input
                    type="number"
                    value={formData.estimatedTotal}
                    onChange={(e) => handleInputChange('estimatedTotal', e.target.value)}
                    className="material-input"
                  />
                ) : (
                  <p className="text-sm font-medium text-blue-600">
                    {formatCurrency(order.estimatedTotal)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Total Final</Label>
                {mode === 'edit' ? (
                  <Input
                    type="number"
                    value={formData.finalTotal || ''}
                    onChange={(e) => handleInputChange('finalTotal', e.target.value)}
                    className="material-input"
                    placeholder="Total final si está completado"
                  />
                ) : (
                  <p className="text-sm font-medium text-green-600">
                    {order.finalTotal ? formatCurrency(order.finalTotal) : 'Pendiente'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {mode === 'view' ? (
              <Button onClick={() => setMode('edit')} className="material-button-primary gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            ) : (
              <Button onClick={handleSave} className="material-button-success gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceOrderDetailsDialog;
