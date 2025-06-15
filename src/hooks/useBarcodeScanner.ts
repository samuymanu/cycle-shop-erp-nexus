
import { useEffect } from "react";

/**
 * Hook para capturar entradas rápidas de un lector de código de barras.
 * Optimizado para códigos EAN-13 y otros formatos estándar.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  useEffect(() => {
    let buffer = "";
    let lastTime = Date.now();

    const onKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // Si pasa más de 200ms, se resetea el buffer (ajustado para códigos más largos)
      if (now - lastTime > 200) buffer = "";

      lastTime = now;

      // Verificar que e.key existe y no es undefined
      if (!e.key) return;

      // Permitir números, letras y algunos caracteres especiales comunes en códigos de barras
      if (
        e.key.length === 1 &&
        (/[a-zA-Z0-9\-_.]/.test(e.key))
      ) {
        buffer += e.key;
        console.log(`📱 Escáner: Buffer actual: "${buffer}"`);
      } else if (e.key === "Enter") {
        // Para códigos EAN-13 esperamos al menos 4 caracteres
        if (buffer && buffer.length >= 4) {
          console.log(`📱 Escáner: Código detectado: "${buffer}" (longitud: ${buffer.length})`);
          onScan(buffer);
        } else {
          console.log(`📱 Escáner: Código muy corto o vacío (${buffer ? buffer.length : 0} chars): "${buffer}"`);
        }
        buffer = "";
      }
    };

    console.log("📱 Escáner de códigos activado - Optimizado para EAN-13");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      console.log("📱 Escáner de códigos desactivado");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onScan]);
}
