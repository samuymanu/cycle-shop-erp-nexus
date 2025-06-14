
export interface ReportData {
  title: string;
  dateRange: string;
  data: any[];
  summary?: Record<string, any>;
}

export const generatePDFReport = (reportData: ReportData) => {
  console.log('📄 Generando reporte PDF:', reportData.title);
  
  // Simulación de generación de PDF
  const reportContent = `
REPORTE: ${reportData.title}
PERÍODO: ${reportData.dateRange}
FECHA DE GENERACIÓN: ${new Date().toLocaleDateString('es-VE')}

======================================

${reportData.data.map((item, index) => `${index + 1}. ${JSON.stringify(item)}`).join('\n')}

======================================

RESUMEN:
${reportData.summary ? Object.entries(reportData.summary).map(([key, value]) => `${key}: ${value}`).join('\n') : 'No hay resumen disponible'}
  `;

  // Crear y descargar archivo
  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportData.title.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateExcelReport = (reportData: ReportData) => {
  console.log('📊 Generando reporte Excel:', reportData.title);
  
  // Simulación de generación de Excel (CSV)
  const headers = reportData.data.length > 0 ? Object.keys(reportData.data[0]).join(',') : '';
  const rows = reportData.data.map(item => Object.values(item).join(',')).join('\n');
  const csvContent = `${headers}\n${rows}`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportData.title.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadData = (data: any[], filename: string, format: 'json' | 'csv' = 'json') => {
  console.log('💾 Descargando datos:', filename);
  
  let content: string;
  let mimeType: string;
  let extension: string;

  if (format === 'csv' && data.length > 0) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    content = `${headers}\n${rows}`;
    mimeType = 'text/csv';
    extension = 'csv';
  } else {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
    extension = 'json';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().getTime()}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
