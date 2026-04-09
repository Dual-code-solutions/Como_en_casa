// src/application/use-cases/locales/GetLocalUseCase.js

class GetLocalUseCase {
  constructor({ localRepository }) {
    this.localRepo = localRepository;
  }

  async execute({ localId, userRole, userLocalId }) {
    // Admin solo puede ver su propio local
    if (userRole === 'admin' && localId !== userLocalId) {
      throw new Error('Sin permisos para ver este local');
    }

    const local = await this.localRepo.findById(localId);
    if (!local) throw new Error('Local no encontrado');
    return local;
  }
}

module.exports = GetLocalUseCase;
