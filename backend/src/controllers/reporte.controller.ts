import { Response } from 'express';
import { Decimal } from 'decimal.js';
import prisma from '../db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// 1. Obtener reporte de ventas por rango (diario, semanal, mensual) en huso local
export async function obtenerReporteDiario(req: AuthenticatedRequest, res: Response) {
  const fechaStr = req.query.fecha as string; // YYYY-MM-DD
  const rango = (req.query.rango as string) || 'diario';

  if (!fechaStr) {
    return res.status(400).json({ error: 'La fecha es requerida (formato YYYY-MM-DD)' });
  }

  try {
    // Determinar inicio y fin en la zona horaria local del servidor
    const [year, month, day] = fechaStr.split('-').map(Number);
    let inicioDia: Date;
    let finDia: Date;

    if (rango === 'semanal') {
      const baseDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const dayOfWeek = baseDate.getDay(); // 0 is Sunday, 1 is Monday...
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      inicioDia = new Date(baseDate);
      inicioDia.setDate(baseDate.getDate() + diffToMonday);

      finDia = new Date(inicioDia);
      finDia.setDate(inicioDia.getDate() + 6);
      finDia.setHours(23, 59, 59, 999);
    } else if (rango === 'mensual') {
      inicioDia = new Date(year, month - 1, 1, 0, 0, 0, 0);
      finDia = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      // diario (local timezone instead of UTC)
      inicioDia = new Date(year, month - 1, day, 0, 0, 0, 0);
      finDia = new Date(year, month - 1, day, 23, 59, 59, 999);
    }

    // Buscar cuentas pagadas en ese rango de fecha
    const cuentas = await prisma.cuenta.findMany({
      where: {
        estado: 'PAGADA',
        closed_at: {
          gte: inicioDia,
          lte: finDia,
        },
      },
      include: {
        area: true,
        usuario: { select: { nombre: true } },
        detalleCuentas: { include: { producto: true } },
        divisionesCuentas: { include: { cliente: true } },
      },
      orderBy: { closed_at: 'desc' },
    });

    let efectivo = new Decimal(0);
    let tarjeta = new Decimal(0);
    let cargos = new Decimal(0);
    let totalVentas = new Decimal(0);
    let totalDescuentos = new Decimal(0);

    const ventas = cuentas.map((c) => {
      const items = c.detalleCuentas.map(det => `${Number(det.cantidad)}x ${det.producto.nombre}`);
      const pagos: any[] = [];
      const totalCuenta = new Decimal(c.total);
      totalVentas = totalVentas.plus(totalCuenta);
      totalDescuentos = totalDescuentos.plus(new Decimal(c.descuento || 0));

      if (c.divisionesCuentas.length > 0) {
        let sumaDivisiones = new Decimal(0);
        c.divisionesCuentas.forEach(div => {
          const montoDec = new Decimal(div.monto_proporcional);
          const metodo = div.metodo_pago;

          if (metodo === 'EFECTIVO') efectivo = efectivo.plus(montoDec);
          else if (metodo === 'TARJETA') tarjeta = tarjeta.plus(montoDec);
          else if (metodo === 'CARGO_SOCIO') cargos = cargos.plus(montoDec);
          else if (metodo === 'MIXTO') {
            efectivo = efectivo.plus(new Decimal(div.monto_efectivo || 0));
            tarjeta = tarjeta.plus(new Decimal(div.monto_tarjeta || 0));
          }

          sumaDivisiones = sumaDivisiones.plus(montoDec);

          pagos.push({
            nombre: div.cliente.nombre,
            monto: Number(montoDec),
            metodo,
          });
        });

        // Abono Directo (si hay diferencia y se especificó método de pago en la cuenta)
        if (c.metodo_pago && totalCuenta.greaterThan(sumaDivisiones)) {
          const dif = totalCuenta.minus(sumaDivisiones);
          if (c.metodo_pago === 'EFECTIVO') efectivo = efectivo.plus(dif);
          else if (c.metodo_pago === 'TARJETA') tarjeta = tarjeta.plus(dif);
          else if (c.metodo_pago === 'MIXTO') {
            efectivo = efectivo.plus(new Decimal(c.monto_efectivo || 0));
            tarjeta = tarjeta.plus(new Decimal(c.monto_tarjeta || 0));
          }

          pagos.push({
            nombre: 'Abono Directo',
            monto: Number(dif),
            metodo: c.metodo_pago,
          });
        }
      } else if (c.metodo_pago) {
        const metodo = c.metodo_pago;
        if (metodo === 'EFECTIVO') efectivo = efectivo.plus(totalCuenta);
        else if (metodo === 'TARJETA') tarjeta = tarjeta.plus(totalCuenta);
        else if (metodo === 'CARGO_SOCIO') cargos = cargos.plus(totalCuenta);
        else if (metodo === 'MIXTO') {
          efectivo = efectivo.plus(new Decimal(c.monto_efectivo || 0));
          tarjeta = tarjeta.plus(new Decimal(c.monto_tarjeta || 0));
        }

        pagos.push({
          nombre: 'Pago directo',
          monto: Number(totalCuenta),
          metodo,
        });
      }

      return {
        id: c.id.toString(),
        fecha: c.closed_at,
        area: c.area.nombre,
        atendido_por: c.usuario.nombre,
        total: Number(totalCuenta),
        descuento: Number(c.descuento || 0),
        items,
        pagos,
      };
    });

    return res.json({
      fecha: fechaStr,
      rango,
      fecha_inicio: inicioDia,
      fecha_fin: finDia,
      resumen: {
        efectivo: efectivo.toNumber(),
        tarjeta: tarjeta.toNumber(),
        cargo_socio: cargos.toNumber(),
        total_descuentos: totalDescuentos.toNumber(),
        total_ventas: totalVentas.toNumber(),
      },
      ventas,
    });
  } catch (error: any) {
    console.error('Error al generar reporte diario:', error);
    return res.status(500).json({ error: error.message || 'Error al obtener reporte diario' });
  }
}

