// src/app.js
// ─────────────────────────────────────────────────────
// ENSAMBLAJE DE LA APLICACIÓN
// ─────────────────────────────────────────────────────
// Aquí se realiza toda la Inyección de Dependencias:
//   1. Se crean los repositorios (implementaciones Supabase)
//   2. Se crean los use cases pasándoles los repositorios
//   3. Se crean los controllers pasándoles los use cases
//   4. Se crean las rutas pasándoles los controllers
//   5. Se montan las rutas en Express
//
// Ningún archivo importa directamente una implementación
// concreta excepto ESTE archivo. Si cambias Supabase por
// Firebase, solo editas este archivo.
// ─────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// ── Middlewares globales ──
const requestLogger = require('./api/middlewares/requestLogger');
const errorMiddleware = require('./api/middlewares/errorMiddleware');

// ── Repositorios (implementaciones Supabase) ──
const SupabaseOrderRepository       = require('./infrastructure/database/SupabaseOrderRepository');
const SupabaseMesaRepository        = require('./infrastructure/database/SupabaseMesaRepository');
const SupabaseUserRepository        = require('./infrastructure/database/SupabaseUserRepository');
const SupabaseLocalRepository       = require('./infrastructure/database/SupabaseLocalRepository');
const SupabaseProductRepository     = require('./infrastructure/database/SupabaseProductRepository');
const SupabaseCategoryRepository    = require('./infrastructure/database/SupabaseCategoryRepository');
const SupabaseReservationRepository = require('./infrastructure/database/SupabaseReservationRepository');
const SupabaseCorteRepository       = require('./infrastructure/database/SupabaseCorteRepository');

// ── Use Cases ──
const LoginUseCase              = require('./application/use-cases/auth/LoginUseCase');
const GetMeUseCase              = require('./application/use-cases/auth/GetMeUseCase');
const ListUsersUseCase          = require('./application/use-cases/users/ListUsersUseCase');
const GetUserUseCase            = require('./application/use-cases/users/GetUserUseCase');
const CreateUserUseCase         = require('./application/use-cases/users/CreateUserUseCase');
const UpdateUserUseCase         = require('./application/use-cases/users/UpdateUserUseCase');
const ToggleUserStatusUseCase   = require('./application/use-cases/users/ToggleUserStatusUseCase');
const ListLocalesUseCase        = require('./application/use-cases/locales/ListLocalesUseCase');
const GetLocalUseCase           = require('./application/use-cases/locales/GetLocalUseCase');
const CreateLocalUseCase        = require('./application/use-cases/locales/CreateLocalUseCase');
const UpdateLocalUseCase        = require('./application/use-cases/locales/UpdateLocalUseCase');
const DeleteLocalUseCase        = require('./application/use-cases/locales/DeleteLocalUseCase');
const ListMesasUseCase          = require('./application/use-cases/mesas/ListMesasUseCase');
const CreateMesaUseCase         = require('./application/use-cases/mesas/CreateMesaUseCase');
const UpdateMesaUseCase         = require('./application/use-cases/mesas/UpdateMesaUseCase');
const ChangeMesaEstadoUseCase   = require('./application/use-cases/mesas/ChangeMesaEstadoUseCase');
const DeleteMesaUseCase         = require('./application/use-cases/mesas/DeleteMesaUseCase');
const ListCategoriasUseCase     = require('./application/use-cases/categorias/ListCategoriasUseCase');
const CreateCategoriaUseCase    = require('./application/use-cases/categorias/CreateCategoriaUseCase');
const UpdateCategoriaUseCase    = require('./application/use-cases/categorias/UpdateCategoriaUseCase');
const DeleteCategoriaUseCase    = require('./application/use-cases/categorias/DeleteCategoriaUseCase');
const ListProductosUseCase      = require('./application/use-cases/productos/ListProductosUseCase');
const GetProductoUseCase        = require('./application/use-cases/productos/GetProductoUseCase');
const CreateProductoUseCase     = require('./application/use-cases/productos/CreateProductoUseCase');
const UpdateProductoUseCase     = require('./application/use-cases/productos/UpdateProductoUseCase');
const ToggleDisponibilidadUseCase = require('./application/use-cases/productos/ToggleDisponibilidadUseCase');
const DeleteProductoUseCase     = require('./application/use-cases/productos/DeleteProductoUseCase');
const AddIngredienteUseCase     = require('./application/use-cases/productos/AddIngredienteUseCase');
const UpdateIngredienteUseCase  = require('./application/use-cases/productos/UpdateIngredienteUseCase');
const DeleteIngredienteUseCase  = require('./application/use-cases/productos/DeleteIngredienteUseCase');
const ConfirmOrderUseCase       = require('./application/use-cases/orders/ConfirmOrderUseCase');
const ListOrdersUseCase         = require('./application/use-cases/orders/ListOrdersUseCase');
const GetOrderUseCase           = require('./application/use-cases/orders/GetOrderUseCase');
const UpdateOrderEstadoUseCase  = require('./application/use-cases/orders/UpdateOrderEstadoUseCase');
const CreateReservacionUseCase  = require('./application/use-cases/reservaciones/CreateReservacionUseCase');
const ListReservacionesUseCase  = require('./application/use-cases/reservaciones/ListReservacionesUseCase');
const UpdateReservacionUseCase  = require('./application/use-cases/reservaciones/UpdateReservacionUseCase');
const GenerarCorteUseCase       = require('./application/use-cases/cortes/GenerarCorteUseCase');
const ListCortesUseCase         = require('./application/use-cases/cortes/ListCortesUseCase');
const GetCorteUseCase           = require('./application/use-cases/cortes/GetCorteUseCase');

