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
import {Proveedores} from '../models';
import {ProveedoresRepository} from '../repositories';

export class ProveedoresController {
  constructor(
    @repository(ProveedoresRepository)
    public proveedoresRepository : ProveedoresRepository,
  ) {}

  @post('/proveedores')
  @response(200, {
    description: 'Proveedores model instance',
    content: {'application/json': {schema: getModelSchemaRef(Proveedores)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Proveedores, {
            title: 'NewProveedores',
            
          }),
        },
      },
    })
    proveedores: Proveedores,
  ): Promise<Proveedores> {
    return this.proveedoresRepository.create(proveedores);
  }

  @get('/proveedores/count')
  @response(200, {
    description: 'Proveedores model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Proveedores) where?: Where<Proveedores>,
  ): Promise<Count> {
    return this.proveedoresRepository.count(where);
  }

  @get('/proveedores')
  @response(200, {
    description: 'Array of Proveedores model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Proveedores, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Proveedores) filter?: Filter<Proveedores>,
  ): Promise<Proveedores[]> {
    return this.proveedoresRepository.find(filter);
  }

  @patch('/proveedores')
  @response(200, {
    description: 'Proveedores PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Proveedores, {partial: true}),
        },
      },
    })
    proveedores: Proveedores,
    @param.where(Proveedores) where?: Where<Proveedores>,
  ): Promise<Count> {
    return this.proveedoresRepository.updateAll(proveedores, where);
  }

  @get('/proveedores/{id}')
  @response(200, {
    description: 'Proveedores model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Proveedores, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Proveedores, {exclude: 'where'}) filter?: FilterExcludingWhere<Proveedores>
  ): Promise<Proveedores> {
    return this.proveedoresRepository.findById(id, filter);
  }

  @patch('/proveedores/{id}')
  @response(204, {
    description: 'Proveedores PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Proveedores, {partial: true}),
        },
      },
    })
    proveedores: Proveedores,
  ): Promise<void> {
    await this.proveedoresRepository.updateById(id, proveedores);
  }

  @put('/proveedores/{id}')
  @response(204, {
    description: 'Proveedores PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() proveedores: Proveedores,
  ): Promise<void> {
    await this.proveedoresRepository.replaceById(id, proveedores);
  }

  @del('/proveedores/{id}')
  @response(204, {
    description: 'Proveedores DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.proveedoresRepository.deleteById(id);
  }
}
