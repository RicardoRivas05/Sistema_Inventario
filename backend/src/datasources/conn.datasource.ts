import { inject, lifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as dotenv from 'dotenv';

dotenv.config();

// HOST = localhost
const config = {
  name: 'conn',
  connector: 'mssql',
  database: process.env.NAME_DB || 'celulares',
  port: parseInt(process.env.PORT_DB || '1433'),
  host: process.env.HOST_DB || 'YAHIRFER2003',
  user: process.env.USER_DB || 'sa',
  password: process.env.PASSWORD_DB || '12345',
  requestTimeout: 30000,
  options: {
    encrypt: false,
    trustServerCertificate: true,
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
