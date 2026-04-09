// src/application/use-cases/users/ToggleUserStatusUseCase.js

class ToggleUserStatusUseCase {
  constructor({ userRepository }) {
    this.userRepo = userRepository;
  }

  async execute({ targetUserId }) {
    const user = await this.userRepo.findById(targetUserId);
    if (!user) throw new Error('Usuario no encontrado');

    // No se puede desactivar al dueño
    if (user.esDueno()) {
      throw new Error('No se puede desactivar la cuenta del dueño');
    }

    const nuevoEstado = !user.estadoCuenta;
    return this.userRepo.toggleStatus(targetUserId, nuevoEstado);
  }
}

module.exports = ToggleUserStatusUseCase;
