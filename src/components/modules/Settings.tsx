
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database,
  DollarSign,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBarcodeConnectionManager } from '@/hooks/useBarcodeConnectionManager';
import ExchangeRateSection from './Settings/ExchangeRateSection';

const Settings = () => {
  const { user } = useAuth();
  const { connected, deviceName, toggle } = useBarcodeConnectionManager();

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            Configuración
          </h1>
          <p className="text-slate-600 mt-1">
            Administra las configuraciones del sistema y tu cuenta
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="rates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rates" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Tasas de Cambio
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Dispositivos
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            Cuenta
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Exchange Rates Tab */}
        <TabsContent value="rates" className="space-y-6">
          <ExchangeRateSection />
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
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
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card className="bikeERP-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información de la Cuenta
              </CardTitle>
              <CardDescription>
                Gestiona tu información personal y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <p className="text-lg">{user?.name || 'No disponible'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Rol</label>
                  <p className="text-lg">{user?.role ? String(user.role) : 'No disponible'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-lg">{user?.email || 'No disponible'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Badge variant="default">Activo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card className="bikeERP-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Información del Sistema
              </CardTitle>
              <CardDescription>
                Estado y configuración del sistema BikeERP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">Estado de la Base de Datos</p>
                  <p className="text-lg font-bold text-green-600">Conectada</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">Versión del Sistema</p>
                  <p className="text-lg font-bold text-blue-600">v1.0.0</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-800">Último Backup</p>
                  <p className="text-lg font-bold text-purple-600">Hoy 02:30 AM</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-orange-800">Espacio Usado</p>
                  <p className="text-lg font-bold text-orange-600">245 MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
