
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useDeleteProduct, Product } from '@/hooks/useInventoryData';
import { useToast } from '@/hooks/use-toast';

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onProductDeleted: () => void;
}

const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  open,
  onOpenChange,
  product,
  onProductDeleted,
}) => {
  const deleteProductMutation = useDeleteProduct();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProductMutation.mutateAsync(product.id);

      toast({
        title: 'Producto eliminado',
        description: `${product.name} ha sido eliminado del inventario.`,
      });

      onProductDeleted();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar el producto',
        variant: 'destructive',
      });
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Producto
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El producto será eliminado permanentemente del inventario.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="font-medium text-red-800">Producto a eliminar:</div>
          <div className="mt-2 text-red-700">
            <div><strong>Nombre:</strong> {product.name}</div>
            <div><strong>SKU:</strong> {product.sku}</div>
            <div><strong>Marca:</strong> {product.brand}</div>
            <div><strong>Stock actual:</strong> {product.currentStock} unidades</div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteProductMutation.isPending}
          >
            {deleteProductMutation.isPending ? 'Eliminando...' : 'Eliminar Producto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductDialog;
