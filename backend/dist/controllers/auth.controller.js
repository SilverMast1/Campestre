"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginInterno = loginInterno;
exports.loginCliente = loginCliente;
exports.crearClientePorStaff = crearClientePorStaff;
exports.buscarSociosPublico = buscarSociosPublico;
exports.listarUsuarios = listarUsuarios;
exports.crearUsuarioInterno = crearUsuarioInterno;
exports.cambiarPasswordUsuario = cambiarPasswordUsuario;
exports.toggleActivoUsuario = toggleActivoUsuario;
exports.actualizarUsuarioInterno = actualizarUsuarioInterno;
// Usar bcryptjs en entorno Netlify/serverless para evitar fallos de módulos nativos C++
let bcrypt;
try {
    if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        bcrypt = require('bcryptjs');
    }
    else {
        bcrypt = require('bcrypt');
    }
}
catch {
    bcrypt = require('bcryptjs');
}
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
const cache_1 = require("../cache");
const JWT_SECRET = process.env.JWT_SECRET || 'campestre_jwt_secret_token_key_2026_super_strong';
// 1. Login para personal del club (Superusuario/Admin y Vendedores)
async function loginInterno(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }
    try {
        const usuario = await db_1.default.usuario.findUnique({
            where: { username },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!usuario || !usuario.activo) {
            return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
        }
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValido) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const rolesNombres = usuario.roles.map((ur) => ur.role.nombre);
        const token = jsonwebtoken_1.default.sign({
            id: usuario.id,
            username: usuario.username,
            email: usuario.email || '',
            type: 'INTERNAL',
            roles: rolesNombres,
        }, JWT_SECRET);
        return res.json({
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                nombre: usuario.nombre,
                roles: rolesNombres,
            },
        });
    }
    catch (error) {
        console.error('Error en loginInterno:', error);
        return res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
}
// 2. Login para Clientes (Socios del Club) - Simplificado: Acceden solo con su nombre
async function loginCliente(req, res) {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre del socio es requerido para ingresar' });
    }
    try {
        // Buscar coincidencia exacta por nombre
        const cliente = await db_1.default.cliente.findFirst({
            where: {
                nombre: {
                    equals: nombre,
                }
            },
        });
        if (!cliente || !cliente.activo) {
            return res.status(401).json({ error: 'Socio no encontrado o membresía inactiva' });
        }
        const token = jsonwebtoken_1.default.sign({
            id: cliente.id,
            nombre: cliente.nombre,
            email: cliente.email || '',
            type: 'CLIENT',
        }, JWT_SECRET);
        return res.json({
            token,
            cliente: {
                id: cliente.id,
                codigo_socio: cliente.codigo_socio,
                nombre: cliente.nombre,
                email: cliente.email,
            },
        });
    }
    catch (error) {
        console.error('Error en loginCliente:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
// 3. Crear Cliente por el Staff (Vendedores y Administradores)
async function crearClientePorStaff(req, res) {
    const { codigo_socio, nombre, email, telefono } = req.body;
    if (!codigo_socio || !nombre) {
        return res.status(400).json({ error: 'El código de socio y nombre son requeridos' });
    }
    try {
        // Verificar si el código de socio ya existe
        const socioExistente = await db_1.default.cliente.findUnique({
            where: { codigo_socio },
        });
        if (socioExistente) {
            return res.status(400).json({ error: 'Este código de socio/membresía ya está registrado' });
        }
        // Si envían correo, verificar duplicidad
        if (email) {
            const emailExistente = await db_1.default.cliente.findFirst({
                where: { email },
            });
            if (emailExistente) {
                return res.status(400).json({ error: 'El correo electrónico ya está asociado a otro socio' });
            }
        }
        const qrToken = (0, uuid_1.v4)(); // Generar el token único para el código QR dinámico
        const nuevoCliente = await db_1.default.cliente.create({
            data: {
                codigo_socio,
                nombre: nombre.trim().toUpperCase(),
                email: email || null,
                telefono: telefono || null,
                qr_token: qrToken,
            },
        });
        (0, cache_1.invalidateCache)('socios');
        return res.status(201).json({
            message: 'Socio registrado con éxito en el sistema',
            cliente: {
                id: nuevoCliente.id,
                codigo_socio: nuevoCliente.codigo_socio,
                nombre: nuevoCliente.nombre,
                email: nuevoCliente.email,
                qr_token: nuevoCliente.qr_token,
            },
        });
    }
    catch (error) {
        console.error('Error al crear cliente por staff:', error);
        return res.status(500).json({ error: 'Error al dar de alta al socio' });
    }
}
// 4. Búsqueda pública de socios por nombre (para autocompletado en Login de Socios)
async function buscarSociosPublico(req, res) {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json([]);
    }
    try {
        const socios = await db_1.default.cliente.findMany({
            where: {
                activo: true,
                nombre: { contains: query, mode: 'insensitive' },
            },
            select: {
                id: true,
                nombre: true,
                codigo_socio: true,
            },
            take: 10,
        });
        return res.json(socios);
    }
    catch (error) {
        console.error('Error en buscarSociosPublico:', error);
        return res.status(500).json({ error: 'Error interno al buscar socios' });
    }
}
// 5. Listar usuarios internos (Solo Admin)
async function listarUsuarios(req, res) {
    try {
        const usuarios = await db_1.default.usuario.findMany({
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
            orderBy: { username: 'asc' },
        });
        const data = usuarios.map(u => ({
            id: u.id,
            username: u.username,
            nombre: u.nombre,
            email: u.email,
            activo: u.activo,
            roles: u.roles.map(ur => ur.role.nombre),
        }));
        return res.json(data);
    }
    catch (error) {
        console.error('Error al listar usuarios:', error);
        return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
}
// 6. Crear usuario interno (Solo Admin)
async function crearUsuarioInterno(req, res) {
    const { username, password, nombre, email, role } = req.body;
    if (!username || !password || !nombre || !role) {
        return res.status(400).json({ error: 'Usuario, contraseña, nombre y rol son requeridos' });
    }
    if (role !== 'ADMIN' && role !== 'VENDEDOR') {
        return res.status(400).json({ error: 'El rol debe ser ADMIN o VENDEDOR' });
    }
    try {
        const usuarioExistente = await db_1.default.usuario.findUnique({
            where: { username },
        });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Este nombre de usuario ya está registrado' });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const dbRole = await db_1.default.role.findUnique({
            where: { nombre: role },
        });
        if (!dbRole) {
            return res.status(400).json({ error: 'El rol especificado no existe en la base de datos' });
        }
        const nuevoUsuario = await db_1.default.usuario.create({
            data: {
                username,
                password_hash: passwordHash,
                nombre,
                email: email || null,
                activo: true,
            },
        });
        await db_1.default.usuarioRole.create({
            data: {
                usuario_id: nuevoUsuario.id,
                role_id: dbRole.id,
            },
        });
        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: {
                id: nuevoUsuario.id,
                username: nuevoUsuario.username,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                activo: nuevoUsuario.activo,
                roles: [role],
            },
        });
    }
    catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ error: 'Error al crear el usuario' });
    }
}
// 7. Cambiar contraseña de usuario (Solo Admin)
async function cambiarPasswordUsuario(req, res) {
    const { id } = req.params;
    const { password } = req.body;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    if (!password) {
        return res.status(400).json({ error: 'La nueva contraseña es requerida' });
    }
    try {
        const passwordHash = await bcrypt.hash(password, 12);
        await db_1.default.usuario.update({
            where: { id: parsedId },
            data: { password_hash: passwordHash },
        });
        return res.json({ message: 'Contraseña actualizada exitosamente' });
    }
    catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return res.status(500).json({ error: 'Error al actualizar contraseña' });
    }
}
// 8. Cambiar estado activo/inactivo del usuario (Solo Admin)
async function toggleActivoUsuario(req, res) {
    const { id } = req.params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    try {
        const usuario = await db_1.default.usuario.findUnique({
            where: { id: parsedId },
        });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const usuarioActualizado = await db_1.default.usuario.update({
            where: { id: parsedId },
            data: { activo: !usuario.activo },
        });
        return res.json({
            message: `Usuario ${usuarioActualizado.activo ? 'activado' : 'desactivado'} exitosamente`,
            activo: usuarioActualizado.activo,
        });
    }
    catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        return res.status(500).json({ error: 'Error al actualizar estado del usuario' });
    }
}
async function actualizarUsuarioInterno(req, res) {
    const { id } = req.params;
    const { username, nombre, email, role } = req.body;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    try {
        if (username) {
            const usuarioDuplicado = await db_1.default.usuario.findFirst({
                where: {
                    username,
                    NOT: { id: parsedId },
                },
            });
            if (usuarioDuplicado) {
                return res.status(400).json({ error: 'Este nombre de usuario ya está registrado por otra persona' });
            }
        }
        if (role && role !== 'ADMIN' && role !== 'VENDEDOR') {
            return res.status(400).json({ error: 'El rol debe ser ADMIN o VENDEDOR' });
        }
        const dataUpdate = {};
        if (username !== undefined)
            dataUpdate.username = username.trim();
        if (nombre !== undefined)
            dataUpdate.nombre = nombre.trim();
        if (email !== undefined)
            dataUpdate.email = email ? email.trim() : null;
        const resultado = await db_1.default.$transaction(async (tx) => {
            const u = await tx.usuario.update({
                where: { id: parsedId },
                data: dataUpdate,
            });
            if (role) {
                const dbRole = await tx.role.findUnique({
                    where: { nombre: role },
                });
                if (!dbRole) {
                    throw new Error('El rol especificado no existe');
                }
                await tx.usuarioRole.deleteMany({
                    where: { usuario_id: parsedId },
                });
                await tx.usuarioRole.create({
                    data: {
                        usuario_id: parsedId,
                        role_id: dbRole.id,
                    },
                });
            }
            return u;
        });
        return res.json({
            message: 'Datos de usuario actualizados correctamente',
            usuario: {
                id: resultado.id,
                username: resultado.username,
                nombre: resultado.nombre,
                email: resultado.email,
                roles: role ? [role] : undefined,
            },
        });
    }
    catch (error) {
        console.error('Error al actualizar usuario interno:', error);
        return res.status(500).json({ error: error.message || 'Error al actualizar el usuario' });
    }
}
