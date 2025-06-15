
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

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

const ProductSearch: React.FC<ProductSearchProps> = ({
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
}) => {
  return (
    <Card className="bikeERP-card">
      <CardHeader>
        <CardTitle className="text-slate-900">Productos</CardTitle>
        <CardDescription className="text-slate-600">
          Busca y agrega productos al carrito. Usa ↑ ↓ y Enter para más rapidez. 
          También puedes escanear códigos de barras directamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, marca, SKU o código de barras..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                  if (e.target.value) {
                    setIsSearchActive(true);
                  } else {
                    setIsSearchActive(false);
                  }
                }}
                onKeyDown={onSearchKeyDown}
                onFocus={() => { if(searchTerm) setIsSearchActive(true); }}
                onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
                className="pl-10 bikeERP-input"
              />
              {isSearchActive && searchTerm && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    <ul>
                      {filteredProducts.slice(0, 10).map((product, index) => (
                        <li
                          key={product.id}
                          className={`p-3 cursor-pointer hover:bg-slate-100 ${index === highlightedIndex ? 'bg-slate-100' : ''}`}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onClick={() => onProductSelect(product)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-slate-800">{product.name}</p>
                              <p className="text-sm text-slate-500">{product.brand} - {formatCurrency(product.salePrice)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-600">Stock: {product.currentStock}</p>
                              <Badge variant="outline" className="text-xs font-mono">{product.sku}</Badge>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-slate-500">
                      No se encontraron productos con "{searchTerm}".
                      <br />
                      <span className="text-xs text-slate-400">
                        Intenta con el SKU original del producto o escanea el código.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoría">
                  {selectedCategory === 'all'
                    ? 'Todas las categorías'
                    : categories.find(cat => cat.name === selectedCategory)?.displayName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSearch;
