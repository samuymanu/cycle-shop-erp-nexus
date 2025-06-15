
import { useEffect } from "react";

/**
 * Hook optimizado para capturar entradas de lectores de códigos de barras.
 * Mejorado para manejar códigos EAN-13 y otros formatos estándar.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  useEffect(() => {
    let buffer = "";
    let lastTime = Date.now();

    const onKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // Reset del buffer si pasa mucho tiempo entre teclas (200ms para scanners rápidos)
      if (now - lastTime > 200) {
        buffer = "";
      }

      lastTime = now;

      if (!e.key) return;

      // Capturar números, letras y algunos caracteres especiales comunes en códigos
      if (e.key.length === 1 && /[a-zA-Z0-9\-_.]/.test(e.key)) {
        buffer += e.key;
        console.log(`📱 Escáner: Buffer: "${buffer}" (${buffer.length} chars)`);
      } else if (e.key === "Enter") {
        // Validar longitud mínima para evitar falsos positivos
        if (buffer && buffer.length >= 4) {
          console.log(`📱 ✅ Código detectado: "${buffer}" (${buffer.length} chars)`);
          onScan(buffer.trim());
        } else {
          console.log(`📱 ❌ Código muy corto descartado: "${buffer}" (${buffer.length} chars)`);
        }
        buffer = "";
      } else if (e.key === "Escape" || e.key === "Tab") {
        // Limpiar buffer en escape o tab
        console.log(`📱 🔄 Buffer limpiado por ${e.key}`);
        buffer = "";
      }
    };

    console.log("📱 ✅ Escáner de códigos activado - Optimizado para EAN-13");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      console.log("📱 ❌ Escáner de códigos desactivado");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onScan]);
}
