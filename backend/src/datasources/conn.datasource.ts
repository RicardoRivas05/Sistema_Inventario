import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  name: 'conn',
  connector: 'mssql',
  host: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'SistemaInventario',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    trustedConnection: process.env.DB_TRUSTED_CONNECTION === 'true',
  },
};

@lifeCycleObserver('datasource')
export class ConnDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = 'conn';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.conn', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
