// src/api/dtos/orderSchemas.js
const { z } = require('zod');

const confirmOrderSchema = z.object({
  localId: z
    .string({ required_error: 'El ID del local es requerido' })
    .uuid('ID de local inválido'),
  deliveryType: z
    .enum(['local', 'domicilio', 'llevar'], {
      required_error: 'El tipo de entrega es requerido',
      invalid_type_error: 'Tipo de entrega inválido. Debe ser: local, domicilio o llevar'
    }),
  total: z
    .number({ required_error: 'El total es requerido' })
    .positive('El total debe ser mayor a 0'),
  customer: z.object({
    name: z
      .string({ required_error: 'El nombre del cliente es requerido' })
      .min(2, 'Nombre muy corto'),
    phone: z
      .string({ required_error: 'El teléfono es requerido' })
      .min(10, 'Teléfono debe tener al menos 10 dígitos'),
    table: z
      .string()
      .uuid('ID de mesa inválido')
      .optional()
      .nullable(),
    address: z
      .string()
      .optional()
      .nullable(),
    landmark: z
      .string()
      .optional()
      .nullable()
  }),
  cart: z
    .array(z.object({
      id: z
        .string({ required_error: 'ID del producto requerido' })
        .uuid('ID de producto inválido'),
      quantity: z
        .number({ required_error: 'La cantidad es requerida' })
        .int('La cantidad debe ser un entero')
        .positive('La cantidad debe ser mayor a 0'),
      mods: z
        .any()
        .optional(),
      subtotal: z
        .number({ required_error: 'El subtotal es requerido' })
        .positive('El subtotal debe ser mayor a 0')
    }))
    .min(1, 'El carrito no puede estar vacío')
});

const updateEstadoSchema = z.object({
  estado: z
    .enum(['cocina', 'listo', 'finalizado'], {
      required_error: 'El nuevo estado es requerido',
      invalid_type_error: 'Estado inválido. Debe ser: cocina, listo o finalizado'
    })
});

module.exports = { confirmOrderSchema, updateEstadoSchema };
