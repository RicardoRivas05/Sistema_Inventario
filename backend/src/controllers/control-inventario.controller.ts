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
import {ControlInventario} from '../models';
import {ControlInventarioRepository} from '../repositories';

export class ControlInventarioController {
  constructor(
    @repository(ControlInventarioRepository)
    public controlInventarioRepository : ControlInventarioRepository,
  ) {}

  @post('/control-inventarios')
  @response(200, {
    description: 'ControlInventario model instance',
    content: {'application/json': {schema: getModelSchemaRef(ControlInventario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ControlInventario, {
            title: 'NewControlInventario',
            
          }),
        },
      },
    })
    controlInventario: ControlInventario,
  ): Promise<ControlInventario> {
    return this.controlInventarioRepository.create(controlInventario);
  }

  @get('/control-inventarios/count')
  @response(200, {
    description: 'ControlInventario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(ControlInventario) where?: Where<ControlInventario>,
  ): Promise<Count> {
    return this.controlInventarioRepository.count(where);
  }

  @get('/control-inventarios')
  @response(200, {
    description: 'Array of ControlInventario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ControlInventario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ControlInventario) filter?: Filter<ControlInventario>,
  ): Promise<ControlInventario[]> {
    return this.controlInventarioRepository.find(filter);
  }

  @patch('/control-inventarios')
  @response(200, {
    description: 'ControlInventario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ControlInventario, {partial: true}),
        },
      },
    })
    controlInventario: ControlInventario,
    @param.where(ControlInventario) where?: Where<ControlInventario>,
  ): Promise<Count> {
    return this.controlInventarioRepository.updateAll(controlInventario, where);
  }

  @get('/control-inventarios/{id}')
  @response(200, {
    description: 'ControlInventario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ControlInventario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ControlInventario, {exclude: 'where'}) filter?: FilterExcludingWhere<ControlInventario>
  ): Promise<ControlInventario> {
    return this.controlInventarioRepository.findById(id, filter);
  }

  @patch('/control-inventarios/{id}')
  @response(204, {
    description: 'ControlInventario PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ControlInventario, {partial: true}),
        },
      },
    })
    controlInventario: ControlInventario,
  ): Promise<void> {
    await this.controlInventarioRepository.updateById(id, controlInventario);
  }

  @put('/control-inventarios/{id}')
  @response(204, {
    description: 'ControlInventario PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() controlInventario: ControlInventario,
  ): Promise<void> {
    await this.controlInventarioRepository.replaceById(id, controlInventario);
  }

  @del('/control-inventarios/{id}')
  @response(204, {
    description: 'ControlInventario DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.controlInventarioRepository.deleteById(id);
  }
}
