// src/application/use-cases/locales/UpdateLocalUseCase.js

class UpdateLocalUseCase {
  constructor({ localRepository }) {
    this.localRepo = localRepository;
  }

  async execute({ localId, data }) {
    const local = await this.localRepo.findById(localId);
    if (!local) throw new Error('Local no encontrado');

    // Si cambia el slug, verificar que no exista
    if (data.slug && data.slug !== local.slug) {
      const existente = await this.localRepo.findBySlug(data.slug);
      if (existente) throw new Error('Ya existe un local con ese slug');
    }

    return this.localRepo.update(localId, data);
  }
}

module.exports = UpdateLocalUseCase;