// 2. Obtener historial de turnos cerrados (arqueos/cortes de caja)
export async function obtenerReporteCortes(req: AuthenticatedRequest, res: Response) {
  try {
    const turnos = await prisma.turno.findMany({
      include: {
        usuario: { select: { nombre: true } },
      },
      orderBy: { abierto_at: 'desc' },
    });

    const resultado = turnos.map((t) => {
      const fondo = new Decimal(t.fondo_inicial);
      const cajaEfectivoTotal = new Decimal(t.caja_efectivo); // Incluye el fondo
      const efectivoVendido = t.activo 
        ? new Decimal(0) 
        : Decimal.max(0, cajaEfectivoTotal.minus(fondo));

      const tarjeta = new Decimal(t.caja_tarjeta);
      const cargos = new Decimal(t.caja_cargos);
      const ventasNetas = t.activo 
        ? new Decimal(0)
        : efectivoVendido.plus(tarjeta).plus(cargos);

      return {
        id: t.id,
        activo: t.activo,
        atendido_por: t.usuario.nombre,
        abierto_at: t.abierto_at,
        cerrado_at: t.cerrado_at,
        fondo_inicial: Number(fondo),
        efectivo_total_caja: Number(cajaEfectivoTotal), // Fondo + Efectivo vendido
        efectivo_ventas: Number(efectivoVendido),
        tarjeta_ventas: Number(tarjeta),
        cargos_socios: Number(cargos),
        ventas_netas: Number(ventasNetas), // Total vendido en el turno
      };
    });

    return res.json(resultado);
  } catch (error: any) {
    console.error('Error al obtener reporte de cortes:', error);
    return res.status(500).json({ error: error.message || 'Error al obtener reporte de cortes' });
  }
}
