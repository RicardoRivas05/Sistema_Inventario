
import {injectable, BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ProductosRepository} from '../repositories/productos.repository';
import {ControlInventarioRepository} from '../repositories/control-inventario.repository';

@injectable({scope: BindingScope.TRANSIENT})
export class DashboardService {
  constructor(
    @repository(ProductosRepository)
    public productosRepository: ProductosRepository,
    @repository(ControlInventarioRepository)
    public controlInventarioRepository: ControlInventarioRepository,
  ) {}

  async obtenerMetricasGenerales(): Promise<{
    totalProductos: number;
    valorInventario: number;
    stockBajo: number;
    movimientosHoy: number;
  }> {
    try {
      console.log('[Dashboard Service] Calculando métricas generales...');

      
      const totalProductos = await this.productosRepository.count();

      
      const valorInventario = await this.calcularValorInventario();

      
      const stockBajo = await this.contarProductosStockBajo();

      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const movimientosHoy = await this.controlInventarioRepository.count({
        fecha: {gte: hoy.toISOString()} as any,
      });

      const resultado = {
        totalProductos: totalProductos.count,
        valorInventario,
        stockBajo,
        movimientosHoy: movimientosHoy.count,
      };

      console.log('[Dashboard Service] Métricas calculadas:', resultado);
      return resultado;

    } catch (error) {
      console.error('[Dashboard Service] Error en obtenerMetricasGenerales:', error);
      throw error;
    }
  }

  
  async calcularValorInventario(): Promise<number> {
    try {
      const productos = await this.productosRepository.find({
        fields: ['stock', 'precioVenta'],
      });

      const valor = productos.reduce((total, producto) => {
        const stock = producto.stock ?? 0;
        const precio = producto.precioVenta ?? 0;
        return total + (stock * precio);
      }, 0);

      console.log('[Dashboard Service] Valor inventario calculado:', valor);
      return valor;

    } catch (error) {
      console.error('[Dashboard Service] Error en calcularValorInventario:', error);
      return 0;
    }
  }

  
  async contarProductosStockBajo(): Promise<number> {
    try {
      const productos = await this.productosRepository.find({
        fields: ['stock', 'stockMinimo'],
      });

      const cantidad = productos.filter(p => 
        (p.stock ?? 0) <= (p.stockMinimo ?? 0)
      ).length;

      console.log('[Dashboard Service] Productos con stock bajo:', cantidad);
      return cantidad;

    } catch (error) {
      console.error('[Dashboard Service] Error en contarProductosStockBajo:', error);
      return 0;
    }
  }

  
  async obtenerProductosStockBajo(): Promise<Array<{
    id: number;
    nombre: string;
    stockActual: number;
    stockMinimo: number;
    porcentaje: number;
  }>> {
    try {
      console.log('[Dashboard Service] Obteniendo productos con stock bajo...');

      const productos = await this.productosRepository.find({
        order: ['stock ASC'],
        limit: 10,
      });

      const resultado = productos
        .filter(p => (p.stock ?? 0) <= (p.stockMinimo ?? 0))
        .map(p => {
          const stockActual = p.stock ?? 0;
          const stockMinimo = p.stockMinimo ?? 0;
          const porcentaje = stockMinimo > 0 
            ? Math.round((stockActual / stockMinimo) * 100)
            : 0;

          return {
            id: p.idProducto ?? 0,
            nombre: p.marca && p.modelo ? `${p.marca} ${p.modelo}` : 'Producto sin nombre',
            stockActual,
            stockMinimo,
            porcentaje,
          };
        });

      console.log('[Dashboard Service] Productos con stock bajo encontrados:', resultado.length);
      return resultado;

    } catch (error) {
      console.error('[Dashboard Service] Error en obtenerProductosStockBajo:', error);
      return [];
    }
  }

  
  async obtenerMovimientosRecientes(): Promise<Array<{
    id: number;
    productoNombre: string;
    tipo: string;
    cantidad: number;
    fecha: string;
    usuario: string;
  }>> {
    try {
      console.log('[Dashboard Service] Obteniendo movimientos recientes...');

      const movimientos = await this.controlInventarioRepository.find({
        order: ['fecha DESC'],
        limit: 15,
      });

      
      const productosIds = [...new Set(movimientos.map(m => m.idProducto).filter(id => id))];
      const productos = await this.productosRepository.find({
        where: {
          idProducto: {inq: productosIds}
        },
        fields: ['idProducto', 'marca', 'modelo']
      });

      
      const productosMap = new Map();
      productos.forEach(p => {
        const nombre = p.marca && p.modelo ? `${p.marca} ${p.modelo}` : 'Producto sin nombre';
        productosMap.set(p.idProducto, nombre);
      });

      const resultado = movimientos.map(m => {
        const productoNombre = m.idProducto 
          ? (productosMap.get(m.idProducto) || `Producto ID: ${m.idProducto}`)
          : 'Producto desconocido';

        return {
          id: m.idControl ?? 0,
          productoNombre,
          tipo: m.tipoMovimiento ?? 'Movimiento',
          cantidad: m.cantidad ?? 0,
          fecha: m.fecha ?? new Date().toISOString(),
          usuario: m.idUsuario ? `Usuario ${m.idUsuario}` : 'Sistema',
        };
      });

      console.log('[Dashboard Service] Movimientos recientes obtenidos:', resultado.length);
      return resultado;

    } catch (error) {
      console.error('[Dashboard Service] Error en obtenerMovimientosRecientes:', error);
      return [];
    }
  }

  
  async obtenerTendenciaMovimientos(): Promise<Array<{
    fecha: string;
    cantidad: number;
  }>> {
    try {
      console.log('[Dashboard Service] Obteniendo tendencia de movimientos...');

      const dataSource = this.controlInventarioRepository.dataSource;
      
      const query = `
        SELECT 
          CONVERT(date, fecha) as fecha,
          COUNT(Id_control) as cantidad
        FROM Control_Inventario
        WHERE fecha >= DATEADD(day, -7, GETDATE())
        GROUP BY CONVERT(date, fecha)
        ORDER BY fecha DESC
      `;

      const result = await dataSource.execute(query);
      
      const tendencia = result.map((row: any) => ({
        fecha: new Date(row.fecha).toISOString().split('T')[0],
        cantidad: parseInt(row.cantidad) || 0,
      }));

      console.log('[Dashboard Service] Tendencia obtenida:', tendencia.length, 'días');
      return tendencia;

    } catch (error) {
      console.error('[Dashboard Service] Error en obtenerTendenciaMovimientos:', error);
      return [];
    }
  }
}