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
import {DetalleVentas} from '../models';
import {DetalleVentasRepository} from '../repositories';

export class DetalleVentasController {
  constructor(
    @repository(DetalleVentasRepository)
    public detalleVentasRepository : DetalleVentasRepository,
  ) {}

  @post('/detalle-ventas')
  @response(200, {
    description: 'DetalleVentas model instance',
    content: {'application/json': {schema: getModelSchemaRef(DetalleVentas)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DetalleVentas, {
            title: 'NewDetalleVentas',
            exclude: ['id'],
          }),
        },
      },
    })
    detalleVentas: Omit<DetalleVentas, 'id'>,
  ): Promise<DetalleVentas> {
    return this.detalleVentasRepository.create(detalleVentas);
  }

  @get('/detalle-ventas/count')
  @response(200, {
    description: 'DetalleVentas model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(DetalleVentas) where?: Where<DetalleVentas>,
  ): Promise<Count> {
    return this.detalleVentasRepository.count(where);
  }

  @get('/detalle-ventas')
  @response(200, {
    description: 'Array of DetalleVentas model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DetalleVentas, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(DetalleVentas) filter?: Filter<DetalleVentas>,
  ): Promise<DetalleVentas[]> {
    return this.detalleVentasRepository.find(filter);
  }

  @patch('/detalle-ventas')
  @response(200, {
    description: 'DetalleVentas PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DetalleVentas, {partial: true}),
        },
      },
    })
    detalleVentas: DetalleVentas,
    @param.where(DetalleVentas) where?: Where<DetalleVentas>,
  ): Promise<Count> {
    return this.detalleVentasRepository.updateAll(detalleVentas, where);
  }

  @get('/detalle-ventas/{id}')
  @response(200, {
    description: 'DetalleVentas model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DetalleVentas, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(DetalleVentas, {exclude: 'where'}) filter?: FilterExcludingWhere<DetalleVentas>
  ): Promise<DetalleVentas> {
    return this.detalleVentasRepository.findById(id, filter);
  }

  @patch('/detalle-ventas/{id}')
  @response(204, {
    description: 'DetalleVentas PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DetalleVentas, {partial: true}),
        },
      },
    })
    detalleVentas: DetalleVentas,
  ): Promise<void> {
    await this.detalleVentasRepository.updateById(id, detalleVentas);
  }

  @put('/detalle-ventas/{id}')
  @response(204, {
    description: 'DetalleVentas PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() detalleVentas: DetalleVentas,
  ): Promise<void> {
    await this.detalleVentasRepository.replaceById(id, detalleVentas);
  }

  @del('/detalle-ventas/{id}')
  @response(204, {
    description: 'DetalleVentas DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.detalleVentasRepository.deleteById(id);
  }
}
