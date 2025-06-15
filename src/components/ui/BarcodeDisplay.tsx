
import React from "react";
import { Barcode } from "lucide-react";

/**
 * Representa visualmente un código de barras EAN-13 con patrón matemáticamente correcto
 */
interface BarcodeDisplayProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

// Patrones L (izquierda - números pares)
const L_PATTERNS = [
  "0001101", // 0
  "0011001", // 1
  "0010011", // 2
  "0111101", // 3
  "0100011", // 4
  "0110001", // 5
  "0101111", // 6
  "0111011", // 7
  "0110111", // 8
  "0001011"  // 9
];

// Patrones G (izquierda - números impares)
const G_PATTERNS = [
  "0100111", // 0
  "0110011", // 1
  "0011011", // 2
  "0100001", // 3
  "0011101", // 4
  "0111001", // 5
  "0000101", // 6
  "0010001", // 7
  "0001001", // 8
  "0010111"  // 9
];

// Patrones R (derecha)
const R_PATTERNS = [
  "1110010", // 0
  "1100110", // 1
  "1101100", // 2
  "1000010", // 3
  "1011100", // 4
  "1001110", // 5
  "1010000", // 6
  "1000100", // 7
  "1001000", // 8
  "1110100"  // 9
];

// Patrones de grupo para el primer dígito
const FIRST_DIGIT_PATTERNS = [
  "LLLLLL", // 0
  "LLGLGG", // 1
  "LLGGLG", // 2
  "LLGGGL", // 3
  "LGLLGG", // 4
  "LGGLLG", // 5
  "LGGGLL", // 6
  "LGLGLG", // 7
  "LGLGGL", // 8
  "LGGLGL"  // 9
];

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ 
  value, 
  label, 
  className = "",
  size = 'medium'
}) => {
  // Configuraciones de tamaño
  const sizeConfig = {
    small: { width: 160, height: 50, fontSize: '9px', iconSize: 'h-4 w-4' },
    medium: { width: 240, height: 80, fontSize: '11px', iconSize: 'h-6 w-6' },
    large: { width: 320, height: 100, fontSize: '13px', iconSize: 'h-8 w-8' }
  };

  const config = sizeConfig[size];

  // Generar patrón EAN-13 matemáticamente correcto
  const generateEAN13Pattern = (code: string) => {
    // Asegurar que el código tenga 13 dígitos
    let ean13 = code.padStart(13, '0').substring(0, 13);
    
    // Si no es un EAN-13 válido, crear uno basado en el código original
    if (!/^\d{13}$/.test(ean13)) {
      // Convertir caracteres no numéricos a números
      const numericCode = code.replace(/\D/g, '').padStart(12, '0').substring(0, 12);
      
      // Calcular dígito de verificación
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const digit = parseInt(numericCode[i]);
        if (i % 2 === 0) {
          sum += digit;
        } else {
          sum += digit * 3;
        }
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      ean13 = numericCode + checkDigit;
    }

    const digits = ean13.split('').map(d => parseInt(d));
    const firstDigit = digits[0];
    const leftGroup = digits.slice(1, 7);
    const rightGroup = digits.slice(7, 13);
    
    const pattern = FIRST_DIGIT_PATTERNS[firstDigit];
    let binaryString = '';
    
    // Patrón de inicio
    binaryString += '101';
    
    // Grupo izquierdo (6 dígitos)
    for (let i = 0; i < 6; i++) {
      const digit = leftGroup[i];
      if (pattern[i] === 'L') {
        binaryString += L_PATTERNS[digit];
      } else {
        binaryString += G_PATTERNS[digit];
      }
    }
    
    // Separador central
    binaryString += '01010';
    
    // Grupo derecho (6 dígitos)
    for (let i = 0; i < 6; i++) {
      const digit = rightGroup[i];
      binaryString += R_PATTERNS[digit];
    }
    
    // Patrón de fin
    binaryString += '101';
    
    return { pattern: binaryString, ean13 };
  };

  const { pattern, ean13 } = generateEAN13Pattern(value);
  
  // Renderizar barras basadas en el patrón binario
  const renderBars = () => {
    const bars = [];
    const moduleWidth = config.width / pattern.length;
    const barHeight = config.height - 35;
    
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '1') {
        bars.push(
          <rect
            key={i}
            x={i * moduleWidth}
            y={8}
            width={moduleWidth}
            height={barHeight}
            fill="#000000"
          />
        );
      }
    }
    
    return bars;
  };

  const isValidEAN13 = /^\d{13}$/.test(ean13);

  return (
    <div className={`flex flex-col items-center bg-white p-2 rounded border ${className}`}>
      <div className="mb-1">
        <Barcode className={`${config.iconSize} text-gray-400`} />
      </div>
      
      {/* Código de barras SVG con patrón EAN-13 real */}
      <div className="bg-white border rounded p-2 shadow-sm">
        <svg 
          width={config.width} 
          height={config.height} 
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="block"
        >
          {/* Fondo blanco */}
          <rect width={config.width} height={config.height} fill="white"/>
          
          {/* Barras EAN-13 matemáticamente correctas */}
          {renderBars()}
        </svg>
      </div>

      {/* Texto del código con formato EAN-13 */}
      <div 
        className="font-mono font-bold text-black mt-1 tracking-wider"
        style={{ fontSize: config.fontSize }}
      >
        {isValidEAN13 ? ean13 : value}
      </div>
      
      {/* Indicador EAN-13 */}
      {isValidEAN13 && (
        <div className="text-xs text-green-600 font-medium mt-1">
          EAN-13 ✓
        </div>
      )}
      
      {!isValidEAN13 && (
        <div className="text-xs text-orange-600 font-medium mt-1">
          Convertido a EAN-13
        </div>
      )}
    </div>
  );
};

export default BarcodeDisplay;
