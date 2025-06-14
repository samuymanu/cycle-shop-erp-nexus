
import { useState, useCallback } from "react";

export function useBarcodeConnectionManager(defaultConnected = false) {
  const [connected, setConnected] = useState(defaultConnected);
  const [deviceName] = useState("Bartech 5130-BLE");

  const connect = useCallback(() => setConnected(true), []);
  const disconnect = useCallback(() => setConnected(false), []);
  const toggle = useCallback(() => setConnected((prev) => !prev), []);

  return {
    connected,
    deviceName,
    connect,
    disconnect,
    toggle,
    setConnected, // para integraciones avanzadas si quieres controlar desde fuera
  };
}
