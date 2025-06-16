import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import UserManagementDialog from '@/components/dialogs/UserManagementDialog';
import { toast } from '@/hooks/use-toast';
import { 
  Database, 
  Users, 
  Shield, 
  Server, 
  Save, 
  TestTube,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon,
  DollarSign
} from 'lucide-react';
import BarcodeScannerStatus from './BarcodeScannerStatus';
import { useBarcodeConnectionManager } from '@/hooks/useBarcodeConnectionManager';
import { setGlobalBarcodeConnection } from '@/hooks/useBarcodeConnectionStatus';

const Settings = () => {
  const { user, hasPermission } = useAuth();
  const barcodeManager = useBarcodeConnectionManager(true); // inicia conectado por defecto
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '5432',
    database: 'bicicentro_erp',
    username: 'postgres',
    password: '',
  });
  
  const [exchangeRates, setExchangeRates] = useState({
    parallelRate: 35.50,
    bcvRate: 36.20,
    lastUpdated: new Date(),
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    notifications: true,
    multiUser: false,
    debugMode: false,
  });
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    console.log('Probando conexión a base de datos...', dbConfig);
    
    // Simular prueba de conexión
    setTimeout(() => {
      // Aquí iría la lógica real de conexión
      setConnectionStatus('success');
      setTimeout(() => setConnectionStatus('idle'), 3000);
    }, 2000);
  };

  const handleSaveDbConfig = () => {
    console.log('Guardando configuración de base de datos...', dbConfig);
    // Implementar lógica de guardado
  };

  const handleSaveSystemSettings = () => {
    console.log('Guardando configuración del sistema...', systemSettings);
    // Implementar lógica de guardado
  };

  const handleUpdateExchangeRates = () => {
    console.log('Actualizando tasas de cambio...', exchangeRates);
    setExchangeRates({
      ...exchangeRates,
      lastUpdated: new Date(),
    });
    // Implementar lógica de guardado
  };

  const handleExportData = () => {
    console.log('Exportando datos del sistema...');
    // Implementar exportación de datos
  };

  const handleImportData = () => {
    console.log('Importando datos al sistema...');
    // Implementar importación de datos
  };

  const handleConfigureRoles = () => {
    console.log('Configurando roles...');
    toast({
      title: 'Función no implementada',
      description: 'La configuración de roles estará disponible próximamente.',
    });
  };

  const handleConfigurePermissions = () => {
    console.log('Configurando permisos...');
    toast({
      title: 'Función no implementada',
      description: 'La configuración de permisos estará disponible próximamente.',
    });
  };

  const handleCreateBackup = () => {
    console.log('Creando respaldo...');
    toast({
      title: 'Creando Respaldo',
      description: 'Se ha iniciado la creación de un respaldo manual.',
    });
  };

  const handleRestoreSystem = () => {
    console.log('Restaurando sistema...');
    toast({
      title: 'Función no implementada',
      description: 'La restauración del sistema estará disponible próximamente.',
    });
  };

  const handleBarcodeConnect = async () => {
    setBarcodeLoading(true);
    setTimeout(() => {
      barcodeManager.connect();
      setGlobalBarcodeConnection(true);
      setBarcodeLoading(false);
    }, 1000);
  };

  const handleBarcodeDisconnect = async () => {
    setBarcodeLoading(true);
    setTimeout(() => {
      barcodeManager.disconnect();
      setGlobalBarcodeConnection(false);
      setBarcodeLoading(false);
    }, 1000);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
              <p className="text-gray-600">Administra la configuración del sistema</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Gestión de Lector de Código de Barras */}
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <span className="text-primary">Lector de Códigos de Barras</span>
          </h2>
          <div className="max-w-xl">
            <BarcodeScannerStatus
              connected={barcodeManager.connected}
              deviceName={barcodeManager.deviceName}
              onConnect={handleBarcodeConnect}
              onDisconnect={handleBarcodeDisconnect}
              loading={barcodeLoading}
            />
            <div className="text-xs text-gray-600 mt-2 ml-1">
              Gestiona el estado de conexión del lector Bartech 5130-BLE desde aquí. <br />
              Esto es una simulación visual, para conectar un lector BLE real, consulta la documentación de WebBluetooth.
            </div>
          </div>
        </div>

        {/* Exchange Rates Configuration */}
        <Card className="bikeERP-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Tasas de Cambio del Bolívar
            </CardTitle>
            <CardDescription>
              Configura las tasas de cambio USD/Bs (Paralelo y BCV)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parallelRate">Tasa Paralelo (USD/Bs)</Label>
                <Input
                  id="parallelRate"
                  type="number"
                  step="0.01"
                  value={exchangeRates.parallelRate}
                  onChange={(e) => setExchangeRates({
                    ...exchangeRates, 
                    parallelRate: parseFloat(e.target.value) || 0
                  })}
                  placeholder="35.50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bcvRate">Tasa BCV (USD/Bs)</Label>
                <Input
                  id="bcvRate"
                  type="number"
                  step="0.01"
                  value={exchangeRates.bcvRate}
                  onChange={(e) => setExchangeRates({
                    ...exchangeRates, 
                    bcvRate: parseFloat(e.target.value) || 0
                  })}
                  placeholder="36.20"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">
                  Última actualización: {formatDate(exchangeRates.lastUpdated)}
                </p>
              </div>
              <Button onClick={handleUpdateExchangeRates} className="bikeERP-button-primary">
                <Save className="h-4 w-4 mr-2" />
                Actualizar Tasas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Configuration */}
        {hasPermission('settings', 'update') && (
          <Card className="bikeERP-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Configuración de Base de Datos
              </CardTitle>
              <CardDescription>
                Configura la conexión a la base de datos principal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Servidor</Label>
                  <Input
                    id="host"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                    placeholder="localhost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Puerto</Label>
                  <Input
                    id="port"
                    value={dbConfig.port}
                    onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                    placeholder="5432"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Base de Datos</Label>
                  <Input
                    id="database"
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                    placeholder="bicicentro_erp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    value={dbConfig.username}
                    onChange={(e) => setDbConfig({...dbConfig, username: e.target.value})}
                    placeholder="postgres"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                    placeholder="Contraseña de la base de datos"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleTestConnection}
                  variant="outline"
                  disabled={connectionStatus === 'testing'}
                  className="gap-2"
                >
                  {connectionStatus === 'testing' ? (
                    <>
                      <TestTube className="h-4 w-4 animate-spin" />
                      Probando...
                    </>
                  ) : connectionStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Conexión Exitosa
                    </>
                  ) : connectionStatus === 'error' ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Error de Conexión
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4" />
                      Probar Conexión
                    </>
                  )}
                </Button>
                
                <Button onClick={handleSaveDbConfig} className="gap-2 bikeERP-button-primary">
                  <Save className="h-4 w-4" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bikeERP-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Configuración del Sistema
              </CardTitle>
              <CardDescription>
                Ajustes generales del sistema ERP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Respaldo Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Crear respaldos automáticos diariamente
                  </p>
                </div>
                <Switch
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => 
                    setSystemSettings({...systemSettings, autoBackup: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones del sistema
                  </p>
                </div>
                <Switch
                  checked={systemSettings.notifications}
                  onCheckedChange={(checked) => 
                    setSystemSettings({...systemSettings, notifications: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Modo Multiusuario</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir múltiples sesiones simultáneas
                  </p>
                </div>
                <Switch
                  checked={systemSettings.multiUser}
                  onCheckedChange={(checked) => 
                    setSystemSettings({...systemSettings, multiUser: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Modo Debug</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar logs detallados del sistema
                  </p>
                </div>
                <Switch
                  checked={systemSettings.debugMode}
                  onCheckedChange={(checked) => 
                    setSystemSettings({...systemSettings, debugMode: checked})
                  }
                />
              </div>

              <Button onClick={handleSaveSystemSettings} className="w-full gap-2 bikeERP-button-primary">
                <Save className="h-4 w-4" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>

          {/* User Management */}
          {hasPermission('users', 'read') && (
            <Card className="bikeERP-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription>
                  Administra usuarios y permisos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Usuario Actual</span>
                  </div>
                  <p className="text-sm text-blue-800">{user?.name}</p>
                  <p className="text-xs text-blue-600">{user?.role.displayName}</p>
                </div>

                <UserManagementDialog />
                <Button variant="outline" className="w-full" onClick={handleConfigureRoles}>
                  Configurar Roles
                </Button>
                <Button variant="outline" className="w-full" onClick={handleConfigurePermissions}>
                  Permisos del Sistema
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Data Management */}
        <Card className="bikeERP-card">
          <CardHeader>
            <CardTitle>Gestión de Datos</CardTitle>
            <CardDescription>
              Importar, exportar y respaldar información del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button onClick={handleExportData} variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                Exportar Datos
              </Button>
              <Button onClick={handleImportData} variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                Importar Datos
              </Button>
              <Button onClick={handleCreateBackup} variant="outline" className="gap-2">
                <Save className="h-4 w-4" />
                Crear Respaldo
              </Button>
              <Button onClick={handleRestoreSystem} variant="outline" className="gap-2">
                <Server className="h-4 w-4" />
                Restaurar Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
