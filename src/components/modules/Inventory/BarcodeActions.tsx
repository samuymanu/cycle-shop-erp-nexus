
import React from "react";
import { printer, scanBarcode } from "lucide-react";
import BarcodeDisplay from "@/components/ui/BarcodeDisplay";

interface BarcodeActionsProps {
  value: string;
}

const handleDownload = (barcode: string) => {
  // Descarga un PNG con el código
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 80;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Fondo
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 200, 80);
    // "Código" (líneas simuladas)
    ctx.fillStyle = "#bdbdbd";
    for (let i = 0; i < 22; i++) {
      const x = 10 + i * 8;
      ctx.fillRect(x, 20, 4 + (i % 3), 40);
    }
    // Texto valor
    ctx.fillStyle = "#212121";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(barcode, 100, 75);
  }
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${barcode}_barcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

const handlePrint = (barcode: string) => {
  // Abre una ventana con el código grande para imprimir
  const win = window.open("", "_blank", "width=360,height=200");
  if (win) {
    win.document.write(`
      <html>
      <head>
        <title>Imprimir Código de Barras</title>
        <style>
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 95vh; margin: 0; font-family: monospace; }
          .barcode { margin: 20px 0 8px 0;}
          .value { font-size: 16px; letter-spacing: 1px;}
        </style>
      </head>
      <body>
        <svg class="barcode" width="240" height="64">
          ${Array.from({length:22}).map((_,i) => `<rect x="${12 + i*10}" y="16" width="${5 + (i%3)}" height="32" fill="#bdbdbd"/>`).join('')}
        </svg>
        <div class="value">${barcode}</div>
        <script>window.print();setTimeout(()=>window.close(),300);</script>
      </body>
      </html>
    `);
    win.document.close();
  }
};

const BarcodeActions: React.FC<BarcodeActionsProps> = ({ value }) => {
  return (
    <div className="flex items-center gap-2 pt-1">
      <button
        onClick={() => handleDownload(value)}
        title="Descargar código de barra"
        className="p-1 hover:bg-blue-50 rounded transition-colors"
        type="button"
      >
        <scanBarcode className="w-4 h-4 text-blue-600" />
      </button>
      <button
        onClick={() => handlePrint(value)}
        title="Imprimir código de barra"
        className="p-1 hover:bg-green-50 rounded transition-colors"
        type="button"
      >
        <printer className="w-4 h-4 text-green-600" />
      </button>
    </div>
  );
};

export default BarcodeActions;
