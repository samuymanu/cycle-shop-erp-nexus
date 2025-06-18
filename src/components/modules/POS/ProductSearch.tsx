
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProductCard from './ProductCard';

interface ProductSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: any[];
  onAddToCart: (product: any) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  searchTerm,
  setSearchTerm,
  filteredProducts,
  onAddToCart,
}) => {
  return (
    <div className="bikeERP-card">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Buscar Productos</h3>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nombre, SKU, marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron productos que coincidan con "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
