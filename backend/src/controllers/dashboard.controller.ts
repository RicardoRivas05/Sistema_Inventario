
import {inject} from '@loopback/core';
import {
  get,
  response,
  Request,
  RestBindings,
} from '@loopback/rest';
import {DashboardService} from '../services/dashboard.service';


export class DashboardController {
  constructor(
    @inject('services.DashboardService')
    public dashboardService: DashboardService,
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
  ) {}

  
  @get('/dashboard/metricas-generales')
  @response(200, {
    description: 'Métricas generales del inventario',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            totalProductos: {
              type: 'number',
              description: 'Total de productos activos'
            },
            valorInventario: {
              type: 'number',
              description: 'Valor total del inventario en moneda local'
            },
            stockBajo: {
              type: 'number',
              description: 'Cantidad de productos con stock bajo'
            },
            movimientosHoy: {
              type: 'number',
              description: 'Total de movimientos registrados hoy'
            },
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
    console.log('GET /dashboard/metricas-generales');
    return this.dashboardService.obtenerMetricasGenerales();
  }

 
  @get('/dashboard/stock-alertas')
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
              porcentaje: {
                type: 'number',
                description: 'Porcentaje de stock actual vs mínimo'
              },
            },
          },
        },
      },
    },
  })
  async obtenerStockAlertas(): Promise<Array<{
    id: number;
    nombre: string;
    stockActual: number;
    stockMinimo: number;
    porcentaje: number;
  }>> {
    console.log('GET /dashboard/stock-alertas');
    return this.dashboardService.obtenerProductosStockBajo();
  }

 
  @get('/dashboard/movimientos-recientes')
  @response(200, {
    description: 'Movimientos recientes de inventario',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {type: 'number'},
              productoNombre: {type: 'string'},
              tipo: {
                type: 'string',
                description: 'Entrada, Salida o Ajuste'
              },
              cantidad: {type: 'number'},
              fecha: {
                type: 'string',
                format: 'date-time'
              },
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
    console.log('GET /dashboard/movimientos-recientes');
    return this.dashboardService.obtenerMovimientosRecientes();
  }

  
  @get('/dashboard/productos-populares')
  @response(200, {
    description: 'Top 10 productos más movidos',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nombre: {type: 'string'},
              totalMovimientos: {
                type: 'number',
                description: 'Total de movimientos en los últimos 30 días'
              },
            },
          },
        },
      },
    },
  })
  async obtenerProductosPopulares(): Promise<Array<{
    nombre: string;
    totalMovimientos: number;
  }>> {
    console.log('GET /dashboard/productos-populares');
    return this.dashboardService.obtenerProductosPopulares();
  }
}