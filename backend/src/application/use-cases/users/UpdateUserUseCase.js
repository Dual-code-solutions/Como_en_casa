// src/application/use-cases/users/UpdateUserUseCase.js

class UpdateUserUseCase {
  constructor({ userRepository }) {
    this.userRepo = userRepository;
  }

  async execute({ targetUserId, data, userRole, userId }) {
    // Admin solo puede editar su propio perfil
    if (userRole === 'admin' && targetUserId !== userId) {
      throw new Error('Solo puedes editar tu propio perfil');
    }

    const user = await this.userRepo.findById(targetUserId);
    if (!user) throw new Error('Usuario no encontrado');

    return this.userRepo.update(targetUserId, data);
  }
}

module.exports = UpdateUserUseCase;
