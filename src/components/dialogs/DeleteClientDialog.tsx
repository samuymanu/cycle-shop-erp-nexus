
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Client, useDeleteClient } from '@/hooks/useClientsData';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteClientDialogProps {
  client: Client;
  trigger?: React.ReactNode;
}

const DeleteClientDialog = ({ client, trigger }: DeleteClientDialogProps) => {
  const deleteClientMutation = useDeleteClient();

  const handleDeleteClient = async () => {
    try {
      await deleteClientMutation.mutateAsync(client.id);
      
      toast({
        title: "Cliente Eliminado",
        description: `El cliente ${client.name} ha sido eliminado exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            ¿Eliminar Cliente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar al cliente <strong>{client.name}</strong>?
            <br />
            Esta acción no se puede deshacer y se perderán todos los datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteClient}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteClientMutation.isPending}
          >
            {deleteClientMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteClientDialog;
