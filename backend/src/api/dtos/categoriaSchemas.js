// src/api/dtos/categoriaSchemas.js
const { z } = require('zod');

const createCategoriaSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre de la categoría es requerido' })
    .min(2, 'Nombre muy corto'),
  orden: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .optional()
    .default(0)
});

const updateCategoriaSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Nombre muy corto')
    .optional(),
  orden: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .optional()
});

module.exports = { createCategoriaSchema, updateCategoriaSchema };
