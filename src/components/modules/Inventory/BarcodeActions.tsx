
import React from "react";
import { Printer, ScanBarcode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRegenerateSKU } from "@/hooks/useInventoryData";
import { toast } from "@/hooks/use-toast";
import BarcodeDisplay from "@/components/ui/BarcodeDisplay";

interface BarcodeActionsProps {
  value: string;
  productId?: number;
  onSkuRegenerated?: () => void;
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

// Función para calcular dígito de verificación EAN-13
const calculateCheckDigit = (code: string) => {
  const digits = code.slice(0, 12).split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
};

// Generar código EAN-13 válido
const generateValidEAN13 = (input: string) => {
  // Limpiar entrada - solo números
  let cleaned = input.replace(/\D/g, '');
  
  if (cleaned.length >= 13) {
    // Ya tiene 13 dígitos, verificar si es válido
    const provided = cleaned.slice(0, 13);
    const calculated = calculateCheckDigit(provided);
    const lastDigit = parseInt(provided[12]);
    
    if (calculated === lastDigit) {
      return provided; // EAN-13 válido
    }
  }
  
  // Generar EAN-13 válido
  const base12 = cleaned.padStart(12, '0').slice(0, 12);
  const checkDigit = calculateCheckDigit(base12);
  return base12 + checkDigit;
};

// Generar patrón binario EAN-13
const generateEAN13Pattern = (ean13: string) => {
  const digits = ean13.split('').map(Number);
  const firstDigit = digits[0];
  const leftGroup = digits.slice(1, 7);
  const rightGroup = digits.slice(7, 13);
  const patternSequence = FIRST_DIGIT_PATTERNS[firstDigit];
  
  let pattern = '101'; // Start guard
  
  // Left group
  for (let i = 0; i < 6; i++) {
    if (patternSequence[i] === 'L') {
      pattern += L_PATTERNS[leftGroup[i]];
    } else {
      pattern += G_PATTERNS[leftGroup[i]];
    }
  }
  
  pattern += '01010'; // Center guard
  
  // Right group
  for (let i = 0; i < 6; i++) {
    pattern += R_PATTERNS[rightGroup[i]];
  }
  
  pattern += '101'; // End guard
  
  return pattern;
};

// Generar imagen de alta calidad para descarga
const generateHighQualityCanvas = (barcode: string, width: number = 800, height: number = 300) => {
  const ean13 = generateValidEAN13(barcode);
  const pattern = generateEAN13Pattern(ean13);
  
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Fondo blanco puro
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Configuración de calidad máxima
  ctx.imageSmoothingEnabled = false;
  
  // Quiet zones: mínimo 11 módulos a cada lado según estándar
  const minQuietZone = 11;
  const moduleWidth = Math.floor((width - (2 * minQuietZone * 3)) / pattern.length);
  const actualModuleWidth = Math.max(moduleWidth, 2); // Mínimo 2px por módulo
  
  const barcodeWidth = pattern.length * actualModuleWidth;
  const quietZoneWidth = Math.max((width - barcodeWidth) / 2, minQuietZone * actualModuleWidth);
  
  // Área para barras (85% de la altura)
  const barAreaHeight = Math.floor(height * 0.75);
  const barStartY = Math.floor(height * 0.08);
  const textAreaY = barStartY + barAreaHeight + 20;
  
  // Dibujar barras con precisión
  ctx.fillStyle = "#000000";
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      const x = Math.floor(quietZoneWidth + (i * actualModuleWidth));
      
      // Guard bars más altos
      const isGuardBar = (
        i < 3 || 
        (i >= 45 && i < 50) || 
        i >= pattern.length - 3
      );
      
      const barHeight = isGuardBar ? barAreaHeight + 10 : barAreaHeight;
      const barY = isGuardBar ? barStartY - 5 : barStartY;
      
      ctx.fillRect(x, barY, actualModuleWidth, barHeight);
    }
  }
  
  // Texto del código - centrado y legible
  ctx.fillStyle = "#000000";
  ctx.font = `bold ${Math.floor(height * 0.08)}px 'Courier New', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Dividir el texto en grupos para mejor legibilidad
  const firstDigit = ean13[0];
  const leftPart = ean13.slice(1, 7);
  const rightPart = ean13.slice(7, 13);
  
  const centerX = width / 2;
  ctx.fillText(`${firstDigit} ${leftPart} ${rightPart}`, centerX, textAreaY);
  
  console.log(`🏷️ Código EAN-13 generado: ${ean13} (patrón: ${pattern.length} bits)`);
  
  return canvas;
};

const handleDownload = (barcode: string) => {
  const canvas = generateHighQualityCanvas(barcode, 800, 300);
  const ean13 = generateValidEAN13(barcode);
  
  canvas.toBlob((blob) => {
    if (!blob) {
      toast({
        title: "Error",
        description: "No se pudo generar la imagen",
        variant: "destructive",
      });
      return;
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `EAN13_${ean13}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Código descargado",
      description: `Imagen de alta calidad guardada: EAN13_${ean13}.png`,
    });
  }, 'image/png', 1.0);
};

