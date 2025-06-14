
// Configuración del API para el backend Express/SQLite local
export const API_CONFIG = {
  // URL base - cambiar por la IP de tu servidor para acceso desde red
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  
  // Endpoints específicos
  endpoints: {
    auth: '/auth',
    products: '/products',
    sales: '/sales',
    clients: '/clients',
    // Agregar más endpoints según sea necesario
  },
  
  // Configuración de requests
  timeout: 10000, // 10 segundos
  retries: 2,
};

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

// Helper para hacer requests con configuración estándar
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response: ${url}`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    throw error;
  }
};
