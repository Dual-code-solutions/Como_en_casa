-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categorias (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_local uuid,
  nombre text NOT NULL,
  orden integer DEFAULT 0,
  CONSTRAINT categorias_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_id_local_fkey FOREIGN KEY (id_local) REFERENCES public.locales(id)
);
CREATE TABLE public.detalle_pedido (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_pedido uuid,
  id_producto uuid,
  cantidad integer NOT NULL DEFAULT 1,
  personalizacion jsonb DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL,
  CONSTRAINT detalle_pedido_pkey PRIMARY KEY (id),
  CONSTRAINT detalle_pedido_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id),
  CONSTRAINT detalle_pedido_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id)
);
CREATE TABLE public.historial_cortes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_local uuid,
  fecha_corte date DEFAULT CURRENT_DATE,
  total_ingresos_dia numeric NOT NULL,
  conteo_pedidos_local integer DEFAULT 0,
  conteo_pedidos_domicilio integer DEFAULT 0,
  conteo_pedidos_llevar integer DEFAULT 0,
  resumen_metodos_pago jsonb,
  id_admin_cierre uuid,
  cerrado_at timestamp with time zone DEFAULT now(),
  CONSTRAINT historial_cortes_pkey PRIMARY KEY (id),
  CONSTRAINT historial_cortes_id_local_fkey FOREIGN KEY (id_local) REFERENCES public.locales(id)
);
CREATE TABLE public.ingredientes_personalizables (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_producto uuid,
  nombre_ingrediente text NOT NULL,
  precio_extra numeric DEFAULT 0.00,
  permite_doble boolean DEFAULT true,
  es_base boolean DEFAULT true,
  CONSTRAINT ingredientes_personalizables_pkey PRIMARY KEY (id),
  CONSTRAINT ingredientes_personalizables_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id)
);
CREATE TABLE public.locales (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre_sucursal text NOT NULL,
  slug text NOT NULL UNIQUE,
  configuracion jsonb DEFAULT '{}'::jsonb,
  creado_at timestamp with time zone DEFAULT now(),
  CONSTRAINT locales_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mesas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_local uuid NOT NULL,
  nombre_o_numero text NOT NULL,
  capacidad integer NOT NULL,
  estado_actual text DEFAULT 'disponible'::text,
  creado_at timestamp with time zone DEFAULT now(),
  descripcion text,
  CONSTRAINT mesas_pkey PRIMARY KEY (id),
  CONSTRAINT mesas_id_local_fkey FOREIGN KEY (id_local) REFERENCES public.locales(id)
);
CREATE TABLE public.pedidos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_local uuid,
  num_orden_dia integer NOT NULL DEFAULT nextval('pedidos_num_orden_dia_seq'::regclass),
  nombre_cliente text NOT NULL,
  telefono text NOT NULL,
  modalidad USER-DEFINED NOT NULL,
  direccion_envio text,
  referencia_ubicacion text,
  estado USER-DEFINED DEFAULT 'entrante'::estado_pedido,
  tiempo_espera_minutos integer,
  total_pago numeric NOT NULL,
  creado_at timestamp with time zone DEFAULT now(),
  id_mesa uuid,
  motivo_cancelacion text,
  CONSTRAINT pedidos_pkey PRIMARY KEY (id),
  CONSTRAINT pedidos_id_local_fkey FOREIGN KEY (id_local) REFERENCES public.locales(id),
  CONSTRAINT pedidos_id_mesa_fkey FOREIGN KEY (id_mesa) REFERENCES public.mesas(id)
);
CREATE TABLE public.perfiles (
  id uuid NOT NULL,
  id_local uuid,
  rol USER-DEFINED NOT NULL DEFAULT 'admin'::rol_usuario,
  primer_nombre text NOT NULL,
  segundo_nombre text,
  primer_apellido text NOT NULL,
  segundo_apellido text,
  telefono_contacto text,
  estado_cuenta boolean DEFAULT true,
  fecha_registro timestamp with time zone DEFAULT now(),
  email text,
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT perfiles_id_local_fkey FOREIGN KEY (id_local) REFERENCES public.locales(id)
);
CREATE TABLE public.productos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_local uuid,
  id_categoria uuid,
  nombre text NOT NULL,
  descripcion text,
  precio_base numeric NOT NULL,
  imagen_url text,
  disponible boolean DEFAULT true,
  visible_menu boolean DEFAULT true,
  creado_at timestamp with time zone DEFAULT now(),
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT productos_id_local_fkey FOREIGN KEY (id_local) REFERENCES public.locales(id),
  CONSTRAINT productos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id)
);
CREATE TABLE public.reservaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  id_local uuid,
  nombre_cliente text NOT NULL,
  telefono text NOT NULL,
  fecha_reserva date NOT NULL,
  hora_reserva time without time zone NOT NULL,
  num_personas integer NOT NULL,
  notas_adicionales text,
  anticipo_pagado boolean DEFAULT false,
  monto_anticipo numeric DEFAULT 250.00,
  metodo_pago_anticipo text,
  estado USER-DEFINED DEFAULT 'pendiente'::estado_reserva,
  creado_at timestamp with time zone DEFAULT now(),
  id_mesa uuid,
  CONSTRAINT reservaciones_pkey PRIMARY KEY (id),
  CONSTRAINT reservaciones_id_local_fkey FOREIGN KEY (id_local) REFERENCES public.locales(id),
  CONSTRAINT reservaciones_id_mesa_fkey FOREIGN KEY (id_mesa) REFERENCES public.mesas(id)
);