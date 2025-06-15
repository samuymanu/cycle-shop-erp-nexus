
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  CreditCard, 
  ShoppingCart, 
  Trash2, 
  CheckCircle, 
  Bike, 
  Wrench, 
  Package,
  Layers
} from 'lucide-react';

interface ShortcutsReferenceProps {
  onProcessSale: () => void;
  onClearCart: () => void;
  onSearchFocus: () => void;
  onPaymentFocus: () => void;
  onCategoryAll: () => void;
  onCategoryBikes: () => void;
  onCategoryMotos: () => void;
  onCategoryAccessories: () => void;
  onCategoryParts: () => void;
  canProcessSale: boolean;
  hasItems: boolean;
}

interface ShortcutItem {
  keys: string[];
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'success';
}

const ShortcutsReference: React.FC<ShortcutsReferenceProps> = ({
  onProcessSale,
  onClearCart,
  onSearchFocus,
  onPaymentFocus,
  onCategoryAll,
  onCategoryBikes,
  onCategoryMotos,
  onCategoryAccessories,
  onCategoryParts,
  canProcessSale,
  hasItems,
}) => {
  const shortcuts: ShortcutItem[] = [
    {
      keys: ['Ctrl', 'Enter'],
      label: 'Procesar Venta',
      description: 'Finalizar y procesar la venta actual',
      icon: <CheckCircle className="h-3 w-3" />,
      action: onProcessSale,
      disabled: !canProcessSale,
      variant: 'success',
    },
    {
      keys: ['Ctrl', 'Del'],
      label: 'Limpiar Carrito',
      description: 'Vaciar todos los items del carrito',
      icon: <Trash2 className="h-3 w-3" />,
      action: onClearCart,
      disabled: !hasItems,
      variant: 'destructive',
    },
    {
      keys: ['Ctrl', 'F'],
      label: 'Buscar Producto',
      description: 'Enfocar en el campo de búsqueda',
      icon: <Search className="h-3 w-3" />,
      action: onSearchFocus,
    },
    {
      keys: ['Ctrl', 'P'],
      label: 'Ir a Pagos',
      description: 'Enfocar en la sección de pagos',
      icon: <CreditCard className="h-3 w-3" />,
      action: onPaymentFocus,
      disabled: !hasItems,
    },
    {
      keys: ['F1'],
      label: 'Todas',
      description: 'Mostrar todas las categorías',
      icon: <Layers className="h-3 w-3" />,
      action: onCategoryAll,
    },
    {
      keys: ['F2'],
      label: 'Bicicletas',
      description: 'Filtrar por bicicletas',
      icon: <Bike className="h-3 w-3" />,
      action: onCategoryBikes,
    },
    {
      keys: ['F3'],
      label: 'Motocicletas',
      description: 'Filtrar por motocicletas',
      icon: <Wrench className="h-3 w-3" />,
      action: onCategoryMotos,
    },
    {
      keys: ['F4'],
      label: 'Accesorios',
      description: 'Filtrar por accesorios',
      icon: <Package className="h-3 w-3" />,
      action: onCategoryAccessories,
    },
    {
      keys: ['F5'],
      label: 'Repuestos',
      description: 'Filtrar por repuestos',
      icon: <Wrench className="h-3 w-3" />,
      action: onCategoryParts,
    },
  ];

  const getButtonVariant = (variant?: string) => {
    switch (variant) {
      case 'success': return 'default';
      case 'destructive': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="bikeERP-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium">Atajos de Teclado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-3">
        <TooltipProvider>
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div className="flex gap-0.5 min-w-[50px]">
                {shortcut.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                      {key}
                    </Badge>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-[10px] text-muted-foreground">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={getButtonVariant(shortcut.variant)}
                    size="sm"
                    className="flex-1 justify-start gap-1.5 h-6 text-[10px] px-2"
                    onClick={shortcut.action}
                    disabled={shortcut.disabled}
                  >
                    {shortcut.icon}
                    {shortcut.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{shortcut.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default ShortcutsReference;