// ── Controllers ──
const AuthController        = require('./api/controllers/AuthController');
const UserController        = require('./api/controllers/UserController');
const LocalController       = require('./api/controllers/LocalController');
const MesaController        = require('./api/controllers/MesaController');
const CategoriaController   = require('./api/controllers/CategoriaController');
const ProductoController    = require('./api/controllers/ProductoController');
const OrderController       = require('./api/controllers/OrderController');
const ReservacionController = require('./api/controllers/ReservacionController');
const CorteController       = require('./api/controllers/CorteController');

// ── Routes ──
const authRoutes        = require('./api/routes/authRoutes');
const userRoutes        = require('./api/routes/userRoutes');
const localRoutes       = require('./api/routes/localRoutes');
const mesaRoutes        = require('./api/routes/mesaRoutes');
const categoriaRoutes   = require('./api/routes/categoriaRoutes');
const productoRoutes    = require('./api/routes/productoRoutes');
const orderRoutes       = require('./api/routes/orderRoutes');
const reservacionRoutes = require('./api/routes/reservacionRoutes');
const corteRoutes       = require('./api/routes/corteRoutes');

// ─────────────────────────────────────────────────────
// Swagger Configuration
// ─────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Como en Casa — API',
      version: '1.0.0',
      description: 'API REST del sistema de kiosko/tablet para restaurante "Como en Casa". Incluye gestión de pedidos, mesas, productos, reservaciones, cortes de caja y autenticación.',
      contact: {
        name: 'Dual Code Solutions',
        email: 'serviciodualcodesolutions.devs@gmail.com'
      }
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desarrollo local' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido de POST /api/auth/login'
        }
      }
    },
    tags: [
      { name: 'Auth',          description: 'Autenticación y sesión' },
      { name: 'Users',         description: 'Gestión de usuarios/perfiles' },
      { name: 'Locales',       description: 'Gestión de sucursales' },
      { name: 'Mesas',         description: 'Gestión de mesas del restaurante' },
      { name: 'Categorías',    description: 'Categorías del menú' },
      { name: 'Productos',     description: 'Productos del menú con ingredientes' },
      { name: 'Pedidos',       description: 'Pedidos desde la tablet y Kanban' },
      { name: 'Reservaciones', description: 'Reservaciones con anticipo' },
      { name: 'Cortes',        description: 'Cortes de caja diarios' }
    ]
  },
  apis: ['./src/api/docs/*.yaml']
};

