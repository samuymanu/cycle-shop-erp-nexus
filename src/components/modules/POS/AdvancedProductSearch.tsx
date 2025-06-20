
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/erp';
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar productos basado en búsqueda y categoría
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
                           product.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory && product.currentStock > 0;
  });

  // Obtener categorías únicas
  const categories = Array.from(new Set(
    products.map(p => p.category).filter(Boolean)
  ));

  // Manejar clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddProduct = (product: Product) => {
    onAddToCart(product);
    onSearchChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    onSearchChange('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Campo de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          id="advanced-product-search"
          ref={inputRef}
          type="text"
          placeholder="Buscar por nombre, SKU, marca..."
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => setIsOpen(searchTerm.length > 0)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filtros de categoría */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory('')}
            className="h-6 text-xs px-2"
          >
            Todas ({products.filter(p => p.currentStock > 0).length})
          </Button>
          {categories.slice(0, 3).map(category => {
            const count = products.filter(p => 
              p.category === category && p.currentStock > 0
            ).length;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="h-6 text-xs px-2"
              >
                {category} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* Dropdown de resultados - FIXED: mejor estructura y nombres prominentes */}
      {isOpen && (searchTerm || selectedCategory) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-80 overflow-y-auto">
          {selectedCategory && (
            <div className="p-3 bg-blue-50 border-b">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  Filtrando por: {selectedCategory}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                  className="h-6 w-6 p-0 text-blue-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 
                `No se encontraron productos que coincidan con "${searchTerm}"` :
                'No hay productos en esta categoría'
              }
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredProducts.slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-transparent hover:border-l-blue-500"
                  onClick={() => handleAddProduct(product)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      {/* FIXED: Nombre del producto más prominente */}
                      <h4 className="font-bold text-base text-gray-900 mb-2 leading-tight">
                        {product.name}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Marca:</span> {product.brand}
                        </div>
                        <div>
                          <span className="font-medium">Modelo:</span> {product.model}
                        </div>
                        <div>
                          <span className="font-medium">SKU:</span> {product.sku}
                        </div>
                        <div>
                          <Badge variant="secondary" className="text-xs w-fit">
                            Stock: {product.currentStock}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-2">
                      <MultiCurrencyPrice usdAmount={product.salePrice} size="sm" />
                      <Button
                        size="sm"
                        className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProduct(product);
                        }}
                      >
                        + Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length > 8 && (
                <div className="p-3 text-center text-xs text-gray-500 bg-gray-50">
                  +{filteredProducts.length - 8} productos más... (refina tu búsqueda)
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedProductSearch;
