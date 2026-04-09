// src/infrastructure/database/SupabaseUserRepository.js
const UserRepository = require('../../domain/repositories/UserRepository');
const User = require('../../domain/entities/User');
const supabase = require('../config/supabase');

class SupabaseUserRepository extends UserRepository {

  async findAll(filters = {}) {
    let query = supabase
      .from('perfiles')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (filters.localId) {
      query = query.eq('id_local', filters.localId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(row => this._toEntity(row));
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ? this._toEntity(data) : null;
  }

  async create(userData) {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email:             userData.email,
      password:          userData.password,
      email_confirm:     true,
      user_metadata:     { rol: userData.rol }
    });

    if (authError) throw new Error(`Error creando usuario auth: ${authError.message}`);

    // 2. Insertar perfil vinculado al mismo ID
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .insert({
        id:                 authData.user.id,
        id_local:           userData.localId,
        rol:                userData.rol,
        primer_nombre:      userData.primerNombre,
        segundo_nombre:     userData.segundoNombre || null,
        primer_apellido:    userData.primerApellido,
        segundo_apellido:   userData.segundoApellido || null,
        telefono_contacto:  userData.telefonoContacto || null,
        estado_cuenta:      true
      })
      .select()
      .single();

    if (perfilError) throw new Error(`Error creando perfil: ${perfilError.message}`);

    return this._toEntity({ ...perfil, email: userData.email });
  }

  async update(id, data) {
    const updateData = {};
    if (data.primerNombre !== undefined)    updateData.primer_nombre = data.primerNombre;
    if (data.segundoNombre !== undefined)   updateData.segundo_nombre = data.segundoNombre;
    if (data.primerApellido !== undefined)  updateData.primer_apellido = data.primerApellido;
    if (data.segundoApellido !== undefined) updateData.segundo_apellido = data.segundoApellido;
    if (data.telefonoContacto !== undefined) updateData.telefono_contacto = data.telefonoContacto;

    const { data: updated, error } = await supabase
      .from('perfiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(updated);
  }

  async toggleStatus(id, estado) {
    const { data, error } = await supabase
      .from('perfiles')
      .update({ estado_cuenta: estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this._toEntity(data);
  }

  async findByEmail(email) {
    // Buscar en auth.users por email mediante la API admin
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw new Error(error.message);

    const authUser = data.users.find(u => u.email === email);
    if (!authUser) return null;

    return this.findById(authUser.id);
  }

  _toEntity(row) {
    return new User({
      id:               row.id,
      localId:          row.id_local,
      rol:              row.rol,
      primerNombre:     row.primer_nombre,
      segundoNombre:    row.segundo_nombre,
      primerApellido:   row.primer_apellido,
      segundoApellido:  row.segundo_apellido,
      telefonoContacto: row.telefono_contacto,
      estadoCuenta:     row.estado_cuenta,
      email:            row.email || null,
      fechaRegistro:    row.fecha_registro
    });
  }
}

module.exports = SupabaseUserRepository;
