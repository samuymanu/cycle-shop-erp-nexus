
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  categories: { id: number; name: string; displayName: string }[];
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories
}) => (
  <Card className="erp-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary" />
        Filtros
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, SKU o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 erp-search-input"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="erp-select"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>
              {category.displayName}
            </option>
          ))}
        </select>
      </div>
    </CardContent>
  </Card>
);

export default ProductFilters;
