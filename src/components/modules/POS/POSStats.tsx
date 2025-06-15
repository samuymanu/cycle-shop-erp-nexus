
import React from 'react';
import CategoryStats from '../CategoryStats';
import ProductList from '../ProductList';

interface POSStatsProps {
  categoryStats: any[];
  getCategoryKey: (categoryName: string) => string;
  CATEGORY_COLORS: Record<string, string>;
  CATEGORY_ICONS: Record<string, React.ReactNode>;
  products: any[];
  filteredProducts: any[];
  getCategoryOfProduct: (productCategoryName: string) => any;
  addToCart: (product: any) => void;
  formatCurrency: (amount: number) => string;
}

const POSStats: React.FC<POSStatsProps> = ({
  categoryStats,
  getCategoryKey,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  products,
  filteredProducts,
  getCategoryOfProduct,
  addToCart,
  formatCurrency,
}) => {
  return (
    <>
      <CategoryStats
        categoryStats={categoryStats}
        getCategoryKey={getCategoryKey}
        CATEGORY_COLORS={CATEGORY_COLORS}
        CATEGORY_ICONS={CATEGORY_ICONS}
      />
      <ProductList
        products={products}
        filteredProducts={filteredProducts}
        getCategoryOfProduct={getCategoryOfProduct}
        getCategoryKey={getCategoryKey}
        CATEGORY_COLORS={CATEGORY_COLORS}
        CATEGORY_ICONS={CATEGORY_ICONS}
        addToCart={addToCart}
        formatCurrency={formatCurrency}
      />
    </>
  );
};

export default POSStats;
