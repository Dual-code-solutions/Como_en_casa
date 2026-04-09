const multer = require('multer');
const supabase = require('../config/supabaseClient');

// Multer en memoria: no guarda en disco, manda el buffer directo a Supabase
const upload = multer({ storage: multer.memoryStorage() }).single('imagen_url');

// ─────────────────────────────────────────────
// 1. CREAR PRODUCTO (con imagen y con ingredientes)
// ─────────────────────────────────────────────
const createProduct = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ error: 'Error al procesar la imagen' });

        try {
            const { id_local, id_categoria, nombre, descripcion, precio_base, visible_menu } = req.body;
            let imagen_url = null;

            // 1a. Subir imagen a Supabase Storage (si mandaron una)
            if (req.file) {
                const file = req.file;
                const fileName = `${id_local}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

                const { error: uploadError } = await supabase.storage
                    .from('producto_fotos')
                    .upload(fileName, file.buffer, { contentType: file.mimetype });

                if (uploadError) throw new Error('Error al subir la imagen: ' + uploadError.message);

                const { data: publicUrlData } = supabase.storage
                    .from('producto_fotos')
                    .getPublicUrl(fileName);

                imagen_url = publicUrlData.publicUrl;
            }

            // 1b. Insertar el producto en la tabla
            const { data: productData, error: productError } = await supabase
                .from('productos')
                .insert([{
                    id_local,
                    id_categoria,
                    nombre,
                    descripcion,
                    precio_base: parseFloat(precio_base),
                    imagen_url,
                    visible_menu: visible_menu === 'true',
                    disponible: true
                }])
                .select()
                .single();

            if (productError) throw new Error('Error al guardar el producto: ' + productError.message);

            // 1c. Insertar los ingredientes personalizables (si mandaron)
            const ingredientes = req.body.ingredientes ? JSON.parse(req.body.ingredientes) : [];
            if (ingredientes.length > 0) {
                const ingredientesInsert = ingredientes.map(ing => ({
                    id_producto: productData.id,
                    nombre_ingrediente: ing.nombre,
                    precio_extra: parseFloat(ing.precio_extra || 0),
                    es_base: ing.es_base ?? true,
                    permite_doble: ing.permite_doble ?? false
                }));

                const { error: ingredientsError } = await supabase
                    .from('ingredientes_personalizables')
                    .insert(ingredientesInsert);

                if (ingredientsError) throw new Error('Error al guardar ingredientes: ' + ingredientsError.message);
            }

            res.status(201).json({ message: 'Producto creado exitosamente', producto: productData });

        } catch (error) {
            console.error('❌ createProduct:', error.message);
            res.status(500).json({ error: error.message });
        }
    });
};

// ─────────────────────────────────────────────
// 2. EDITAR PRODUCTO
// ─────────────────────────────────────────────
const updateProduct = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ error: 'Error al procesar la imagen' });

        try {
            const { id } = req.params;
            const { id_categoria, nombre, descripcion, precio_base, visible_menu, imagen_url_existente } = req.body;
            let imagen_url = imagen_url_existente || null; // Mantener la imagen actual si no subieron una nueva

            // 2a. Si mandaron nueva imagen, subirla
            if (req.file) {
                const file = req.file;
                const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

                const { error: uploadError } = await supabase.storage
                    .from('producto_fotos')
                    .upload(fileName, file.buffer, { contentType: file.mimetype });

                if (uploadError) throw new Error('Error al subir la imagen: ' + uploadError.message);

                const { data: publicUrlData } = supabase.storage
                    .from('producto_fotos')
                    .getPublicUrl(fileName);

                imagen_url = publicUrlData.publicUrl;
            }

            // 2b. Actualizar el producto
            const { data: productData, error: productError } = await supabase
                .from('productos')
                .update({
                    id_categoria,
                    nombre,
                    descripcion,
                    precio_base: parseFloat(precio_base),
                    imagen_url,
                    visible_menu: visible_menu === 'true' || visible_menu === true
                })
                .eq('id', id)
                .select()
                .single();

            if (productError) throw new Error('Error al actualizar el producto: ' + productError.message);

            // 2c. Reemplazar ingredientes: borrar los anteriores e insertar los nuevos
            const ingredientes = req.body.ingredientes ? JSON.parse(req.body.ingredientes) : [];

            await supabase.from('ingredientes_personalizables').delete().eq('id_producto', id);

            if (ingredientes.length > 0) {
                const ingredientesInsert = ingredientes.map(ing => ({
                    id_producto: id,
                    nombre_ingrediente: ing.nombre,
                    precio_extra: parseFloat(ing.precio_extra || 0),
                    es_base: ing.es_base ?? true,
                    permite_doble: ing.permite_doble ?? false
                }));

                const { error: ingredientsError } = await supabase
                    .from('ingredientes_personalizables')
                    .insert(ingredientesInsert);

                if (ingredientsError) throw new Error('Error al actualizar ingredientes: ' + ingredientsError.message);
            }

            res.json({ message: 'Producto actualizado', producto: productData });

        } catch (error) {
            console.error('❌ updateProduct:', error.message);
            res.status(500).json({ error: error.message });
        }
    });
};

// ─────────────────────────────────────────────
// 3. ALTERNAR VISIBILIDAD (ocultar / mostrar)
// ─────────────────────────────────────────────
const toggleVisibility = async (req, res) => {
    const { id } = req.params;
    const { visible_menu } = req.body;

    try {
        const { error } = await supabase
            .from('productos')
            .update({ visible_menu })
            .eq('id', id);

        if (error) throw new Error('Error al actualizar visibilidad: ' + error.message);

        res.json({ message: 'Visibilidad actualizada', visible_menu });
    } catch (error) {
        console.error('❌ toggleVisibility:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────
// 4. BORRADO LÓGICO (ocultar + marcar no disponible)
// ─────────────────────────────────────────────
const softDeleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('productos')
            .update({ visible_menu: false, disponible: false })
            .eq('id', id);

        if (error) throw new Error('Error al eliminar el producto: ' + error.message);

        res.json({ message: 'Producto eliminado (borrado lógico)' });
    } catch (error) {
        console.error('❌ softDeleteProduct:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createProduct, updateProduct, toggleVisibility, softDeleteProduct };
