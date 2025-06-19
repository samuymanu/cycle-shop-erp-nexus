
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Package, Barcode } from 'lucide-react';
import { Product } from '@/types/erp';
import CategoryFilter from './CategoryFilter';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

interface AdvancedProductSearchProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const AdvancedProductSearch: React.FC<AdvancedProductSearchProps> = ({
  products,
  onAddToCart,
  searchTerm,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Obtener categorías únicas de los productos
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Filtrar productos por término de búsqueda y categoría
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory && product.currentStock > 0;
  });

  // Mostrar resultados solo si hay término de búsqueda o categoría seleccionada
  const shouldShowResults = (searchTerm.length > 0 || selectedCategory) && showResults;

  useEffect(() => {
    setShowResults(searchTerm.length > 0 || selectedCategory !== null);
  }, [searchTerm, selectedCategory]);

  const handleProductSelect = (product: Product) => {
    onAddToCart(product);
    onSearchChange('');
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      handleProductSelect(filteredProducts[0]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
      onSearchChange('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Filtro de categorías */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        productCount={products.filter(p => p.currentStock > 0).length}
      />

      {/* Campo de búsqueda */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            id="advanced-product-search"
            type="text"
            placeholder="Buscar por nombre, marca, modelo o SKU..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowResults(true)}
            className="pl-10 pr-4"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Barcode className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {shouldShowResults && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              <div className="py-2">
                {filteredProducts.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>{product.brand} - {product.model}</div>
                        <div className="flex items-center gap-3">
                          <span>SKU: {product.sku}</span>
                          <Badge variant={product.currentStock < (product.minStock || 5) ? "destructive" : "secondary"} className="text-xs">
                            Stock: {product.currentStock}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <MultiCurrencyPrice usdAmount={product.salePrice} size="sm" />
                      <Button
                        size="sm"
                        className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700 mt-1"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredProducts.length > 8 && (
                  <div className="px-4 py-2 text-xs text-gray-500 text-center border-t">
                    +{filteredProducts.length - 8} productos más... Refine su búsqueda
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No se encontraron productos</p>
                {selectedCategory && (
                  <p className="text-xs">en la categoría seleccionada</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información de filtros activos */}
      {(searchTerm || selectedCategory) && (
        <div className="text-xs text-gray-600">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          {selectedCategory && ` en ${selectedCategory}`}
        </div>
      )}
    </div>
  );
};

export default AdvancedProductSearch;
