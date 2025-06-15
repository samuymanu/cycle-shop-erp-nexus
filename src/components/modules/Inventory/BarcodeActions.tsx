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

// Mismos patrones EAN-13 que en BarcodeDisplay
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

const generateEAN13BinaryPattern = (code: string) => {
  // Convertir a EAN-13 válido
  let ean13 = code.padStart(13, '0').substring(0, 13);
  
  if (!/^\d{13}$/.test(ean13)) {
    const numericCode = code.replace(/\D/g, '').padStart(12, '0').substring(0, 12);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(numericCode[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    ean13 = numericCode + checkDigit;
  }

  const digits = ean13.split('').map(d => parseInt(d));
  const firstDigit = digits[0];
  const leftGroup = digits.slice(1, 7);
  const rightGroup = digits.slice(7, 13);
  const pattern = FIRST_DIGIT_PATTERNS[firstDigit];
  
  let binaryString = '101'; // Inicio
  
  // Grupo izquierdo
  for (let i = 0; i < 6; i++) {
    const digit = leftGroup[i];
    binaryString += pattern[i] === 'L' ? L_PATTERNS[digit] : G_PATTERNS[digit];
  }
  
  binaryString += '01010'; // Centro
  
  // Grupo derecho
  for (let i = 0; i < 6; i++) {
    binaryString += R_PATTERNS[rightGroup[i]];
  }
  
  binaryString += '101'; // Fin
  
  return { pattern: binaryString, ean13 };
};

const generateBarcodeCanvas = (barcode: string, width: number = 400, height: number = 120) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Fondo blanco puro
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  const { pattern, ean13 } = generateEAN13BinaryPattern(barcode);

  // Ajustes: más ancho de módulo, barra alta, NO etiquetas EAN-13
  const moduleWidth = Math.floor((width - 32) / pattern.length); // 16px de zona tranquila
  const barcodeWidth = moduleWidth * pattern.length;
  const quietZone = (width - barcodeWidth) / 2;
  const barHeight = height - 38;
  const startY = 8;

  ctx.fillStyle = "#222";

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      let isGuardBar = (
        i < 3 ||
        (i >= 45 && i < 50) ||
        i >= (pattern.length - 3)
      );
      const x = Math.round(quietZone + i * moduleWidth);
      ctx.fillRect(
        x,
        startY,
        moduleWidth + 0.3, // evita defectos del escáner
        isGuardBar ? barHeight + 11 : barHeight
      );
    }
  }

  // Texto del código debajo, claro, sin la etiqueta 'EAN-13'
  ctx.fillStyle = "#000000";
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(ean13, width / 2, height - 11);

  return canvas;
};

const handleDownload = (barcode: string) => {
  const canvas = generateBarcodeCanvas(barcode, 400, 120);
  
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${barcode}_EAN13.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Código descargado",
      description: `Código de barras EAN-13 guardado como ${barcode}_EAN13.png`,
    });
  }, 'image/png', 1.0);
};

const handlePrint = (barcode: string) => {
  const canvas = generateBarcodeCanvas(barcode, 600, 180);
  const dataURL = canvas.toDataURL('image/png', 1.0);
  
  const win = window.open("", "_blank", "width=800,height=400");
  if (win) {
    win.document.write(`
      <html>
      <head>
        <title>Código de Barras EAN-13 - ${barcode}</title>
        <style>
          body { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            height: 95vh; 
            margin: 0; 
            font-family: 'Courier New', monospace;
            background: white;
          }
          .barcode-container {
            text-align: center;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
            background: white;
          }
          .barcode-image {
            margin: 10px 0;
            border: 1px solid #eee;
          }
          .code-text { 
            font-size: 18px; 
            font-weight: bold;
            letter-spacing: 2px;
            margin: 10px 0;
          }
          .ean-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="barcode-container">
          <div class="ean-label">Código de Barras EAN-13</div>
          <img src="${dataURL}" alt="Código de barras ${barcode}" class="barcode-image"/>
          <div class="code-text">${barcode}</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 1000);
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
      const result = await regenerateSKUMutation.mutateAsync(productId);
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

  const isValidEAN13 = value.length === 13 && /^\d{13}$/.test(value);
  const isShortSKU = value.length < 13;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Visualización del código */}
      <BarcodeDisplay value={value} size="small" />
      
      {/* Acciones */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleDownload(value)}
          title="Descargar código EAN-13"
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
      
      {/* Indicador de validez más pequeño */}
      <div className="text-xs text-center">
        {isValidEAN13 ? (
          <span className="text-green-600 font-medium">✓ EAN-13</span>
        ) : (
          <span className="text-orange-600 font-medium">⚠ No estándar</span>
        )}
      </div>
    </div>
  );
};

export default BarcodeActions;
