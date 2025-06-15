
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Layers } from 'lucide-react';

interface POSStatsProps {
  categoryStats: any[];
  getCategoryKey: (categoryName: string) => string;
  CATEGORY_COLORS: Record<string, string>;
  CATEGORY_ICONS: Record<string, React.ReactNode>;
  products: any[];
  filteredProducts: any[];
  getCategoryOfProduct: (productCategoryName: string) => any;
  addToCart: (product: any) => void;
  formatCurrency: (amount: number) => string;
}

const POSStats: React.FC<POSStatsProps> = ({
  categoryStats,
  getCategoryKey,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  products,
  filteredProducts,
  getCategoryOfProduct,
  addToCart,
  formatCurrency,
}) => {
  // Solo mostrar productos si hay filtros activos o pocos productos
  const shouldShowProducts = filteredProducts.length <= 20;

  return (
    <div className="space-y-4">
      {/* Products Grid - Solo si hay pocos productos */}
      {shouldShowProducts && filteredProducts.length > 0 && (
        <Card className="bikeERP-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.slice(0, 12).map((product) => {
                const categoryKey = getCategoryKey(product.category);
                const categoryIcon = CATEGORY_ICONS[categoryKey] || <Package className="h-4 w-4" />;

                return (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border hover:border-primary/30 bg-white"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {categoryIcon}
                            <h3 className="font-medium text-sm truncate">{product.name}</h3>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 truncate">
                            {product.brand} • SKU: {product.sku}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Stock: {product.currentStock}
                            </span>
                            <span className="font-semibold text-primary text-sm">
                              {formatCurrency(product.salePrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {filteredProducts.length > 12 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                +{filteredProducts.length - 12} productos más disponibles...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message when there are too many products */}
      {!shouldShowProducts && (
        <Card className="bikeERP-card">
          <CardContent className="p-6 text-center">
            <Layers className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filteredProducts.length} productos disponibles
            </h3>
            <p className="text-gray-600 text-sm">
              Usa la búsqueda o filtros por categoría para encontrar productos específicos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default POSStats;
