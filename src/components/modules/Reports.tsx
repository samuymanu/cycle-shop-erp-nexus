
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, FileText, Download, Calendar, DollarSign, Package, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReportsData } from '@/hooks/useReportsData';
import { useSalesData } from '@/hooks/useSalesData';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useClientsData } from '@/hooks/useClientsData';
import { generatePDFReport, generateExcelReport, downloadData } from '@/utils/reportGenerator';

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState('2024-06-01');
  const [dateTo, setDateTo] = useState('2024-06-13');
  const { data, isLoading, refetch } = useReportsData({ dateFrom, dateTo });
  
  // Obtener datos reales para generar reportes
  const { data: salesData = [] } = useSalesData();
  const { data: inventoryData = [] } = useInventoryData();
  const { data: clientsData = [] } = useClientsData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleGenerateReport = (reportType: string) => {
    console.log('📊 Generando reporte:', reportType);
    
    let reportData;
    
    switch (reportType) {
      case 'Ventas':
        const filteredSales = salesData.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          return saleDate >= fromDate && saleDate <= toDate;
        });
        
        reportData = {
          title: 'Reporte de Ventas',
          dateRange: `${dateFrom} - ${dateTo}`,
          data: filteredSales,
          summary: {
            'Total Ventas': formatCurrency(data?.sales.totalSales ?? 0),
            'Transacciones': data?.sales.transactions ?? 0,
            'Ticket Promedio': formatCurrency(data?.sales.averageTicket ?? 0),
            'Crecimiento': `${data?.sales.growth ?? 0}%`
          }
        };
        break;
        
      case 'Inventario':
        reportData = {
          title: 'Reporte de Inventario',
          dateRange: new Date().toLocaleDateString('es-VE'),
          data: inventoryData,
          summary: {
            'Total Productos': data?.inventory.totalProducts ?? 0,
            'Stock Bajo': data?.inventory.lowStock ?? 0,
            'Valor Total': formatCurrency(data?.inventory.totalValue ?? 0),
            'Rotación': `${data?.inventory.turnover ?? 0}x`
          }
        };
        break;
        
      case 'Clientes':
        reportData = {
          title: 'Reporte de Clientes',
          dateRange: `${dateFrom} - ${dateTo}`,
          data: clientsData,
          summary: {
            'Total Clientes': data?.clients.totalClients ?? 0,
            'Nuevos Clientes': data?.clients.newClients ?? 0,
            'Clientes Activos': data?.clients.activeClients ?? 0,
            'Retención': `${data?.clients.retention ?? 0}%`
          }
        };
        break;
        
      case 'Taller':
        reportData = {
          title: 'Reporte de Taller',
          dateRange: `${dateFrom} - ${dateTo}`,
          data: [], // Datos simulados del taller
          summary: {
            'Órdenes Totales': data?.workshop.totalOrders ?? 0,
            'Completadas': data?.workshop.completed ?? 0,
            'Ingresos': formatCurrency(data?.workshop.revenue ?? 0),
            'Tiempo Promedio': `${data?.workshop.avgTime ?? 0} días`
          }
        };
        break;
        
      default:
        toast({
          title: 'Error',
          description: 'Tipo de reporte no válido',
          variant: 'destructive',
        });
        return;
    }
    
    generatePDFReport(reportData);
    
    toast({
      title: 'Reporte generado',
      description: `El reporte detallado de "${reportType}" ha sido generado y descargado.`,
    });
  };

  const handleExportReport = (reportType: string, format: string) => {
    console.log('💾 Exportando reporte:', reportType, format);
    
    let exportData;
    let filename;
    
    switch (reportType) {
      case 'Ventas':
        const filteredSales = salesData.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          return saleDate >= fromDate && saleDate <= toDate;
        });
        exportData = filteredSales;
        filename = 'Reporte_Ventas';
        break;
        
      case 'Inventario':
        exportData = inventoryData;
        filename = 'Reporte_Inventario';
        break;
        
      case 'Clientes':
        exportData = clientsData;
        filename = 'Reporte_Clientes';
        break;
        
      case 'Taller':
        exportData = []; // Datos del taller (simulados)
        filename = 'Reporte_Taller';
        break;
        
      default:
        toast({
          title: 'Error',
          description: 'Tipo de reporte no válido',
          variant: 'destructive',
        });
        return;
    }
    
    if (format === 'excel') {
      const reportData = {
        title: `Reporte de ${reportType}`,
        dateRange: `${dateFrom} - ${dateTo}`,
        data: exportData
      };
      generateExcelReport(reportData);
    } else {
      downloadData(exportData, filename, 'csv');
    }
    
    toast({
      title: 'Exportación completada',
      description: `Los datos de "${reportType}" han sido exportados como ${format === 'pdf' ? 'PDF' : 'Excel/CSV'}.`,
    });
  };

  const handleDownloadAllData = () => {
    console.log('📥 Descargando todos los datos del sistema...');
    
    const allData = {
      sales: salesData,
      inventory: inventoryData,
      clients: clientsData,
      reportPeriod: { dateFrom, dateTo },
      generatedAt: new Date().toISOString()
    };
    
    downloadData([allData], 'BikeERP_Backup_Completo', 'json');
    
    toast({
      title: 'Descarga completada',
      description: 'Todos los datos del sistema han sido descargados exitosamente.',
    });
  };

  const handleUpdatePeriod = () => {
    refetch();
    toast({
      title: "Período actualizado",
      description: `Mostrando reportes entre ${dateFrom} y ${dateTo}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
                <p className="text-gray-600">Genera reportes detallados del negocio</p>
              </div>
            </div>
            <Button onClick={handleDownloadAllData} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Descargar Datos
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Date Range Filter */}
        <Card>
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
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdatePeriod}>
                Actualizar Período
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                Reporte de Ventas
              </CardTitle>
              <CardDescription>Análisis detallado de ventas por período</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-24 flex items-center justify-center text-gray-400">Cargando...</div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Ventas Totales</div>
                      <div className="text-xl font-bold text-green-600">{formatCurrency(data?.sales.totalSales ?? 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Transacciones</div>
                      <div className="text-xl font-bold">{data?.sales.transactions ?? 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Ticket Promedio</div>
                      <div className="text-xl font-bold">{formatCurrency(data?.sales.averageTicket ?? 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Crecimiento</div>
                      <div className="text-xl font-bold text-green-600">
                        +{data?.sales.growth ?? 0}%
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-4 border-t mt-4">
                    <Button onClick={() => handleGenerateReport('Ventas')} className="bg-green-600 hover:bg-green-700 text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      Generar Reporte Detallado
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportReport('Ventas', "pdf")} className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportReport('Ventas', "excel")} className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                Reporte de Inventario
              </CardTitle>
              <CardDescription>Estado actual del inventario y rotación</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-24 flex items-center justify-center text-gray-400">Cargando...</div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Total Productos</div>
                      <div className="text-xl font-bold">{data?.inventory.totalProducts ?? 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Stock Bajo</div>
                      <div className="text-xl font-bold text-red-600">{data?.inventory.lowStock ?? 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Valor Total</div>
                      <div className="text-xl font-bold">{formatCurrency(data?.inventory.totalValue ?? 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Rotación</div>
                      <div className="text-xl font-bold">{data?.inventory.turnover ?? 0}x</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-4 border-t mt-4">
                    <Button onClick={() => handleGenerateReport('Inventario')} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      Generar Reporte Detallado
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportReport('Inventario', "pdf")} className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportReport('Inventario', "excel")} className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Taller */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                Reporte de Taller
              </CardTitle>
              <CardDescription>Análisis de órdenes de servicio y productividad</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-24 flex items-center justify-center text-gray-400">Cargando...</div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Órdenes Totales</div>
                      <div className="text-xl font-bold">{data?.workshop.totalOrders ?? 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Completadas</div>
                      <div className="text-xl font-bold text-green-600">{data?.workshop.completed ?? 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Ingresos</div>
                      <div className="text-xl font-bold">{formatCurrency(data?.workshop.revenue ?? 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Tiempo Prom.</div>
                      <div className="text-xl font-bold">{data?.workshop.avgTime ?? 0} días</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-4 border-t mt-4">
                    <Button onClick={() => handleGenerateReport('Taller')} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      Generar Reporte Detallado
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportReport('Taller', "pdf")} className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportReport('Taller', "excel")} className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                Reporte de Clientes
              </CardTitle>
              <CardDescription>Análisis de base de clientes y comportamiento</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-24 flex items-center justify-center text-gray-400">Cargando...</div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Total Clientes</div>
                      <div className="text-xl font-bold">{data?.clients.totalClients ?? 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Nuevos</div>
                      <div className="text-xl font-bold text-blue-600">{data?.clients.newClients ?? 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Activos</div>
                      <div className="text-xl font-bold text-green-600">{data?.clients.activeClients ?? 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-600">Retención</div>
                      <div className="text-xl font-bold">{data?.clients.retention ?? 0}%</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-4 border-t mt-4">
                    <Button onClick={() => handleGenerateReport('Clientes')} className="bg-orange-600 hover:bg-orange-700 text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      Generar Reporte Detallado
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportReport('Clientes', "pdf")} className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportReport('Clientes', "excel")} className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <Card>
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
