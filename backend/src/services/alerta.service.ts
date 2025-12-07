import {injectable, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {AlertaRepository} from '../repositories';
import {Alerta} from '../models';
import {NotificacionService} from './notificacion.service';

@injectable()
export class AlertaService {
  constructor(
    @repository(AlertaRepository)
    public alertaRepository: AlertaRepository,
    @inject('services.NotificacionService')
    public notificacionService: NotificacionService,
  ) {}

  async crearAlertaStockBajo(productoId: number, productoNombre: string, stockActual: number, stockMinimo: number) {
    const alerta = new Alerta({
      tipo: 'stock_bajo',
      mensaje: `Producto "${productoNombre}" tiene stock bajo: ${stockActual} unidades (mínimo: ${stockMinimo})`,
      prioridad: stockActual <= 2 ? 'critica' : 'alta',
      estado: 'pendiente',
      productoId: productoId,
      fechaCreacion: new Date().toISOString()
    });

    const alertaCreada = await this.alertaRepository.create(alerta);
    
    await this.notificacionService.enviarNotificacionStockBajo(
      productoId, 
      productoNombre, 
      stockActual
    );

    return alertaCreada;
  }

  async crearAlertaVencimiento(productoId: number, productoNombre: string, diasParaVencer: number) {
    const alerta = new Alerta({
      tipo: 'vencimiento',
      mensaje: `Producto "${productoNombre}" vence en ${diasParaVencer} días`,
      prioridad: diasParaVencer <= 3 ? 'alta' : 'media',
      estado: 'pendiente',
      productoId: productoId,
      fechaCreacion: new Date().toISOString()
    });

    const alertaCreada = await this.alertaRepository.create(alerta);
    
    await this.notificacionService.enviarNotificacionVencimiento(
      productoId, 
      productoNombre, 
      diasParaVencer
    );

    return alertaCreada;
  }

  async obtenerAlertasPendientes() {
    return this.alertaRepository.find({
      where: {estado: 'pendiente'},
      order: ['fechaCreacion DESC']
    });
  }

  async marcarComoLeida(alertaId: number) {
    return this.alertaRepository.updateById(alertaId, {
      estado: 'leida',
      fechaResolucion: new Date().toISOString()
    });
  }

  async obtenerEstadisticas() {
    const alertas = await this.alertaRepository.find();
    
    const porTipo: {[key: string]: number} = {};
    const porPrioridad: {[key: string]: number} = {};
    
    alertas.forEach(alerta => {
      if (alerta.tipo) porTipo[alerta.tipo] = (porTipo[alerta.tipo] || 0) + 1;
      if (alerta.prioridad) porPrioridad[alerta.prioridad] = (porPrioridad[alerta.prioridad] || 0) + 1;
    });

    return {
      total: alertas.length,
      pendientes: alertas.filter(a => a.estado === 'pendiente').length,
      leidas: alertas.filter(a => a.estado === 'leida').length,
      porTipo: porTipo,
      porPrioridad: porPrioridad
    };
  }
}