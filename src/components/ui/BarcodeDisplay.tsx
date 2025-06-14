
import React from "react";
import { Barcode } from "lucide-react";

/**
 * Representa visualmente un código de barras (SKU) usando SVG tipo barcode o fallback.
 */
interface BarcodeDisplayProps {
  value: string;
  label?: string;
  className?: string;
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ value, label, className }) => {
  // Para proyecto simple, solo simulamos la visualización del código de barras como líneas
  // (Para producción, puedes instalar un paquete como `react-barcode` para el SVG real)
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <Barcode className="h-8 w-8 text-gray-400" />
      <div className="w-32 h-6 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 my-1 rounded">
        <span className="sr-only">{value}</span>
      </div>
      <span className="font-mono text-xs text-gray-700">{label ?? value}</span>
    </div>
  );
};

export default BarcodeDisplay;
