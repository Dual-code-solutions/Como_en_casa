// src/api/dtos/productoSchemas.js
const { z } = require('zod');

// Schema para un ingrediente dentro del array de creación de producto
const ingredienteSchema = z.object({
  nombreIngrediente: z
    .string({ required_error: 'Nombre del ingrediente requerido' })
    .min(2, 'Nombre muy corto'),
  precioExtra: z
    .number()
    .min(0, 'El precio extra no puede ser negativo')
    .optional()
    .default(0),
  permiteDoble: z
    .boolean()
    .optional()
    .default(true),
  esBase: z
    .boolean()
    .optional()
    .default(true)
});

const createProductoSchema = z.object({
  categoriaId: z
    .string()
    .uuid('ID de categoría inválido')
    .optional()
    .nullable(),
  nombre: z
    .string({ required_error: 'El nombre del producto es requerido' })
    .min(2, 'Nombre muy corto'),
  descripcion: z
    .string()
    .optional()
    .nullable(),
  precioBase: z
    .number({ required_error: 'El precio base es requerido' })
    .positive('El precio debe ser mayor a 0'),
  imagenUrl: z
    .string()
    .url('URL de imagen inválida')
    .optional()
    .nullable(),
  disponible: z
    .boolean()
    .optional()
    .default(true),
  visibleMenu: z
    .boolean()
    .optional()
    .default(true),
  ingredientes: z
    .array(ingredienteSchema)
    .optional()
    .default([])
});

const updateProductoSchema = z.object({
  categoriaId: z
    .string()
    .uuid('ID de categoría inválido')
    .optional()
    .nullable(),
  nombre: z
    .string()
    .min(2, 'Nombre muy corto')
    .optional(),
  descripcion: z
    .string()
    .optional()
    .nullable(),
  precioBase: z
    .number()
    .positive('El precio debe ser mayor a 0')
    .optional(),
  imagenUrl: z
    .string()
    .url('URL de imagen inválida')
    .optional()
    .nullable(),
  disponible: z
    .boolean()
    .optional(),
  visibleMenu: z
    .boolean()
    .optional()
});

const toggleDisponibilidadSchema = z.object({
  disponible: z
    .boolean({ required_error: 'El campo disponible es requerido' })
});

const addIngredienteSchema = z.object({
  nombreIngrediente: z
    .string({ required_error: 'Nombre del ingrediente requerido' })
    .min(2, 'Nombre muy corto'),
  precioExtra: z
    .number()
    .min(0, 'El precio extra no puede ser negativo')
    .optional()
    .default(0),
  permiteDoble: z
    .boolean()
    .optional()
    .default(true),
  esBase: z
    .boolean()
    .optional()
    .default(true)
});

const updateIngredienteSchema = z.object({
  nombreIngrediente: z
    .string()
    .min(2, 'Nombre muy corto')
    .optional(),
  precioExtra: z
    .number()
    .min(0, 'El precio extra no puede ser negativo')
    .optional(),
  permiteDoble: z
    .boolean()
    .optional(),
  esBase: z
    .boolean()
    .optional()
});

module.exports = {
  createProductoSchema,
  updateProductoSchema,
  toggleDisponibilidadSchema,
  addIngredienteSchema,
  updateIngredienteSchema
};
