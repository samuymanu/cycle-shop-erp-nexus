
import React from "react";
import { Barcode } from "lucide-react";

interface BarcodeDisplayProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

// Patrones EAN-13 EXACTOS según estándar internacional
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

// Calcular dígito de verificación
const calculateCheckDigit = (code: string) => {
  const digits = code.slice(0, 12).split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
};

// Generar EAN-13 válido
const generateValidEAN13 = (input: string) => {
  let cleaned = input.replace(/\D/g, '');
  
  if (cleaned.length >= 13) {
    const provided = cleaned.slice(0, 13);
    const calculated = calculateCheckDigit(provided);
    const lastDigit = parseInt(provided[12]);
    
    if (calculated === lastDigit) {
      return provided;
    }
  }
  
  const base12 = cleaned.padStart(12, '0').slice(0, 12);
  const checkDigit = calculateCheckDigit(base12);
  return base12 + checkDigit;
};

// Generar patrón binario
const generateEAN13Pattern = (ean13: string) => {
  const digits = ean13.split('').map(Number);
  const firstDigit = digits[0];
  const leftGroup = digits.slice(1, 7);
  const rightGroup = digits.slice(7, 13);
  const patternSequence = FIRST_DIGIT_PATTERNS[firstDigit];
  
  let pattern = '101'; // Start guard
  
  for (let i = 0; i < 6; i++) {
    if (patternSequence[i] === 'L') {
      pattern += L_PATTERNS[leftGroup[i]];
    } else {
      pattern += G_PATTERNS[leftGroup[i]];
    }
  }
  
  pattern += '01010'; // Center guard
  
  for (let i = 0; i < 6; i++) {
    pattern += R_PATTERNS[rightGroup[i]];
  }
  
  pattern += '101'; // End guard
  
  return pattern;
};

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  className = "",
  size = "medium"
}) => {
  const sizeConfig = {
    small:   { width: 200, height: 100, fontSize: '12px', iconSize: 'h-4 w-4', codeFont: '14px' },
    medium:  { width: 280, height: 140, fontSize: '16px', iconSize: 'h-6 w-6', codeFont: '18px' },
    large:   { width: 360, height: 180, fontSize: '20px', iconSize: 'h-8 w-8', codeFont: '22px' },
  };
  
  const config = sizeConfig[size];
  const ean13 = generateValidEAN13(value);
  const pattern = generateEAN13Pattern(ean13);
  const isOriginalValid = value.length === 13 && /^\d{13}$/.test(value) && calculateCheckDigit(value) === parseInt(value[12]);
  
  // Configuración de barras
  const quietZone = 20;
  const moduleWidth = Math.max(Math.floor((config.width - (2 * quietZone)) / pattern.length), 1);
  const barcodeWidth = pattern.length * moduleWidth;
  const startX = (config.width - barcodeWidth) / 2;
  
  const barAreaHeight = config.height * 0.7;
  const barStartY = config.height * 0.1;
  const textY = barStartY + barAreaHeight + 20;

  const renderBars = () => {
    const bars = [];
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === "1") {
        const isGuardBar = (
          i < 3 ||
          (i >= 45 && i < 50) ||
          i >= (pattern.length - 3)
        );
        
        bars.push(
          <rect
            key={i}
            x={startX + i * moduleWidth}
            y={isGuardBar ? barStartY - 3 : barStartY}
            width={moduleWidth}
            height={isGuardBar ? barAreaHeight + 6 : barAreaHeight}
            fill="#000000"
          />
        );
      }
    }
    return bars;
  };

  return (
    <div className={`flex flex-col items-center bg-white p-3 rounded-lg border shadow-sm ${className}`}>
      <div className="mb-2">
        <Barcode className={`${config.iconSize} text-gray-500`} />
      </div>
      
      <div className="bg-white border rounded-md shadow-inner p-2">
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="block"
        >
          <rect width={config.width} height={config.height} fill="#ffffff"/>
          {renderBars()}
          <text
            x={config.width / 2}
            y={textY}
            fontFamily="'Courier New', monospace"
            fontSize={config.codeFont}
            fill="#000000"
            fontWeight="bold"
            textAnchor="middle"
            letterSpacing="1px"
          >
            {ean13}
          </text>
        </svg>
      </div>
      
      <div className="mt-2 text-center">
        <div className="font-mono font-bold text-black tracking-wide" style={{ fontSize: config.fontSize }}>
          {ean13}
        </div>
        <div className="text-xs mt-1">
          {isOriginalValid ? (
            <span className="text-green-600 font-medium">✓ EAN-13 Válido</span>
          ) : (
            <span className="text-blue-600 font-medium">Convertido a EAN-13</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeDisplay;
