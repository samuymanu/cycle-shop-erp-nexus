
import React from "react";
import { Barcode } from "lucide-react";

/**
 * Representa visualmente un código de barras EAN-13 con patrón matemáticamente correcto.
 * Mejorado: barras más altas y gruesas, texto EAN-13 siempre debajo de las barras, nunca montado.
 */
interface BarcodeDisplayProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

// Patrones EAN-13 (idénticos)
const L_PATTERNS = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011"
];
const G_PATTERNS = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111"
];
const R_PATTERNS = [
  "1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100"
];
const FIRST_DIGIT_PATTERNS = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"
];

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  label,
  className = "",
  size = "medium"
}) => {
  // Configuración de tamaño y estilos mejorados
  const sizeConfig = {
    small:   { width: 180, height: 72, fontSize: '10px', iconSize: 'h-4 w-4', codeFont: '11px', labelFont: '9px' },
    medium:  { width: 260, height: 108, fontSize: '13px', iconSize: 'h-6 w-6', codeFont: '14px', labelFont: '11px' },
    large:   { width: 340, height: 134, fontSize: '16px', iconSize: 'h-8 w-8', codeFont: '16px', labelFont: '13px' },
  };
  const config = sizeConfig[size];

  // --- Generar patrón EAN-13 corregido
  const generateEAN13Pattern = (code: string) => {
    let ean13 = code.padStart(13, '0').substring(0, 13);

    if (!/^\d{13}$/.test(ean13)) {
      const numericCode = code.replace(/\D/g, '').padStart(12, '0').substring(0,12);
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const digit = parseInt(numericCode[i]);
        sum += i % 2 === 0 ? digit : digit * 3;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      ean13 = numericCode + checkDigit;
    }
    const digits = ean13.split('').map(d => parseInt(d));
    const pattern = FIRST_DIGIT_PATTERNS[digits[0]];
    let binaryString = "101";
    for (let i = 0; i < 6; i++) {
      binaryString += (pattern[i] === 'L' ? L_PATTERNS[digits[i+1]] : G_PATTERNS[digits[i+1]]);
    }
    binaryString += "01010";
    for (let i = 0; i < 6; i++) {
      binaryString += R_PATTERNS[digits[i+7]];
    }
    binaryString += "101";
    return { pattern: binaryString, ean13 };
  };

  const { pattern, ean13 } = generateEAN13Pattern(value);
  const isValidEAN13 = /^\d{13}$/.test(ean13);

  // Mejor: altura de barras = 76% del alto, texto siempre debajo
  const BAR_TOP_MARGIN = 10;
  const BAR_BOTTOM_MARGIN = 30;
  const barHeight = config.height - BAR_TOP_MARGIN - BAR_BOTTOM_MARGIN;
  let moduleWidth = config.width / pattern.length;
  // Asegurar módulo mínimo >= 2px para mejor legibilidad (en impresiones o pantallas)
  moduleWidth = Math.max(moduleWidth, 2);

  // Renderizar barras EAN-13 altas y claras
  const renderBars = () => {
    const bars = [];
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '1') {
        bars.push(
          <rect
            key={i}
            x={i * moduleWidth}
            y={BAR_TOP_MARGIN}
            width={moduleWidth + 0.5}
            height={barHeight}
            fill="#111"
          />
        );
      }
    }
    return bars;
  };

  // El texto del código EAN-13 va centrado debajo de las barras, nunca montado
  // Si hay label, va más abajo, ambos centrados

  return (
    <div className={`flex flex-col items-center bg-white p-2 rounded border ${className}`}>
      {/* Icono */}
      <div className="mb-1">
        <Barcode className={`${config.iconSize} text-gray-400`} />
      </div>
      {/* Código de barras — SVG mejorado */}
      <div className="bg-white border rounded shadow-sm px-2 py-2">
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="block"
        >
          {/* Fondo blanco */}
          <rect width={config.width} height={config.height} fill="#fff"/>
          {/* Barras EAN-13 mejoradas */}
          {renderBars()}
          {/* Texto EAN-13 centrado abajo (SIEMPRE debajo, nunca montado) */}
          <text
            x={config.width/2}
            y={config.height - 15}
            fontFamily="'Courier New', monospace"
            fontSize={config.codeFont}
            fill="#222"
            textAnchor="middle"
            fontWeight="bold"
            alignmentBaseline="middle"
            letterSpacing={2}
          >
            {ean13}
          </text>
          {/* Texto 'EAN-13' indicativo (arriba del número, pero DEBAJO de barras) */}
          <text
            x={config.width/2}
            y={config.height - 27}
            fontFamily="Arial, sans-serif"
            fontSize={config.labelFont}
            fill="#556"
            textAnchor="middle"
            fontWeight="bold"
          >
            EAN-13
          </text>
        </svg>
      </div>
      {/* Indicadores visuales */}
      <div className="font-mono font-bold text-black mt-1 tracking-wider"
           style={{ fontSize: config.fontSize }}>
        {isValidEAN13 ? ean13 : value}
      </div>
      {isValidEAN13
        ? <div className="text-xs text-green-600 font-medium mt-1">EAN-13 ✓</div>
        : <div className="text-xs text-orange-600 font-medium mt-1">Convertido a EAN-13</div>
      }
    </div>
  );
};

export default BarcodeDisplay;
