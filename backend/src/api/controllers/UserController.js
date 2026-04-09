// src/api/controllers/UserController.js

class UserController {
  constructor({ listUsersUseCase, getUserUseCase, createUserUseCase,
                updateUserUseCase, toggleUserStatusUseCase }) {
    this._listUsers   = listUsersUseCase;
    this._getUser     = getUserUseCase;
    this._createUser  = createUserUseCase;
    this._updateUser  = updateUserUseCase;
    this._toggleStatus = toggleUserStatusUseCase;

    this.list         = this.list.bind(this);
    this.get          = this.get.bind(this);
    this.create       = this.create.bind(this);
    this.update       = this.update.bind(this);
    this.toggleStatus = this.toggleStatus.bind(this);
  }

  // #04 GET /api/users
  async list(req, res, next) {
    try {
      const users = await this._listUsers.execute({
        userRole:      req.userRole,
        userLocalId:   req.userLocalId,
        filterLocalId: req.query.id_local
      });
      res.json({ success: true, data: users });
    } catch (e) { next(e); }
  }

  // #05 GET /api/users/:id
  async get(req, res, next) {
    try {
      const user = await this._getUser.execute({
        targetUserId: req.params.id,
        userRole:     req.userRole,
        userLocalId:  req.userLocalId
      });
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  }

  // #06 POST /api/users
  async create(req, res, next) {
    try {
      const user = await this._createUser.execute(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (e) { next(e); }
  }

  // #07 PATCH /api/users/:id
  async update(req, res, next) {
    try {
      const user = await this._updateUser.execute({
        targetUserId: req.params.id,
        data:         req.body,
        userRole:     req.userRole,
        userId:       req.userId
      });
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  }

  // #08 PATCH /api/users/:id/toggle-status
  async toggleStatus(req, res, next) {
    try {
      const user = await this._toggleStatus.execute({
        targetUserId: req.params.id
      });
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  }
}

module.exports = UserController;
