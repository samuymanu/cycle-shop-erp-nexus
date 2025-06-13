
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, FileText, Download, Calendar, DollarSign, Package, Users } from 'lucide-react';

const Reports = () => {
  const { user, hasPermission } = useAuth();
  const [dateFrom, setDateFrom] = useState('2024-06-01');
  const [dateTo, setDateTo] = useState('2024-06-13');

  // Mock report data
  const reportTypes = [
    {
      id: 'sales',
      title: 'Reporte de Ventas',
      description: 'Análisis detallado de ventas por período',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      data: {
        totalSales: 1250000,
        transactions: 45,
        averageTicket: 27777,
        growth: 12.5,
      }
    },
    {
      id: 'inventory',
      title: 'Reporte de Inventario',
      description: 'Estado actual del inventario y rotación',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      data: {
        totalProducts: 156,
        lowStock: 12,
        totalValue: 8500000,
        turnover: 2.3,
      }
    },
    {
      id: 'workshop',
      title: 'Reporte de Taller',
      description: 'Análisis de órdenes de servicio y productividad',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      data: {
        totalOrders: 28,
        completed: 20,
        revenue: 350000,
        avgTime: 3.2,
      }
    },
    {
      id: 'clients',
      title: 'Reporte de Clientes',
      description: 'Análisis de base de clientes y comportamiento',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      data: {
        totalClients: 89,
        newClients: 12,
        activeClients: 67,
        retention: 75.3,
      }
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleGenerateReport = (reportType: string) => {
    console.log(`Generando reporte: ${reportType} desde ${dateFrom} hasta ${dateTo}`);
    // Aquí iría la lógica para generar el reporte
  };

  const handleExportReport = (reportType: string, format: string) => {
    console.log(`Exportando reporte ${reportType} en formato ${format}`);
    // Aquí iría la lógica para exportar el reporte
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
              <p className="text-gray-600">Genera reportes detallados del negocio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Date Range Filter */}
        <Card className="material-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rango de Fechas
            </CardTitle>
            <CardDescription>
              Selecciona el período para generar los reportes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Fecha Desde</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="material-input"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="material-input"
                />
              </div>
              <Button className="material-button-primary">
                Actualizar Período
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            
            return (
              <Card key={report.id} className="material-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${report.bgColor}`}>
                      <Icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    {report.title}
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {report.id === 'sales' && (
                      <>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Ventas Totales</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(report.data.totalSales)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Transacciones</p>
                          <p className="text-lg font-bold">{report.data.transactions}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Ticket Promedio</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(report.data.averageTicket)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Crecimiento</p>
                          <p className="text-lg font-bold text-green-600">
                            +{report.data.growth}%
                          </p>
                        </div>
                      </>
                    )}
                    
                    {report.id === 'inventory' && (
                      <>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Productos</p>
                          <p className="text-lg font-bold">{report.data.totalProducts}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Stock Bajo</p>
                          <p className="text-lg font-bold text-red-600">{report.data.lowStock}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Valor Total</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(report.data.totalValue)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Rotación</p>
                          <p className="text-lg font-bold">{report.data.turnover}x</p>
                        </div>
                      </>
                    )}
                    
                    {report.id === 'workshop' && (
                      <>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Órdenes Totales</p>
                          <p className="text-lg font-bold">{report.data.totalOrders}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Completadas</p>
                          <p className="text-lg font-bold text-green-600">{report.data.completed}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Ingresos</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(report.data.revenue)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Tiempo Prom.</p>
                          <p className="text-lg font-bold">{report.data.avgTime} días</p>
                        </div>
                      </>
                    )}
                    
                    {report.id === 'clients' && (
                      <>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Clientes</p>
                          <p className="text-lg font-bold">{report.data.totalClients}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Nuevos</p>
                          <p className="text-lg font-bold text-blue-600">{report.data.newClients}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Activos</p>
                          <p className="text-lg font-bold text-green-600">{report.data.activeClients}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Retención</p>
                          <p className="text-lg font-bold">{report.data.retention}%</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => handleGenerateReport(report.id)}
                      className="material-button-primary gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Generar Reporte Detallado
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportReport(report.id, 'pdf')}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExportReport(report.id, 'excel')}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Insights */}
        <Card className="material-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights Rápidos
            </CardTitle>
            <CardDescription>
              Resumen ejecutivo del período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Mejor Día de Ventas</h3>
                <p className="text-2xl font-bold text-green-600">Lunes</p>
                <p className="text-sm text-green-600">Promedio: {formatCurrency(185000)}</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Producto Más Vendido</h3>
                <p className="text-lg font-bold text-blue-600">Cadenas Shimano</p>
                <p className="text-sm text-blue-600">25 unidades vendidas</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Eficiencia Taller</h3>
                <p className="text-2xl font-bold text-purple-600">89%</p>
                <p className="text-sm text-purple-600">Órdenes completadas a tiempo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
