// src/application/use-cases/locales/DeleteLocalUseCase.js

class DeleteLocalUseCase {
  constructor({ localRepository }) {
    this.localRepo = localRepository;
  }

  async execute({ localId }) {
    const local = await this.localRepo.findById(localId);
    if (!local) throw new Error('Local no encontrado');

    return this.localRepo.delete(localId);
  }
}

module.exports = DeleteLocalUseCase;
