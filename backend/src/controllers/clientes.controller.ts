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
import {Clientes} from '../models';
import {ClientesRepository} from '../repositories';

export class ClientesController {
  constructor(
    @repository(ClientesRepository)
    public clientesRepository : ClientesRepository,
  ) {}

  @post('/clientes')
  @response(200, {
    description: 'Clientes model instance',
    content: {'application/json': {schema: getModelSchemaRef(Clientes)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Clientes, {
            title: 'NewClientes',
            
          }),
        },
      },
    })
    clientes: Clientes,
  ): Promise<Clientes> {
    return this.clientesRepository.create(clientes);
  }

  @get('/clientes/count')
  @response(200, {
    description: 'Clientes model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Clientes) where?: Where<Clientes>,
  ): Promise<Count> {
    return this.clientesRepository.count(where);
  }

  @get('/clientes')
  @response(200, {
    description: 'Array of Clientes model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Clientes, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Clientes) filter?: Filter<Clientes>,
  ): Promise<Clientes[]> {
    return this.clientesRepository.find(filter);
  }

  @patch('/clientes')
  @response(200, {
    description: 'Clientes PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Clientes, {partial: true}),
        },
      },
    })
    clientes: Clientes,
    @param.where(Clientes) where?: Where<Clientes>,
  ): Promise<Count> {
    return this.clientesRepository.updateAll(clientes, where);
  }

  @get('/clientes/{id}')
  @response(200, {
    description: 'Clientes model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Clientes, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Clientes, {exclude: 'where'}) filter?: FilterExcludingWhere<Clientes>
  ): Promise<Clientes> {
    return this.clientesRepository.findById(id, filter);
  }

  @patch('/clientes/{id}')
  @response(204, {
    description: 'Clientes PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Clientes, {partial: true}),
        },
      },
    })
    clientes: Clientes,
  ): Promise<void> {
    await this.clientesRepository.updateById(id, clientes);
  }

  @put('/clientes/{id}')
  @response(204, {
    description: 'Clientes PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() clientes: Clientes,
  ): Promise<void> {
    await this.clientesRepository.replaceById(id, clientes);
  }

  @del('/clientes/{id}')
  @response(204, {
    description: 'Clientes DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.clientesRepository.deleteById(id);
  }
}
