import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, mssql: {schema: 'dbo', table: 'Control_Inventario'}}
})
export class ControlInventario extends Entity {
  @property({
    type: 'number',
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 0,
    generated: 1,
    id: 1,
    mssql: {columnName: 'Id_control', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'NO', generated: 1},
  })
  idControl?: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    mssql: {columnName: 'tipo_movimiento', dataType: 'varchar', dataLength: 100, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  tipoMovimiento?: string;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    mssql: {columnName: 'fecha', dataType: 'date', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  fecha?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'cantidad', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  cantidad?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'Id_producto', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  idProducto?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'Id_usuario', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  idUsuario?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<ControlInventario>) {
    super(data);
  }
}

export interface ControlInventarioRelations {
  // describe navigational properties here
}

export type ControlInventarioWithRelations = ControlInventario & ControlInventarioRelations;
