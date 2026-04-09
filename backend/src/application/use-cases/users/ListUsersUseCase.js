// src/application/use-cases/users/ListUsersUseCase.js

class ListUsersUseCase {
  constructor({ userRepository }) {
    this.userRepo = userRepository;
  }

  async execute({ userRole, userLocalId, filterLocalId }) {
    // El dueño puede ver todos, el admin solo los de su local
    const localId = userRole === 'admin' ? userLocalId : filterLocalId;
    return this.userRepo.findAll({ localId });
  }
}

module.exports = ListUsersUseCase;
