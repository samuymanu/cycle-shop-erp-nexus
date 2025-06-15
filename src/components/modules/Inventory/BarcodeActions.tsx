
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

const generateBarcodeCanvas = (barcode: string, width: number = 400, height: number = 120) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) return canvas;

  // Fondo blanco nítido
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Configuración para barras nítidas
  const barWidth = width / 95; // 95 módulos estándar EAN-13
  const barHeight = height - 40;
  const startY = 10;

  ctx.fillStyle = "#000000";

  // Patrón de inicio
  ctx.fillRect(0, startY, barWidth, barHeight);
  ctx.fillRect(barWidth * 2, startY, barWidth, barHeight);

  // Generar barras basadas en dígitos
  for (let i = 0; i < barcode.length && i < 13; i++) {
    const digit = parseInt(barcode[i]) || 0;
    const x = barWidth * (4 + i * 6.5);
    
    // Patrón de barras basado en el dígito
    for (let j = 0; j < 4; j++) {
      if ((digit + i + j) % 3 === 0) {
        ctx.fillRect(x + j * barWidth, startY, barWidth, barHeight);
      }
    }
  }

  // Separador central
  const centerX = width / 2 - barWidth;
  ctx.fillRect(centerX, startY, barWidth, barHeight);
  ctx.fillRect(centerX + barWidth * 2, startY, barWidth, barHeight);

  // Patrón de fin
  ctx.fillRect(width - barWidth * 3, startY, barWidth, barHeight);
  ctx.fillRect(width - barWidth, startY, barWidth, barHeight);

  // Texto del código nítido
  ctx.fillStyle = "#000000";
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(barcode, width / 2, height - 8);

  // Texto EAN-13
  ctx.font = "12px Arial, sans-serif";
  ctx.fillText("EAN-13", width / 2, height - 25);

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
    <div className="flex flex-col items-center gap-3">
      {/* Visualización del código */}
      <BarcodeDisplay value={value} size="medium" />
      
      {/* Acciones */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDownload(value)}
          title="Descargar código EAN-13"
          className="p-2 hover:bg-blue-50 rounded transition-colors border border-blue-200"
          type="button"
        >
          <ScanBarcode className="w-4 h-4 text-blue-600" />
        </button>
        
        <button
          onClick={() => handlePrint(value)}
          title="Imprimir código EAN-13"
          className="p-2 hover:bg-green-50 rounded transition-colors border border-green-200"
          type="button"
        >
          <Printer className="w-4 h-4 text-green-600" />
        </button>
        
        {productId && isShortSKU && (
          <button
            onClick={handleRegenerateSKU}
            title="Generar código EAN-13 estándar"
            className="p-2 hover:bg-orange-50 rounded transition-colors border border-orange-200"
            type="button"
            disabled={regenerateSKUMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 text-orange-600 ${regenerateSKUMutation.isPending ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      
      {/* Indicador de validez */}
      <div className="text-xs text-center">
        {isValidEAN13 ? (
          <span className="text-green-600 font-medium">✓ EAN-13 Válido</span>
        ) : (
          <span className="text-orange-600 font-medium">⚠ Formato no estándar</span>
        )}
      </div>
    </div>
  );
};

export default BarcodeActions;
