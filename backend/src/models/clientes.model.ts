import {Entity, model, property} from '@loopback/repository';

@model({settings: {idInjection: false, mssql: {schema: 'dbo', table: 'Clientes'}}})
export class Clientes extends Entity {
  @property({
    type: 'number',
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 0,
    generated: 1,
    id: 1,
    mssql: {columnName: 'Id_cliente', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'NO', generated: 1},
  })
  idCliente?: number;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    mssql: {columnName: 'nombre', dataType: 'varchar', dataLength: 100, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  nombre?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 20,
    generated: false,
    mssql: {columnName: 'telefono', dataType: 'varchar', dataLength: 20, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  telefono?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 100,
    generated: false,
    mssql: {columnName: 'correo', dataType: 'varchar', dataLength: 100, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  correo?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 150,
    generated: false,
    mssql: {columnName: 'direccion', dataType: 'varchar', dataLength: 150, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  direccion?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Clientes>) {
    super(data);
  }
}

export interface ClientesRelations {
  // describe navigational properties here
}

export type ClientesWithRelations = Clientes & ClientesRelations;
