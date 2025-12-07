import {Client, expect} from '@loopback/testlab';
import {BackendApplication} from '../../application';
import {setupApplication} from '../test-helper';

describe('AlertasController', () => {
  let app: BackendApplication;
  let client: Client;

  before(async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('crea alerta correctamente', async () => {
    const alertaData = {
      tipo: 'stock_bajo',
      mensaje: 'Stock bajo producto X',
      prioridad: 'alta',
      estado: 'pendiente'
    };

    const response = await client
      .post('/alertas')
      .send(alertaData)
      .expect(200);

    expect(response.body).to.containEql(alertaData);
  });

  it('obtiene alertas pendientes', async () => {
    await client
      .get('/alertas/pendientes')
      .expect(200);
  });
});