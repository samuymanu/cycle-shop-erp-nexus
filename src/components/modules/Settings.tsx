
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Database, Smartphone, Wifi, WifiOff, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBarcodeConnectionManager } from '@/hooks/useBarcodeConnectionManager';
import { toast } from '@/hooks/use-toast';
import ExchangeRateSection from './Settings/ExchangeRateSection';

const Settings = () => {
  const { user } = useAuth();
  const { connected, deviceName, toggle } = useBarcodeConnectionManager();
  
  // Estados para edición de información de cuenta
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountData, setAccountData] = useState({
    name: user?.name || 'Juan Pérez',
    role: user?.role ? String(user.role) : 'Admin',
    email: user?.email || 'admin@bicicentro.com',
    status: 'Activo'
  });

  // Estados para edición de información del sistema
  const [isEditingSystem, setIsEditingSystem] = useState(false);
  const [systemData, setSystemData] = useState({
    dbStatus: 'Conectada',
    version: 'v1.0.0',
    lastBackup: 'Hoy 02:30 AM',
    usedSpace: '245 MB'
  });

  const availableRoles = ['Admin', 'Administrador', 'Venta'];

  const handleSaveAccount = () => {
    // Aquí se implementaría la lógica para guardar los cambios de cuenta
    setIsEditingAccount(false);
    toast({
      title: "✅ Información Actualizada",
      description: "Los datos de la cuenta han sido guardados correctamente",
    });
  };

  const handleSaveSystem = () => {
    // Aquí se implementaría la lógica para guardar los cambios del sistema
    setIsEditingSystem(false);
    toast({
      title: "✅ Sistema Actualizado",
      description: "La configuración del sistema ha sido guardada correctamente",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-600 mt-1">
            Administra las configuraciones del sistema y tu cuenta
          </p>
        </div>
      </div>

      {/* Exchange Rates Section */}
      <ExchangeRateSection />

      {/* Devices Section */}
      <Card className="bikeERP-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Dispositivos Conectados
          </CardTitle>
          <CardDescription>
            Gestiona los dispositivos externos conectados al sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {connected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">{deviceName}</p>
                <p className="text-sm text-gray-500">Lector de Códigos de Barras</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={connected ? 'default' : 'secondary'}>
                {connected ? 'Conectado' : 'Desconectado'}
              </Badge>
              <Button
                onClick={toggle}
                variant={connected ? 'outline' : 'default'}
                size="sm"
              >
                {connected ? 'Desconectar' : 'Conectar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card className="bikeERP-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información de la Cuenta
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isEditingAccount) {
                  setIsEditingAccount(false);
                  // Restaurar datos originales si se cancela
                  setAccountData({
                    name: user?.name || 'Juan Pérez',
                    role: user?.role ? String(user.role) : 'Admin',
                    email: user?.email || 'admin@bicicentro.com',
                    status: 'Activo'
                  });
                } else {
                  setIsEditingAccount(true);
                }
              }}
              className={isEditingAccount ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}
            >
              {isEditingAccount ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Gestiona tu información personal y preferencias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              {isEditingAccount ? (
                <Input
                  value={accountData.name}
                  onChange={(e) => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-lg mt-1">{accountData.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Rol</label>
              {isEditingAccount ? (
                <Select 
                  value={accountData.role} 
                  onValueChange={(value) => setAccountData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg mt-1">{accountData.role}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              {isEditingAccount ? (
                <Input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="text-lg mt-1">{accountData.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              {isEditingAccount ? (
                <Select 
                  value={accountData.status} 
                  onValueChange={(value) => setAccountData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                    <SelectItem value="Suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="default" className="mt-1">{accountData.status}</Badge>
              )}
            </div>
          </div>
          {isEditingAccount && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSaveAccount} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Section */}
      <Card className="bikeERP-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Información del Sistema
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isEditingSystem) {
                  setIsEditingSystem(false);
                  // Restaurar datos originales si se cancela
                  setSystemData({
                    dbStatus: 'Conectada',
                    version: 'v1.0.0',
                    lastBackup: 'Hoy 02:30 AM',
                    usedSpace: '245 MB'
                  });
                } else {
                  setIsEditingSystem(true);
                }
              }}
              className={isEditingSystem ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}
            >
              {isEditingSystem ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Estado y configuración del sistema BikeERP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800">Estado de la Base de Datos</p>
              {isEditingSystem ? (
                <Select 
                  value={systemData.dbStatus} 
                  onValueChange={(value) => setSystemData(prev => ({ ...prev, dbStatus: value }))}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conectada">Conectada</SelectItem>
                    <SelectItem value="Desconectada">Desconectada</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg font-bold text-green-600">{systemData.dbStatus}</p>
              )}
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Versión del Sistema</p>
              {isEditingSystem ? (
                <Input
                  value={systemData.version}
                  onChange={(e) => setSystemData(prev => ({ ...prev, version: e.target.value }))}
                  className="mt-1 bg-white"
                />
              ) : (
                <p className="text-lg font-bold text-blue-600">{systemData.version}</p>
              )}
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-800">Último Backup</p>
              {isEditingSystem ? (
                <Input
                  value={systemData.lastBackup}
                  onChange={(e) => setSystemData(prev => ({ ...prev, lastBackup: e.target.value }))}
                  className="mt-1 bg-white"
                />
              ) : (
                <p className="text-lg font-bold text-purple-600">{systemData.lastBackup}</p>
              )}
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-800">Espacio Usado</p>
              {isEditingSystem ? (
                <Input
                  value={systemData.usedSpace}
                  onChange={(e) => setSystemData(prev => ({ ...prev, usedSpace: e.target.value }))}
                  className="mt-1 bg-white"
                />
              ) : (
                <p className="text-lg font-bold text-orange-600">{systemData.usedSpace}</p>
              )}
            </div>
          </div>
          {isEditingSystem && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSaveSystem} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar Configuración
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
