
import React, { forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package } from 'lucide-react';

interface ProductSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: any[];
  filteredProducts: any[];
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onProductSelect: (product: any) => void;
  formatCurrency: (amount: number) => string;
}

const ProductSearch = forwardRef<HTMLInputElement, ProductSearchProps>(({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  filteredProducts,
  highlightedIndex,
  setHighlightedIndex,
  isSearchActive,
  setIsSearchActive,
  onSearchKeyDown,
  onProductSelect,
  formatCurrency,
}, ref) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="bikeERP-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={ref}
              type="text"
              placeholder="Buscar productos por nombre, marca o SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchActive(e.target.value.length > 0);
                if (e.target.value.length === 0) {
                  setHighlightedIndex(-1);
                }
              }}
              onKeyDown={onSearchKeyDown}
              onFocus={() => setIsSearchActive(true)}
              className="pl-10 bg-white border-gray-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="text-xs"
            >
              Todas las Categorías
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="text-xs"
              >
                {category.displayName || category.name}
              </Button>
            ))}
          </div>

          {/* Search Results */}
          {isSearchActive && searchTerm && (
            <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg bg-white">
              {filteredProducts.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredProducts.slice(0, 10).map((product, index) => (
                    <div
                      key={product.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        index === highlightedIndex
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-gray-50 border-transparent'
                      } border`}
                      onClick={() => onProductSelect(product)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.brand} • SKU: {product.sku}
                          </p>
                          <p className="text-xs text-gray-500">
                            Stock: {product.currentStock} unidades
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-primary">
                            {formatCurrency(product.salePrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length > 10 && (
                    <p className="text-center text-xs text-gray-500 py-2">
                      +{filteredProducts.length - 10} productos más...
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron productos</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ProductSearch.displayName = 'ProductSearch';

export default ProductSearch;
