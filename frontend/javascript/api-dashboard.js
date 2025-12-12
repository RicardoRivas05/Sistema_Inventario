

const dashboardAPI = {
    
    baseURL: 'http://localhost:3000',

    
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            console.log(`[API] ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`[API] Respuesta recibida:`, data);
            return data;

        } catch (error) {
            console.error(`[API] Error en ${endpoint}:`, error);
            throw error;
        }
    },

    
    async obtenerMetricas() {
        try {
            const data = await this.request('/dashboard/metricas-generales');
            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: {
                    totalProductos: 0,
                    valorInventario: 0,
                    stockBajo: 0,
                    movimientosHoy: 0
                }
            };
        }
    },

    
    async obtenerStockBajo() {
        try {
            const data = await this.request('/dashboard/stock-bajo');
            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    },

    
    async obtenerMovimientosRecientes() {
        try {
            const data = await this.request('/dashboard/movimientos-recientes');
            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    },

    
    async obtenerTodosDatos() {
        try {
            console.log('[API] Obteniendo todos los datos del dashboard...');

            
            const [metricas, stockBajo, movimientos] = await Promise.all([
                this.obtenerMetricas(),
                this.obtenerStockBajo(),
                this.obtenerMovimientosRecientes()
            ]);

            
            const errors = [];
            if (!metricas.success) errors.push(`Métricas: ${metricas.error}`);
            if (!stockBajo.success) errors.push(`Stock: ${stockBajo.error}`);
            if (!movimientos.success) errors.push(`Movimientos: ${movimientos.error}`);

            return {
                success: errors.length === 0,
                errors: errors,
                data: {
                    metricas: metricas.data,
                    stockAlertas: stockBajo.data,
                    movimientos: movimientos.data,
                    populares: [] 
                }
            };

        } catch (error) {
            console.error('[API] Error crítico obteniendo datos:', error);
            return {
                success: false,
                errors: [error.message],
                data: {
                    metricas: {
                        totalProductos: 0,
                        valorInventario: 0,
                        stockBajo: 0,
                        movimientosHoy: 0
                    },
                    stockAlertas: [],
                    movimientos: [],
                    populares: []
                }
            };
        }
    },

    
    async verificarConexion() {
        try {
            await this.request('/ping');
            console.log('[API] Conexión establecida con el servidor');
            return true;
        } catch (error) {
            console.error('[API] No se pudo conectar con el servidor:', error);
            return false;
        }
    }
};


console.log('[API] Cliente de Dashboard inicializado');
console.log('[API] URL Base:', dashboardAPI.baseURL);