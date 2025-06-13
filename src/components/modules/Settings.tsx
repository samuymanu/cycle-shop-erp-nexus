
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { 
  Database, 
  Users, 
  Shield, 
  Server, 
  Save, 
  TestTube,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';

const Settings = () => {
  const { user, hasPermission } = useAuth();
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '5432',
    database: 'bicicentro_erp',
    username: 'postgres',
    password: '',
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

  const handleExportData = () => {
    console.log('Exportando datos del sistema...');
    // Implementar exportación de datos
  };

  const handleImportData = () => {
    console.log('Importando datos al sistema...');
    // Implementar importación de datos
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
        {/* Database Configuration */}
        {hasPermission('settings', 'update') && (
          <Card className="erp-card">
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
                
                <Button onClick={handleSaveDbConfig} className="gap-2 erp-button-primary">
                  <Save className="h-4 w-4" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="erp-card">
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

              <Button onClick={handleSaveSystemSettings} className="w-full gap-2 erp-button-primary">
                <Save className="h-4 w-4" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>

          {/* User Management */}
          {hasPermission('users', 'read') && (
            <Card className="erp-card">
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

                <Button variant="outline" className="w-full">
                  Gestionar Usuarios
                </Button>
                <Button variant="outline" className="w-full">
                  Configurar Roles
                </Button>
                <Button variant="outline" className="w-full">
                  Permisos del Sistema
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Data Management */}
        <Card className="erp-card">
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
              <Button variant="outline" className="gap-2">
                <Save className="h-4 w-4" />
                Crear Respaldo
              </Button>
              <Button variant="outline" className="gap-2">
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
