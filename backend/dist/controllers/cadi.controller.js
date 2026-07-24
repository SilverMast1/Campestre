"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarCadis = listarCadis;
exports.listarCadisActivos = listarCadisActivos;
exports.asignarClientesACadi = asignarClientesACadi;
exports.liberarCadi = liberarCadi;
exports.crearCadi = crearCadi;
exports.eliminarCadi = eliminarCadi;
const db_1 = __importDefault(require("../db"));
// 1. Listar todos los Cadis con su estado
async function listarCadis(req, res) {
    try {
        const cadis = await db_1.default.cadi.findMany({
            orderBy: { numero_cadi: 'asc' },
        });
        return res.json(cadis);
    }
    catch (error) {
        console.error('Error al listar cadis:', error);
        return res.status(500).json({ error: 'Error al consultar cadis' });
    }
}
// 2. Listar Cadis activos (en ronda) con los clientes a los que asisten
async function listarCadisActivos(req, res) {
    try {
        const cadisActivos = await db_1.default.cadi.findMany({
            where: { estado: 'EN_RONDA' },
            include: {
                asignaciones: {
                    where: { activa: true },
                    include: {
                        cliente: true,
                    },
                },
            },
            orderBy: { numero_cadi: 'asc' },
        });
        const resultado = cadisActivos.map((c) => ({
            id: c.id,
            numero_cadi: c.numero_cadi,
            nombre: c.nombre,
            telefono: c.telefono,
            estado: c.estado,
            clientes: c.asignaciones.map((a) => ({
                id: a.cliente.id,
                codigo_socio: a.cliente.codigo_socio,
                nombre: a.cliente.nombre,
                email: a.cliente.email,
            })),
        }));
        return res.json(resultado);
    }
    catch (error) {
        console.error('Error al listar cadis activos:', error);
        return res.status(500).json({ error: 'Error al consultar cadis activos' });
    }
}
// 3. Crear asignación de Cadi a múltiples clientes (Iniciar Ronda)
async function asignarClientesACadi(req, res) {
    const { cadi_id, cliente_ids } = req.body; // Array de IDs de clientes
    if (!cadi_id || !Array.isArray(cliente_ids) || cliente_ids.length === 0) {
        return res.status(400).json({ error: 'ID de Cadi y lista de IDs de clientes son requeridos' });
    }
    const uniqueClienteIds = Array.from(new Set(cliente_ids));
    try {
        const cadiIdInt = parseInt(cadi_id);
        const cadi = await db_1.default.cadi.findUnique({ where: { id: cadiIdInt } });
        if (!cadi || cadi.estado === 'INACTIVO') {
            return res.status(404).json({ error: 'Cadi no encontrado o inactivo' });
        }
        // Iniciar asignación en transacción
        await db_1.default.$transaction(async (tx) => {
            // Desactivar cualquier asignación activa previa para este Cadi por seguridad
            await tx.asignacionCadiCliente.updateMany({
                where: { cadi_id: cadiIdInt, activa: true },
                data: { activa: false, fecha_fin: new Date() },
            });
            // Crear las nuevas asignaciones activas
            for (const clienteId of uniqueClienteIds) {
                const clienteIdInt = parseInt(clienteId);
                // Se permite la doble asignación de Cadis (e.g. un socio con múltiples Cadis asignados simultáneamente)
                // por lo que omitimos verificar si ya tiene un Cadi activo asignado.
                await tx.asignacionCadiCliente.create({
                    data: {
                        cadi_id: cadiIdInt,
                        cliente_id: clienteIdInt,
                        fecha_inicio: new Date(),
                        activa: true,
                    },
                });
            }
            // Cambiar estado del Cadi a 'EN_RONDA'
            await tx.cadi.update({
                where: { id: cadiIdInt },
                data: { estado: 'EN_RONDA' },
            });
        });
        return res.status(200).json({ message: 'Cadi asignado e inicio de ronda exitoso' });
    }
    catch (error) {
        console.error('Error al asignar clientes a cadi:', error);
        return res.status(500).json({ error: error.message || 'Error al procesar asignación' });
    }
}
// 4. Liberar Cadi (Finalizar ronda)
async function liberarCadi(req, res) {
    const cadiId = parseInt(req.params.cadiId);
    if (isNaN(cadiId)) {
        return res.status(400).json({ error: 'ID de Cadi inválido' });
    }
    try {
        await db_1.default.$transaction(async (tx) => {
            // Marcar asignaciones activas como finalizadas
            await tx.asignacionCadiCliente.updateMany({
                where: { cadi_id: cadiId, activa: true },
                data: { activa: false, fecha_fin: new Date() },
            });
            // Cambiar estado del Cadi a 'DISPONIBLE'
            await tx.cadi.update({
                where: { id: cadiId },
                data: { estado: 'DISPONIBLE' },
            });
        });
        return res.json({ message: 'Cadi liberado y ronda finalizada exitosamente' });
    }
    catch (error) {
        console.error('Error al liberar cadi:', error);
        return res.status(500).json({ error: 'Error al finalizar la ronda' });
    }
}
// 5. Crear nuevo Cadi (Vendedor y Admin)
async function crearCadi(req, res) {
    const { numero_cadi, nombre, telefono } = req.body;
    if (!numero_cadi || !nombre) {
        return res.status(400).json({ error: 'Número de cadi y nombre son requeridos' });
    }
    try {
        const nuevo = await db_1.default.cadi.create({
            data: {
                numero_cadi: numero_cadi.trim(),
                nombre: nombre.trim(),
                telefono: telefono?.trim() || null,
                estado: 'DISPONIBLE',
            },
        });
        return res.status(201).json(nuevo);
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: `El código de cadi "${numero_cadi}" ya existe` });
        }
        console.error('Error al crear cadi:', error);
        return res.status(500).json({ error: 'Error al crear el cadi' });
    }
}
// 6. Eliminar Cadi (Admin y Vendedor)
async function eliminarCadi(req, res) {
    const cadiId = parseInt(req.params.cadiId);
    if (isNaN(cadiId)) {
        return res.status(400).json({ error: 'ID de Cadi inválido' });
    }
    try {
        await db_1.default.$transaction(async (tx) => {
            await tx.asignacionCadiCliente.deleteMany({ where: { cadi_id: cadiId } });
            await tx.cadi.delete({ where: { id: cadiId } });
        });
        return res.json({ message: 'Cadi eliminado correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar cadi:', error);
        return res.status(500).json({ error: error.message || 'Error al eliminar el cadi' });
    }
}
