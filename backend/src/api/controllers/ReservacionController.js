// src/api/controllers/ReservacionController.js

class ReservacionController {
  constructor({ createReservacionUseCase, listReservacionesUseCase,
                updateReservacionUseCase }) {
    this._createReservacion = createReservacionUseCase;
    this._listReservaciones = listReservacionesUseCase;
    this._updateReservacion = updateReservacionUseCase;

    this.create = this.create.bind(this);
    this.list   = this.list.bind(this);
    this.update = this.update.bind(this);
    this.disponibilidad = this.disponibilidad.bind(this);
  }

  // #36 POST /api/reservaciones
  async create(req, res, next) {
    try {
      const reservacion = await this._createReservacion.execute({
        localId:          req.body.localId,
        mesaId:           req.body.mesaId,
        nombreCliente:    req.body.nombreCliente,
        telefono:         req.body.telefono,
        fechaReserva:     req.body.fechaReserva,
        horaReserva:      req.body.horaReserva,
        numPersonas:      req.body.numPersonas,
        notasAdicionales: req.body.notasAdicionales
      });
      res.status(201).json({ success: true, data: reservacion });
    } catch (e) { next(e); }
  }

  // 🟢 GET /api/reservaciones/disponibilidad?localId=&fecha=
  async disponibilidad(req, res, next) {
    try {
      const { localId, fecha } = req.query;
      if (!localId || !fecha) return res.status(400).json({ success: false, message: 'localId y fecha requeridos' });

      const reservaciones = await this._listReservaciones.execute({ localId, fecha });
      // Devuelve solo los slots ocupados (excluyendo canceladas)
      const ocupados = reservaciones
        .filter(r => r.estado !== 'cancelada')
        .map(r => r.horaReserva);

      res.json({ success: true, data: ocupados });
    } catch (e) { next(e); }
  }

  // #37 GET /api/reservaciones
  async list(req, res, next) {
    try {
      // Admin solo ve su local
      const localId = req.userRole === 'admin'
        ? req.userLocalId
        : req.query.localId;

      const reservaciones = await this._listReservaciones.execute({
        localId,
        fecha:  req.query.fecha,
        estado: req.query.estado
      });
      res.json({ success: true, data: reservaciones });
    } catch (e) { next(e); }
  }

  // #38 PATCH /api/reservaciones/:id
  async update(req, res, next) {
    try {
      const reservacion = await this._updateReservacion.execute({
        reservacionId: req.params.id,
        data:          req.body
      });
      res.json({ success: true, data: reservacion });
    } catch (e) { next(e); }
  }
}

module.exports = ReservacionController;
