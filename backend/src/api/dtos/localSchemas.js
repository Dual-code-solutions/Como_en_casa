// src/api/dtos/localSchemas.js
const { z } = require('zod');

const createLocalSchema = z.object({
  nombreSucursal: z
    .string({ required_error: 'El nombre de la sucursal es requerido' })
    .min(2, 'Nombre muy corto'),
  slug: z
    .string({ required_error: 'El slug es requerido' })
    .min(2, 'Slug muy corto')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  configuracion: z
    .record(z.any())
    .optional()
    .default({})
});

const updateLocalSchema = z.object({
  nombreSucursal: z
    .string()
    .min(2, 'Nombre muy corto')
    .optional(),
  slug: z
    .string()
    .min(2, 'Slug muy corto')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .optional(),
  configuracion: z
    .record(z.any())
    .optional()
});

module.exports = { createLocalSchema, updateLocalSchema };
