
import React from 'react';

interface CategoryStatsProps {
  categoryStats: any[];
  getCategoryKey: (category: string) => string;
  CATEGORY_COLORS: Record<string, string>;
  CATEGORY_ICONS: Record<string, React.ReactNode>;
}

const CategoryStats: React.FC<CategoryStatsProps> = ({
  categoryStats,
  getCategoryKey,
  CATEGORY_COLORS,
  CATEGORY_ICONS
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
      {categoryStats.map(cat => {
        const catKey = getCategoryKey(cat.name);
        return (
          <div
            key={cat.id}
            className={`p-2 rounded-lg border ${CATEGORY_COLORS[catKey] || CATEGORY_COLORS.default}`}
          >
            <div className="flex items-center gap-1">
              {(CATEGORY_ICONS[catKey] || <span />)}
              <span className="text-xs font-medium capitalize">{cat.displayName}</span>
            </div>
            <div className="text-sm font-bold">{cat.count} producto{cat.count === 1 ? '' : 's'}</div>
          </div>
        );
      })}
    </div>
  );
}

export default CategoryStats;
