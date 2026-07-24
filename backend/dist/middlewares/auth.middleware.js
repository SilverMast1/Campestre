"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.requireRoles = requireRoles;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'campestre_jwt_secret_token_key_2026_super_strong';
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token de autorización ausente o inválido' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}
function requireRoles(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        // Si el usuario es un cliente externo (socio), no tiene roles de personal
        if (req.user.type === 'CLIENT' && rolesPermitidos.includes('CLIENTE')) {
            return next();
        }
        if (req.user.type === 'INTERNAL' && req.user.roles) {
            const tieneRol = req.user.roles.some((rol) => rolesPermitidos.includes(rol));
            if (tieneRol) {
                return next();
            }
        }
        return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes' });
    };
}
