// src/api/dtos/reservacionSchemas.js
const { z } = require('zod');

const createReservacionSchema = z.object({
  localId: z
    .string({ required_error: 'El ID del local es requerido' })
    .uuid('ID de local inválido'),
  mesaId: z
    .string()
    .uuid('ID de mesa inválido')
    .optional()
    .nullable(),
  nombreCliente: z
    .string({ required_error: 'El nombre del cliente es requerido' })
    .min(2, 'Nombre muy corto'),
  telefono: z
    .string({ required_error: 'El teléfono es requerido' })
    .min(10, 'Teléfono debe tener al menos 10 dígitos'),
  fechaReserva: z
    .string({ required_error: 'La fecha de reserva es requerida' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Usar YYYY-MM-DD'),
  horaReserva: z
    .string({ required_error: 'La hora de reserva es requerida' })
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato de hora inválido. Usar HH:MM'),
  numPersonas: z
    .number({ required_error: 'El número de personas es requerido' })
    .int('Debe ser un número entero')
    .positive('Debe ser al menos 1 persona'),
  notasAdicionales: z
    .string()
    .optional()
    .nullable()
});

const updateReservacionSchema = z.object({
  estado: z
    .enum(['pendiente', 'aceptada', 'cancelada'])
    .optional(),
  anticipoPagado: z
    .boolean()
    .optional(),
  montoAnticipo: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .optional(),
  metodoPagoAnticipo: z
    .string()
    .optional()
    .nullable(),
  mesaId: z
    .string()
    .uuid('ID de mesa inválido')
    .optional()
    .nullable()
});

module.exports = { createReservacionSchema, updateReservacionSchema };
