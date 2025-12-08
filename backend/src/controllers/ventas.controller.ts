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
import {Ventas} from '../models';
import {VentasRepository} from '../repositories';

export class VentasController {
  constructor(
    @repository(VentasRepository)
    public ventasRepository : VentasRepository,
  ) {}

  @post('/ventas')
  @response(200, {
    description: 'Ventas model instance',
    content: {'application/json': {schema: getModelSchemaRef(Ventas)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ventas, {
            title: 'NewVentas',
            
          }),
        },
      },
    })
    ventas: Ventas,
  ): Promise<Ventas> {
    return this.ventasRepository.create(ventas);
  }

  @get('/ventas/count')
  @response(200, {
    description: 'Ventas model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Ventas) where?: Where<Ventas>,
  ): Promise<Count> {
    return this.ventasRepository.count(where);
  }

  @get('/ventas')
  @response(200, {
    description: 'Array of Ventas model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Ventas, {includeRelations: true}),
        },
      },
    },
  })
  async find(): Promise<Ventas[]> {
    return this.ventasRepository.find();
  }

  @patch('/ventas')
  @response(200, {
    description: 'Ventas PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ventas, {partial: true}),
        },
      },
    })
    ventas: Ventas,
    @param.where(Ventas) where?: Where<Ventas>,
  ): Promise<Count> {
    return this.ventasRepository.updateAll(ventas, where);
  }

  @get('/ventas/{id}')
  @response(200, {
    description: 'Ventas model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Ventas, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Ventas, {exclude: 'where'}) filter?: FilterExcludingWhere<Ventas>
  ): Promise<Ventas> {
    return this.ventasRepository.findById(id, filter);
  }

  @patch('/ventas/{id}')
  @response(204, {
    description: 'Ventas PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ventas, {partial: true}),
        },
      },
    })
    ventas: Ventas,
  ): Promise<void> {
    await this.ventasRepository.updateById(id, ventas);
  }

  @put('/ventas/{id}')
  @response(204, {
    description: 'Ventas PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() ventas: Ventas,
  ): Promise<void> {
    await this.ventasRepository.replaceById(id, ventas);
  }

  @del('/ventas/{id}')
  @response(204, {
    description: 'Ventas DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.ventasRepository.deleteById(id);
  }
}
