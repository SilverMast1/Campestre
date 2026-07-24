"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPerfilSocio = obtenerPerfilSocio;
exports.listarConsumosSocio = listarConsumosSocio;
exports.regenerarTokenQR = regenerarTokenQR;
exports.buscarSocioPorQR = buscarSocioPorQR;
exports.buscarSocios = buscarSocios;
exports.eliminarSocio = eliminarSocio;
exports.actualizarSocio = actualizarSocio;
exports.listarSocios = listarSocios;
exports.listarCargosSocios = listarCargosSocios;
exports.obtenerDetalleCargosSocio = obtenerDetalleCargosSocio;
exports.liquidarCargosSocio = liquidarCargosSocio;
exports.borrarCargosSocio = borrarCargosSocio;
exports.obtenerCuentaActivaSocio = obtenerCuentaActivaSocio;
exports.obtenerSiguienteCodigoSocio = obtenerSiguienteCodigoSocio;
const uuid_1 = require("uuid");
const decimal_js_1 = require("decimal.js");
const db_1 = __importDefault(require("../db"));
const cache_1 = require("../cache");
// 1. Obtener datos de perfil del socio autenticado
async function obtenerPerfilSocio(req, res) {
    const socioId = req.user?.id;
    if (!socioId) {
        return res.status(401).json({ error: 'Socio no autenticado' });
    }
    try {
        const socio = await db_1.default.cliente.findUnique({
            where: { id: socioId },
            select: {
                id: true,
                codigo_socio: true,
                nombre: true,
                email: true,
                telefono: true,
                activo: true,
                qr_token: true,
            },
        });
        if (!socio) {
            return res.status(404).json({ error: 'Socio no encontrado' });
        }
        return res.json(socio);
    }
    catch (error) {
        console.error('Error al obtener perfil de socio:', error);
        return res.status(500).json({ error: 'Error al consultar datos' });
    }
}
// 2. Obtener historial de consumos y gastos del socio
async function listarConsumosSocio(req, res) {
    const socioId = req.user?.id;
    if (!socioId) {
        return res.status(401).json({ error: 'Socio no autenticado' });
    }
    try {
        // Buscar todas las divisiones de cuenta donde el cliente haya pagado
        const divisiones = await db_1.default.divisionCuenta.findMany({
            where: { cliente_id: socioId },
            include: {
                cuenta: {
                    include: {
                        area: true,
                        usuario: { select: { nombre: true } },
                        cadi: true,
                        detalleCuentas: {
                            include: {
                                producto: true,
                            },
                        },
                    },
                },
            },
            orderBy: { pagado_at: 'desc' },
        });
        // Formatear el historial de consumos del socio
        const historial = divisiones.map((div) => {
            const cuenta = div.cuenta;
            return {
                division_id: div.id,
                cuenta_id: cuenta.id,
                area: cuenta.area.nombre,
                atendido_por: cuenta.usuario.nombre,
                cadi: cuenta.cadi ? cuenta.cadi.nombre : null,
                fecha_pago: div.pagado_at,
                fecha_consumo: cuenta.closed_at || cuenta.created_at,
                estado_pago: div.estado_pago,
                metodo_pago: div.metodo_pago,
                total_cuenta_grupo: Number(cuenta.total),
                mi_porcentaje: Number(div.porcentaje_participacion),
                mi_pago: Number(div.monto_proporcional),
                consumo_detalle: cuenta.detalleCuentas.map((dc) => ({
                    producto: dc.producto.nombre,
                    cantidad: Number(dc.cantidad),
                    precio_unitario: Number(dc.precio_unitario),
                    subtotal: Number(dc.subtotal),
                })),
            };
        });
        return res.json(historial);
    }
    catch (error) {
        console.error('Error al obtener consumos de socio:', error);
        return res.status(500).json({ error: 'Error al consultar historial de consumos' });
    }
}
// 3. Regenerar el código QR dinámico de membresía
async function regenerarTokenQR(req, res) {
    const socioId = req.user?.id;
    if (!socioId) {
        return res.status(401).json({ error: 'Socio no autenticado' });
    }
    try {
        const nuevoToken = (0, uuid_1.v4)();
        const socioActualizado = await db_1.default.cliente.update({
            where: { id: socioId },
            data: { qr_token: nuevoToken },
            select: { qr_token: true },
        });
        return res.json({ qr_token: socioActualizado.qr_token });
    }
    catch (error) {
        console.error('Error al regenerar token QR:', error);
        return res.status(500).json({ error: 'Error al generar código QR' });
    }
}
// 4. Buscar socio por token de QR (POS Vendedor)
async function buscarSocioPorQR(req, res) {
    const { qr_token } = req.body;
    if (!qr_token) {
        return res.status(400).json({ error: 'Token de QR requerido' });
    }
    try {
        const socio = await db_1.default.cliente.findUnique({
            where: { qr_token },
            select: {
                id: true,
                codigo_socio: true,
                nombre: true,
                email: true,
                activo: true,
            },
        });
        if (!socio || !socio.activo) {
            return res.status(404).json({ error: 'Socio no encontrado o cuenta de membresía inactiva' });
        }
        return res.json(socio);
    }
    catch (error) {
        console.error('Error al buscar socio por QR:', error);
        return res.status(500).json({ error: 'Error al procesar búsqueda por QR' });
    }
}
// 5. Autocompletado de socios (Búsqueda rápida por nombre o código de socio)
async function buscarSocios(req, res) {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json([]);
    }
    try {
        const socios = await db_1.default.cliente.findMany({
            where: {
                activo: true,
                OR: [
                    { nombre: { contains: query, mode: 'insensitive' } },
                    { codigo_socio: { contains: query, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                codigo_socio: true,
                nombre: true,
                email: true,
            },
            take: 10,
        });
        return res.json(socios);
    }
    catch (error) {
        console.error('Error al buscar socios:', error);
        return res.status(500).json({ error: 'Error al procesar búsqueda' });
    }
}
// 6. Eliminar socio (Admin y Vendedor)
async function eliminarSocio(req, res) {
    const socioId = parseInt(req.params.socioId);
    if (isNaN(socioId)) {
        return res.status(400).json({ error: 'ID de socio inválido' });
    }
    try {
        await db_1.default.$transaction(async (tx) => {
            await tx.asignacionCadiCliente.deleteMany({ where: { cliente_id: socioId } });
            await tx.divisionCuenta.deleteMany({ where: { cliente_id: socioId } });
            await tx.cuenta.updateMany({ where: { cliente_id: socioId }, data: { cliente_id: null } });
            await tx.cliente.delete({ where: { id: socioId } });
        });
        (0, cache_1.invalidateCache)('socios');
        return res.json({ message: 'Socio eliminado correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar socio:', error);
        return res.status(500).json({ error: error.message || 'Error al eliminar el socio' });
    }
}
// 6.5 Actualizar socio
async function actualizarSocio(req, res) {
    const socioId = parseInt(req.params.socioId);
    const { nombre, email, telefono, codigo_socio } = req.body;
    if (isNaN(socioId)) {
        return res.status(400).json({ error: 'ID de socio inválido' });
    }
    try {
        const socioActualizado = await db_1.default.cliente.update({
            where: { id: socioId },
            data: {
                nombre: nombre ? nombre.trim().toUpperCase() : undefined,
                email,
                telefono,
                codigo_socio
            }
        });
        return res.json(socioActualizado);
    }
    catch (error) {
        console.error('Error al actualizar socio:', error);
        return res.status(500).json({ error: error.message || 'Error al actualizar el socio' });
    }
}
// 7. Listar todos los socios (Admin y Vendedor)
async function listarSocios(req, res) {
    const cached = (0, cache_1.getCache)('socios_lista');
    if (cached)
        return res.json(cached);
    try {
        const socios = await db_1.default.cliente.findMany({
            where: { activo: true },
            select: { id: true, codigo_socio: true, nombre: true, email: true, telefono: true, created_at: true },
            orderBy: { nombre: 'asc' },
        });
        (0, cache_1.setCache)('socios_lista', socios, 60);
        return res.json(socios);
    }
    catch (error) {
        console.error('Error al listar socios:', error);
        return res.status(500).json({ error: 'Error al consultar socios' });
    }
}
// 8. Listar socios con cargos pendientes (deudas)
async function listarCargosSocios(req, res) {
    const cached = (0, cache_1.getCache)('socios_cargos');
    if (cached)
        return res.json(cached);
    try {
        const sociosConCargos = await db_1.default.cliente.findMany({
            where: {
                activo: true,
                divisionesCuentas: {
                    some: {
                        metodo_pago: 'CARGO_SOCIO',
                        estado_pago: 'PENDIENTE',
                    },
                },
            },
            include: {
                divisionesCuentas: {
                    where: {
                        metodo_pago: 'CARGO_SOCIO',
                        estado_pago: 'PENDIENTE',
                    },
                },
            },
        });
        const resultado = sociosConCargos
            .map((socio) => {
            const saldoPendiente = socio.divisionesCuentas
                .filter(div => div.estado_pago === 'PENDIENTE')
                .reduce((sum, div) => sum.plus(new decimal_js_1.Decimal(div.monto_proporcional)), new decimal_js_1.Decimal(0));
            return {
                id: socio.id,
                codigo_socio: socio.codigo_socio,
                nombre: socio.nombre,
                email: socio.email,
                telefono: socio.telefono,
                saldo_pendiente: saldoPendiente.toNumber(),
            };
        })
            .filter((s) => s.saldo_pendiente > 0);
        (0, cache_1.setCache)('socios_cargos', resultado, 30);
        return res.json(resultado);
    }
    catch (error) {
        console.error('Error al listar cargos de socios:', error);
        return res.status(500).json({ error: 'Error al consultar cargos de socios' });
    }
}
// 9. Obtener detalle de deudas/cargos de un socio
async function obtenerDetalleCargosSocio(req, res) {
    const socioId = parseInt(req.params.socioId);
    if (isNaN(socioId)) {
        return res.status(400).json({ error: 'ID de socio inválido' });
    }
    try {
        const divisiones = await db_1.default.divisionCuenta.findMany({
            where: {
                cliente_id: socioId,
                metodo_pago: 'CARGO_SOCIO',
                estado_pago: 'PENDIENTE',
            },
            include: {
                cuenta: {
                    include: {
                        area: true,
                        usuario: { select: { nombre: true } },
                        cadi: true,
                        detalleCuentas: {
                            include: {
                                producto: true,
                            },
                        },
                    },
                },
            },
            orderBy: { pagado_at: 'desc' },
        });
        const detalle = divisiones.map((div) => {
            const cuenta = div.cuenta;
            return {
                division_id: div.id.toString(),
                cuenta_id: cuenta.id.toString(),
                area: cuenta.area.nombre,
                atendido_por: cuenta.usuario.nombre,
                fecha: div.pagado_at || cuenta.closed_at || cuenta.created_at,
                monto: Number(div.monto_proporcional),
                porcentaje_participacion: Number(div.porcentaje_participacion),
                total_cuenta: Number(cuenta.total),
                cadi: cuenta.cadi ? `${cuenta.cadi.numero_cadi} - ${cuenta.cadi.nombre}` : null,
                productos: cuenta.detalleCuentas.map((dc) => ({
                    id: dc.producto.id,
                    detalle_id: dc.id,
                    nombre: dc.producto.nombre,
                    cantidad: Number(dc.cantidad),
                    precio: Number(dc.precio_unitario),
                    subtotal: Number(dc.subtotal),
                    created_at: dc.created_at,
                })),
            };
        });
        return res.json(detalle);
    }
    catch (error) {
        console.error('Error al obtener detalle de cargos de socio:', error);
        return res.status(500).json({ error: 'Error al consultar detalle de cargos' });
    }
}
// 10. Liquidar cargos de un socio (registrar pago real)
async function liquidarCargosSocio(req, res) {
    const socioId = parseInt(req.params.socioId);
    const { metodo_pago, divisionesIds, area_id, abono_monto } = req.body;
    if (isNaN(socioId)) {
        return res.status(400).json({ error: 'ID de socio inválido' });
    }
    if (!metodo_pago || (metodo_pago !== 'EFECTIVO' && metodo_pago !== 'TARJETA' && metodo_pago !== 'TRANSFERENCIA')) {
        return res.status(400).json({ error: 'Método de pago inválido (debe ser EFECTIVO, TARJETA o TRANSFERENCIA)' });
    }
    try {
        const whereClause = {
            cliente_id: socioId,
            metodo_pago: 'CARGO_SOCIO',
            estado_pago: 'PENDIENTE',
        };
        if (Array.isArray(divisionesIds) && divisionesIds.length > 0) {
            const parsedIds = divisionesIds.map((id) => parseInt(id));
            whereClause.id = { in: parsedIds };
        }
        let turnoActivoId = null;
        const activeShift = await db_1.default.turno.findFirst({
            where: { activo: true, ...(area_id ? { area_id: Number(area_id) } : {}) },
        });
        if (activeShift) {
            turnoActivoId = activeShift.id;
        }
        const divisiones = await db_1.default.divisionCuenta.findMany({
            where: whereClause,
            include: { cuenta: true },
            orderBy: { id: 'asc' },
        });
        const esAbonoParcial = abono_monto !== undefined && abono_monto !== null && Number(abono_monto) > 0;
        let abonoRestante = esAbonoParcial ? new decimal_js_1.Decimal(abono_monto) : null;
        await db_1.default.$transaction(async (tx) => {
            for (const div of divisiones) {
                const montoDiv = new decimal_js_1.Decimal(div.monto_proporcional);
                if (abonoRestante !== null) {
                    if (abonoRestante.lessThanOrEqualTo(0)) {
                        break; // Ya se aplicó todo el abono
                    }
                    if (abonoRestante.greaterThanOrEqualTo(montoDiv)) {
                        // Se liquida el 100% de esta división
                        await tx.divisionCuenta.update({
                            where: { id: div.id },
                            data: {
                                metodo_pago: metodo_pago,
                                estado_pago: 'PAGADO',
                                pagado_at: new Date(),
                                monto_efectivo: metodo_pago === 'EFECTIVO' ? montoDiv : 0.0,
                                monto_tarjeta: metodo_pago === 'TARJETA' ? montoDiv : 0.0,
                                turno_pago_id: turnoActivoId,
                            },
                        });
                        abonoRestante = abonoRestante.minus(montoDiv);
                    }
                    else {
                        // Abono parcial dentro de esta división:
                        const montoPagoParcial = abonoRestante;
                        const montoRestanteDeuda = montoDiv.minus(montoPagoParcial);
                        const totalCuenta = new decimal_js_1.Decimal(div.cuenta?.total || div.monto_proporcional);
                        const porcentajePagado = totalCuenta.greaterThan(0)
                            ? montoPagoParcial.div(totalCuenta).mul(100)
                            : new decimal_js_1.Decimal(0);
                        const porcentajeRestante = totalCuenta.greaterThan(0)
                            ? montoRestanteDeuda.div(totalCuenta).mul(100)
                            : new decimal_js_1.Decimal(0);
                        // 1. Actualizar la división actual como pagada con la fracción abonada
                        await tx.divisionCuenta.update({
                            where: { id: div.id },
                            data: {
                                porcentaje_participacion: porcentajePagado,
                                monto_proporcional: montoPagoParcial,
                                metodo_pago: metodo_pago,
                                estado_pago: 'PAGADO',
                                pagado_at: new Date(),
                                monto_efectivo: metodo_pago === 'EFECTIVO' ? montoPagoParcial : 0.0,
                                monto_tarjeta: metodo_pago === 'TARJETA' ? montoPagoParcial : 0.0,
                                turno_pago_id: turnoActivoId,
                            },
                        });
                        // 2. Crear la división equivalente pendiente por el remanente
                        await tx.divisionCuenta.create({
                            data: {
                                cuenta_id: div.cuenta_id,
                                cliente_id: div.cliente_id,
                                porcentaje_participacion: porcentajeRestante,
                                monto_proporcional: montoRestanteDeuda,
                                metodo_pago: 'CARGO_SOCIO',
                                estado_pago: 'PENDIENTE',
                                pagado_at: null,
                            },
                        });
                        abonoRestante = new decimal_js_1.Decimal(0);
                    }
                }
                else {
                    // Liquidar el 100% de la división
                    await tx.divisionCuenta.update({
                        where: { id: div.id },
                        data: {
                            metodo_pago: metodo_pago,
                            estado_pago: 'PAGADO',
                            pagado_at: new Date(),
                            monto_efectivo: metodo_pago === 'EFECTIVO' ? montoDiv : 0.0,
                            monto_tarjeta: metodo_pago === 'TARJETA' ? montoDiv : 0.0,
                            turno_pago_id: turnoActivoId,
                        },
                    });
                }
            }
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('cuenta:actualizar');
        }
        // Invalidar caché de cargos para que la lista se actualice inmediatamente
        (0, cache_1.invalidateCache)('socios_cargos');
        return res.json({
            message: esAbonoParcial ? 'Abono a deuda registrado correctamente' : 'Cargos liquidados correctamente',
            cargos_actualizados: divisiones.length,
        });
    }
    catch (error) {
        console.error('Error al liquidar cargos de socio:', error);
        return res.status(500).json({ error: 'Error al registrar la liquidación de cargos' });
    }
}
// 11. Borrar cargos/adeudos de un socio (cancelar sin pago real, manteniendo inventario y compra guardada)
async function borrarCargosSocio(req, res) {
    const socioId = parseInt(req.params.socioId);
    const { divisionesIds } = req.body;
    if (isNaN(socioId)) {
        return res.status(400).json({ error: 'ID de socio inválido' });
    }
    try {
        const whereClause = {
            cliente_id: socioId,
            metodo_pago: 'CARGO_SOCIO',
            estado_pago: 'PENDIENTE',
        };
        if (Array.isArray(divisionesIds) && divisionesIds.length > 0) {
            const parsedIds = divisionesIds.map((id) => parseInt(id)).filter((id) => !isNaN(id));
            if (parsedIds.length > 0) {
                whereClause.id = { in: parsedIds };
            }
        }
        const result = await db_1.default.divisionCuenta.updateMany({
            where: whereClause,
            data: {
                metodo_pago: 'BORRADO',
                estado_pago: 'BORRADO',
                pagado_at: new Date(),
            },
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('cuenta:actualizar');
        }
        // Invalidar caché de cargos para que la lista se actualice inmediatamente
        (0, cache_1.invalidateCache)('socios_cargos');
        return res.json({
            message: 'Adeudos borrados correctamente. La compra permanece registrada y el stock no se altera.',
            cargos_actualizados: result.count,
        });
    }
    catch (error) {
        console.error('Error al borrar cargos de socio:', error);
        return res.status(500).json({ error: 'Error al borrar los cargos/adeudos del socio' });
    }
}
// 12. Obtener cuenta abierta (activa en tiempo real) del socio autenticado (con/sin cadi)
async function obtenerCuentaActivaSocio(req, res) {
    const socioId = req.user?.id;
    if (!socioId) {
        return res.status(401).json({ error: 'Socio no autenticado' });
    }
    try {
        const socio = await db_1.default.cliente.findUnique({
            where: { id: socioId },
        });
        if (!socio) {
            return res.status(404).json({ error: 'Socio no encontrado' });
        }
        // 1. Intentar buscar por asignación de Cadi activa
        const asignacionCadi = await db_1.default.asignacionCadiCliente.findFirst({
            where: { cliente_id: socioId, activa: true },
            select: { cadi_id: true },
        });
        let cuenta = null;
        let totalIntegrantes = 1;
        if (asignacionCadi) {
            const totalClientesCadi = await db_1.default.asignacionCadiCliente.count({
                where: { cadi_id: asignacionCadi.cadi_id, activa: true },
            });
            totalIntegrantes = totalClientesCadi || 1;
            cuenta = await db_1.default.cuenta.findFirst({
                where: {
                    cadi_id: asignacionCadi.cadi_id,
                    estado: 'ABIERTA',
                },
                include: {
                    area: true,
                    usuario: { select: { nombre: true } },
                    detalleCuentas: {
                        include: { producto: true },
                    },
                },
            });
        }
        // 2. Si no hay cuenta por Cadi, intentar buscar por nombre en nombre_referencia
        if (!cuenta) {
            cuenta = await db_1.default.cuenta.findFirst({
                where: {
                    estado: 'ABIERTA',
                    nombre_referencia: {
                        contains: socio.nombre,
                    },
                },
                include: {
                    area: true,
                    usuario: { select: { nombre: true } },
                    detalleCuentas: {
                        include: { producto: true },
                    },
                },
            });
            if (cuenta && cuenta.nombre_referencia) {
                // Estimar integrantes separando por comas
                const nombres = cuenta.nombre_referencia.split(',');
                totalIntegrantes = nombres.length || 1;
            }
        }
        if (!cuenta) {
            return res.json({ activa: false });
        }
        // Formatear respuesta
        const productos = cuenta.detalleCuentas.map((dc) => ({
            nombre: dc.producto.nombre,
            cantidad: Number(dc.cantidad),
            precio: Number(dc.precio_unitario),
            subtotal: Number(dc.subtotal),
        }));
        const totalAcumulado = Number(cuenta.total);
        const subtotalAcumulado = Number(cuenta.subtotal);
        const descuentoAcumulado = Number(cuenta.descuento);
        return res.json({
            activa: true,
            cuenta_id: cuenta.id.toString(),
            area: cuenta.area.nombre,
            atendido_por: cuenta.usuario.nombre,
            referencia: cuenta.nombre_referencia,
            productos,
            subtotal: subtotalAcumulado,
            descuento: descuentoAcumulado,
            total: totalAcumulado,
            total_integrantes: totalIntegrantes,
            mi_total_estimado: Number((totalAcumulado / totalIntegrantes).toFixed(2)),
        });
    }
    catch (error) {
        console.error('Error al obtener cuenta activa de socio:', error);
        return res.status(500).json({ error: 'Error al consultar cuenta activa' });
    }
}
// 13. Obtener el siguiente código secuencial para Socio o Empleado
async function obtenerSiguienteCodigoSocio(req, res) {
    const tipo = (req.query.tipo || 'SOCIO').toUpperCase();
    const prefijo = tipo === 'EMPLEADO' ? 'EMPLEADO-' : 'SOCIO-';
    try {
        const clientes = await db_1.default.cliente.findMany({
            where: {
                codigo_socio: {
                    startsWith: prefijo,
                },
            },
            select: {
                codigo_socio: true,
            },
        });
        let maxNum = 0;
        for (const c of clientes) {
            const code = c.codigo_socio || '';
            const numPart = code.substring(prefijo.length);
            const num = parseInt(numPart, 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
        return res.json({ siguiente_codigo: `${prefijo}${maxNum + 1}` });
    }
    catch (error) {
        console.error('Error al calcular siguiente código:', error);
        return res.status(500).json({ error: 'Error al calcular siguiente código' });
    }
}
