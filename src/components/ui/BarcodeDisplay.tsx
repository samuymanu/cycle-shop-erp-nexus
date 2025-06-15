
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

const MIN_QUIET_ZONE_MODULES = 14;

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  className = "",
  size = "medium"
}) => {
  // Configuraciones de tamaño
  const sizeConfig = {
    small:   { width: 178, height: 90, fontSize: '12px', iconSize: 'h-4 w-4', codeFont: '13px', marginBelowBars: 26 },
    medium:  { width: 250, height: 150, fontSize: '16px', iconSize: 'h-6 w-6', codeFont: '18px', marginBelowBars: 34 },
    large:   { width: 328, height: 200, fontSize: '21px', iconSize: 'h-8 w-8', codeFont: '25px', marginBelowBars: 42 },
  };
  const config = sizeConfig[size];
  const TOP_MARGIN = 13; // margen arriba del código
  const BAR_AREA_HEIGHT = config.height - config.marginBelowBars - TOP_MARGIN;
  const DIGITS_AREA_HEIGHT = config.marginBelowBars; // solo reservado para número
  const FULL_HEIGHT = config.height;

  // Genera EAN-13 válido y el patrón binario correspondiente
  const generateEAN13Pattern = (code: string) => {
    let ean13 = code.replace(/\D/g, "").padStart(13, "0").slice(0, 13);
    if (!/^\d{13}$/.test(ean13)) {
      // calcular dígito de control si faltan dígitos
      const numericCode = code.replace(/\D/g, '').padStart(12, '0').slice(0, 12);
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const digit = parseInt(numericCode[i]);
        sum += i % 2 === 0 ? digit : digit * 3;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      ean13 = numericCode + checkDigit;
    }
    const digits = ean13.split('').map(d => parseInt(d));
    const firstPattern = FIRST_DIGIT_PATTERNS[digits[0]];
    let binary = "101";
    for (let i = 0; i < 6; i++) {
      binary += (firstPattern[i] === 'L' ? L_PATTERNS[digits[i+1]] : G_PATTERNS[digits[i+1]]);
    }
    binary += "01010";
    for (let i = 0; i < 6; i++) {
      binary += R_PATTERNS[digits[i+7]];
    }
    binary += "101";
    return { binary, ean13, digits };
  };

  const { binary: pattern, ean13 } = generateEAN13Pattern(value);
  const isValidEAN13 = /^\d{13}$/.test(ean13);

  // Cálculo del módulo y quiet zone
  const minModuleWidth = 2;
  const moduleWidth = Math.max(
    Math.floor((config.width - 2 * MIN_QUIET_ZONE_MODULES) / pattern.length),
    minModuleWidth
  );
  const barcodeWidth = moduleWidth * pattern.length;
  const quietZone = Math.max(
    (config.width - barcodeWidth) / 2,
    minModuleWidth * MIN_QUIET_ZONE_MODULES
  );

  // Render de las barras, solo en el área superior
  const renderBars = () => {
    const bars = [];
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === "1") {
        let isGuardBar = (
          i < 3 ||
          (i >= 45 && i < 50) ||
          i >= (pattern.length - 3)
        );
        bars.push(
          <rect
            key={i}
            x={quietZone + i * moduleWidth}
            y={TOP_MARGIN}
            width={moduleWidth}
            height={isGuardBar ? BAR_AREA_HEIGHT + 10 : BAR_AREA_HEIGHT}
            fill="#111"
          />
        );
      }
    }
    return bars;
  };

  return (
    <div className={`flex flex-col items-center bg-white p-2 rounded border ${className}`} style={{maxWidth: config.width}}>
      <div className="mb-1">
        <Barcode className={`${config.iconSize} text-gray-400`} />
      </div>
      <div className="bg-white border rounded shadow-sm px-2 py-2">
        <svg
          width={config.width}
          height={FULL_HEIGHT}
          viewBox={`0 0 ${config.width} ${FULL_HEIGHT}`}
          className="block"
        >
          {/* Quiet zone + barras (solo arriba, sin texto abajo) */}
          <rect width={config.width} height={FULL_HEIGHT} fill="#fff"/>
          {/* BARRAS SOLO EN LA ZONA SUPERIOR */}
          {renderBars()}
          {/* TEXTO - completamente separado y centrado abajo del todo */}
          <text
            x={config.width / 2}
            y={FULL_HEIGHT - (DIGITS_AREA_HEIGHT / 2)}
            fontFamily="'Courier New', monospace"
            fontSize={config.codeFont}
            fill="#151515"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
            letterSpacing="6px"
            style={{ userSelect: "all" }}
          >
            {ean13}
          </text>
        </svg>
      </div>
      <div className="font-mono font-bold text-black mt-1 tracking-wider" style={{ fontSize: config.fontSize }}>
        {isValidEAN13 ? ean13 : value}
      </div>
      {isValidEAN13
        ? <div className="text-xs text-green-600 font-medium mt-1">EAN-13 <b>✓</b></div>
        : <div className="text-xs text-orange-600 font-medium mt-1">Convertido a EAN-13</div>
      }
    </div>
  );
};

export default BarcodeDisplay;
