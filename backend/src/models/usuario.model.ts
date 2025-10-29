import {Entity, model, property} from '@loopback/repository';

@model({settings: {idInjection: false, mssql: {schema: 'dbo', table: 'Usuario'}}})
export class Usuario extends Entity {
  @property({
    type: 'number',
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 0,
    generated: 1,
    id: 1,
    mssql: {columnName: 'Id_usuario', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'NO', generated: 1},
  })
  idUsuario?: number;

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
    length: 50,
    generated: false,
    mssql: {columnName: 'usuario', dataType: 'varchar', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  usuario?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 255,
    generated: false,
    mssql: {columnName: 'password', dataType: 'varchar', dataLength: 255, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  password?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 50,
    generated: false,
    mssql: {columnName: 'rol', dataType: 'varchar', dataLength: 50, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  rol?: string;

  @property({
    type: 'string',
    jsonSchema: {nullable: true},
    length: 250,
    generated: false,
    mssql: {columnName: 'correo', dataType: 'varchar', dataLength: 250, dataPrecision: null, dataScale: null, nullable: 'YES', generated: false},
  })
  correo?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Usuario>) {
    super(data);
  }
}

export interface UsuarioRelations {
  // describe navigational properties here
}

export type UsuarioWithRelations = Usuario & UsuarioRelations;
