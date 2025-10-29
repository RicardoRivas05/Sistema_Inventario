import {Entity, model, property} from '@loopback/repository';

@model({settings: {idInjection: false, mssql: {schema: 'dbo', table: 'Ventas'}}})
export class Ventas extends Entity {
  @property({
    type: 'number',
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 0,
    generated: 1,
    id: 1,
    mssql: {columnName: 'Id_venta', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'NO', generated: 1},
  })
  idVenta?: number;

  @property({
    type: 'date',
    jsonSchema: {nullable: true},
    generated: false,
    mssql: {columnName: 'fecha_venta', dataType: 'datetime', dataLength: null, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  fechaVenta?: string;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 18,
    scale: 2,
    generated: false,
    mssql: {columnName: 'total', dataType: 'decimal', dataLength: null, dataPrecision: 18, dataScale: 2, nullable: 'YES', generated: false},
  })
  total?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'Id_cliente', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  idCliente?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'Id_usuario', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  idUsuario?: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    mssql: {columnName: 'estado', dataType: 'varchar', dataLength: 100, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  estado?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Ventas>) {
    super(data);
  }
}

export interface VentasRelations {
  // describe navigational properties here
}

export type VentasWithRelations = Ventas & VentasRelations;
