// src/application/use-cases/auth/GetMeUseCase.js

class GetMeUseCase {
  constructor({ userRepository }) {
    this.userRepo = userRepository;
  }

  async execute({ userId }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }
}

module.exports = GetMeUseCase;
