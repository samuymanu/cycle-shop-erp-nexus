
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCategoriesData, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from '@/hooks/useCategoriesData';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDisplayName, setNewCategoryDisplayName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');

  const { data: categories = [], isLoading } = useCategoriesData();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const { toast } = useToast();

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim() || !newCategoryDisplayName.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        name: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
        displayName: newCategoryDisplayName,
        isActive: true,
      });

      toast({
        title: 'Categoría creada',
        description: `La categoría "${newCategoryDisplayName}" ha sido creada exitosamente.`,
      });

      setNewCategoryName('');
      setNewCategoryDisplayName('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al crear la categoría',
        variant: 'destructive',
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDisplayName(category.displayName);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editName.trim() || !editDisplayName.trim()) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        name: editName.toLowerCase().replace(/\s+/g, '_'),
        displayName: editDisplayName,
        isActive: editingCategory.isActive,
      });

      toast({
        title: 'Categoría actualizada',
        description: `La categoría "${editDisplayName}" ha sido actualizada exitosamente.`,
      });

      setEditingCategory(null);
      setEditName('');
      setEditDisplayName('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al actualizar la categoría',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`¿Está seguro de eliminar la categoría "${category.displayName}"?`)) {
      try {
        await deleteCategoryMutation.mutateAsync(category.id);

        toast({
          title: 'Categoría eliminada',
          description: `La categoría "${category.displayName}" ha sido eliminada exitosamente.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error al eliminar la categoría',
          variant: 'destructive',
        });
      }
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditDisplayName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Gestión de Categorías
          </DialogTitle>
          <DialogDescription>
            Administra las categorías de productos del sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulario para nueva categoría */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Agregar Nueva Categoría</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Nombre Técnico *</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="ej: bicicletas_montaña"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryDisplayName">Nombre para Mostrar *</Label>
                  <Input
                    id="categoryDisplayName"
                    value={newCategoryDisplayName}
                    onChange={(e) => setNewCategoryDisplayName(e.target.value)}
                    placeholder="ej: Bicicletas de Montaña"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="gap-2"
                disabled={createCategoryMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                {createCategoryMutation.isPending ? 'Creando...' : 'Crear Categoría'}
              </Button>
            </form>
          </div>

          {/* Lista de categorías existentes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categorías Existentes</h3>
            {isLoading ? (
              <p className="text-gray-500">Cargando categorías...</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    {editingCategory?.id === category.id ? (
                      <div className="flex-1 grid grid-cols-2 gap-2 mr-4">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nombre técnico"
                        />
                        <Input
                          value={editDisplayName}
                          onChange={(e) => setEditDisplayName(e.target.value)}
                          placeholder="Nombre para mostrar"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{category.displayName}</Badge>
                          <span className="text-sm text-gray-500">({category.name})</span>
                          {!category.isActive && (
                            <Badge variant="destructive">Inactiva</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {editingCategory?.id === category.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateCategoryMutation.isPending}
                            className="gap-1"
                          >
                            <Save className="h-3 w-3" />
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="gap-1"
                          >
                            <X className="h-3 w-3" />
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
                            className="gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={deleteCategoryMutation.isPending}
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagementDialog;
