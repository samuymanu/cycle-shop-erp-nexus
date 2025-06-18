
import React from 'react';
import { Button } from '@/components/ui/button';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    sku: string;
    brand: string;
    model: string;
    salePrice: number;
    currentStock: number;
    category: string;
  };
  onAddToCart: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.brand} - {product.model}</p>
          <p className="text-xs text-gray-500 mt-1">Stock: {product.currentStock}</p>
        </div>
        <Button
          onClick={() => onAddToCart(product)}
          size="sm"
          className="bikeERP-button-primary h-8 w-8 p-0 flex-shrink-0"
          disabled={product.currentStock <= 0}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="border-t pt-3">
        <MultiCurrencyPrice 
          usdAmount={product.salePrice} 
          size="sm" 
          showUSDFirst={true}
        />
      </div>
    </div>
  );
};

export default ProductCard;
