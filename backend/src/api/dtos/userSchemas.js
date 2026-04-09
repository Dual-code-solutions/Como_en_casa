// src/api/dtos/userSchemas.js
const { z } = require('zod');

const createUserSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('Formato de email inválido'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  localId: z
    .string()
    .uuid('ID de local inválido')
    .optional()
    .nullable(),
  rol: z
    .enum(['dueño', 'admin'], { required_error: 'El rol es requerido' }),
  primerNombre: z
    .string({ required_error: 'El primer nombre es requerido' })
    .min(2, 'Nombre muy corto'),
  segundoNombre: z
    .string()
    .optional()
    .nullable(),
  primerApellido: z
    .string({ required_error: 'El primer apellido es requerido' })
    .min(2, 'Apellido muy corto'),
  segundoApellido: z
    .string()
    .optional()
    .nullable(),
  telefonoContacto: z
    .string()
    .min(10, 'Teléfono debe tener al menos 10 dígitos')
    .optional()
    .nullable()
});

const updateUserSchema = z.object({
  primerNombre: z
    .string()
    .min(2, 'Nombre muy corto')
    .optional(),
  segundoNombre: z
    .string()
    .optional()
    .nullable(),
  primerApellido: z
    .string()
    .min(2, 'Apellido muy corto')
    .optional(),
  segundoApellido: z
    .string()
    .optional()
    .nullable(),
  telefonoContacto: z
    .string()
    .min(10, 'Teléfono debe tener al menos 10 dígitos')
    .optional()
    .nullable()
});

module.exports = { createUserSchema, updateUserSchema };
