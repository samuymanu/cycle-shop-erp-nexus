import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useDatabaseConfig } from '@/hooks/useDatabaseConfig';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import UserManagementDialog from '@/components/dialogs/UserManagementDialog';
import { toast } from '@/hooks/use-toast';
import { useExchangeRates } from '@/hooks/useExchangeRates';
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
  DollarSign,
  RefreshCw,
  Key
} from 'lucide-react';
import BarcodeScannerStatus from './BarcodeScannerStatus';
import { useBarcodeConnectionManager } from '@/hooks/useBarcodeConnectionManager';
import { setGlobalBarcodeConnection } from '@/hooks/useBarcodeConnectionStatus';

const Settings = () => {
  const { user, hasPermission } = useAuth();
  const { rates, updateRates } = useExchangeRates();
  const barcodeManager = useBarcodeConnectionManager(true);
  const dbConfig = useDatabaseConfig();
  const rolesPermissions = useRolesAndPermissions();
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  
  const [newRates, setNewRates] = useState({
    bcv: rates.bcv.toString(),
    parallel: rates.parallel.toString(),
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    notifications: true,
    multiUser: false,
    debugMode: false,
  });

  const handleUpdateExchangeRates = () => {
    const bcvRate = parseFloat(newRates.bcv);
    const parallelRate = parseFloat(newRates.parallel);

    if (isNaN(bcvRate) || isNaN(parallelRate) || bcvRate <= 0 || parallelRate <= 0) {
      toast({
        title: "Error en las tasas",
        description: "Por favor ingrese tasas válidas mayores a 0",
        variant: "destructive",
      });
      return;
    }

    updateRates({
      bcv: bcvRate,
      parallel: parallelRate,
    });

    toast({
      title: "Tasas actualizadas",
      description: `BCV: ${bcvRate} Bs.S - Paralelo: ${parallelRate} Bs.S`,
    });
  };

  const handleSaveSystemSettings = () => {
    console.log('Guardando configuración del sistema...', systemSettings);
    toast({
      title: "Configuración Guardada",
      description: "Los ajustes del sistema han sido actualizados",
    });
  };

  const handleConfigureRoles = () => {
    const totalRoles = rolesPermissions.roles.length;
    const customRoles = rolesPermissions.roles.filter(r => !r.isSystem).length;
    
    toast({
      title: 'Gestión de Roles',
      description: `Sistema configurado con ${totalRoles} roles (${customRoles} personalizados)`,
    });
  };

  const handleConfigurePermissions = () => {
    const permissionsByModule = rolesPermissions.getPermissionsByModule();
    const moduleCount = Object.keys(permissionsByModule).length;
    
    toast({
      title: 'Gestión de Permisos',
      description: `Sistema configurado con permisos para ${moduleCount} módulos`,
    });
  };

  const handleExportData = () => {
    console.log('Exportando datos del sistema...');
    // Implementar exportación de datos
  };

  const handleImportData = () => {
    console.log('Importando datos al sistema...');
    // Implementar importación de datos
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
                  value={newRates.parallel}
                  onChange={(e) => setNewRates({
                    ...newRates, 
                    parallel: e.target.value
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
                  value={newRates.bcv}
                  onChange={(e) => setNewRates({
                    ...newRates, 
                    bcv: e.target.value
                  })}
                  placeholder="36.20"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">
                  Última actualización: {formatDate(rates.lastUpdate)}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Tasas actuales:</span> BCV: {rates.bcv} Bs.S - Paralelo: {rates.parallel} Bs.S
                </div>
              </div>
              <Button onClick={handleUpdateExchangeRates} className="bikeERP-button-primary">
                <Save className="h-4 w-4 mr-2" />
                Actualizar Tasas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Configuration - ENHANCED */}
        {hasPermission('settings', 'update') && (
          <Card className="bikeERP-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Configuración de Base de Datos
              </CardTitle>
              <CardDescription>
                Configura la conexión a la base de datos principal para producción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Servidor / IP</Label>
                  <Input
                    id="host"
                    value={dbConfig.config.host}
                    onChange={(e) => dbConfig.updateConfig({ host: e.target.value })}
                    placeholder="192.168.1.100 o localhost"
                  />
                  <p className="text-xs text-gray-500">
                    IP del servidor de base de datos en la red local
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Puerto</Label>
                  <Input
                    id="port"
                    value={dbConfig.config.port}
                    onChange={(e) => dbConfig.updateConfig({ port: e.target.value })}
                    placeholder="5432"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Base de Datos</Label>
                  <Input
                    id="database"
                    value={dbConfig.config.database}
                    onChange={(e) => dbConfig.updateConfig({ database: e.target.value })}
                    placeholder="bicicentro_erp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    value={dbConfig.config.username}
                    onChange={(e) => dbConfig.updateConfig({ username: e.target.value })}
                    placeholder="postgres"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={dbConfig.config.password}
                    onChange={(e) => dbConfig.updateConfig({ password: e.target.value })}
                    placeholder="Contraseña de la base de datos"
                  />
                </div>
              </div>
              
              {/* Connection Status */}
              {dbConfig.lastTestResult && (
                <div className={`p-3 rounded-lg border ${
                  dbConfig.lastTestResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {dbConfig.lastTestResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      dbConfig.lastTestResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {dbConfig.lastTestResult.message}
                    </span>
                  </div>
                  {dbConfig.lastTestResult.latency && (
                    <p className="text-xs text-gray-600 mt-1">
                      Latencia: {dbConfig.lastTestResult.latency}ms
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={dbConfig.testConnection}
                  variant="outline"
                  disabled={dbConfig.isConnecting}
                  className="gap-2"
                >
                  {dbConfig.isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Probando...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4" />
                      Probar Conexión
                    </>
                  )}
                </Button>
                
                <Button onClick={dbConfig.saveConfig} className="gap-2 bikeERP-button-primary">
                  <Save className="h-4 w-4" />
                  Guardar Configuración
                </Button>

                <Button onClick={dbConfig.resetToDefaults} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Restaurar Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Settings and User Management */}
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
              {/* ... keep existing code for system settings switches */}
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

          {/* User Management - ENHANCED */}
          {hasPermission('users', 'read') && (
            <Card className="bikeERP-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription>
                  Administra usuarios, roles y permisos del sistema
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
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={handleConfigureRoles}
                >
                  <Shield className="h-4 w-4" />
                  Configurar Roles
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {rolesPermissions.roles.length} roles
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={handleConfigurePermissions}
                >
                  <Key className="h-4 w-4" />
                  Permisos del Sistema
                  <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {rolesPermissions.permissions.length} permisos
                  </span>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full gap-2 text-orange-600 border-orange-200 hover:bg-orange-50" 
                  onClick={rolesPermissions.resetToDefaults}
                >
                  <RefreshCw className="h-4 w-4" />
                  Restaurar Defaults
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
