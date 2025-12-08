import {Entity, model, property} from '@loopback/repository';

@model({settings: {idInjection: false, mssql: {schema: 'dbo', table: 'Productos'}}})
export class Productos extends Entity {
  @property({
    type: 'number',
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 0,
    generated: 1,
    id: 1,
    mssql: {columnName: 'Id_Producto', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'NO', generated: 1},
  })
  idProducto?: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    mssql: {columnName: 'marca', dataType: 'varchar', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  marca?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    mssql: {columnName: 'modelo', dataType: 'varchar', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  modelo?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 18,
    scale: 2,
    generated: false,
    mssql: {columnName: 'precio_compra', dataType: 'decimal', dataLength: null, dataPrecision: 18, dataScale: 2, nullable: 'YES', generated: false},
  })
  precioCompra?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 18,
    scale: 2,
    generated: false,
    mssql: {columnName: 'precio_venta', dataType: 'decimal', dataLength: null, dataPrecision: 18, dataScale: 2, nullable: 'YES', generated: false},
  })
  precioVenta?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'stock', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  stock?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'stock_minimo', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  stockMinimo?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'stock_maximo', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  stockMaximo?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'Id_proveedor', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  idProveedor?: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    mssql: {columnName: 'categoria', dataType: 'varchar', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  categoria?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 300,
    generated: false,
    mssql: {columnName: 'descripcion', dataType: 'varchar', dataLength: 300, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  descripcion?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: -1,
    generated: false,
    mssql: {columnName: 'urlImagen', dataType: 'varchar', dataLength: -1, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  urlImagen?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Productos>) {
    super(data);
  }
}

export interface ProductosRelations {
  // describe navigational properties here
}

export type ProductosWithRelations = Productos & ProductosRelations;
