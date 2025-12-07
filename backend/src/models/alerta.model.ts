import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    strict: false,
  },
})
export class Alerta extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: ['stock_bajo', 'vencimiento', 'error_sistema', 'general'],
    },
  })
  tipo: string;

  @property({
    type: 'string',
    required: true,
  })
  mensaje: string;

  @property({
    type: 'string',
    default: 'media',
    jsonSchema: {
      enum: ['baja', 'media', 'alta', 'critica'],
    },
  })
  prioridad?: string;

  @property({
    type: 'string',
    default: 'pendiente',
    jsonSchema: {
      enum: ['pendiente', 'leida', 'resuelta'],
    },
  })
  estado?: string;

  @property({
    type: 'number',
  })
  productoId?: number;

  @property({
    type: 'number',
  })
  usuarioId?: number;

  @property({
    type: 'date',
    default: '$now',
  })
  fechaCreacion?: string;

  @property({
    type: 'date',
  })
  fechaResolucion?: string;

  constructor(data?: Partial<Alerta>) {
    super(data);
  }
}

export interface AlertaRelations {

}

export type AlertaWithRelations = Alerta & AlertaRelations;