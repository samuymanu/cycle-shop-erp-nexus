
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductListProps {
  products: any[];
  filteredProducts: any[];
  getCategoryOfProduct: (category: string) => any;
  getCategoryKey: (category: string) => string;
  CATEGORY_COLORS: Record<string, string>;
  CATEGORY_ICONS: Record<string, React.ReactNode>;
  addToCart: (product: any) => void;
  formatCurrency: (amount: number) => string;
}

const ProductList: React.FC<ProductListProps> = ({
  filteredProducts,
  getCategoryOfProduct,
  getCategoryKey,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  addToCart,
  formatCurrency
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
    {filteredProducts.map((product) => {
      const category = getCategoryOfProduct(product.category);
      const catKey = getCategoryKey(product.category);
      return (
        <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow border-blue-100">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-slate-900">{product.name}</h4>
                <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[catKey] || CATEGORY_COLORS.default}`}>
                  {category ? category.displayName : product.category}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">{product.brand} - {product.model}</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(product.salePrice)}
              </p>
              <p className="text-sm text-slate-500">
                Stock: {product.currentStock} unidades
              </p>
              <Button
                onClick={() => addToCart(product)}
                className="w-full bikeERP-button-primary"
                disabled={product.currentStock === 0}
              >
                {product.currentStock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

export default ProductList;
