// src/api/dtos/mesaSchemas.js
const { z } = require('zod');

const createMesaSchema = z.object({
  nombre_o_numero: z
    .string({ required_error: 'El nombre o número de mesa es requerido' })
    .min(1, 'El nombre de mesa no puede estar vacío'),
  capacidad: z
    .number({ required_error: 'La capacidad es requerida' })
    .int('La capacidad debe ser un número entero')
    .positive('La capacidad debe ser mayor a 0')
});

const updateMesaSchema = z.object({
  nombre_o_numero: z
    .string()
    .min(1, 'El nombre de mesa no puede estar vacío')
    .optional(),
  capacidad: z
    .number()
    .int('La capacidad debe ser un número entero')
    .positive('La capacidad debe ser mayor a 0')
    .optional()
});

const updateEstadoMesaSchema = z.object({
  estado_actual: z
    .enum(['disponible', 'ocupada'], {
      required_error: 'El estado es requerido',
      invalid_type_error: 'Estado inválido. Debe ser: disponible u ocupada'
    })
});

module.exports = { createMesaSchema, updateMesaSchema, updateEstadoMesaSchema };
