// src/services/dashboard.service.ts
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

  /**
   * Obtiene las métricas generales del inventario
   * Retorna: totalProductos, valorInventario, stockBajo, movimientosHoy
   */
  async obtenerMetricasGenerales(): Promise<{
    totalProductos: number;
    valorInventario: number;
    stockBajo: number;
    movimientosHoy: number;
  }> {
    try {
      // Total de productos (no hay campo 'activo' en tu modelo, usando todos)
      const totalProductos = await this.productosRepository.count();

      // Valor total del inventario
      const valorInventario = await this.calcularValorInventario();

      // Productos con stock bajo
      const stockBajo = await this.contarProductosStockBajo();

      // Movimientos de hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const movimientosHoy = await this.controlInventarioRepository.count({
        fecha: {gte: hoy.toISOString().split('T')[0]} as any,
      });

      return {
        totalProductos: totalProductos.count,
        valorInventario,
        stockBajo,
        movimientosHoy: movimientosHoy.count,
      };
    } catch (error) {
      console.error('Error en obtenerMetricasGenerales:', error);
      throw error;
    }
  }

  /**
   * Calcula el valor total del inventario
   * Suma: stock * precioVenta de todos los productos
   */
  async calcularValorInventario(): Promise<number> {
    try {
      const productos = await this.productosRepository.find({
        fields: ['stock', 'precioVenta'],
      });

      return productos.reduce((total, producto) => {
        const stock = producto.stock ?? 0;
        const precio = producto.precioVenta ?? 0;
        return total + (stock * precio);
      }, 0);
    } catch (error) {
      console.error('Error en calcularValorInventario:', error);
      return 0;
    }
  }

  /**
   * Cuenta productos con stock bajo
   * Criterio: stock <= stockMinimo
   */
  async contarProductosStockBajo(): Promise<number> {
    try {
      const productos = await this.productosRepository.find({
        fields: ['stock', 'stockMinimo'],
      });

      return productos.filter(p => 
        (p.stock ?? 0) <= (p.stockMinimo ?? 0)
      ).length;
    } catch (error) {
      console.error('Error en contarProductosStockBajo:', error);
      return 0;
    }
  }

  /**
   * Obtiene productos con stock bajo (top 10)
   * Incluye: id, nombre, stockActual, stockMinimo, porcentaje
   */
  async obtenerProductosStockBajo(): Promise<Array<{
    id: number;
    nombre: string;
    stockActual: number;
    stockMinimo: number;
    porcentaje: number;
  }>> {
    try {
      const productos = await this.productosRepository.find({
        order: ['stock ASC'],
        limit: 10,
      });

      return productos
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
    } catch (error) {
      console.error('Error en obtenerProductosStockBajo:', error);
      return [];
    }
  }

  /**
   * Obtiene movimientos recientes (últimos 15)
   * Incluye: id, productoNombre, tipo, cantidad, fecha, usuario
   */
  async obtenerMovimientosRecientes(): Promise<Array<{
    id: number;
    productoNombre: string;
    tipo: string;
    cantidad: number;
    fecha: string;
    usuario: string;
  }>> {
    try {
      const movimientos = await this.controlInventarioRepository.find({
        order: ['fecha DESC'],
        limit: 15,
        // include: [{relation: 'producto'}], // Comentado hasta que definas relaciones
      });

      return movimientos.map(m => {
        // Para obtener nombre del producto, necesitarías una relación o consulta separada
        // Por ahora usamos un placeholder
        const productoNombre = `Producto ${m.idProducto}`;

        return {
          id: m.idControl ?? 0,
          productoNombre,
          tipo: m.tipoMovimiento ?? 'Movimiento',
          cantidad: m.cantidad ?? 0,
          fecha: m.fecha ?? new Date().toISOString(),
          usuario: `Usuario ${m.idUsuario ?? 'Sistema'}`,
        };
      });
    } catch (error) {
      console.error('Error en obtenerMovimientosRecientes:', error);
      return [];
    }
  }

  /**
   * Obtiene productos más movidos (últimos 30 días)
   * Top 10 productos por cantidad de movimientos
   */
  async obtenerProductosPopulares(): Promise<Array<{
    idProducto: number;
    nombre: string;
    totalMovimientos: number;
  }>> {
    try {
      const dataSource = this.controlInventarioRepository.dataSource;
      
      // Consulta SQL optimizada usando los nombres correctos de columnas
      const query = `
        SELECT TOP 10
          p.Id_Producto as idProducto,
          CONCAT(p.marca, ' ', p.modelo) as nombre,
          COUNT(ci.Id_control) as totalMovimientos
        FROM Control_Inventario ci
        INNER JOIN Productos p ON ci.Id_producto = p.Id_Producto
        WHERE ci.fecha >= DATEADD(day, -30, GETDATE())
        GROUP BY p.Id_Producto, p.marca, p.modelo
        ORDER BY COUNT(ci.Id_control) DESC
      `;

      const result = await dataSource.execute(query);
      
      return result.map((row: any) => ({
        idProducto: row.idProducto,
        nombre: row.nombre || 'Producto sin nombre',
        totalMovimientos: parseInt(row.totalMovimientos) || 0,
      }));
    } catch (error) {
      console.error('Error en obtenerProductosPopulares:', error);
      return [];
    }
  }

  /**
   * Método adicional: Obtener tendencia de movimientos (últimos 7 días)
   */
  async obtenerTendenciaMovimientos(): Promise<Array<{
    fecha: string;
    cantidad: number;
  }>> {
    try {
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
      
      return result.map((row: any) => ({
        fecha: new Date(row.fecha).toISOString().split('T')[0],
        cantidad: parseInt(row.cantidad) || 0,
      }));
    } catch (error) {
      console.error('Error en obtenerTendenciaMovimientos:', error);
      return [];
    }
  }
}