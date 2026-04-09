// src/api/dtos/authSchemas.js
const { z } = require('zod');

const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('Formato de email inválido'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

module.exports = { loginSchema };
