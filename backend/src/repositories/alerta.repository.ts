import {DefaultCrudRepository} from '@loopback/repository';
import {Alerta, AlertaRelations} from '../models';
import {ConnDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AlertaRepository extends DefaultCrudRepository<
  Alerta,
  typeof Alerta.prototype.id,
  AlertaRelations
> {
  constructor(
    @inject('datasources.conn') dataSource: ConnDataSource,
  ) {
    super(Alerta, dataSource);
  }
}