import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
} from '@loopback/rest';
import {Alerta} from '../models';
import {AlertaRepository} from '../repositories';
import {AlertaService} from '../services/alerta.service';
import {inject} from '@loopback/core';

export class AlertaController {
  constructor(
    @repository(AlertaRepository)
    public alertaRepository: AlertaRepository,
    @inject('services.AlertaService')
    public alertaService: AlertaService,
  ) {}

  @post('/alertas')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Alerta, {
            title: 'NewAlerta',
            exclude: ['id'],
          }),
        },
      },
    })
    alerta: Omit<Alerta, 'id'>,
  ): Promise<Alerta> {
    return this.alertaRepository.create(alerta);
  }

  @get('/alertas')
  async find(): Promise<Alerta[]> {
    return this.alertaRepository.find({
      order: ['fechaCreacion DESC']
    });
  }

  @get('/alertas/pendientes')
  async findPendientes(): Promise<Alerta[]> {
    return this.alertaService.obtenerAlertasPendientes();
  }

  @get('/alertas/prioridad/{prioridad}')
  async findByPrioridad(
    @param.path.string('prioridad') prioridad: string,
  ): Promise<Alerta[]> {
    return this.alertaRepository.find({
      where: {prioridad},
      order: ['fechaCreacion DESC']
    });
  }

  @patch('/alertas/{id}/leer')
  async marcarLeida(
    @param.path.number('id') id: number,
  ): Promise<void> {
    await this.alertaService.marcarComoLeida(id);
  }

  @get('/alertas/estadisticas')
  async obtenerEstadisticas() {
    return this.alertaService.obtenerEstadisticas();
  }

  @post('/alertas/simular-stock-bajo')
  async simularAlertaStockBajo() {
    return this.alertaService.crearAlertaStockBajo(1, 'Arroz Integral', 3, 10);
  }

  @get('/alertas/{id}')
  async findById(@param.path.number('id') id: number): Promise<Alerta> {
    return this.alertaRepository.findById(id);
  }

  @patch('/alertas/{id}')
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Alerta, {partial: true}),
        },
      },
    })
    alerta: Alerta,
  ): Promise<void> {
    await this.alertaRepository.updateById(id, alerta);
  }

  @del('/alertas/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.alertaRepository.deleteById(id);
  }
}