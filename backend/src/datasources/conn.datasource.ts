import { inject, lifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as dotenv from 'dotenv';

dotenv.config();

// HOST = localhost
const config = {
  name: 'conn',
  connector: 'mssql',
  database: process.env.NAME_DB || '',
  port: parseInt(process.env.PORT_DB || '1433'),
  host: process.env.HOST_DB || 'localhost',
  user: process.env.USER_DB || 'sa',
  password: process.env.PASSWORD_DB || '',
  requestTimeout: 30000,
  options: {
    enableArithAbort: true,
  },
};


@lifeCycleObserver('datasource')
export class ConnDataSource extends juggler.DataSource {
  static dataSourceName = 'conn';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.conn', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
