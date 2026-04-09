// src/application/use-cases/users/GetUserUseCase.js

class GetUserUseCase {
  constructor({ userRepository }) {
    this.userRepo = userRepository;
  }

  async execute({ targetUserId, userRole, userLocalId }) {
    const user = await this.userRepo.findById(targetUserId);
    if (!user) throw new Error('Usuario no encontrado');

    // Admin solo puede ver usuarios de su local o a sí mismo
    if (userRole === 'admin' && user.localId !== userLocalId && user.id !== targetUserId) {
      throw new Error('Sin permisos para ver este usuario');
    }

    return user;
  }
}

module.exports = GetUserUseCase;
