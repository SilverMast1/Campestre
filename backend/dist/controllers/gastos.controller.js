"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarGastoIngreso = registrarGastoIngreso;
exports.eliminarGastoIngreso = eliminarGastoIngreso;
exports.obtenerReporteSemanalGastos = obtenerReporteSemanalGastos;
const decimal_js_1 = require("decimal.js");
const db_1 = __importDefault(require("../db"));
// Registrar un gasto o ingreso
async function registrarGastoIngreso(req, res) {
    const { fecha, tipo_registro, concepto, monto, metodo_pago } = req.body;
    if (!fecha || !tipo_registro || !concepto || monto === undefined || !metodo_pago) {
        return res.status(400).json({ error: 'Todos los campos son requeridos: fecha, tipo_registro, concepto, monto, metodo_pago' });
    }
    try {
        const registro = await db_1.default.gastoIngresoCCL.create({
            data: {
                fecha: new Date(fecha),
                tipo_registro,
                concepto,
                monto: new decimal_js_1.Decimal(monto),
                metodo_pago
            }
        });
        return res.status(201).json(registro);
    }
    catch (error) {
        console.error('Error al registrar gasto/ingreso:', error);
        return res.status(500).json({ error: error.message || 'Error al guardar el registro' });
    }
}
// Eliminar un gasto o ingreso
async function eliminarGastoIngreso(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }
    try {
        await db_1.default.gastoIngresoCCL.delete({
            where: { id }
        });
        return res.json({ message: 'Registro eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error al eliminar registro:', error);
        return res.status(500).json({ error: error.message || 'Error al eliminar el registro' });
    }
}
// Obtener reporte semanal y lista de registros
async function obtenerReporteSemanalGastos(req, res) {
    const fechaStr = req.query.fecha; // Fecha base para determinar la semana (YYYY-MM-DD)
    if (!fechaStr) {
        return res.status(400).json({ error: 'La fecha es requerida' });
    }
    try {
        const [year, month, day] = fechaStr.split('-').map(Number);
        const baseDate = new Date(year, month - 1, day);
        const dayOfWeek = baseDate.getDay(); // 0: domingo, 1: lunes...
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const inicioSemana = new Date(baseDate);
        inicioSemana.setDate(baseDate.getDate() + diffToMonday);
        inicioSemana.setHours(0, 0, 0, 0);
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        finSemana.setHours(23, 59, 59, 999);
        // Buscar registros en el rango de la semana
        const registros = await db_1.default.gastoIngresoCCL.findMany({
            where: {
                fecha: {
                    gte: inicioSemana,
                    lte: finSemana
                }
            },
            orderBy: { fecha: 'asc' }
        });
        // Inicializar acumuladores decimales
        let totalGastosFijos = new decimal_js_1.Decimal(0);
        let totalGastosVariables = new decimal_js_1.Decimal(0);
        let totalGastosMateriales = new decimal_js_1.Decimal(0);
        let ingresoEfectivo = new decimal_js_1.Decimal(0);
        let ingresoIzettle = new decimal_js_1.Decimal(0);
        let ingresoBanregio = new decimal_js_1.Decimal(0);
        let egresoEfectivo = new decimal_js_1.Decimal(0);
        let egresoIzettle = new decimal_js_1.Decimal(0);
        let egresoBanregio = new decimal_js_1.Decimal(0);
        const desglose = registros.map((r) => {
            const monto = new decimal_js_1.Decimal(r.monto);
            if (r.tipo_registro === 'INGRESO') {
                if (r.metodo_pago === 'EFECTIVO')
                    ingresoEfectivo = ingresoEfectivo.plus(monto);
                else if (r.metodo_pago === 'IZETTLE')
                    ingresoIzettle = ingresoIzettle.plus(monto);
                else if (r.metodo_pago === 'BANREGIO')
                    ingresoBanregio = ingresoBanregio.plus(monto);
            }
            else {
                // Es un gasto (GASTO_FIJO, GASTO_VARIABLE, GASTO_MATERIAL)
                if (r.tipo_registro === 'GASTO_FIJO')
                    totalGastosFijos = totalGastosFijos.plus(monto);
                else if (r.tipo_registro === 'GASTO_VARIABLE')
                    totalGastosVariables = totalGastosVariables.plus(monto);
                else if (r.tipo_registro === 'GASTO_MATERIAL')
                    totalGastosMateriales = totalGastosMateriales.plus(monto);
                // Agrupar salidas por canal de pago
                if (r.metodo_pago === 'EFECTIVO')
                    egresoEfectivo = egresoEfectivo.plus(monto);
                else if (r.metodo_pago === 'IZETTLE')
                    egresoIzettle = egresoIzettle.plus(monto);
                else if (r.metodo_pago === 'BANREGIO')
                    egresoBanregio = egresoBanregio.plus(monto);
            }
            return {
                id: r.id,
                fecha: r.fecha,
                tipo_registro: r.tipo_registro,
                concepto: r.concepto,
                monto: monto.toNumber(),
                metodo_pago: r.metodo_pago
            };
        });
        // Calcular cierres
        const cierreEfectivo = ingresoEfectivo.minus(egresoEfectivo);
        const cierreIzettle = ingresoIzettle.minus(egresoIzettle);
        const cierreBanregio = ingresoBanregio.minus(egresoBanregio);
        const cierreCaja = ingresoEfectivo.plus(ingresoIzettle).plus(ingresoBanregio);
        const totalSemanal = cierreEfectivo.plus(cierreIzettle).plus(cierreBanregio);
        return res.json({
            inicio_semana: inicioSemana,
            fin_semana: finSemana,
            registros: desglose,
            sumario: {
                gastos_fijos: totalGastosFijos.toNumber(),
                gastos_variables: totalGastosVariables.toNumber(),
                gastos_materiales: totalGastosMateriales.toNumber(),
                ingreso_efectivo: ingresoEfectivo.toNumber(),
                ingreso_izettle: ingresoIzettle.toNumber(),
                ingreso_banregio: ingresoBanregio.toNumber(),
                egreso_efectivo: egresoEfectivo.toNumber(),
                egreso_izettle: egresoIzettle.toNumber(),
                egreso_banregio: egresoBanregio.toNumber(),
                cierre_caja: cierreCaja.toNumber(),
                cierre_semanal_efectivo: cierreEfectivo.toNumber(),
                cierre_semanal_izettle: cierreIzettle.toNumber(),
                cierre_semanal_banregio: cierreBanregio.toNumber(),
                total_semanal: totalSemanal.toNumber()
            }
        });
    }
    catch (error) {
        console.error('Error al generar reporte de gastos:', error);
        return res.status(500).json({ error: error.message || 'Error al obtener reporte' });
    }
}
