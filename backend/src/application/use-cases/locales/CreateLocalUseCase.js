// src/application/use-cases/locales/CreateLocalUseCase.js

class CreateLocalUseCase {
  constructor({ localRepository }) {
    this.localRepo = localRepository;
  }

  async execute({ nombreSucursal, slug, configuracion }) {
    // Verificar que el slug no exista
    const existente = await this.localRepo.findBySlug(slug);
    if (existente) throw new Error('Ya existe un local con ese slug');

    return this.localRepo.create({ nombreSucursal, slug, configuracion });
  }
}

module.exports = CreateLocalUseCase;
