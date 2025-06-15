
import React from "react";
import { Barcode } from "lucide-react";

/**
 * Representa visualmente un código de barras EAN-13 con diseño nítido y profesional
 */
interface BarcodeDisplayProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ 
  value, 
  label, 
  className = "",
  size = 'medium'
}) => {
  // Configuraciones de tamaño
  const sizeConfig = {
    small: { width: 120, height: 40, fontSize: '10px', iconSize: 'h-4 w-4' },
    medium: { width: 200, height: 60, fontSize: '12px', iconSize: 'h-6 w-6' },
    large: { width: 280, height: 80, fontSize: '14px', iconSize: 'h-8 w-8' }
  };

  const config = sizeConfig[size];

  // Generar patrón de barras EAN-13 simulado más realista
  const generateBarcodePattern = (code: string) => {
    const bars = [];
    const barWidth = config.width / 95; // 95 es el número estándar de módulos en EAN-13
    
    // Patrón de inicio (3 barras)
    bars.push(<rect key="start1" x={0} y={8} width={barWidth} height={config.height - 24} fill="#000"/>);
    bars.push(<rect key="start2" x={barWidth * 2} y={8} width={barWidth} height={config.height - 24} fill="#000"/>);
    bars.push(<rect key="start3" x={barWidth * 4} y={8} width={barWidth} height={config.height - 24} fill="#000"/>);

    // Generar barras basadas en los dígitos del código
    for (let i = 0; i < code.length && i < 13; i++) {
      const digit = parseInt(code[i]) || 0;
      const x = barWidth * (6 + i * 6);
      
      // Patrón alternado basado en el dígito
      for (let j = 0; j < 4; j++) {
        if ((digit + j) % 2 === 0) {
          bars.push(
            <rect 
              key={`digit-${i}-${j}`} 
              x={x + j * barWidth} 
              y={8} 
              width={barWidth} 
              height={config.height - 24} 
              fill="#000"
            />
          );
        }
      }
    }

    // Patrón central (5 barras)
    const centerX = config.width / 2 - barWidth * 2.5;
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        bars.push(
          <rect 
            key={`center-${i}`} 
            x={centerX + i * barWidth} 
            y={8} 
            width={barWidth} 
            height={config.height - 24} 
            fill="#000"
          />
        );
      }
    }

    // Patrón de fin (3 barras)
    const endX = config.width - barWidth * 3;
    bars.push(<rect key="end1" x={endX} y={8} width={barWidth} height={config.height - 24} fill="#000"/>);
    bars.push(<rect key="end2" x={endX + barWidth * 2} y={8} width={barWidth} height={config.height - 24} fill="#000"/>);

    return bars;
  };

  return (
    <div className={`flex flex-col items-center bg-white p-2 rounded border ${className}`}>
      <div className="mb-2">
        <Barcode className={`${config.iconSize} text-gray-400`} />
      </div>
      
      {/* Código de barras SVG mejorado */}
      <div className="bg-white border rounded p-2 shadow-sm">
        <svg 
          width={config.width} 
          height={config.height} 
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="block"
        >
          {/* Fondo blanco */}
          <rect width={config.width} height={config.height} fill="white"/>
          
          {/* Patrón de barras */}
          {generateBarcodePattern(value)}
        </svg>
      </div>

      {/* Texto del código */}
      <div 
        className="font-mono font-bold text-black mt-2 tracking-wider"
        style={{ fontSize: config.fontSize }}
      >
        {label || value}
      </div>
      
      {/* Indicador EAN-13 */}
      {value.length === 13 && (
        <div className="text-xs text-green-600 font-medium mt-1">
          EAN-13
        </div>
      )}
    </div>
  );
};

export default BarcodeDisplay;
