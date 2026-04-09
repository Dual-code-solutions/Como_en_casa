// src/api/controllers/AuthController.js

class AuthController {
  constructor({ loginUseCase, getMeUseCase }) {
    this._login = loginUseCase;
    this._getMe = getMeUseCase;

    this.login  = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.me     = this.me.bind(this);
  }

  // #01 POST /api/auth/login
  async login(req, res, next) {
    try {
      const result = await this._login.execute(req.body);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  }

  // #02 POST /api/auth/logout
  async logout(req, res) {
    // JWT es stateless, el frontend solo borra el token
    res.json({ success: true, message: 'Sesión cerrada' });
  }

  // #03 GET /api/auth/me
  async me(req, res, next) {
    try {
      const user = await this._getMe.execute({ userId: req.userId });
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  }
}

module.exports = AuthController;
