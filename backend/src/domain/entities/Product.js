// src/domain/entities/Product.js
// ─────────────────────────────────────────────────────
// Entidad: Producto
// Representa un platillo del menú con sus ingredientes
// personalizables (extras, quitar, doble).
// ─────────────────────────────────────────────────────

class Product {
  constructor({ id, localId, categoriaId, nombre, descripcion,
                precioBase, imagenUrl, disponible = true,
                visibleMenu = true, ingredientes = [], creadoAt }) {
    this.id            = id;
    this.localId       = localId;
    this.categoriaId   = categoriaId;
    this.nombre        = nombre;
    this.descripcion   = descripcion || '';
    this.precioBase    = precioBase;
    this.imagenUrl     = imagenUrl || null;
    this.disponible    = disponible;
    this.visibleMenu   = visibleMenu;
    this.ingredientes  = ingredientes;
    this.creadoAt      = creadoAt || new Date();
  }

  // REGLA: Marcar como agotado (toggle rápido desde el panel admin)
  marcarAgotado() {
    this.disponible = false;
    return this;
  }

  // REGLA: Marcar como disponible nuevamente
  marcarDisponible() {
    this.disponible = true;
    return this;
  }

  // REGLA: Ocultar del menú de la tablet (sin eliminarlo)
  ocultarDelMenu() {
    this.visibleMenu = false;
    return this;
  }

  // REGLA: Mostrar en el menú de la tablet
  mostrarEnMenu() {
    this.visibleMenu = true;
    return this;
  }

  // REGLA: Verificar si el producto se muestra al cliente en la tablet
  // Debe estar disponible Y visible para que aparezca
  esVisibleParaCliente() {
    return this.disponible && this.visibleMenu;
  }

  // REGLA: Calcular el precio con extras aplicados
  // mods = { ingredienteId: 'extra' | 'quitar' | 'normal' }
  calcularPrecioConExtras(mods = {}) {
    let precioFinal = this.precioBase;

    Object.entries(mods).forEach(([ingredienteId, accion]) => {
      if (accion === 'extra') {
        const ingrediente = this.ingredientes.find(i => i.id === ingredienteId);
        if (ingrediente && ingrediente.precioExtra) {
          precioFinal += ingrediente.precioExtra;
        }
      }
      // 'quitar' no afecta el precio, solo se remueve del platillo
    });

    return precioFinal;
  }

  // REGLA: Agregar un ingrediente personalizable al producto
  agregarIngrediente(ingrediente) {
    this.ingredientes.push(ingrediente);
    return this;
  }

  // REGLA: Remover un ingrediente personalizable del producto
  removerIngrediente(ingredienteId) {
    this.ingredientes = this.ingredientes.filter(i => i.id !== ingredienteId);
    return this;
  }
}

/**
 * Sub-entidad: Ingrediente Personalizable
 * Cada producto puede tener varios ingredientes que el cliente
 * puede agregar/quitar desde el modal de la tablet.
 */
class Ingrediente {
  constructor({ id, productoId, nombreIngrediente, precioExtra = 0,
                permiteDoble = true, esBase = true }) {
    this.id                = id;
    this.productoId        = productoId;
    this.nombreIngrediente = nombreIngrediente;
    this.precioExtra       = precioExtra;
    this.permiteDoble      = permiteDoble;
    this.esBase            = esBase;
  }
}

module.exports = { Product, Ingrediente };
