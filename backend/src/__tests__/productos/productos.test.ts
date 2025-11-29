import {Client, expect} from '@loopback/testlab';
import {BackendApplication} from '../../application';
import {setupApplication} from '../test-helper';

describe('ProductosController', () => {
  let app: BackendApplication;
  let client: Client;

  before(async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('crea producto correctamente', async () => {
    const productoData = {
      marca: 'HP',
      modelo: 'Pavilion Gaming',
      precioCompra: 12000,
      precioVenta: 15000,
      stock: 5,
      stockMinimo: 2,
      stockMaximo: 50,
      idProveedor: 1,
      categoria: 'Tecnología',
      descripcion: 'Laptop gaming HP Pavilion'
    };

    const response = await client
      .post('/productos')
      .send(productoData)
      .expect(200);

    expect(response.body).to.containEql({
      marca: 'HP',
      modelo: 'Pavilion Gaming',
      categoria: 'Tecnología'
    });
  });

  it('lista productos', async () => {
    await client
      .get('/productos')
      .expect(200);
  });
});