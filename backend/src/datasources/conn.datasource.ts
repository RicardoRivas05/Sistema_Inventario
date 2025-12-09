import { inject, lifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as dotenv from 'dotenv';

dotenv.config();

// HOST = localhost
const config = {
  name: 'conn',
  connector: 'mssql',
  host: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT) || 56136,
  database: process.env.DB_NAME || 'celulares',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '12345678',
  instanceName: 'SQLEXPRESS02', 
  
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate:
      process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    trustedConnection:
      process.env.DB_TRUSTED_CONNECTION === 'true',
    
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
