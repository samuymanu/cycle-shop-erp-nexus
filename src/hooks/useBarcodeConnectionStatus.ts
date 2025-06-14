
import { useEffect, useState } from "react";

/**
 * Hook para simular y representar el estado de conexión de un lector de barcode.
 * Si se quiere integrar realmente con WebBluetooth, habría que desarrollarlo con la API real.
 */
export function useBarcodeConnectionStatus() {
  // Por ahora, simulamos el estado (podría ser real usando WebBluetooth/USB)
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Simulación: inicia "conectado" y alterna a "desconectado" aleatoriamente
    setConnected(true);
    const interval = setInterval(() => {
      // Simulación: alterna cada 30 segundos (ajustable/futuro: usar lógica real)
      setConnected((prev) => Math.random() > 0.2); // 80% chance de "conectado"
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    connected,
    deviceName: 'Bartech 5130-BLE'
  };
}
