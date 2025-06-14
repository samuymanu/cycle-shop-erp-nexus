
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Client } from '@/hooks/useClientsData';
import { Eye, User, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';

interface ViewClientDialogProps {
  client: Client;
  trigger?: React.ReactNode;
}

const ViewClientDialog = ({ client, trigger }: ViewClientDialogProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Detalles del Cliente
          </DialogTitle>
          <DialogDescription>
            Información completa del cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con nombre y estado */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{client.name}</h3>
              <p className="text-gray-600">{client.documentType}: {client.documentNumber}</p>
            </div>
            <Badge variant={client.isActive ? 'default' : 'secondary'}>
              {client.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información de contacto */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Información de Contacto</h4>
              
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{client.phone}</span>
                </div>
              )}

              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{client.email}</span>
                </div>
              )}

              {client.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>

            {/* Información financiera */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Información Financiera</h4>
              
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Balance:</span>
                  <p className={`font-medium ${
                    client.balance > 0 ? 'text-blue-600' :
                    client.balance < 0 ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {formatCurrency(client.balance)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-600">Fecha de registro:</span>
                  <p className="font-medium">{formatDate(client.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewClientDialog;
