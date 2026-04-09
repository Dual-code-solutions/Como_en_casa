// src/application/use-cases/locales/ListLocalesUseCase.js

class ListLocalesUseCase {
  constructor({ localRepository }) {
    this.localRepo = localRepository;
  }

  async execute() {
    return this.localRepo.findAll();
  }
}

module.exports = ListLocalesUseCase;
