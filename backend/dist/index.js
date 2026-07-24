"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Cargar variables de entorno
dotenv_1.default.config();
const db_1 = require("./db");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const idempotency_middleware_1 = require("./middlewares/idempotency.middleware");
const auth_controller_1 = require("./controllers/auth.controller");
const pos_controller_1 = require("./controllers/pos.controller");
const cadi_controller_1 = require("./controllers/cadi.controller");
const cliente_controller_1 = require("./controllers/cliente.controller");
const turno_controller_1 = require("./controllers/turno.controller");
const reporte_controller_1 = require("./controllers/reporte.controller");
const insumo_controller_1 = require("./controllers/insumo.controller");
const gastos_controller_1 = require("./controllers/gastos.controller");
const backup_controller_1 = require("./controllers/backup.controller");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
// Orígenes permitidos: localhost para dev + dominio de producción desde env
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);
const isOriginAllowed = (origin) => {
    if (allowedOrigins.includes(origin))
        return true;
    try {
        const url = new URL(origin);
        const hostname = url.hostname;
        // Permitir localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1')
            return true;
        // Permitir IPs de red local
        if (hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            hostname.startsWith('172.'))
            return true;
        // Permitir túneles de VS Code o localtunnel
        if (hostname.endsWith('.github.dev') ||
            hostname.endsWith('.app.github.dev') ||
            hostname.endsWith('.devtunnels.ms') ||
            hostname.endsWith('.loca.lt') ||
            hostname.endsWith('.ngrok-free.app') ||
            hostname.endsWith('.netlify.app') ||
            hostname.endsWith('.onrender.com') ||
            hostname.endsWith('.vercel.app'))
            return true;
    }
    catch (err) {
        // Si no es una URL válida
    }
    return false;
};
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});
const PORT = process.env.PORT || 3001;
// Middlewares globales
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(idempotency_middleware_1.idempotency);
// ==========================================
// HEALTH CHECK (Railway / producción)
// ==========================================
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ==========================================
// RUTAS DEL API
// ==========================================
// 1. Autenticación (Públicas)
app.post('/api/auth/login-interno', auth_controller_1.loginInterno);
app.post('/api/auth/login-cliente', auth_controller_1.loginCliente);
app.get('/api/auth/socios/buscar', auth_controller_1.buscarSociosPublico);
// 2. Punto de Venta (Vendedores y Administradores)
app.get('/api/pos/productos/:areaId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.listarProductosPorArea);
app.post('/api/pos/clientes', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), auth_controller_1.crearClientePorStaff);
app.post('/api/pos/cuentas/abrir', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.abrirCuenta);
app.post('/api/pos/cuentas/fusionar', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.fusionarCuentas);
app.put('/api/pos/cuentas/:cuentaId/consumos', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.guardarConsumos);
app.get('/api/pos/cuentas/:cuentaId/split-preview', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.previsualizarSplit);
app.post('/api/pos/cuentas/:cuentaId/pagar', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.pagarYCerrarCuenta);
app.put('/api/pos/cuentas/:cuentaId/metodo-pago', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.actualizarMetodoPagoCuenta);
app.put('/api/pos/cuentas/:cuentaId/cambiar-area', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.cambiarAreaCuenta);
// 2.5 Gestión de Almacenamiento (Solo Administradores)
app.put('/api/admin/inventario', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), pos_controller_1.ajustarStockArea);
app.post('/api/admin/inventario/merma', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), pos_controller_1.registrarMermaStock);
app.get('/api/admin/inventario/mermas', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), pos_controller_1.listarMermas);
app.post('/api/pos/inventario/transferir', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), pos_controller_1.transferirStock);
app.get('/api/admin/caja', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), pos_controller_1.obtenerBalanceCaja);
app.get('/api/admin/cuentas', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.listarTodasLasCuentas);
app.delete('/api/admin/cuentas/:cuentaId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), pos_controller_1.eliminarCuenta);
app.delete('/api/admin/reset', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), pos_controller_1.resetearDatos);
app.post('/api/admin/productos', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), pos_controller_1.crearProducto);
app.get('/api/admin/productos', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), pos_controller_1.listarTodosLosProductos);
app.delete('/api/admin/productos/:productoId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), pos_controller_1.eliminarProducto);
// 2.5.5 Respaldos de Base de Datos (Solo Administradores)
app.get('/api/admin/backups', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), backup_controller_1.listarBackups);
app.post('/api/admin/backups/crear', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), backup_controller_1.crearBackup);
app.post('/api/admin/backups/restaurar', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), backup_controller_1.restaurarBackup);
// 2.9 Gestión de Usuarios Internos (Solo Administradores)
app.get('/api/admin/usuarios', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), auth_controller_1.listarUsuarios);
app.post('/api/admin/usuarios', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), auth_controller_1.crearUsuarioInterno);
app.put('/api/admin/usuarios/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), auth_controller_1.actualizarUsuarioInterno);
app.put('/api/admin/usuarios/:id/password', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), auth_controller_1.cambiarPasswordUsuario);
app.put('/api/admin/usuarios/:id/toggle', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), auth_controller_1.toggleActivoUsuario);
// 2.8 Gestión de Insumos y Recetas (Solo Administradores)
app.get('/api/admin/insumos', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), insumo_controller_1.listarInsumos);
app.post('/api/admin/insumos', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), insumo_controller_1.crearInsumo);
app.put('/api/admin/insumos/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), insumo_controller_1.actualizarInsumo);
app.delete('/api/admin/insumos/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), insumo_controller_1.eliminarInsumo);
app.get('/api/admin/productos/:productoId/receta', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), insumo_controller_1.obtenerReceta);
app.post('/api/admin/productos/:productoId/receta', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), insumo_controller_1.guardarReceta);
// 2.6 Turnos / Cortes de Caja
app.post('/api/admin/turno/abrir', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), turno_controller_1.abrirTurno);
app.get('/api/admin/turno/activo', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), turno_controller_1.obtenerTurnoActivo);
app.post('/api/admin/turno/cerrar', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), turno_controller_1.cerrarTurno);
app.post('/api/admin/turno/retiro', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), turno_controller_1.registrarRetiroCaja);
app.post('/api/admin/turno/ingreso', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), turno_controller_1.registrarIngresoCaja);
// 2.7 Reportes (Solo Administradores)
app.get('/api/admin/reportes/diario', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), reporte_controller_1.obtenerReporteDiario);
app.get('/api/admin/reportes/cortes', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), reporte_controller_1.obtenerReporteCortes);
app.get('/api/admin/reportes/ventas-por-area', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), reporte_controller_1.obtenerVentasPorArea);
app.post('/api/admin/gastos-ingresos', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), gastos_controller_1.registrarGastoIngreso);
app.get('/api/admin/gastos-ingresos/semanal', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), gastos_controller_1.obtenerReporteSemanalGastos);
app.delete('/api/admin/gastos-ingresos/:id', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN']), gastos_controller_1.eliminarGastoIngreso);
// 3. Catálogo y Gestión de Cadis (Vendedores y Administradores)
app.get('/api/cadis', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cadi_controller_1.listarCadis);
app.get('/api/cadis/activos', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cadi_controller_1.listarCadisActivos);
app.post('/api/cadis', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cadi_controller_1.crearCadi);
app.post('/api/cadis/asignar', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cadi_controller_1.asignarClientesACadi);
app.put('/api/cadis/:cadiId/liberar', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cadi_controller_1.liberarCadi);
app.delete('/api/cadis/:cadiId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cadi_controller_1.eliminarCadi);
// 4. Portal del Socio/Cliente y Autocompletados
app.get('/api/socio/perfil', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['CLIENTE']), cliente_controller_1.obtenerPerfilSocio);
app.get('/api/socio/consumos', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['CLIENTE']), cliente_controller_1.listarConsumosSocio);
app.get('/api/socio/cuenta-activa', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['CLIENTE']), cliente_controller_1.obtenerCuentaActivaSocio);
app.post('/api/socio/qr-token', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['CLIENTE']), cliente_controller_1.regenerarTokenQR);
app.post('/api/socio/buscar-qr', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.buscarSocioPorQR);
app.get('/api/socio/buscar', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.buscarSocios);
app.get('/api/socios', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.listarSocios);
app.get('/api/socios/siguiente-codigo', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.obtenerSiguienteCodigoSocio);
app.put('/api/socios/:socioId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.actualizarSocio);
app.delete('/api/socios/:socioId', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.eliminarSocio);
// 4.5 Cargos a Socios (Deudas)
app.get('/api/pos/socios/cargos', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.listarCargosSocios);
app.get('/api/pos/socios/:socioId/cargos/detalle', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.obtenerDetalleCargosSocio);
app.post('/api/pos/socios/:socioId/cargos/liquidar', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.liquidarCargosSocio);
app.post('/api/pos/socios/:socioId/cargos/borrar', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRoles)(['ADMIN', 'VENDEDOR']), cliente_controller_1.borrarCargosSocio);
// Ruta de estado general de salud del API
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
// ==========================================
// SERVIR FRONTEND COMPILADO (PRODUCCIÓN LOCAL)
// ==========================================
const frontendDist = path_1.default.join(__dirname, '../../frontend/dist');
app.use(express_1.default.static(frontendDist));
app.get('*', (req, res) => {
    // Solo redirigir al frontend si no es una ruta de API
    if (!req.path.startsWith('/api')) {
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    }
});
// ==========================================
// CONFIGURACIÓN DE WEBSOCKETS (TIEMPO REAL)
// ==========================================
io.on('connection', (socket) => {
    console.log('Cliente conectado por WebSocket:', socket.id);
    // Unirse a salas de áreas (Bar, Snack, Palapa)
    socket.on('join:area', (areaId) => {
        socket.join(`area:${areaId}`);
        console.log(`Socket ${socket.id} se unió a area:${areaId}`);
    });
    // Notificar cuando el stock cambia
    socket.on('inventario:cambio', (data) => {
        // data = { area_id }
        socket.to(`area:${data.area_id}`).emit('inventario:actualizar');
        socket.broadcast.emit('notificacion:global', { message: 'El stock de productos ha sido actualizado' });
    });
    // Notificar cuentas abiertas actualizadas
    socket.on('cuenta:cambio', (data) => {
        // data = { cadi_id }
        socket.broadcast.emit('cuenta:actualizar', data);
    });
    socket.on('disconnect', () => {
        console.log('Cliente desconectado por WebSocket:', socket.id);
    });
});
// Adjuntar instancia de socket.io a express para poder disparar eventos desde controladores si es necesario
app.set('io', io);
// Arrancar servidor
async function startServer() {
    await (0, db_1.optimizarSQLite)();
    const host = process.env.IP || '::';
    server.listen(Number(PORT), host, () => {
        console.log(`Servidor backend corriendo en http://${host}:${PORT}`);
    });
}
if (process.env.NODE_ENV !== 'test' && !process.env.NETLIFY) {
    startServer();
}
