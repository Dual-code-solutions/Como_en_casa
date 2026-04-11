// src/application/use-cases/users/CreateUserUseCase.js
const User = require('../../../domain/entities/User');

class CreateUserUseCase {
  constructor({ userRepository }) {
    this.userRepo = userRepository;
  }

  async execute({ email, password, localId, rol, primerNombre,
                  segundoNombre, primerApellido, segundoApellido,
                  telefonoContacto }) {
    // Normalizar rol antes de validar (el frontend envía 'dueno' sin ñ)
    const rolNorm = rol === 'dueno' ? 'dueño' : rol;

    // Validar rol contra la entidad de dominio
    User.validarRol(rolNorm);

    // Verificar que no exista un usuario con ese email
    const existente = await this.userRepo.findByEmail(email);
    if (existente) throw new Error('Ya existe un usuario con ese email');

    // Crear usuario en Supabase Auth + tabla perfiles
    return this.userRepo.create({
      email, password, localId, rol: rolNorm,
      primerNombre, segundoNombre,
      primerApellido, segundoApellido,
      telefonoContacto
    });
  }
}

module.exports = CreateUserUseCase;
