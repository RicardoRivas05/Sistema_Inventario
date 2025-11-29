import {injectable} from '@loopback/core';

@injectable()
export class NotificacionService {
  
  async enviarNotificacionEmail(destinatario: string, asunto: string, mensaje: string) {
    console.log(` EMAIL enviado a: ${destinatario}`);
    console.log(`Asunto: ${asunto}`);
    console.log(`Mensaje: ${mensaje}`);
    return {enviado: true, metodo: 'email'};
  }

  async enviarNotificacionSistema(usuarioId: number, titulo: string, mensaje: string) {
    console.log(`🔔 NOTIFICACIÓN SISTEMA para usuario: ${usuarioId}`);
    console.log(`Título: ${titulo}`);
    console.log(`Mensaje: ${mensaje}`);
    return {enviado: true, metodo: 'sistema'};
  }

  async enviarNotificacionStockBajo(productoId: number, productoNombre: string, stockActual: number) {
    const asunto = ` Stock Bajo - ${productoNombre}`;
    const mensaje = `El producto ${productoNombre} tiene stock bajo: ${stockActual} unidades. Por favor, reponer inventario.`;
    
    return this.enviarNotificacionEmail('inventario@empresa.com', asunto, mensaje);
  }

  async enviarNotificacionVencimiento(productoId: number, productoNombre: string, diasRestantes: number) {
    const asunto = ` Producto por Vencer - ${productoNombre}`;
    const mensaje = `El producto ${productoNombre} vence en ${diasRestantes} días. Tomar las acciones necesarias.`;
    
    return this.enviarNotificacionEmail('inventario@empresa.com', asunto, mensaje);
  }
}