
import { useState } from 'react';
import { useCreateClient } from './useClientsData';
import { toast } from './use-toast';

export interface QuickClientData {
  name: string;
  documentType: 'DNI' | 'RIF';
  documentNumber: string;
  phone?: string;
  email?: string;
}

export function useCreateClientFromPOS() {
  const [isCreating, setIsCreating] = useState(false);
  const createClientMutation = useCreateClient();

  const createQuickClient = async (clientData: QuickClientData) => {
    setIsCreating(true);
    
    try {
      const newClient = await createClientMutation.mutateAsync({
        ...clientData,
        phone: clientData.phone || '', // Ensure phone is always a string, not undefined
        email: clientData.email || '', // Ensure email is always a string, not undefined
        address: '',
        balance: 0,
        isActive: 1,
      });

      toast({
        title: "✅ Cliente creado",
        description: `${clientData.name} ha sido agregado exitosamente`,
      });

      return newClient;
    } catch (error) {
      toast({
        title: "Error al crear cliente",
        description: "No se pudo crear el cliente. Intenta nuevamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createQuickClient,
    isCreating,
  };
}
