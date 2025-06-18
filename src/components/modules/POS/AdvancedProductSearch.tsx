
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, X } from 'lucide-react';
import MultiCurrencyPrice from '@/components/ui/MultiCurrencyPrice';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  salePrice: number;
  currentStock: number;
  brand: string;
  model: string;
}

interface AdvancedProductSearchProps {
  products: Product[];
  onAddToCart: (product: Product) => boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const AdvancedProductSearch: React.FC<AdvancedProductSearchProps> = ({
  products,
  onAddToCart,
  searchTerm,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return cats.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      const matchesPriceRange = 
        (!minPrice || product.salePrice >= parseFloat(minPrice)) &&
        (!maxPrice || product.salePrice <= parseFloat(maxPrice));

      const hasStock = product.currentStock > 0;

      return matchesSearch && matchesCategory && matchesPriceRange && hasStock;
    }).slice(0, 10); // Limitar a 10 resultados para mejor rendimiento
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchInputRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredProducts.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && filteredProducts[selectedIndex]) {
            onAddToCart(filteredProducts[selectedIndex]);
            setSelectedIndex(-1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onSearchChange('');
          setSelectedIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredProducts, selectedIndex, onAddToCart, onSearchChange]);

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    onSearchChange('');
    setSelectedIndex(-1);
  };

  return (
    <Card className="bikeERP-card">
      <CardContent className="p-4 space-y-4">
        {/* Búsqueda principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar productos... (F2 para enfocar)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-12"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="text-xs font-medium text-gray-600">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full mt-1 p-2 text-sm border border-gray-300 rounded"
              >
                <option value="">Todas</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Precio Mín.</label>
              <Input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$0"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Precio Máx.</label>
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Sin límite"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div className="md:col-span-3 flex justify-between items-center">
              <Badge variant="secondary" className="text-xs">
                {filteredProducts.length} productos encontrados
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}

        {/* Resultados de búsqueda */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {searchTerm && filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => onAddToCart(product)}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedIndex === index 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{product.name}</h4>
                    <p className="text-xs text-gray-500">
                      {product.brand} - {product.model} • SKU: {product.sku}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <MultiCurrencyPrice usdAmount={product.salePrice} size="sm" />
                      <Badge 
                        variant={product.currentStock <= 5 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        Stock: {product.currentStock}
                      </Badge>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-blue-600 flex-shrink-0" />
                </div>
              </div>
            ))
          ) : searchTerm ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No se encontraron productos</p>
              <p className="text-xs">Intenta ajustar los filtros</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Escribe para buscar productos</p>
              <p className="text-xs">Usa ↑↓ para navegar, Enter para agregar</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedProductSearch;
