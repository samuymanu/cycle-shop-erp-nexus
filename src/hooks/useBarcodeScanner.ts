
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
      // Si pasa más de 100ms, se resetea el buffer (el usuario empezó a escribir manualmente)
      if (now - lastTime > 100) buffer = "";

      lastTime = now;

      // Solo números/alfanuméricos y enter
      if (
        e.key.length === 1 &&
        (/[a-zA-Z0-9\-]/.test(e.key))
      ) {
        buffer += e.key;
      } else if (e.key === "Enter") {
        if (buffer.length >= 4) { // Seguro que es un código, no una tecla Enter suelta
          onScan(buffer);
        }
        buffer = "";
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onScan]);
}
