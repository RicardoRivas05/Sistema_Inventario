import {BackendApplication} from '../application';
import {Client, createRestAppClient} from '@loopback/testlab';

export async function setupApplication(): Promise<AppWithClient> {
  const app = new BackendApplication({
    rest: {
      port: 0,
    },
  });

  await app.boot();
  
  // base de datos en memoria para pruebas
  app.bind('datasources.config.conn').to({
    name: 'conn',
    connector: 'memory'
  });
  
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: BackendApplication;
  client: Client;
}