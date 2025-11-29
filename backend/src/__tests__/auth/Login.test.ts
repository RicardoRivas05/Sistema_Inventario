import {Client, expect} from '@loopback/testlab';
import {BackendApplication} from '../../application';
import {setupApplication} from '../test-helper';

describe('AuthController', () => {
  let app: BackendApplication;
  let client: Client;

  before(async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('falla con credenciales incorrectas', async () => {
    await client
      .post('/auth/login')
      .send({
        correo: 'noexiste@test.com',
        password: 'wrongpass'
      })
      .expect(401);
  });
});