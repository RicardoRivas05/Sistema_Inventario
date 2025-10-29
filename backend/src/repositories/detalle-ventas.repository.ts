import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ConnDataSource} from '../datasources';
import {DetalleVentas, DetalleVentasRelations} from '../models';

export class DetalleVentasRepository extends DefaultCrudRepository<
  DetalleVentas,
  typeof DetalleVentas.prototype.idDetalle,
  DetalleVentasRelations
> {
  constructor(
    @inject('datasources.conn') dataSource: ConnDataSource,
  ) {
    super(DetalleVentas, dataSource);
  }
}
