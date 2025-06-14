
import { useEffect, useState } from "react";

let externalSetConnected: ((val: boolean) => void) | null = null;

/**
 * Hook para simular y representar el estado de conexión de un lector de barcode.
 * Ahora puede sincronizarse con el "manager" para ser controlado globalmente.
 */
export function useBarcodeConnectionStatus() {
  // Puede ser controlado desde el manager o automáticamente.
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    externalSetConnected = setConnected;

    // Simulación (si no se controla desde fuera)
    setConnected(true);
    const interval = setInterval(() => {
      setConnected((prev) => Math.random() > 0.2);
    }, 30000);

    return () => {
      clearInterval(interval);
      externalSetConnected = null;
    };
  }, []);

  return {
    connected,
    deviceName: 'Bartech 5130-BLE',
    // Internamente se puede usar setConnected para "forzar" el estado desde afuera
    setConnected: (val: boolean) => {
      setConnected(val);
      if (externalSetConnected) externalSetConnected(val);
    }
  };
}

/**
 * Permite sincronizar el estado de conexión global, desde Configuración,
 * y que otros módulos visualicen el mismo estado.
 */
export function setGlobalBarcodeConnection(val: boolean) {
  if (externalSetConnected) externalSetConnected(val);
}
