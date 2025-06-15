
import React from "react";
import { Barcode } from "lucide-react";

interface BarcodeDisplayProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

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

// Cambios: mayor zona blanca en el fondo, texto partidos en grupos y alineación
const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  label,
  className = "",
  size = "medium"
}) => {
  const sizeConfig = {
    small:   { width: 180, height: 76, fontSize: '10px', iconSize: 'h-4 w-4', codeFont: '12px', labelFont: '9px' },
    medium:  { width: 260, height: 114, fontSize: '13px', iconSize: 'h-6 w-6', codeFont: '17px', labelFont: '11px' },
    large:   { width: 340, height: 140, fontSize: '16px', iconSize: 'h-8 w-8', codeFont: '22px', labelFont: '13px' },
  };
  const config = sizeConfig[size];

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
    return { pattern: binaryString, ean13, digits };
  };

  const { pattern, ean13, digits } = generateEAN13Pattern(value);
  const isValidEAN13 = /^\d{13}$/.test(ean13);

  // Zonas — 10 arriba, 40 abajo (texto separado de barras), más margen izquierdo/derecho para dígitos
  const BAR_TOP_MARGIN = 10;
  const BAR_BOTTOM_MARGIN = 40; // mucho mayor
  const BAR_LEFT_MARGIN = 18;
  const BAR_RIGHT_MARGIN = 18;
  const codeWidth = config.width - BAR_LEFT_MARGIN - BAR_RIGHT_MARGIN;
  let moduleWidth = codeWidth / pattern.length;
  moduleWidth = Math.max(moduleWidth, 2);

  // Render barra EAN-13 con todos los templates y patrones matemáticos
  const renderBars = () => {
    const bars = [];
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '1') {
        // Guardas centrales más largas (barras delimitadoras)
        let isGuardBar = (
          // Start
          i < 3 ||
          // Center
          (i >= 45 && i < 50) ||
          // End
          i >= (pattern.length - 3)
        );
        bars.push(
          <rect
            key={i}
            x={BAR_LEFT_MARGIN + i * moduleWidth}
            y={BAR_TOP_MARGIN}
            width={moduleWidth + 0.45}
            height={isGuardBar ? config.height - BAR_TOP_MARGIN - 12 : config.height - BAR_TOP_MARGIN - BAR_BOTTOM_MARGIN}
            fill="#111"
          />
        );
      }
    }
    return bars;
  };

  // Render texto EAN-13 clásico: primer dígito a la izquierda (fuera de barras),
  // grupo 6 dígitos centrados bajo el grupo izquierdo, 6 dígitos centrados bajo grupo derecho
  const renderCodeText = () => {
    // posiciones estrictamente calculadas según estándar, como la referencia
    const digitPositions = [];
    
    // Primer dígito muy a la izquierda, fuera de barras, alineado al margen izquierdo
    digitPositions.push({
      digit: ean13[0],
      x: BAR_LEFT_MARGIN - 5,
      anchor: 'middle'
    });
    // Siguiente 6 dígitos (lado izquierdo)
    for (let i = 1; i <= 6; i++) {
      // Centrados bajo sus respectivas barras (simplificado)
      digitPositions.push({
        digit: ean13[i],
        x: BAR_LEFT_MARGIN + (3 + (i - 1) * 7) * moduleWidth,
        anchor: 'middle'
      });
    }
    // Últimos 6 dígitos (lado derecho)
    for (let i = 7; i <= 12; i++) {
      digitPositions.push({
        digit: ean13[i],
        x: BAR_LEFT_MARGIN + (50 + (i - 7) * 7) * moduleWidth,
        anchor: 'middle'
      });
    }
    // Render
    return digitPositions.map((d, ix) => (
      <text
        key={ix}
        x={d.x}
        y={config.height - 16}
        fontFamily="'Courier New', monospace"
        fontSize={config.codeFont}
        fill="#222"
        textAnchor={d.anchor}
        fontWeight="bold"
        alignmentBaseline="middle"
        letterSpacing={0}
      >{d.digit}</text>
    ));
  };

  return (
    <div className={`flex flex-col items-center bg-white p-2 rounded border ${className}`}>
      <div className="mb-1">
        <Barcode className={`${config.iconSize} text-gray-400`} />
      </div>
      {/* SVG — barras siempre con texto abajo, nunca encima */}
      <div className="bg-white border rounded shadow-sm px-2 py-2">
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="block"
        >
          {/* Fondo blanco */}
          <rect width={config.width} height={config.height} fill="#fff"/>
          {/* Barras EAN-13 matemáticamente correctas, gran margen abajo */}
          {renderBars()}
          {/* Texto EAN-13 partido en 1-6-6, alineación igual a referencia, SIEMPRE completamente debajo */}
          {renderCodeText()}
          {/* Texto 'EAN-13' indicativo, pequeño bajo el SVG */}
        </svg>
      </div>
      <div 
        className="font-mono font-bold text-black mt-1 tracking-wider"
        style={{ fontSize: config.fontSize }}
      >
        {isValidEAN13 ? ean13 : value}
      </div>
      <div className="text-xs text-gray-600" style={{marginTop: '2px', fontSize:config.labelFont}}>
        EAN-13
      </div>
      {isValidEAN13
        ? <div className="text-xs text-green-600 font-medium mt-1">EAN-13 ✓</div>
        : <div className="text-xs text-orange-600 font-medium mt-1">Convertido a EAN-13</div>
      }
    </div>
  );
};

export default BarcodeDisplay;
