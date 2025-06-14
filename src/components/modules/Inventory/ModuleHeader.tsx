
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus, Download } from 'lucide-react';

interface ModuleHeaderProps {
  hasPermissionCreate: boolean;
  onExport: () => void;
  onAdd: () => void;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  hasPermissionCreate,
  onExport,
  onAdd
}) => (
  <div className="bg-white shadow-sm border-b border-gray-200">
    <div className="px-8 py-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
            <p className="text-gray-600">Control de stock y productos</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={onExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          {hasPermissionCreate && (
            <Button 
              onClick={onAdd}
              className="gap-2 erp-button-primary"
            >
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default ModuleHeader;
