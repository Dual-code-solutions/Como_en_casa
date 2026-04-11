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
    // Normalizar rol: el ENUM de Supabase usa 'dueño' con ñ
    const rolNormalizado = userData.rol === 'dueno' ? 'dueño' : userData.rol;

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email:             userData.email,
      password:          userData.password,
      email_confirm:     true,
      user_metadata:     { rol: rolNormalizado }
    });

    if (authError) throw new Error(`Error creando usuario auth: ${authError.message}`);

    // 2. Insertar perfil — incluye email si la columna ya existe en perfiles
    const perfilData = {
      id:                 authData.user.id,
      id_local:           userData.localId,
      rol:                rolNormalizado,
      email:              userData.email,
      primer_nombre:      userData.primerNombre,
      segundo_nombre:     userData.segundoNombre || null,
      primer_apellido:    userData.primerApellido,
      segundo_apellido:   userData.segundoApellido || null,
      telefono_contacto:  userData.telefonoContacto || null,
      estado_cuenta:      true
    };

    let perfilResult = await supabase.from('perfiles').insert(perfilData).select().single();

    // Si falla por columna email inexistente, reintentar sin ella
    if (perfilResult.error && perfilResult.error.message.includes('email')) {
      console.warn('[UserRepo] Columna email no existe en perfiles, insertando sin ella.');
      const { email: _ignored, ...perfilSinEmail } = perfilData;
      perfilResult = await supabase.from('perfiles').insert(perfilSinEmail).select().single();
    }

    if (perfilResult.error) throw new Error(`Error creando perfil: ${perfilResult.error.message}`);

    return this._toEntity({ ...perfilResult.data, email: userData.email });
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
      email:            row.email || null,
      primerNombre:     row.primer_nombre,
      segundoNombre:    row.segundo_nombre,
      primerApellido:   row.primer_apellido,
      segundoApellido:  row.segundo_apellido,
      telefonoContacto: row.telefono_contacto,
      estadoCuenta:     row.estado_cuenta,
      fechaRegistro:    row.fecha_registro
    });
  }
}

module.exports = SupabaseUserRepository;
