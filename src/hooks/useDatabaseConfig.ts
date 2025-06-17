
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface DatabaseConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  maxConnections?: number;
  timeout?: number;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
  serverInfo?: string;
}

const DEFAULT_CONFIG: DatabaseConfig = {
  host: 'localhost',
  port: '5432',
  database: 'bicicentro_erp',
  username: 'postgres',
  password: '',
  maxConnections: 20,
  timeout: 10000,
};

export function useDatabaseConfig() {
  const [config, setConfig] = useState<DatabaseConfig>(() => {
    try {
      const stored = localStorage.getItem('databaseConfig');
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading database config:', error);
    }
    return DEFAULT_CONFIG;
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<ConnectionTestResult | null>(null);

  const updateConfig = (updates: Partial<DatabaseConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    
    try {
      localStorage.setItem('databaseConfig', JSON.stringify(newConfig));
    } catch (error) {
      console.error('Error saving database config:', error);
    }
  };

  const testConnection = async (): Promise<ConnectionTestResult> => {
    setIsConnecting(true);
    const startTime = Date.now();

    try {
      console.log('🔧 Probando conexión a la base de datos...', {
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.username,
      });

      // En un entorno real, esto haría una petición al backend para probar la conexión
      // Por ahora simulamos la prueba de conexión
      const testUrl = `http://${config.host}:4000/api/test-connection`;
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: config.host,
          port: config.port,
          database: config.database,
          username: config.username,
          password: config.password,
        }),
        signal: AbortSignal.timeout(config.timeout || 10000),
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        const testResult: ConnectionTestResult = {
          success: true,
          message: `Conexión exitosa en ${latency}ms`,
          latency,
          serverInfo: result.serverInfo || 'PostgreSQL Server',
        };
        
        setLastTestResult(testResult);
        toast({
          title: "Conexión Exitosa",
          description: testResult.message,
        });
        
        return testResult;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error('❌ Error de conexión:', error);
      
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Tiempo de conexión agotado';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'No se puede conectar al servidor';
        } else {
          errorMessage = error.message;
        }
      }

      const testResult: ConnectionTestResult = {
        success: false,
        message: errorMessage,
        latency: Date.now() - startTime,
      };
      
      setLastTestResult(testResult);
      toast({
        title: "Error de Conexión",
        description: errorMessage,
        variant: "destructive",
      });
      
      return testResult;
    } finally {
      setIsConnecting(false);
    }
  };

  const saveConfig = () => {
    try {
      localStorage.setItem('databaseConfig', JSON.stringify(config));
      
      // En producción, también debería enviar la configuración al backend
      console.log('💾 Configuración de base de datos guardada:', config);
      
      toast({
        title: "Configuración Guardada",
        description: "La configuración de base de datos se ha guardado correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving database config:', error);
      toast({
        title: "Error al Guardar",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    setLastTestResult(null);
    localStorage.removeItem('databaseConfig');
    
    toast({
      title: "Configuración Restablecida",
      description: "Se han restaurado los valores por defecto",
    });
  };

  return {
    config,
    updateConfig,
    testConnection,
    saveConfig,
    resetToDefaults,
    isConnecting,
    lastTestResult,
  };
}
