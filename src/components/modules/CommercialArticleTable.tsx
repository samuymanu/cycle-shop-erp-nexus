
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface ArticleRow {
  id: string;
  name: string;
  quantity: number;
  priceUsd: number;
}

interface CommercialArticleTableProps {
  articles: ArticleRow[];
  setArticles: (rows: ArticleRow[]) => void;
  profitMargin: number;
  setProfitMargin: (m: number) => void;
  exchangeRate: number;
  formatCurrency: (amount: number, currency: 'VES' | 'USD') => string;
}

const CommercialArticleTable: React.FC<CommercialArticleTableProps> = ({
  articles,
  setArticles,
  profitMargin,
  setProfitMargin,
  exchangeRate,
  formatCurrency,
}) => {
  // HANDLERS
  const handleArticleChange = (id: string, key: keyof ArticleRow, value: string | number) => {
    setArticles(
      articles.map(article =>
        article.id === id
          ? { ...article, [key]: key === 'name' ? value : Number(value) }
          : article
      )
    );
  };

  const addArticle = () => {
    setArticles([
      ...articles,
      { id: Date.now().toString(), name: '', quantity: 1, priceUsd: 0 },
    ]);
  };

  const removeArticle = (id: string) => {
    setArticles(articles.filter(article => article.id !== id));
  };

  // CALCULATIONS
  const subtotalUsd = articles.reduce((sum, r) => sum + r.priceUsd * r.quantity, 0);
  const subtotalVes = subtotalUsd * exchangeRate;
  const marginVes = subtotalVes * (profitMargin / 100);
  const totalFinalVes = subtotalVes + marginVes;

  return (
    <Card className="mt-4 bg-yellow-50 border-yellow-300">
      <CardContent className="flex flex-col gap-6 p-4">
        <div>
          <Label>Margen de Ganancia (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.01}
            className="w-28 mt-1"
            value={profitMargin}
            onChange={e => setProfitMargin(Number(e.target.value))}
          />
        </div>
        {/* Tabla de artículos */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-yellow-100">
                <th className="p-2">Artículo</th>
                <th className="p-2">Cantidad</th>
                <th className="p-2">Precio USD</th>
                <th className="p-2">Subtotal USD</th>
                <th className="p-2">Subtotal VES</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td className="py-4 text-center text-gray-400" colSpan={6}>Agregue artículos para calcular</td>
                </tr>
              ) : (
                articles.map((article, idx) => (
                  <tr key={article.id} className="even:bg-yellow-50">
                    <td className="p-2">
                      <Input
                        type="text"
                        placeholder={`Ej. Artículo ${idx + 1}`}
                        value={article.name}
                        onChange={e => handleArticleChange(article.id, 'name', e.target.value)}
                        className="w-36"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min={1}
                        value={article.quantity}
                        onChange={e => handleArticleChange(article.id, 'quantity', e.target.value)}
                        className="w-20"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={article.priceUsd}
                        onChange={e => handleArticleChange(article.id, 'priceUsd', e.target.value)}
                        className="w-28"
                      />
                    </td>
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(article.priceUsd * article.quantity, 'USD')}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(article.priceUsd * article.quantity * exchangeRate, 'VES')}
                    </td>
                    <td className="p-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-red-100"
                        onClick={() => removeArticle(article.id)}
                        title="Eliminar artículo"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-yellow-100 font-semibold">
                <td className="p-2" colSpan={3}>Totales:</td>
                <td className="p-2 text-right">{formatCurrency(subtotalUsd, 'USD')}</td>
                <td className="p-2 text-right">{formatCurrency(subtotalVes, 'VES')}</td>
                <td className="p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div>
          <Button type="button" onClick={addArticle} variant="outline" className="gap-2 hover:bg-yellow-200">
            <Plus className="h-4 w-4" /> Agregar Artículo
          </Button>
        </div>
        <div className="flex flex-col gap-0.5 border-t pt-4 mt-2 text-right">
          <div>
            <span className="text-gray-600">Subtotal en VES:</span>{" "}
            <span className="font-medium">{formatCurrency(subtotalVes, 'VES')}</span>
          </div>
          <div>
            <span className="text-gray-600">Margen aplicado ({profitMargin}%):</span>{" "}
            <span className="font-medium">{formatCurrency(marginVes, 'VES')}</span>
          </div>
          <div>
            <span className="text-lg font-bold text-yellow-800">
              Total final: {formatCurrency(totalFinalVes, 'VES')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommercialArticleTable;

