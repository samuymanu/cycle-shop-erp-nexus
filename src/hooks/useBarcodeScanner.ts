
import { useEffect } from "react";

/**
 * Hook para capturar entradas rápidas de un lector de código de barras.
 * Llama a `onScan` con el código escaneado.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  useEffect(() => {
    let buffer = "";
    let lastTime = Date.now();

    const onKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      // Si pasa más de 150ms, se resetea el buffer (tiempo más flexible)
      if (now - lastTime > 150) buffer = "";

      lastTime = now;

      // Solo números/alfanuméricos y enter - más permisivo
      if (
        e.key.length === 1 &&
        (/[a-zA-Z0-9\-_.]/.test(e.key))
      ) {
        buffer += e.key;
        console.log(`📱 Escáner: Buffer actual: "${buffer}"`);
      } else if (e.key === "Enter") {
        if (buffer.length >= 2) { // Reducido de 4 a 2 para ser más flexible
          console.log(`📱 Escáner: Código detectado: "${buffer}"`);
          onScan(buffer);
        } else {
          console.log(`📱 Escáner: Código muy corto (${buffer.length} chars): "${buffer}"`);
        }
        buffer = "";
      }
    };

    console.log("📱 Escáner de códigos activado");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      console.log("📱 Escáner de códigos desactivado");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onScan]);
}