// ─────────────────────────────────────────────────────
// createApp(io): Función de ensamblaje
// Recibe la instancia de Socket.IO de server.js
// ─────────────────────────────────────────────────────
function createApp(io) {
  const app = express();

  // ═══════════════════════════════════════════════════
  // 1. MIDDLEWARES GLOBALES
  // ═══════════════════════════════════════════════════
  app.use(helmet());
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : '*',
    credentials: true
  }));
  app.use(express.json({ limit: '5mb' }));
  app.use(requestLogger);

  // ═══════════════════════════════════════════════════
  // 2. SWAGGER DOCS
  // ═══════════════════════════════════════════════════
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Como en Casa — API Docs'
  }));

  // ═══════════════════════════════════════════════════
  // 3. INYECCIÓN DE DEPENDENCIAS
  // ═══════════════════════════════════════════════════

  // 3a. Repositorios
  const orderRepo       = new SupabaseOrderRepository();
  const mesaRepo        = new SupabaseMesaRepository();
  const userRepo        = new SupabaseUserRepository();
  const localRepo       = new SupabaseLocalRepository();
  const productRepo     = new SupabaseProductRepository();
  const categoryRepo    = new SupabaseCategoryRepository();
  const reservationRepo = new SupabaseReservationRepository();
  const corteRepo       = new SupabaseCorteRepository();

  // 3b. Use Cases (inyectando repos + io)
  const loginUC               = new LoginUseCase();
  const getMeUC               = new GetMeUseCase({ userRepository: userRepo });
  const listUsersUC           = new ListUsersUseCase({ userRepository: userRepo });
  const getUserUC             = new GetUserUseCase({ userRepository: userRepo });
  const createUserUC          = new CreateUserUseCase({ userRepository: userRepo });
  const updateUserUC          = new UpdateUserUseCase({ userRepository: userRepo });
  const toggleUserStatusUC    = new ToggleUserStatusUseCase({ userRepository: userRepo });
  const listLocalesUC         = new ListLocalesUseCase({ localRepository: localRepo });
  const getLocalUC            = new GetLocalUseCase({ localRepository: localRepo });
  const createLocalUC         = new CreateLocalUseCase({ localRepository: localRepo });
  const updateLocalUC         = new UpdateLocalUseCase({ localRepository: localRepo });
  const deleteLocalUC         = new DeleteLocalUseCase({ localRepository: localRepo });
  const listMesasUC           = new ListMesasUseCase({ mesaRepository: mesaRepo });
  const createMesaUC          = new CreateMesaUseCase({ mesaRepository: mesaRepo });
  const updateMesaUC          = new UpdateMesaUseCase({ mesaRepository: mesaRepo });
  const changeMesaEstadoUC    = new ChangeMesaEstadoUseCase({ mesaRepository: mesaRepo, socketIO: io });
  const deleteMesaUC          = new DeleteMesaUseCase({ mesaRepository: mesaRepo });
  const listCategoriasUC      = new ListCategoriasUseCase({ categoryRepository: categoryRepo });
  const createCategoriaUC     = new CreateCategoriaUseCase({ categoryRepository: categoryRepo });
  const updateCategoriaUC     = new UpdateCategoriaUseCase({ categoryRepository: categoryRepo });
  const deleteCategoriaUC     = new DeleteCategoriaUseCase({ categoryRepository: categoryRepo });
  const listProductosUC       = new ListProductosUseCase({ productRepository: productRepo });
  const getProductoUC         = new GetProductoUseCase({ productRepository: productRepo });
  const createProductoUC      = new CreateProductoUseCase({ productRepository: productRepo });
  const updateProductoUC      = new UpdateProductoUseCase({ productRepository: productRepo });
  const toggleDisponibilidadUC = new ToggleDisponibilidadUseCase({ productRepository: productRepo });
  const deleteProductoUC      = new DeleteProductoUseCase({ productRepository: productRepo });
  const addIngredienteUC      = new AddIngredienteUseCase({ productRepository: productRepo });
  const updateIngredienteUC   = new UpdateIngredienteUseCase({ productRepository: productRepo });
  const deleteIngredienteUC   = new DeleteIngredienteUseCase({ productRepository: productRepo });
  const confirmOrderUC        = new ConfirmOrderUseCase({ orderRepository: orderRepo, mesaRepository: mesaRepo, socketIO: io });
  const listOrdersUC          = new ListOrdersUseCase({ orderRepository: orderRepo });
  const getOrderUC            = new GetOrderUseCase({ orderRepository: orderRepo });
  const updateOrderEstadoUC   = new UpdateOrderEstadoUseCase({ orderRepository: orderRepo, mesaRepository: mesaRepo, socketIO: io });
  const createReservacionUC   = new CreateReservacionUseCase({ reservationRepository: reservationRepo, mesaRepository: mesaRepo, socketIO: io });
  const listReservacionesUC   = new ListReservacionesUseCase({ reservationRepository: reservationRepo });
  const updateReservacionUC   = new UpdateReservacionUseCase({ reservationRepository: reservationRepo, socketIO: io });
  const generarCorteUC        = new GenerarCorteUseCase({ corteRepository: corteRepo, orderRepository: orderRepo });
  const listCortesUC          = new ListCortesUseCase({ corteRepository: corteRepo });
  const getCorteUC            = new GetCorteUseCase({ corteRepository: corteRepo });

  // 3c. Controllers (inyectando use cases)
  const authCtrl = new AuthController({
    loginUseCase: loginUC, getMeUseCase: getMeUC
  });
  const userCtrl = new UserController({
    listUsersUseCase: listUsersUC, getUserUseCase: getUserUC,
    createUserUseCase: createUserUC, updateUserUseCase: updateUserUC,
    toggleUserStatusUseCase: toggleUserStatusUC
  });
  const localCtrl = new LocalController({
    listLocalesUseCase: listLocalesUC, getLocalUseCase: getLocalUC,
    createLocalUseCase: createLocalUC, updateLocalUseCase: updateLocalUC,
    deleteLocalUseCase: deleteLocalUC
  });
  const mesaCtrl = new MesaController({
    listMesasUseCase: listMesasUC, createMesaUseCase: createMesaUC,
    updateMesaUseCase: updateMesaUC, changeMesaEstadoUseCase: changeMesaEstadoUC,
    deleteMesaUseCase: deleteMesaUC
  });
  const categoriaCtrl = new CategoriaController({
    listCategoriasUseCase: listCategoriasUC, createCategoriaUseCase: createCategoriaUC,
    updateCategoriaUseCase: updateCategoriaUC, deleteCategoriaUseCase: deleteCategoriaUC
  });
  const productoCtrl = new ProductoController({
    listProductosUseCase: listProductosUC, getProductoUseCase: getProductoUC,
    createProductoUseCase: createProductoUC, updateProductoUseCase: updateProductoUC,
    toggleDisponibilidadUseCase: toggleDisponibilidadUC, deleteProductoUseCase: deleteProductoUC,
    addIngredienteUseCase: addIngredienteUC, updateIngredienteUseCase: updateIngredienteUC,
    deleteIngredienteUseCase: deleteIngredienteUC
  });
  const orderCtrl = new OrderController({
    confirmOrderUseCase: confirmOrderUC, listOrdersUseCase: listOrdersUC,
    getOrderUseCase: getOrderUC, updateOrderEstadoUseCase: updateOrderEstadoUC
  });
  const reservacionCtrl = new ReservacionController({
    createReservacionUseCase: createReservacionUC,
    listReservacionesUseCase: listReservacionesUC,
    updateReservacionUseCase: updateReservacionUC
  });
  const corteCtrl = new CorteController({
    generarCorteUseCase: generarCorteUC, listCortesUseCase: listCortesUC,
    getCorteUseCase: getCorteUC
  });

  // ═══════════════════════════════════════════════════
  // 4. MONTAJE DE RUTAS
  // ═══════════════════════════════════════════════════
  // ⚠️  IMPORTANTE: Las subrutas de /api/locales/:localId/...
  // deben montarse ANTES de localRoutes para que Express
  // no las intercepte con el authMiddleware de localRoutes.
  app.use('/api/locales/:localId/mesas',      mesaRoutes(mesaCtrl));
  app.use('/api/locales/:localId/categorias', categoriaRoutes(categoriaCtrl));
  app.use('/api/locales/:localId/productos',  productoRoutes(productoCtrl));
  app.use('/api/locales/:localId/cortes',     corteRoutes(corteCtrl));

  app.use('/api/auth',          authRoutes(authCtrl));
  app.use('/api/users',         userRoutes(userCtrl));
  app.use('/api/locales',       localRoutes(localCtrl));
  app.use('/api/orders',        orderRoutes(orderCtrl));
  app.use('/api/reservaciones', reservacionRoutes(reservacionCtrl));

  // ═══════════════════════════════════════════════════
  // 5. HEALTH CHECK
  // ═══════════════════════════════════════════════════
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      status:  'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // ═══════════════════════════════════════════════════
  // 6. RUTA 404
  // ═══════════════════════════════════════════════════
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
  });

  // ═══════════════════════════════════════════════════
  // 7. MIDDLEWARE DE ERRORES (siempre al final)
  // ═══════════════════════════════════════════════════
  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
