
import React from "react";
import { Barcode } from "lucide-react";

interface BarcodeDisplayProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

// Patrones estándar EAN-13
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

// QUIET ZONE estándar (mínimo 10 módulos EAN; usamos 14 para mayor seguridad)
const MIN_QUIET_ZONE_MODULES = 14;

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  className = "",
  size = "medium"
}) => {
  // Config según tamaño de visualización
  const sizeConfig = {
    small:   { width: 178, height: 78, fontSize: '10px', iconSize: 'h-4 w-4', codeFont: '13px' },
    medium:  { width: 250, height: 120, fontSize: '14px', iconSize: 'h-6 w-6', codeFont: '18px' },
    large:   { width: 328, height: 154, fontSize: '18px', iconSize: 'h-8 w-8', codeFont: '25px' },
  };
  const config = sizeConfig[size];
  const TOP_MARGIN = 8;
  const TEXT_GAP = 32; // espacio mínimo al texto debajo
  const BARCODE_HEIGHT = config.height - TOP_MARGIN - TEXT_GAP;

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

  // Patrón y valor corregido
  const { binary: pattern, ean13 } = generateEAN13Pattern(value);
  const isValidEAN13 = /^\d{13}$/.test(ean13);

  // Calcular módulo: máximo tamaño, pero sin bajar de 2px
  const minModuleWidth = 2;
  // Quiet zone siempre ≥ 14 módulos (muy seguro), espacio calculado sobre width
  const moduleWidth = Math.max(
    Math.floor((config.width - 2 * MIN_QUIET_ZONE_MODULES) / pattern.length),
    minModuleWidth
  );
  const barcodeWidth = moduleWidth * pattern.length;
  const quietZone = Math.max(
    (config.width - barcodeWidth) / 2,
    minModuleWidth * MIN_QUIET_ZONE_MODULES
  );

  // Renderizado de las barras, con altura correcta para guardas
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
            height={isGuardBar ? BARCODE_HEIGHT + 18 : BARCODE_HEIGHT}
            fill="#111"
          />
        );
      }
    }
    return bars;
  };

  // Render de texto: dígito 1 a la izq fuera; 6 centro-izq; 6 centro-der
  const renderCodeText = () => {
    const positions = [];
    // Primero a la izquierda fuera de barras
    positions.push({
      val: ean13[0],
      x: quietZone - moduleWidth * 2,
      anchor: "middle"
    });
    // 6 bajo barras izquierda
    for (let i = 1; i <= 6; i++) {
      positions.push({
        val: ean13[i],
        x: quietZone + (3 + (i-1)*7)*moduleWidth + (moduleWidth * 3.5),
        anchor: "middle"
      });
    }
    // 6 bajo barras derecha
    for (let i = 7; i <= 12; i++) {
      positions.push({
        val: ean13[i],
        x: quietZone + (50 + (i-7)*7)*moduleWidth + (moduleWidth * 3.5),
        anchor: "middle"
      });
    }
    return positions.map((d, ix) => (
      <text
        key={ix}
        x={d.x}
        y={config.height - 8}
        fontFamily="'Courier New', monospace"
        fontSize={config.codeFont}
        fill="#222"
        fontWeight={ix === 0 ? "bold" : "normal"}
        textAnchor={d.anchor}
        alignmentBaseline="middle"
      >
        {d.val}
      </text>
    ));
  };

  return (
    <div className={`flex flex-col items-center bg-white p-2 rounded border ${className}`} style={{maxWidth: config.width}}>
      <div className="mb-1">
        <Barcode className={`${config.iconSize} text-gray-400`} />
      </div>
      <div className="bg-white border rounded shadow-sm px-2 py-2">
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="block"
        >
          {/* Quiet zone + barras */}
          <rect width={config.width} height={config.height} fill="#fff"/>
          {renderBars()}
          {renderCodeText()}
        </svg>
      </div>
      <div
        className="font-mono font-bold text-black mt-1 tracking-wider"
        style={{ fontSize: config.fontSize }}
      >
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
