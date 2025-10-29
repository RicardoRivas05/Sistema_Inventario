import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {idInjection: false, mssql: {schema: 'dbo', table: 'detalle_ventas'}}
})
export class DetalleVentas extends Entity {
  @property({
    type: 'number',
    jsonSchema: {nullable: false},
    precision: 10,
    scale: 0,
    generated: 1,
    id: 1,
    mssql: {columnName: 'Id_detalle', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'NO', generated: 1},
  })
  idDetalle?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 10,
    scale: 0,
    generated: false,
    mssql: {columnName: 'Id_venta', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  idVenta?: number;

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
    mssql: {columnName: 'cantidad', dataType: 'int', dataLength: null, dataPrecision: 10, dataScale: 0, nullable: 'YES', generated: false},
  })
  cantidad?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 18,
    scale: 2,
    generated: false,
    mssql: {columnName: 'precio_unitario', dataType: 'decimal', dataLength: null, dataPrecision: 18, dataScale: 2, nullable: 'YES', generated: false},
  })
  precioUnitario?: number;

  @property({
    type: 'number',
    jsonSchema: {nullable: true},
    precision: 18,
    scale: 2,
    generated: false,
    mssql: {columnName: 'subtotal', dataType: 'decimal', dataLength: null, dataPrecision: 18, dataScale: 2, nullable: 'YES', generated: false},
  })
  subtotal?: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<DetalleVentas>) {
    super(data);
  }
}

export interface DetalleVentasRelations {
  // describe navigational properties here
}

export type DetalleVentasWithRelations = DetalleVentas & DetalleVentasRelations;
