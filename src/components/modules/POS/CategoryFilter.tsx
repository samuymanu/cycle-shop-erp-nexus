
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  productCount: number;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  productCount,
}) => {
  const categoryDisplayNames: Record<string, string> = {
    'bicicletas': 'Bicicletas',
    'transmision': 'Transmisión',
    'frenos': 'Frenos',
    'ruedas': 'Ruedas',
    'seguridad': 'Seguridad',
    'accesorios': 'Accesorios',
    'motocicletas': 'Motocicletas',
  };

  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">Filtro por Categoría</span>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCategorySelect(null)}
            className="h-5 w-5 p-0 text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {/* Mostrar todas las categorías */}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={selectedCategory === null ? "default" : "secondary"}
            className={`cursor-pointer text-xs ${
              selectedCategory === null 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => onCategorySelect(null)}
          >
            Todas ({productCount})
          </Badge>
          
          {categories.map((category) => {
            const displayName = categoryDisplayNames[category] || category;
            const isSelected = selectedCategory === category;
            
            return (
              <Badge
                key={category}
                variant={isSelected ? "default" : "secondary"}
                className={`cursor-pointer text-xs ${
                  isSelected 
                    ? "bg-primary text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => onCategorySelect(category)}
              >
                {displayName}
              </Badge>
            );
          })}
        </div>
        
        {selectedCategory && (
          <div className="text-xs text-gray-600">
            Filtrando por: {categoryDisplayNames[selectedCategory] || selectedCategory}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;
