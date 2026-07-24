"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.abrirTurno = abrirTurno;
exports.obtenerTurnoActivo = obtenerTurnoActivo;
exports.cerrarTurno = cerrarTurno;
exports.registrarRetiroCaja = registrarRetiroCaja;
exports.registrarIngresoCaja = registrarIngresoCaja;
const decimal_js_1 = require("decimal.js");
const db_1 = __importDefault(require("../db"));
// 1. Abrir un nuevo turno de caja (Apertura)
async function abrirTurno(req, res) {
    const { fondo_inicial, area_id } = req.body;
    const usuarioId = req.user?.id;
    if (fondo_inicial === undefined || !usuarioId || !area_id) {
        return res.status(400).json({ error: 'Fondo inicial, área y usuario requeridos' });
    }
    try {
        // Verificar si ya existe un turno activo para esa área
        const turnoPrevio = await db_1.default.turno.findFirst({
            where: { activo: true, area_id: Number(area_id) },
        });
        if (turnoPrevio) {
            return res.status(400).json({ error: 'Ya existe un turno activo para esta área. Debe cerrarlo primero.' });
        }
        const fondoDec = new decimal_js_1.Decimal(fondo_inicial);
        if (fondoDec.lessThan(0)) {
            return res.status(400).json({ error: 'El fondo inicial no puede ser menor a cero' });
        }
        const nuevoTurno = await db_1.default.turno.create({
            data: {
                usuario_id: usuarioId,
                area_id: Number(area_id),
                fondo_inicial: fondoDec,
                activo: true,
            },
        });
        return res.status(201).json({
            message: 'Turno abierto exitosamente',
            turno: {
                id: nuevoTurno.id,
                fondo_inicial: Number(nuevoTurno.fondo_inicial),
                abierto_at: nuevoTurno.abierto_at,
                activo: nuevoTurno.activo,
            }
        });
    }
    catch (error) {
        console.error('Error al abrir turno:', error);
        return res.status(500).json({ error: 'Error al iniciar turno de caja' });
    }
}
// 2. Obtener turno activo y su historial de ventas actual
async function obtenerTurnoActivo(req, res) {
    const area_id = req.query.area_id;
    try {
        const turno = await db_1.default.turno.findFirst({
            where: { activo: true, ...(area_id ? { area_id: Number(area_id) } : {}) },
            select: {
                id: true,
                activo: true,
                fondo_inicial: true,
                abierto_at: true,
                area_id: true,
                usuario_id: true,
                caja_efectivo: true,
                caja_tarjeta: true,
                caja_cargos: true,
                caja_transferencia: true,
                cerrado_at: true,
                retiros: true,
                cuentas: {
                    where: { estado: 'PAGADA' },
                    select: {
                        id: true,
                        total: true,
                        metodo_pago: true,
                        monto_efectivo: true,
                        monto_tarjeta: true,
                        nombre_referencia: true,
                        created_at: true,
                        closed_at: true,
                        area_id: true,
                        usuario_id: true,
                        descuento: true,
                        cadi_id: true,
                        usuario: { select: { nombre: true } },
                        detalleCuentas: {
                            select: {
                                cantidad: true,
                                precio_unitario: true,
                                subtotal: true,
                                notas: true,
                                producto: { select: { id: true, nombre: true, categoria: true } },
                            },
                        },
                        divisionesCuentas: {
                            select: {
                                id: true,
                                cliente_id: true,
                                monto_proporcional: true,
                                metodo_pago: true,
                                estado_pago: true,
                                turno_pago_id: true,
                                monto_efectivo: true,
                                monto_tarjeta: true,
                                cliente: { select: { id: true, nombre: true, codigo_socio: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!turno) {
            return res.json({ activo: false });
        }
        // Calcular balances financieros acumulados en el turno activo
        let efectivo = new decimal_js_1.Decimal(0);
        let tarjeta = new decimal_js_1.Decimal(0);
        let cargos = new decimal_js_1.Decimal(0);
        let transferencia = new decimal_js_1.Decimal(0);
        const ventas = [];
        turno.cuentas.forEach(cuenta => {
            const items = cuenta.detalleCuentas.map(det => `${Number(det.cantidad)}x ${det.producto.nombre}`);
            const pagos = [];
            if (cuenta.divisionesCuentas.length > 0) {
                // Pago Split (con socios)
                let sumaDivisiones = new decimal_js_1.Decimal(0);
                cuenta.divisionesCuentas.forEach(div => {
                    const montoDec = new decimal_js_1.Decimal(div.monto_proporcional);
                    const metodo = div.metodo_pago;
                    const esCargoOriginario = metodo === 'CARGO_SOCIO' || (div.turno_pago_id && div.turno_pago_id !== turno.id);
                    // Si es un cargo generado originariamente en este turno
                    if (esCargoOriginario) {
                        cargos = cargos.plus(montoDec);
                        pagos.push({
                            cliente_id: div.cliente_id,
                            nombre: div.cliente.nombre,
                            monto: Number(montoDec),
                            metodo: 'CARGO_SOCIO',
                        });
                    }
                    // Si fue pago inmediato en efectivo/tarjeta o se pagó en este turno
                    else if (!div.turno_pago_id || div.turno_pago_id === turno.id) {
                        if (!div.turno_pago_id) {
                            if (metodo === 'EFECTIVO')
                                efectivo = efectivo.plus(montoDec);
                            else if (metodo === 'TARJETA')
                                tarjeta = tarjeta.plus(montoDec);
                            else if (metodo === 'TRANSFERENCIA')
                                transferencia = transferencia.plus(montoDec);
                            else if (metodo === 'MIXTO') {
                                efectivo = efectivo.plus(new decimal_js_1.Decimal(div.monto_efectivo || 0));
                                tarjeta = tarjeta.plus(new decimal_js_1.Decimal(div.monto_tarjeta || 0));
                            }
                        }
                        pagos.push({
                            cliente_id: div.cliente_id,
                            nombre: div.cliente.nombre,
                            monto: Number(montoDec),
                            metodo: div.metodo_pago,
                        });
                    }
                });
                // Abono Directo (si hay diferencia y se especificó método de pago en la cuenta)
                const totalCuenta = new decimal_js_1.Decimal(cuenta.total);
                if (cuenta.metodo_pago && totalCuenta.greaterThan(sumaDivisiones)) {
                    const dif = totalCuenta.minus(sumaDivisiones);
                    if (cuenta.metodo_pago === 'EFECTIVO')
                        efectivo = efectivo.plus(dif);
                    else if (cuenta.metodo_pago === 'TARJETA')
                        tarjeta = tarjeta.plus(dif);
                    else if (cuenta.metodo_pago === 'TRANSFERENCIA')
                        transferencia = transferencia.plus(dif);
                    else if (cuenta.metodo_pago === 'MIXTO') {
                        efectivo = efectivo.plus(new decimal_js_1.Decimal(cuenta.monto_efectivo || 0));
                        tarjeta = tarjeta.plus(new decimal_js_1.Decimal(cuenta.monto_tarjeta || 0));
                    }
                    pagos.push({
                        cliente_id: null,
                        nombre: 'Abono Directo',
                        monto: Number(dif),
                        metodo: cuenta.metodo_pago,
                    });
                }
            }
            else if (cuenta.metodo_pago) {
                // Pago Directo (sin socios)
                const montoDec = new decimal_js_1.Decimal(cuenta.total);
                const metodo = cuenta.metodo_pago;
                if (metodo === 'EFECTIVO')
                    efectivo = efectivo.plus(montoDec);
                else if (metodo === 'TARJETA')
                    tarjeta = tarjeta.plus(montoDec);
                else if (metodo === 'TRANSFERENCIA')
                    transferencia = transferencia.plus(montoDec);
                else if (metodo === 'CARGO_SOCIO')
                    cargos = cargos.plus(montoDec);
                else if (metodo === 'MIXTO') {
                    efectivo = efectivo.plus(new decimal_js_1.Decimal(cuenta.monto_efectivo || 0));
                    tarjeta = tarjeta.plus(new decimal_js_1.Decimal(cuenta.monto_tarjeta || 0));
                }
                pagos.push({
                    cliente_id: null,
                    nombre: 'Pago directo',
                    monto: Number(montoDec),
                    metodo: cuenta.metodo_pago,
                });
            }
            const productos = cuenta.detalleCuentas.map(det => ({
                id: det.producto.id,
                nombre: det.producto.nombre,
                precio_venta: Number(det.precio_unitario),
                cantidad: Number(det.cantidad),
                categoria: det.producto.categoria,
                notas: det.notas || '',
                subtotal: Number(det.subtotal)
            }));
            const socios = cuenta.divisionesCuentas.map(div => ({
                id: div.cliente.id,
                nombre: div.cliente.nombre,
                codigo_socio: div.cliente.codigo_socio
            }));
            ventas.push({
                id: Number(cuenta.id),
                referencia: cuenta.nombre_referencia || '—',
                fecha: cuenta.closed_at,
                area: cuenta.area_id === 1 ? 'Bar' : cuenta.area_id === 2 ? 'Snack' : 'Palapa',
                area_id: cuenta.area_id,
                usuario_id: cuenta.usuario_id,
                atendido_por: cuenta.usuario?.nombre || 'Desconocido',
                total: Number(cuenta.total),
                descuento: Number(cuenta.descuento),
                cadi_id: cuenta.cadi_id,
                items,
                productos,
                socios,
                pagos,
            });
        });
        // Fetch all divisions paid/liquidated in this shift
        const divisionesPagadasTurno = await db_1.default.divisionCuenta.findMany({
            where: { turno_pago_id: turno.id },
            include: {
                cliente: true,
                cuenta: {
                    include: {
                        usuario: { select: { nombre: true } }
                    }
                }
            }
        });
        divisionesPagadasTurno.forEach(div => {
            const montoDec = new decimal_js_1.Decimal(div.monto_proporcional);
            const metodo = div.metodo_pago;
            if (metodo === 'EFECTIVO')
                efectivo = efectivo.plus(montoDec);
            else if (metodo === 'TARJETA')
                tarjeta = tarjeta.plus(montoDec);
            else if (metodo === 'TRANSFERENCIA')
                transferencia = transferencia.plus(montoDec);
        });
        const retirosOnly = turno.retiros.filter(r => r.tipo !== 'INGRESO');
        const ingresosOnly = turno.retiros.filter(r => r.tipo === 'INGRESO');
        const totalRetiros = retirosOnly.reduce((sum, r) => sum.plus(new decimal_js_1.Decimal(r.monto)), new decimal_js_1.Decimal(0));
        const totalIngresos = ingresosOnly.reduce((sum, r) => sum.plus(new decimal_js_1.Decimal(r.monto)), new decimal_js_1.Decimal(0));
        return res.json({
            activo: true,
            turno: {
                id: turno.id,
                fondo_inicial: Number(turno.fondo_inicial),
                abierto_at: turno.abierto_at,
            },
            balances: {
                efectivo: efectivo.toNumber(),
                total_retiros: totalRetiros.toNumber(),
                total_ingresos: totalIngresos.toNumber(),
                total_caja_efectivo: efectivo.plus(turno.fondo_inicial).plus(totalIngresos).minus(totalRetiros).toNumber(), // Caja total con el fondo inicial + ingresos - retiros
                tarjeta: tarjeta.toNumber(),
                transferencia: transferencia.toNumber(),
                cargo_socio: cargos.toNumber(),
            },
            ventas,
            retiros: turno.retiros.map(r => ({
                id: r.id,
                monto: Number(r.monto),
                motivo: r.motivo,
                tipo: r.tipo || 'RETIRO',
                fecha: r.created_at,
            })),
            cargos_liquidados: divisionesPagadasTurno.map(div => ({
                id: div.id,
                socio: div.cliente.nombre,
                cuenta_id: div.cuenta_id,
                monto: Number(div.monto_proporcional),
                metodo_pago: div.metodo_pago,
                fecha: div.pagado_at,
            })),
        });
    }
    catch (error) {
        console.error('Error al obtener turno activo:', error);
        return res.status(500).json({ error: 'Error al consultar estado de caja' });
    }
}
// 3. Cerrar caja y terminar turno (Arqueo y Cierre)
async function cerrarTurno(req, res) {
    const { area_id } = req.body;
    try {
        const turnoActivo = await db_1.default.turno.findFirst({
            where: { activo: true, ...(area_id ? { area_id: Number(area_id) } : {}) },
        });
        if (!turnoActivo) {
            return res.status(400).json({ error: 'No hay un turno activo para cerrar' });
        }
        // 1. Buscar todas las cuentas abiertas vinculadas al turno activo
        const cuentasAbiertas = await db_1.default.cuenta.findMany({
            where: {
                turno_id: turnoActivo.id,
                estado: 'ABIERTA',
            },
            include: {
                cadi: {
                    include: {
                        asignaciones: {
                            where: { activa: true },
                            include: {
                                cliente: true,
                            },
                        },
                    },
                },
            },
        });
        // 2. Liquidar cada cuenta abierta a CARGO_SOCIO
        for (const cuenta of cuentasAbiertas) {
            const cadiId = cuenta.cadi_id;
            const clientesRonda = cuenta.cadi ? cuenta.cadi.asignaciones.map(a => a.cliente) : [];
            if (cadiId && clientesRonda.length > 0) {
                const totalCuenta = new decimal_js_1.Decimal(cuenta.total);
                const cantidadClientes = clientesRonda.length;
                const porcentajeBase = new decimal_js_1.Decimal(100).div(cantidadClientes);
                const montoBase = totalCuenta.div(cantidadClientes).toDP(2);
                let totalDividido = montoBase.mul(cantidadClientes);
                let residuo = totalCuenta.minus(totalDividido);
                await db_1.default.$transaction(async (tx) => {
                    for (let i = 0; i < cantidadClientes; i++) {
                        const cliente = clientesRonda[i];
                        let montoCliente = new decimal_js_1.Decimal(montoBase);
                        if (i === cantidadClientes - 1 && !residuo.isZero()) {
                            montoCliente = montoCliente.plus(residuo);
                        }
                        const porcentaje = montoCliente.div(totalCuenta).mul(100);
                        await tx.divisionCuenta.create({
                            data: {
                                cuenta_id: cuenta.id,
                                cliente_id: cliente.id,
                                porcentaje_participacion: porcentaje,
                                monto_proporcional: montoCliente,
                                metodo_pago: 'CARGO_SOCIO',
                                estado_pago: 'PENDIENTE',
                                pagado_at: null,
                            },
                        });
                    }
                    await tx.cuenta.update({
                        where: { id: cuenta.id },
                        data: {
                            estado: 'PAGADA',
                            closed_at: new Date(),
                        },
                    });
                });
            }
            else {
                // Intentar buscar si existe un socio activo con el mismo nombre que la referencia
                let clienteEncontrado = null;
                if (cuenta.nombre_referencia) {
                    clienteEncontrado = await db_1.default.cliente.findFirst({
                        where: {
                            nombre: { equals: cuenta.nombre_referencia.trim() },
                            activo: true,
                        },
                    });
                }
                if (clienteEncontrado) {
                    await db_1.default.$transaction(async (tx) => {
                        await tx.divisionCuenta.create({
                            data: {
                                cuenta_id: cuenta.id,
                                cliente_id: clienteEncontrado.id,
                                porcentaje_participacion: new decimal_js_1.Decimal(100),
                                monto_proporcional: cuenta.total,
                                metodo_pago: 'CARGO_SOCIO',
                                estado_pago: 'PENDIENTE',
                                pagado_at: null,
                            },
                        });
                        await tx.cuenta.update({
                            where: { id: cuenta.id },
                            data: {
                                estado: 'PAGADA',
                                closed_at: new Date(),
                            },
                        });
                    });
                }
                else {
                    await db_1.default.cuenta.update({
                        where: { id: cuenta.id },
                        data: {
                            estado: 'PAGADA',
                            closed_at: new Date(),
                            metodo_pago: 'CARGO_SOCIO',
                        },
                    });
                }
            }
            if (cadiId) {
                const otrasAsignaciones = await db_1.default.asignacionCadiCliente.findMany({
                    where: { cadi_id: cadiId, activa: true },
                });
                if (otrasAsignaciones.length === 0) {
                    await db_1.default.cadi.update({
                        where: { id: cadiId },
                        data: { estado: 'DISPONIBLE' },
                    });
                }
            }
        }
        // 3. Consultar el turno con todas las cuentas pagadas (incluyendo las auto-liquidadas)
        const turno = await db_1.default.turno.findUnique({
            where: { id: turnoActivo.id },
            include: {
                cuentas: {
                    where: { estado: 'PAGADA' },
                    include: {
                        divisionesCuentas: true,
                    },
                },
                retiros: true,
            },
        });
        if (!turno) {
            return res.status(404).json({ error: 'No se pudo consultar el turno activo' });
        }
        // Calcular balances finales del turno
        let efectivo = new decimal_js_1.Decimal(0);
        let tarjeta = new decimal_js_1.Decimal(0);
        let cargos = new decimal_js_1.Decimal(0);
        let transferencia = new decimal_js_1.Decimal(0);
        turno.cuentas.forEach(cuenta => {
            if (cuenta.divisionesCuentas.length > 0) {
                let sumaDivisiones = new decimal_js_1.Decimal(0);
                cuenta.divisionesCuentas.forEach(div => {
                    const montoDec = new decimal_js_1.Decimal(div.monto_proporcional);
                    const metodo = div.metodo_pago;
                    const esCargoOriginario = metodo === 'CARGO_SOCIO' || (div.turno_pago_id && div.turno_pago_id !== turno.id);
                    if (esCargoOriginario) {
                        cargos = cargos.plus(montoDec);
                    }
                    else if (!div.turno_pago_id) {
                        if (metodo === 'EFECTIVO')
                            efectivo = efectivo.plus(montoDec);
                        else if (metodo === 'TARJETA')
                            tarjeta = tarjeta.plus(montoDec);
                        else if (metodo === 'TRANSFERENCIA')
                            transferencia = transferencia.plus(montoDec);
                        else if (metodo === 'MIXTO') {
                            efectivo = efectivo.plus(new decimal_js_1.Decimal(div.monto_efectivo || 0));
                            tarjeta = tarjeta.plus(new decimal_js_1.Decimal(div.monto_tarjeta || 0));
                        }
                    }
                    sumaDivisiones = sumaDivisiones.plus(montoDec);
                });
                const totalCuenta = new decimal_js_1.Decimal(cuenta.total);
                if (cuenta.metodo_pago && totalCuenta.greaterThan(sumaDivisiones)) {
                    const dif = totalCuenta.minus(sumaDivisiones);
                    if (cuenta.metodo_pago === 'EFECTIVO')
                        efectivo = efectivo.plus(dif);
                    else if (cuenta.metodo_pago === 'TARJETA')
                        tarjeta = tarjeta.plus(dif);
                    else if (cuenta.metodo_pago === 'TRANSFERENCIA')
                        transferencia = transferencia.plus(dif);
                    else if (cuenta.metodo_pago === 'MIXTO') {
                        efectivo = efectivo.plus(new decimal_js_1.Decimal(cuenta.monto_efectivo || 0));
                        tarjeta = tarjeta.plus(new decimal_js_1.Decimal(cuenta.monto_tarjeta || 0));
                    }
                }
            }
            else if (cuenta.metodo_pago) {
                const montoDec = new decimal_js_1.Decimal(cuenta.total);
                const metodo = cuenta.metodo_pago;
                if (metodo === 'EFECTIVO')
                    efectivo = efectivo.plus(montoDec);
                else if (metodo === 'TARJETA')
                    tarjeta = tarjeta.plus(montoDec);
                else if (metodo === 'TRANSFERENCIA')
                    transferencia = transferencia.plus(montoDec);
                else if (metodo === 'CARGO_SOCIO')
                    cargos = cargos.plus(montoDec);
                else if (metodo === 'MIXTO') {
                    efectivo = efectivo.plus(new decimal_js_1.Decimal(cuenta.monto_efectivo || 0));
                    tarjeta = tarjeta.plus(new decimal_js_1.Decimal(cuenta.monto_tarjeta || 0));
                }
            }
        });
        // Fetch all divisions paid/liquidated in this shift
        const divisionesPagadasTurno = await db_1.default.divisionCuenta.findMany({
            where: { turno_pago_id: turno.id },
        });
        divisionesPagadasTurno.forEach(div => {
            const montoDec = new decimal_js_1.Decimal(div.monto_proporcional);
            const metodo = div.metodo_pago;
            if (metodo === 'EFECTIVO')
                efectivo = efectivo.plus(montoDec);
            else if (metodo === 'TARJETA')
                tarjeta = tarjeta.plus(montoDec);
            else if (metodo === 'TRANSFERENCIA')
                transferencia = transferencia.plus(montoDec);
        });
        const fondoDec = new decimal_js_1.Decimal(turno.fondo_inicial);
        const efectivoTotalCaja = efectivo.plus(fondoDec);
        const totalRetiros = turno.retiros.filter(r => r.tipo !== 'INGRESO').reduce((sum, r) => sum.plus(new decimal_js_1.Decimal(r.monto)), new decimal_js_1.Decimal(0));
        const totalIngresos = turno.retiros.filter(r => r.tipo === 'INGRESO').reduce((sum, r) => sum.plus(new decimal_js_1.Decimal(r.monto)), new decimal_js_1.Decimal(0));
        const finalEfectivoCaja = efectivoTotalCaja.plus(totalIngresos).minus(totalRetiros);
        // Actualizar el turno para marcarlo inactivo y guardar los arqueos
        const turnoCerrado = await db_1.default.turno.update({
            where: { id: turno.id },
            data: {
                activo: false,
                cerrado_at: new Date(),
                caja_efectivo: finalEfectivoCaja, // Caja de efectivo real final (fondo + ventas - retiros)
                caja_tarjeta: tarjeta,
                caja_cargos: cargos,
                caja_transferencia: transferencia,
            },
        });
        return res.json({
            message: 'Turno cerrado y arqueado exitosamente',
            resumen: {
                id: turnoCerrado.id,
                fondo_inicial: Number(turnoCerrado.fondo_inicial),
                efectivo_ventas: efectivo.toNumber(),
                efectivo_total_entregar: efectivoTotalCaja.toNumber(),
                tarjeta_ventas: tarjeta.toNumber(),
                transferencia_ventas: transferencia.toNumber(),
                cargos_socios_adeudos: cargos.toNumber(),
                abierto_at: turnoCerrado.abierto_at,
                cerrado_at: turnoCerrado.cerrado_at,
                total_retiros: totalRetiros.toNumber(),
                total_ingresos: totalIngresos.toNumber(),
                caja_efectivo_final: finalEfectivoCaja.toNumber(),
                retiros: turno.retiros ? turno.retiros.map(r => ({
                    id: r.id,
                    monto: Number(r.monto),
                    motivo: r.motivo,
                    tipo: r.tipo || 'RETIRO',
                    fecha: r.created_at,
                })) : [],
            }
        });
    }
    catch (error) {
        console.error('Error al cerrar turno:', error);
        return res.status(500).json({ error: 'Error al finalizar el turno de caja' });
    }
}
// 4. Registrar un retiro de efectivo de la caja activa
async function registrarRetiroCaja(req, res) {
    const { monto, motivo, area_id } = req.body;
    if (monto === undefined || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
        return res.status(400).json({ error: 'Monto de retiro válido requerido' });
    }
    if (!motivo || motivo.trim() === '') {
        return res.status(400).json({ error: 'Motivo del retiro requerido' });
    }
    try {
        const turnoActivo = await db_1.default.turno.findFirst({
            where: { activo: true, ...(area_id ? { area_id: Number(area_id) } : {}) },
            select: { id: true, fondo_inicial: true }
        });
        if (!turnoActivo) {
            return res.status(400).json({ error: 'No hay un turno activo abierto para registrar el retiro' });
        }
        const montoDec = new decimal_js_1.Decimal(monto);
        // Suma de cuentas directas (sin divisiones) en efectivo
        const sumaCuentasDirectas = await db_1.default.cuenta.aggregate({
            _sum: { total: true },
            where: {
                turno_id: turnoActivo.id,
                estado: 'PAGADA',
                metodo_pago: 'EFECTIVO',
                divisionesCuentas: { none: {} }
            }
        });
        // Suma de divisiones en efectivo
        const sumaCuentasSplit = await db_1.default.divisionCuenta.aggregate({
            _sum: { monto_proporcional: true },
            where: {
                cuenta: {
                    turno_id: turnoActivo.id,
                    estado: 'PAGADA'
                },
                metodo_pago: 'EFECTIVO'
            }
        });
        const efectivoVentas = new decimal_js_1.Decimal(sumaCuentasDirectas._sum.total || 0)
            .plus(new decimal_js_1.Decimal(sumaCuentasSplit._sum.monto_proporcional || 0));
        // Suma de retiros previos
        const sumaRetiros = await db_1.default.retiroCaja.aggregate({
            _sum: { monto: true },
            where: {
                turno_id: turnoActivo.id,
                tipo: 'RETIRO'
            }
        });
        // Suma de ingresos previos
        const sumaIngresos = await db_1.default.retiroCaja.aggregate({
            _sum: { monto: true },
            where: {
                turno_id: turnoActivo.id,
                tipo: 'INGRESO'
            }
        });
        const totalRetirosPrevios = new decimal_js_1.Decimal(sumaRetiros._sum.monto || 0);
        const totalIngresosPrevios = new decimal_js_1.Decimal(sumaIngresos._sum.monto || 0);
        const efectivoDisponible = efectivoVentas.plus(new decimal_js_1.Decimal(turnoActivo.fondo_inicial)).plus(totalIngresosPrevios).minus(totalRetirosPrevios);
        if (montoDec.greaterThan(efectivoDisponible)) {
            return res.status(400).json({
                error: `Monto de retiro ($${montoDec.toNumber()}) excede el efectivo disponible en caja ($${efectivoDisponible.toNumber()})`
            });
        }
        const nuevoRetiro = await db_1.default.retiroCaja.create({
            data: {
                turno_id: turnoActivo.id,
                monto: montoDec,
                motivo: motivo.trim(),
                tipo: 'RETIRO',
            },
        });
        return res.json({
            message: 'Retiro de caja registrado correctamente',
            retiro: {
                id: nuevoRetiro.id,
                monto: Number(nuevoRetiro.monto),
                motivo: nuevoRetiro.motivo,
                tipo: nuevoRetiro.tipo,
                fecha: nuevoRetiro.created_at,
            },
        });
    }
    catch (error) {
        console.error('Error al registrar retiro de caja:', error);
        return res.status(500).json({ error: 'Error al procesar el retiro de efectivo de caja' });
    }
}
// 5. Registrar un ingreso de efectivo a la caja activa
async function registrarIngresoCaja(req, res) {
    const { monto, motivo, area_id } = req.body;
    if (monto === undefined || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
        return res.status(400).json({ error: 'Monto de ingreso válido requerido' });
    }
    if (!motivo || motivo.trim() === '') {
        return res.status(400).json({ error: 'Motivo del ingreso requerido' });
    }
    try {
        const turnoActivo = await db_1.default.turno.findFirst({
            where: { activo: true, ...(area_id ? { area_id: Number(area_id) } : {}) },
        });
        if (!turnoActivo) {
            return res.status(400).json({ error: 'No hay un turno activo abierto para registrar el ingreso' });
        }
        const montoDec = new decimal_js_1.Decimal(monto);
        const nuevoIngreso = await db_1.default.retiroCaja.create({
            data: {
                turno_id: turnoActivo.id,
                monto: montoDec,
                motivo: motivo.trim(),
                tipo: 'INGRESO',
            },
        });
        return res.json({
            message: 'Ingreso de caja registrado correctamente',
            ingreso: {
                id: nuevoIngreso.id,
                monto: Number(nuevoIngreso.monto),
                motivo: nuevoIngreso.motivo,
                tipo: nuevoIngreso.tipo,
                fecha: nuevoIngreso.created_at,
            },
        });
    }
    catch (error) {
        console.error('Error al registrar ingreso de caja:', error);
        return res.status(500).json({ error: 'Error al procesar el ingreso de efectivo de caja' });
    }
}