const handlePrint = (barcode: string) => {
  const canvas = generateHighQualityCanvas(barcode, 600, 250);
  const ean13 = generateValidEAN13(barcode);
  const dataURL = canvas.toDataURL('image/png', 1.0);
  
  const win = window.open("", "_blank", "width=800,height=600");
  if (win) {
    win.document.write(`
      <html>
      <head>
        <title>Código EAN-13: ${ean13}</title>
        <style>
          body { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            min-height: 90vh; 
            margin: 0; 
            font-family: 'Courier New', monospace;
            background: white;
          }
          .barcode-container {
            text-align: center;
            padding: 30px;
            border: 2px solid #333;
            border-radius: 10px;
            background: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .barcode-image {
            margin: 20px 0;
            border: 1px solid #ddd;
            max-width: 100%;
          }
          .code-text { 
            font-size: 24px; 
            font-weight: bold;
            letter-spacing: 3px;
            margin: 15px 0;
            color: #333;
          }
          .ean-label {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          @media print {
            body { margin: 0; }
            .barcode-container { 
              border: 1px solid #000; 
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="barcode-container">
          <div class="ean-label">Código de Barras EAN-13</div>
          <img src="${dataURL}" alt="EAN-13: ${ean13}" class="barcode-image"/>
          <div class="code-text">${ean13}</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  }
};

const BarcodeActions: React.FC<BarcodeActionsProps> = ({ value, productId, onSkuRegenerated }) => {
  const regenerateSKUMutation = useRegenerateSKU();

  const handleRegenerateSKU = async () => {
    if (!productId) return;
    
    try {
      const result = await regenerateSKUMutation.mutateAsync(productId.toString());
      toast({
        title: "SKU EAN-13 Generado",
        description: result.message,
      });
      onSkuRegenerated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo regenerar el SKU",
        variant: "destructive",
      });
    }
  };

  const ean13 = generateValidEAN13(value);
  const isOriginalValid = value.length === 13 && /^\d{13}$/.test(value) && calculateCheckDigit(value) === parseInt(value[12]);
  const isShortSKU = value.length < 13;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Visualización del código */}
      <BarcodeDisplay value={value} size="small" />
      
      {/* Acciones */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleDownload(value)}
          title="Descargar código EAN-13 (alta calidad)"
          className="p-1 hover:bg-blue-50 rounded transition-colors border border-blue-200"
          type="button"
        >
          <ScanBarcode className="w-3 h-3 text-blue-600" />
        </button>
        
        <button
          onClick={() => handlePrint(value)}
          title="Imprimir código EAN-13"
          className="p-1 hover:bg-green-50 rounded transition-colors border border-green-200"
          type="button"
        >
          <Printer className="w-3 h-3 text-green-600" />
        </button>
        
        {productId && isShortSKU && (
          <button
            onClick={handleRegenerateSKU}
            title="Generar código EAN-13 estándar"
            className="p-1 hover:bg-orange-50 rounded transition-colors border border-orange-200"
            type="button"
            disabled={regenerateSKUMutation.isPending}
          >
            <RefreshCw className={`w-3 h-3 text-orange-600 ${regenerateSKUMutation.isPending ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      
      {/* Indicador de validez más preciso */}
      <div className="text-xs text-center">
        {isOriginalValid ? (
          <span className="text-green-600 font-medium">✓ EAN-13 Válido</span>
        ) : (
          <span className="text-blue-600 font-medium">→ {ean13}</span>
        )}
      </div>
    </div>
  );
};

export default BarcodeActions;
