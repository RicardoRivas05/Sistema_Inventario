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
import {Productos} from '../models';
import {ProductosRepository} from '../repositories';

export class ProductosController {
  constructor(
    @repository(ProductosRepository)
    public productosRepository : ProductosRepository,
  ) {}

  @post('/productos')
  @response(200, {
    description: 'Productos model instance',
    content: {'application/json': {schema: getModelSchemaRef(Productos)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Productos, {
            title: 'NewProductos',
            
          }),
        },
      },
    })
    productos: Productos,
  ): Promise<Productos> {
    return this.productosRepository.create(productos);
  }

  @get('/productos/count')
  @response(200, {
    description: 'Productos model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Productos) where?: Where<Productos>,
  ): Promise<Count> {
    return this.productosRepository.count(where);
  }

  @get('/productos')
  @response(200, {
    description: 'Array of Productos model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Productos, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Productos) filter?: Filter<Productos>,
  ): Promise<Productos[]> {
    console.log("Filter recibido en find:", filter);
    return this.productosRepository.find(filter);
  }

  @get('/productos/page')
  @response(200, {
    description: 'Array of Productos model instances paginated',
  })
  async dataPaginate(
    @param.query.number('page', {default: 1} ) page: number,
    @param.query.number('limit', {default: 10} ) limit: number,
  ){
    return this.productosRepository.find({
      skip: (page - 1) * limit,
      limit: limit,
    });
  }

  @patch('/productos')
  @response(200, {
    description: 'Productos PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Productos, {partial: true}),
        },
      },
    })
    productos: Productos,
    @param.where(Productos) where?: Where<Productos>,
  ): Promise<Count> {
    return this.productosRepository.updateAll(productos, where);
  }

  @get('/productos/{id}')
  @response(200, {
    description: 'Productos model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Productos, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Productos, {exclude: 'where'}) filter?: FilterExcludingWhere<Productos>
  ): Promise<any> {
    const producto = await this.productosRepository.findById(id, filter);

    return {
      success: true,
      data: producto,
    }
  }

  @patch('/productos/{id}')
  @response(204, {
    description: 'Productos PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Productos, {partial: true}),
        },
      },
    })
    productos: Productos,
  ): Promise<void> {
    await this.productosRepository.updateById(id, productos);
  }

  @put('/productos/{id}')
  @response(204, {
    description: 'Productos PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() productos: Productos,
  ): Promise<void> {
    await this.productosRepository.replaceById(id, productos);
  }

  @del('/productos/{id}')
  @response(204, {
    description: 'Productos DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.productosRepository.deleteById(id);
  }
}
