
import React from "react";
import { ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerStatusProps {
  connected: boolean;
  deviceName: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  loading?: boolean;
}

const BarcodeScannerStatus: React.FC<BarcodeScannerStatusProps> = ({
  connected,
  deviceName,
  onConnect,
  onDisconnect,
  loading = false,
}) => {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <ScanBarcode className={`w-6 h-6 ${connected ? "text-green-600" : "text-red-500"}`} />
        <span className={`font-bold ${connected ? "text-green-700" : "text-red-700"}`}>
          {deviceName}: {connected ? "Conectado" : "Desconectado"}
        </span>
      </div>
      {onConnect && !connected && (
        <Button
          onClick={onConnect}
          disabled={loading}
          size="sm"
          variant="outline"
          className="ml-2"
        >
          {loading ? "Conectando..." : "Conectar"}
        </Button>
      )}
      {onDisconnect && connected && (
        <Button
          onClick={onDisconnect}
          disabled={loading}
          size="sm"
          variant="outline"
          className="ml-2"
        >
          {loading ? "Desconectando..." : "Desconectar"}
        </Button>
      )}
    </div>
  );
};

export default BarcodeScannerStatus;
