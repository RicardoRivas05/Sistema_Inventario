import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ConnDataSource} from '../datasources';
import {ControlInventario, ControlInventarioRelations} from '../models';

export class ControlInventarioRepository extends DefaultCrudRepository<
  ControlInventario,
  typeof ControlInventario.prototype.idControl,
  ControlInventarioRelations
> {
  constructor(
    @inject('datasources.conn') dataSource: ConnDataSource,
  ) {
    super(ControlInventario, dataSource);
  }
}
