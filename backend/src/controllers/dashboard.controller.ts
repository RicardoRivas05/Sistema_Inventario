import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import {DashboardService} from '../services/dashboard.service';

export class DashboardController {
  constructor(
    @inject('services.DashboardService')
    public dashboardService: DashboardService,
  ) {}

  
  @get('/ping')
  @response(200, {
    description: 'Ping successful',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {type: 'string'},
            timestamp: {type: 'string'}
          }
        }
      }
    }
  })
  async ping(): Promise<object> {
    return {
      message: 'Server is running',
      timestamp: new Date().toISOString()
    };
  }

 
  @get('/dashboard/metricas-generales')
  @response(200, {
    description: 'Métricas generales del inventario',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            totalProductos: {type: 'number'},
            valorInventario: {type: 'number'},
            stockBajo: {type: 'number'},
            movimientosHoy: {type: 'number'},
          },
        },
      },
    },
  })
  async obtenerMetricasGenerales(): Promise<{
    totalProductos: number;
    valorInventario: number;
    stockBajo: number;
    movimientosHoy: number;
  }> {
    try {
      console.log('[Dashboard Controller] Obteniendo métricas generales...');
      const metricas = await this.dashboardService.obtenerMetricasGenerales();
      console.log('[Dashboard Controller] Métricas obtenidas:', metricas);
      return metricas;
    } catch (error) {
      console.error('[Dashboard Controller] Error en métricas:', error);
      throw error;
    }
  }

  
  @get('/dashboard/stock-bajo')
  @response(200, {
    description: 'Lista de productos con stock bajo',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {type: 'number'},
              nombre: {type: 'string'},
              stockActual: {type: 'number'},
              stockMinimo: {type: 'number'},
              porcentaje: {type: 'number'},
            },
          },
        },
      },
    },
  })
  async obtenerProductosStockBajo(): Promise<Array<{
    id: number;
    nombre: string;
    stockActual: number;
    stockMinimo: number;
    porcentaje: number;
  }>> {
    try {
      console.log('[Dashboard Controller] Obteniendo productos con stock bajo...');
      const productos = await this.dashboardService.obtenerProductosStockBajo();
      console.log('[Dashboard Controller] Productos con stock bajo:', productos.length);
      return productos;
    } catch (error) {
      console.error('[Dashboard Controller] Error en stock bajo:', error);
      throw error;
    }
  }

  
  @get('/dashboard/movimientos-recientes')
  @response(200, {
    description: 'Lista de movimientos recientes',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {type: 'number'},
              productoNombre: {type: 'string'},
              tipo: {type: 'string'},
              cantidad: {type: 'number'},
              fecha: {type: 'string'},
              usuario: {type: 'string'},
            },
          },
        },
      },
    },
  })
  async obtenerMovimientosRecientes(): Promise<Array<{
    id: number;
    productoNombre: string;
    tipo: string;
    cantidad: number;
    fecha: string;
    usuario: string;
  }>> {
    try {
      console.log('[Dashboard Controller] Obteniendo movimientos recientes...');
      const movimientos = await this.dashboardService.obtenerMovimientosRecientes();
      console.log('[Dashboard Controller] Movimientos obtenidos:', movimientos.length);
      return movimientos;
    } catch (error) {
      console.error('[Dashboard Controller] Error en movimientos:', error);
      throw error;
    }
  }

 
  @get('/dashboard/tendencia-movimientos')
  @response(200, {
    description: 'Tendencia de movimientos últimos 7 días',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fecha: {type: 'string'},
              cantidad: {type: 'number'},
            },
          },
        },
      },
    },
  })
  async obtenerTendenciaMovimientos(): Promise<Array<{
    fecha: string;
    cantidad: number;
  }>> {
    try {
      console.log('[Dashboard Controller] Obteniendo tendencia de movimientos...');
      const tendencia = await this.dashboardService.obtenerTendenciaMovimientos();
      console.log('[Dashboard Controller] Tendencia obtenida:', tendencia.length, 'días');
      return tendencia;
    } catch (error) {
      console.error('[Dashboard Controller] Error en tendencia:', error);
      throw error;
    }
  }
}