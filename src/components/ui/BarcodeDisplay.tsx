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

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  label,
  className = "",
  size = "medium"
}) => {
  // Configuración según tamaño
  const sizeConfig = {
    small:   { width: 180, height: 80, fontSize: '10px', iconSize: 'h-4 w-4', codeFont: '13px', labelFont: '8px' },
    medium:  { width: 260, height: 128, fontSize: '14px', iconSize: 'h-6 w-6', codeFont: '18px', labelFont: '11px' },
    large:   { width: 340, height: 170, fontSize: '18px', iconSize: 'h-8 w-8', codeFont: '23px', labelFont: '15px' },
  };
  const config = sizeConfig[size];
  const QUIET_ZONE_MODULES = 13; // Más seguridad visual
  const TOP_MARGIN = 8;
  const TEXT_GAP = 30; // suficiente separación texto/código
  const BAR_HEIGHT = config.height - TOP_MARGIN - TEXT_GAP;

  // Generar patrón binario EAN-13 y corregir el valor/texto mostrado
  const generateEAN13Pattern = (code: string) => {
    let ean13 = code.padStart(13, '0').slice(0, 13);

    if (!/^\d{13}$/.test(ean13)) {
      // Corregir a solo dígitos + dígito control
      const numericCode = code.replace(/\D/g, '').padStart(12, '0').slice(0,12);
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

  // Determinar ancho de módulo
  const moduleWidth = Math.floor((config.width - 2 * QUIET_ZONE_MODULES) / pattern.length);
  const barcodeWidth = moduleWidth * pattern.length;
  const quietZone = (config.width - barcodeWidth) / 2;

  // Mejor trazo: barras más anchas y sin esquinas redondeadas, mayor altura en guardas.
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
            width={moduleWidth + 0.3}
            height={isGuardBar ? BAR_HEIGHT + 15 : BAR_HEIGHT}
            fill="#111"
          />
        );
      }
    }
    return bars;
  };

  // Texto separado: primer dígito bien a la izquierda, 6/6 dígitos exactamente bajo cada bloque
  const renderCodeText = () => {
    // Posiciones aproximadamente: 
    // Primer dígito (izquierda fuera de barras)
    // 6 siguientes bajo barras izquierda
    // 6 últimos bajo barras derecha
    const digitPos = [];
    // Primer dígito
    digitPos.push({
      digit: ean13[0],
      x: quietZone - moduleWidth * 2.2,
      anchor: 'middle'
    });
    // Siguientes 6, bajo la parte izquierda de las barras
    for (let i = 1; i <= 6; i++) {
      digitPos.push({
        digit: ean13[i],
        x: quietZone + (3 + (i-1)*7) * moduleWidth + moduleWidth * 3.5,
        anchor: 'middle'
      });
    }
    // Últimos 6, bajo la parte derecha de las barras
    for (let i = 7; i <= 12; i++) {
      digitPos.push({
        digit: ean13[i],
        x: quietZone + (50 + (i-7)*7) * moduleWidth + moduleWidth * 3.5,
        anchor: 'middle'
      });
    }
    return digitPos.map((d, ix) => (
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
        letterSpacing={0}
      >
        {d.digit}
      </text>
    ));
  };

  return (
    <div className={`flex flex-col items-center bg-white p-2 rounded border ${className}`} style={{maxWidth: config.width}}>
      <div className="mb-1">
        <Barcode className={`${config.iconSize} text-gray-400`} />
      </div>
      {/* SVG: más silencioso (zona blanca), barras más gruesas, texto bien separado */}
      <div className="bg-white border rounded shadow-sm px-2 py-2">
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="block"
        >
          {/* Fondo blanco y zona tranquila explícita */}
          <rect width={config.width} height={config.height} fill="#fff"/>
          {/* Barras */}
          {renderBars()}
          {/* Texto tipo EAN, bajo la zona de barras, bien centrado */}
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
