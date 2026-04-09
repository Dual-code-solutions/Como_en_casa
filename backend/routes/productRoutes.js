const express = require('express');
const router = express.Router();
const { createProduct, updateProduct, toggleVisibility, softDeleteProduct } = require('../controllers/productController');

// POST   /api/products/create        → Crear nuevo producto (con imagen + ingredientes)
router.post('/create', createProduct);

// PUT    /api/products/:id/update    → Editar producto existente
router.put('/:id/update', updateProduct);

// PATCH  /api/products/:id/visibility → Alternar visible_menu (true/false)
router.patch('/:id/visibility', toggleVisibility);

// DELETE /api/products/:id           → Borrado lógico (ocultar del menú)
router.delete('/:id', softDeleteProduct);

module.exports = router;
