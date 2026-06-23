import { Response } from 'express';
import { Decimal } from 'decimal.js';
import prisma from '../db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// 1. Obtener productos y stock de un área específica (Bar, Snack, Palapa)

async function gestionarStock(tx: any, areaId: number, productoId: number, cantidadDiff: any, usuarioId: number, cuentaId: bigint) {
  if (cantidadDiff.isZero()) return;

  const prod = await tx.producto.findUnique({ where: { id: productoId } });
  if (!prod) throw new Error(`Producto con ID ${productoId} no encontrado`);

  const nombreProd = prod.nombre.trim().toLowerCase();

  if (cantidadDiff.greaterThan(0)) {
    // SALIDA DE INVENTARIO (Descontar stock)
    let cantidadPorDescontar = cantidadDiff;

    if (nombreProd === 'agua mineral prep') {
      const prodGrande = await tx.producto.findFirst({ where: { nombre: { equals: 'Agua Mineral Grande', mode: 'insensitive' } } });
      const prodNormal = await tx.producto.findFirst({ where: { nombre: { equals: 'Agua Mineral', mode: 'insensitive' } } });

      if (prodGrande) {
        const invGrande = await tx.inventarioArea.findUnique({ where: { area_id_producto_id: { area_id: areaId, producto_id: prodGrande.id } } });
        if (invGrande && cantidadPorDescontar.greaterThan(0)) {
          const stockGrandeActual = invGrande.stock; // Decimal
          const prepsDisponiblesGrande = stockGrandeActual.mul(3);
          const prepsADescontarGrande = cantidadPorDescontar.lessThan(prepsDisponiblesGrande) ? cantidadPorDescontar : prepsDisponiblesGrande;

          if (prepsADescontarGrande.greaterThan(0)) {
            const descontarGrandeStock = prepsADescontarGrande.div(3).toDP(2);
            const nuevoStockGrande = stockGrandeActual.minus(descontarGrandeStock);
            await tx.inventarioArea.update({ where: { area_id_producto_id: { area_id: areaId, producto_id: prodGrande.id } }, data: { stock: nuevoStockGrande } });
            await tx.movimientoInventario.create({ data: { area_id: areaId, producto_id: prodGrande.id, tipo_movimiento: 'SALIDA_VENTA', cantidad: descontarGrandeStock, stock_anterior: stockGrandeActual, stock_nuevo: nuevoStockGrande, usuario_id: usuarioId, referencia_id: `CUENTA-${cuentaId}`, motivo: 'Consumo (cascada)' } });
            cantidadPorDescontar = cantidadPorDescontar.minus(prepsADescontarGrande);
          }
        }
      }

      if (cantidadPorDescontar.greaterThan(0)) {
        if (!prodNormal) throw new Error(`No se encontró Agua Mineral`);
        const invNormal = await tx.inventarioArea.findUnique({ where: { area_id_producto_id: { area_id: areaId, producto_id: prodNormal.id } } });
        if (!invNormal) throw new Error(`El producto Agua Mineral no está en esta área`);
        const stockNormalActual = invNormal.stock;
        if (stockNormalActual.lessThan(cantidadPorDescontar)) throw new Error(`Stock insuficiente para Agua Mineral Prep`);
        const nuevoStockNormal = stockNormalActual.minus(cantidadPorDescontar);
        await tx.inventarioArea.update({ where: { area_id_producto_id: { area_id: areaId, producto_id: prodNormal.id } }, data: { stock: nuevoStockNormal } });
        await tx.movimientoInventario.create({ data: { area_id: areaId, producto_id: prodNormal.id, tipo_movimiento: 'SALIDA_VENTA', cantidad: cantidadPorDescontar, stock_anterior: stockNormalActual, stock_nuevo: nuevoStockNormal, usuario_id: usuarioId, referencia_id: `CUENTA-${cuentaId}`, motivo: 'Consumo' } });
      }
    } else {
      const inv = await tx.inventarioArea.findUnique({ where: { area_id_producto_id: { area_id: areaId, producto_id: productoId } } });
      if (!inv) throw new Error(`Producto ${prod.nombre} no registrado en el inventario de esta área`);
      const stockActual = inv.stock;
      if (stockActual.lessThan(cantidadDiff)) throw new Error(`Stock insuficiente para ${prod.nombre}. Disp: ${stockActual}, Req: ${cantidadDiff}`);
      const nuevoStock = stockActual.minus(cantidadDiff);
      await tx.inventarioArea.update({ where: { area_id_producto_id: { area_id: areaId, producto_id: productoId } }, data: { stock: nuevoStock } });
      await tx.movimientoInventario.create({ data: { area_id: areaId, producto_id: productoId, tipo_movimiento: 'SALIDA_VENTA', cantidad: cantidadDiff, stock_anterior: stockActual, stock_nuevo: nuevoStock, usuario_id: usuarioId, referencia_id: `CUENTA-${cuentaId}`, motivo: 'Consumo registrado por POS' } });
    }

    // Insumos
    const recetaIngredientes = await tx.recetaIngrediente.findMany({ where: { producto_id: productoId } });
    for (const receta of recetaIngredientes) {
      const insumo = await tx.insumo.findUnique({ where: { id: receta.insumo_id } });
      if (insumo) {
        const stockInsumoActual = insumo.stock;
        const cantidadRestarInsumo = receta.cantidad.mul(cantidadDiff);
        const nuevoStockInsumo = stockInsumoActual.minus(cantidadRestarInsumo);
        await tx.insumo.update({ where: { id: receta.insumo_id }, data: { stock: nuevoStockInsumo } });
      }
    }

  } else {
    // ENTRADA DE INVENTARIO (Devolución)
    let cantidadPorDevolver = cantidadDiff.abs();
    
    if (nombreProd === 'agua mineral prep') {
      const prodNormal = await tx.producto.findFirst({ where: { nombre: { equals: 'Agua Mineral', mode: 'insensitive' } } });
      if (prodNormal) {
        const invNormal = await tx.inventarioArea.findUnique({ where: { area_id_producto_id: { area_id: areaId, producto_id: prodNormal.id } } });
        if (invNormal) {
          const stockNormalActual = invNormal.stock;
          const nuevoStockNormal = stockNormalActual.plus(cantidadPorDevolver);
          await tx.inventarioArea.update({ where: { area_id_producto_id: { area_id: areaId, producto_id: prodNormal.id } }, data: { stock: nuevoStockNormal } });
          await tx.movimientoInventario.create({ data: { area_id: areaId, producto_id: prodNormal.id, tipo_movimiento: 'ENTRADA_DEVOLUCION', cantidad: cantidadPorDevolver, stock_anterior: stockNormalActual, stock_nuevo: nuevoStockNormal, usuario_id: usuarioId, referencia_id: `CUENTA-${cuentaId}`, motivo: 'Devolución (Agua Mineral Prep)' } });
        }
      }
    } else {
      const inv = await tx.inventarioArea.findUnique({ where: { area_id_producto_id: { area_id: areaId, producto_id: productoId } } });
      if (inv) {
        const stockActual = inv.stock;
        const nuevoStock = stockActual.plus(cantidadPorDevolver);
        await tx.inventarioArea.update({ where: { area_id_producto_id: { area_id: areaId, producto_id: productoId } }, data: { stock: nuevoStock } });
        await tx.movimientoInventario.create({ data: { area_id: areaId, producto_id: productoId, tipo_movimiento: 'ENTRADA_DEVOLUCION', cantidad: cantidadPorDevolver, stock_anterior: stockActual, stock_nuevo: nuevoStock, usuario_id: usuarioId, referencia_id: `CUENTA-${cuentaId}`, motivo: 'Devolución por modificación POS' } });
      }
    }

    // Devolver Insumos
    const recetaIngredientes = await tx.recetaIngrediente.findMany({ where: { producto_id: productoId } });
    for (const receta of recetaIngredientes) {
      const insumo = await tx.insumo.findUnique({ where: { id: receta.insumo_id } });
      if (insumo) {
        const stockInsumoActual = insumo.stock;
        const cantidadSumarInsumo = receta.cantidad.mul(cantidadPorDevolver);
        const nuevoStockInsumo = stockInsumoActual.plus(cantidadSumarInsumo);
        await tx.insumo.update({ where: { id: receta.insumo_id }, data: { stock: nuevoStockInsumo } });
      }
    }
  }
}


export async function listarProductosPorArea(req: AuthenticatedRequest, res: Response) {
  const areaId = parseInt(req.params.areaId);

  if (isNaN(areaId)) {
    return res.status(400).json({ error: 'ID de área inválido' });
  }

  try {
    const productosConStock = await prisma.inventarioArea.findMany({
      where: { area_id: areaId, producto: { activo: true } },
      include: {
        producto: true,
      },
    });

    // Formatear la respuesta
    const productos = productosConStock.map((inv) => ({
      id: inv.producto.id,
      codigo_barras: inv.producto.codigo_barras,
      nombre: inv.producto.nombre,
      descripcion: inv.producto.descripcion,
      precio_venta: Number(inv.producto.precio_venta),
      categoria: inv.producto.categoria,
      stock: Number(inv.stock),
      stock_minimo: Number(inv.stock_minimo),
      stock_maximo: Number(inv.stock_maximo),
      ubicacion_estante: inv.ubicacion_estante,
    }));

    return res.json(productos);
  } catch (error) {
    console.error('Error al listar productos por área:', error);
    return res.status(500).json({ error: 'Error al consultar inventario' });
  }
}

// 2. Abrir una nueva cuenta
export async function abrirCuenta(req: AuthenticatedRequest, res: Response) {
  const { area_id, cadi_id, nombre_referencia, cliente_id } = req.body;
  const usuarioId = req.user?.id;

  if (!area_id || !usuarioId) {
    return res.status(400).json({ error: 'El área e ID de usuario son requeridos' });
  }

  try {
    const turnoActivo = await prisma.turno.findFirst({
      where: { activo: true },
      orderBy: { abierto_at: 'desc' },
    });

    const nuevaCuenta = await prisma.cuenta.create({
      data: {
        area_id: parseInt(area_id),
        usuario_id: usuarioId,
        turno_id: turnoActivo?.id,
        cadi_id: cadi_id ? parseInt(cadi_id) : null,
        cliente_id: cliente_id ? parseInt(cliente_id) : null,
        nombre_referencia,
        estado: 'ABIERTA',
        subtotal: new Decimal(0),
        impuestos: new Decimal(0),
        descuento: new Decimal(0),
        total: new Decimal(0),
      },
      include: {
        cadi: true,
        cliente: true,
      },
    });

    return res.status(201).json(nuevaCuenta);
  } catch (error) {
    console.error('Error al abrir la cuenta:', error);
    return res.status(500).json({ error: 'Error al abrir la cuenta' });
  }
}

// 3. Registrar consumos (guardar cuenta abierta / actualizar detalles)
export async function guardarConsumos(req: AuthenticatedRequest, res: Response) {
  const cuentaId = BigInt(req.params.cuentaId);
  const { productos, cadi_id, nombre_referencia, cliente_id } = req.body; // Array de { producto_id, cantidad }

  if (!Array.isArray(productos)) {
    return res.status(400).json({ error: 'Los productos deben ser enviados como un arreglo' });
  }

  try {
    const cuenta = await prisma.cuenta.findUnique({ where: { id: cuentaId } });
    if (!cuenta || cuenta.estado !== 'ABIERTA') {
      return res.status(404).json({ error: 'La cuenta no existe o ya está cerrada' });
    }

    const usuarioId = req.user?.id || 1; // Fallback admin if needed

    // Usaremos una transacción para recrear los detalles e imputar subtotales
    const cuentaActualizada = await prisma.$transaction(async (tx) => {
      // 1. Obtener detalles previos para calcular diferencia de stock
      const detallesPrevios = await tx.detalleCuenta.findMany({ where: { cuenta_id: cuentaId } });
      const prevQtys: Record<number, any> = {};
      for (const dp of detallesPrevios) {
        if (!prevQtys[dp.producto_id]) prevQtys[dp.producto_id] = new Decimal(0);
        prevQtys[dp.producto_id] = prevQtys[dp.producto_id].plus(new Decimal(dp.cantidad));
      }

      const newQtys: Record<number, any> = {};
      for (const p of productos) {
        if (!newQtys[p.producto_id]) newQtys[p.producto_id] = new Decimal(0);
        newQtys[p.producto_id] = newQtys[p.producto_id].plus(new Decimal(p.cantidad));
      }

      const allProdIds = new Set([...Object.keys(prevQtys).map(Number), ...Object.keys(newQtys).map(Number)]);
      
      for (const prodId of allProdIds) {
        const prev = prevQtys[prodId] || new Decimal(0);
        const cur = newQtys[prodId] || new Decimal(0);
        const diff = cur.minus(prev);
        
        await gestionarStock(tx, cuenta.area_id, prodId, diff, usuarioId, cuenta.id);
      }

      // Eliminar detalles previos de la cuenta
      await tx.detalleCuenta.deleteMany({ where: { cuenta_id: cuentaId } });

      let subtotalAcumulado = new Decimal(0);
      let tieneDescuentoGlobal = false;

      // 1. Identificar si existe algún ítem en la categoría 'descuentos'
      for (const p of productos) {
        const prod = await tx.producto.findUnique({ where: { id: p.producto_id } });
        if (prod && prod.categoria?.toLowerCase() === 'descuentos') {
          tieneDescuentoGlobal = true;
        }
      }

      // 2. Crear nuevos detalles
      for (const p of productos) {
        const prod = await tx.producto.findUnique({ where: { id: p.producto_id } });
        if (!prod) {
          throw new Error(`Producto con ID ${p.producto_id} no encontrado`);
        }

        const cantidadDec = new Decimal(p.cantidad);
        const precioDec = p.precio_unitario !== undefined && p.precio_unitario !== null
          ? new Decimal(p.precio_unitario)
          : new Decimal(prod.precio_venta);
        const itemSubtotal = cantidadDec.mul(precioDec);

        const isDescuento = prod.categoria?.toLowerCase() === 'descuentos';

        // Si es el ítem de descuento, no suma al subtotal de consumo
        const itemTotal = isDescuento ? new Decimal(0) : itemSubtotal;

        if (!isDescuento) {
          subtotalAcumulado = subtotalAcumulado.plus(itemSubtotal);
        }

        await tx.detalleCuenta.create({
          data: {
            cuenta_id: cuentaId,
            producto_id: prod.id,
            cantidad: cantidadDec,
            precio_unitario: precioDec,
            descuento: new Decimal(0),
            subtotal: isDescuento ? new Decimal(0) : itemSubtotal,
            total: itemTotal,
            estado_item: 'ENTREGADO',
          },
        });
      }

      // 3. Si tiene descuento global del 30%, se calcula sobre la suma de los otros productos
      const descuentoAcumulado = tieneDescuentoGlobal ? subtotalAcumulado.mul(0.30).toDP(2) : new Decimal(0);
      const total = subtotalAcumulado.minus(descuentoAcumulado);
      const impuestos = new Decimal(0);

      // Actualizar cuenta madre
      const updateData: any = {
        subtotal: subtotalAcumulado,
        descuento: descuentoAcumulado,
        impuestos,
        total,
      };

      if (cadi_id !== undefined) {
        updateData.cadi_id = cadi_id ? Number(cadi_id) : null;
      }
      if (cliente_id !== undefined) {
        updateData.cliente_id = cliente_id ? Number(cliente_id) : null;
      }
      if (nombre_referencia !== undefined) {
        updateData.nombre_referencia = nombre_referencia;
      }

      return await tx.cuenta.update({
        where: { id: cuentaId },
        data: updateData,
        include: {
          detalleCuentas: {
            include: {
              producto: true,
            },
          },
          cadi: true,
          cliente: true,
        },
      });
    });

    return res.json(cuentaActualizada);
  } catch (error: any) {
    console.error('Error al guardar consumos:', error);
    return res.status(500).json({ error: error.message || 'Error al actualizar consumos' });
  }
}

// 4. Previsualizar la división (Split) de la cuenta vinculada al Cadi
export async function previsualizarSplit(req: AuthenticatedRequest, res: Response) {
  const cuentaId = BigInt(req.params.cuentaId);

  try {
    const cuenta = await prisma.cuenta.findUnique({
      where: { id: cuentaId },
      include: {
        detalleCuentas: { include: { producto: true } },
        cadi: true,
      },
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const totalCuenta = new Decimal(cuenta.total);

    // Si no tiene cadi, no hay split automático por Cadi, se cobra directo al cliente
    if (!cuenta.cadi_id) {
      return res.json({
        split_automatico: false,
        total: totalCuenta.toNumber(),
        divisiones: [],
      });
    }

    // Obtener los socios activos vinculados al Cadi
    const asignaciones = await prisma.asignacionCadiCliente.findMany({
      where: { cadi_id: cuenta.cadi_id, activa: true },
      include: { cliente: true },
    });

    const cantidadClientes = asignaciones.length;

    if (cantidadClientes === 0) {
      return res.json({
        split_automatico: true,
        total: totalCuenta.toNumber(),
        cadi: cuenta.cadi?.nombre,
        mensaje: 'El Cadi no tiene clientes activos asignados en esta ronda',
        divisiones: [],
      });
    }

    // Cálculo del Split con precisión decimal exacta y ajuste de residuo
    const porcentajeBase = new Decimal(100).div(cantidadClientes);
    const montoBase = totalCuenta.div(cantidadClientes).toDP(2); // Redondear a 2 decimales para dinero

    // Sumamos los montos redondeados para ver si hay residuo decimal
    let totalDividido = montoBase.mul(cantidadClientes);
    let residuo = totalCuenta.minus(totalDividido);

    const divisiones = asignaciones.map((asig, index) => {
      let montoCliente = new Decimal(montoBase);
      // Aplicar el residuo remanente al último cliente para que sume exactamente el total
      if (index === cantidadClientes - 1 && !residuo.isZero()) {
        montoCliente = montoCliente.plus(residuo);
      }

      return {
        cliente_id: asig.cliente.id,
        nombre: asig.cliente.nombre,
        codigo_socio: asig.cliente.codigo_socio,
        porcentaje: porcentajeBase.toNumber(),
        monto: montoCliente.toNumber(),
      };
    });

    return res.json({
      split_automatico: true,
      total: totalCuenta.toNumber(),
      cadi: cuenta.cadi?.nombre,
      divisiones,
    });
  } catch (error) {
    console.error('Error al previsualizar split:', error);
    return res.status(500).json({ error: 'Error al calcular la división' });
  }
}

// 5. Cobrar y cerrar la cuenta con descuento de stock (Transaccional)
// Soporta 2 modos:
//   a) Pago Directo: body = { metodo_pago: 'EFECTIVO' | 'TARJETA' } — sin socios/divisiones
//   b) Pago Split:   body = { pagos: [{ cliente_id, monto, metodo_pago }] } — con socios
export async function pagarYCerrarCuenta(req: AuthenticatedRequest, res: Response) {
  const cuentaId = BigInt(req.params.cuentaId);
  const { pagos, metodo_pago } = req.body;
  const usuarioId = req.user?.id;

  const esPagoDirecto = metodo_pago && (!pagos || pagos.length === 0);
  const esPagoSplit = Array.isArray(pagos) && pagos.length > 0;

  if (!esPagoDirecto && !esPagoSplit) {
    return res.status(400).json({ error: 'Debe especificar un método de pago o los pagos divididos por socio' });
  }

  if (!usuarioId) {
    return res.status(400).json({ error: 'Usuario requerido' });
  }

  try {
    const cuenta = await prisma.cuenta.findUnique({
      where: { id: cuentaId },
      include: {
        detalleCuentas: true,
      },
    });

    if (!cuenta || cuenta.estado !== 'ABIERTA') {
      return res.status(400).json({ error: 'La cuenta no existe o ya ha sido pagada/cancelada' });
    }

    // Ejecutar cobro y descuento en transacción atómica
    await prisma.$transaction(async (tx) => {
      if (esPagoDirecto) {
        // 2a. Pago Directo — cerrar la cuenta con el método de pago indicado (sin divisiones)
        await tx.cuenta.update({
          where: { id: cuentaId },
          data: {
            estado: 'PAGADA',
            closed_at: new Date(),
            metodo_pago: metodo_pago,
          },
        });
      } else {
        // 2b. Pago Split — registrar los pagos divisionales de los socios
        const totalCuenta = new Decimal(cuenta.total);
        let sumaPagos = new Decimal(0);

        for (const pago of pagos) {
          const montoDec = new Decimal(pago.monto);
          sumaPagos = sumaPagos.plus(montoDec);

          const porcentaje = montoDec.div(totalCuenta).mul(100);

          const esCargoSocio = pago.metodo_pago === 'CARGO_SOCIO';

          await tx.divisionCuenta.create({
            data: {
              cuenta_id: cuentaId,
              cliente_id: pago.cliente_id,
              porcentaje_participacion: porcentaje,
              monto_proporcional: montoDec,
              metodo_pago: pago.metodo_pago,
              estado_pago: esCargoSocio ? 'PENDIENTE' : 'PAGADO',
              pagado_at: esCargoSocio ? null : new Date(),
            },
          });
        }

        // Validar que la suma de los pagos coincida exactamente con el total de la cuenta
        if (!sumaPagos.toDP(2).equals(totalCuenta.toDP(2))) {
          throw new Error(`La suma de los pagos ($${sumaPagos.toNumber()}) no coincide con el total de la cuenta ($${totalCuenta.toNumber()})`);
        }

        // 3. Cerrar y actualizar estado de la cuenta
        await tx.cuenta.update({
          where: { id: cuentaId },
          data: {
            estado: 'PAGADA',
            closed_at: new Date(),
          },
        });
      }
    });

    // Si la cuenta tenía un cadi asignado, opcionalmente se puede liberar al cadi a 'DISPONIBLE'
    if (cuenta.cadi_id) {
      // Validar si el cadi tiene más asignaciones activas. Si no, se libera.
      const otrasAsignaciones = await prisma.asignacionCadiCliente.findMany({
        where: { cadi_id: cuenta.cadi_id, activa: true },
      });
      if (otrasAsignaciones.length === 0) {
        await prisma.cadi.update({
          where: { id: cuenta.cadi_id },
          data: { estado: 'DISPONIBLE' },
        });
      }
    }

    return res.json({ message: 'Cuenta pagada y cerrada exitosamente' });
  } catch (error: any) {
    console.error('Error al procesar el pago de la cuenta:', error);
    return res.status(500).json({ error: error.message || 'Error en el proceso de cobro' });
  }
}

// 6. Ajustar Stock Físico Manualmente (Solo Administradores)
export async function ajustarStockArea(req: AuthenticatedRequest, res: Response) {
  const { area_id, producto_id, nuevo_stock, motivo, nombre, precio_venta } = req.body;
  const usuarioId = req.user?.id;

  if (!area_id || !producto_id || nuevo_stock === undefined || !usuarioId) {
    return res.status(400).json({ error: 'Área, producto, nuevo stock y usuario administrador requeridos' });
  }

  try {
    const areaIdInt = parseInt(area_id);
    const productoIdInt = parseInt(producto_id);
    const nuevoStockDec = new Decimal(nuevo_stock);

    if (nuevoStockDec.lessThan(0)) {
      return res.status(400).json({ error: 'El stock no puede ser menor a cero' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // Si se especificó nombre o precio_venta, actualizarlos en el Producto
      const dataUpdateProducto: any = {};
      if (nombre !== undefined && nombre.trim() !== '') {
        dataUpdateProducto.nombre = nombre.trim();
      }
      if (precio_venta !== undefined && precio_venta !== null) {
        const precioDec = new Decimal(precio_venta);
        if (precioDec.lessThan(0)) {
          throw new Error('El precio de venta no puede ser menor a cero');
        }
        dataUpdateProducto.precio_venta = precioDec;
      }

      if (Object.keys(dataUpdateProducto).length > 0) {
        await tx.producto.update({
          where: { id: productoIdInt },
          data: dataUpdateProducto,
        });
      }

      // Obtener stock actual
      const inv = await tx.inventarioArea.findUnique({
        where: {
          area_id_producto_id: {
            area_id: areaIdInt,
            producto_id: productoIdInt,
          },
        },
      });

      if (!inv) {
        throw new Error('El producto no está registrado en el inventario de esta área');
      }

      const stockAnterior = new Decimal(inv.stock);

      // Actualizar stock
      const invActualizado = await tx.inventarioArea.update({
        where: {
          area_id_producto_id: {
            area_id: areaIdInt,
            producto_id: productoIdInt,
          },
        },
        data: {
          stock: nuevoStockDec,
        },
        include: {
          producto: true,
        },
      });

      // Crear movimiento de inventario (Kardex)
      await tx.movimientoInventario.create({
        data: {
          area_id: areaIdInt,
          producto_id: productoIdInt,
          tipo_movimiento: 'AJUSTE',
          cantidad: nuevoStockDec.minus(stockAnterior), // Diferencia (puede ser positiva o negativa)
          stock_anterior: stockAnterior,
          stock_nuevo: nuevoStockDec,
          usuario_id: usuarioId,
          referencia_id: 'AJUSTE-MANUAL',
          motivo: motivo || 'Ajuste manual por administrador',
        },
      });

      return invActualizado;
    });

    // Notificar cambio de inventario por sockets si el servidor tiene adjunto socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('inventario:actualizar');
    }

    return res.json({
      message: 'Stock y datos de producto ajustados con éxito',
      producto: resultado.producto.nombre,
      area_id: resultado.area_id,
      nuevo_stock: Number(resultado.stock),
      precio_venta: Number(resultado.producto.precio_venta),
    });
  } catch (error: any) {
    console.error('Error al ajustar stock:', error);
    return res.status(500).json({ error: error.message || 'Error al ajustar el inventario' });
  }
}

// Helper para verificar si dos fechas son del mismo día de calendario
function esMismoDia(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// 7. Listar todas las cuentas (Admin)
export async function listarTodasLasCuentas(req: AuthenticatedRequest, res: Response) {
  try {
    const { solo_turno_activo } = req.query;
    let whereClause: any = {};

    if (solo_turno_activo === 'true') {
      const turnoActivo = await prisma.turno.findFirst({
        where: { activo: true },
        orderBy: { abierto_at: 'desc' },
      });

      if (!turnoActivo || !esMismoDia(new Date(), new Date(turnoActivo.abierto_at))) {
        return res.json([]);
      }

      whereClause.turno_id = turnoActivo.id;
    }

    const cuentas = await prisma.cuenta.findMany({
      where: whereClause,
      include: {
        area: true,
        usuario: { select: { nombre: true } },
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
        cliente: true,
        detalleCuentas: { include: { producto: true } },
        divisionesCuentas: { include: { cliente: { select: { id: true, nombre: true, codigo_socio: true } } } },
      },
      orderBy: { created_at: 'desc' },
    });

    const resultado = cuentas.map((c) => ({
      id: c.id.toString(),
      area_id: c.area.id,
      area: c.area.nombre,
      referencia: c.nombre_referencia || '—',
      estado: c.estado,
      total: Number(c.total),
      metodo_pago: c.metodo_pago,
      fecha: c.created_at,
      cerrado_at: c.closed_at,
      usuario_id: c.usuario_id,
      atendido_por: c.usuario.nombre,
      cadi_id: c.cadi_id,
      cadi: c.cadi ? `${c.cadi.numero_cadi} - ${c.cadi.nombre}` : null,
      socios: c.cadi 
        ? c.cadi.asignaciones.map((a) => ({
            id: a.cliente.id,
            nombre: a.cliente.nombre,
            codigo_socio: a.cliente.codigo_socio,
            email: a.cliente.email,
          }))
        : c.cliente ? [{
            id: c.cliente.id,
            nombre: c.cliente.nombre,
            codigo_socio: c.cliente.codigo_socio,
            email: c.cliente.email,
          }] : [],
      productos: c.detalleCuentas.map((d) => ({
        id: d.producto.id,
        nombre: d.producto.nombre,
        precio_venta: Number(d.precio_unitario),
        categoria: d.producto.categoria,
        cantidad: Number(d.cantidad),
        subtotal: Number(d.subtotal),
      })),
      divisiones: c.divisionesCuentas.map((d) => ({
        cliente: d.cliente.nombre,
        codigo_socio: d.cliente.codigo_socio,
        monto: Number(d.monto_proporcional),
        metodo_pago: d.metodo_pago,
        estado_pago: d.estado_pago,
      })),
    }));

    return res.json(resultado);
  } catch (error) {
    console.error('Error al listar cuentas:', error);
    return res.status(500).json({ error: 'Error al consultar cuentas' });
  }
}

// 8. Eliminar una cuenta (Admin) — también elimina sus detalles y divisiones
export async function eliminarCuenta(req: AuthenticatedRequest, res: Response) {
  const cuentaId = BigInt(req.params.cuentaId);

  try {
    const cuenta = await prisma.cuenta.findUnique({ where: { id: cuentaId } });
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.divisionCuenta.deleteMany({ where: { cuenta_id: cuentaId } });
      await tx.detalleCuenta.deleteMany({ where: { cuenta_id: cuentaId } });
      await tx.cuenta.delete({ where: { id: cuentaId } });
    });

    return res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar cuenta:', error);
    return res.status(500).json({ error: error.message || 'Error al eliminar la cuenta' });
  }
}

// 9. Reset completo: elimina todas las cuentas, divisiones, detalles y movimientos de inventario
export async function resetearDatos(req: AuthenticatedRequest, res: Response) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.divisionCuenta.deleteMany({});
      await tx.detalleCuenta.deleteMany({});
      await tx.cuenta.deleteMany({});
      await tx.movimientoInventario.deleteMany({});
      await tx.asignacionCadiCliente.deleteMany({});
      await tx.cliente.deleteMany({});
      await tx.cadi.deleteMany({});
      await tx.retiroCaja.deleteMany({});
      await tx.turno.deleteMany({});
    });

    return res.json({ message: 'Datos reseteados correctamente. Cuentas, movimientos y asignaciones eliminados.' });
  } catch (error: any) {
    console.error('Error al resetear datos:', error);
    return res.status(500).json({ error: error.message || 'Error al resetear los datos' });
  }
}

// 10. Crear nuevo producto con precio personalizado (Admin)
export async function crearProducto(req: AuthenticatedRequest, res: Response) {
  const { nombre, precio_venta, categoria, descripcion, stock_bar, stock_snack, stock_palapa, stock_minimo } = req.body;

  if (!nombre || precio_venta === undefined) {
    return res.status(400).json({ error: 'Nombre y precio de venta son requeridos' });
  }

  const precioNum = parseFloat(precio_venta);
  if (isNaN(precioNum) || precioNum < 0) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo' });
  }

  try {
    const { Decimal } = await import('decimal.js');

    const producto = await prisma.$transaction(async (tx) => {
      // Crear el producto
      const nuevo = await tx.producto.create({
        data: {
          nombre,
          precio_venta: new Decimal(precioNum),
          categoria: categoria || 'General',
          descripcion: descripcion || null,
          activo: true,
        },
      });

      const stockMin = new Decimal(stock_minimo ?? 0);
      const areas = [
        { id: 1, stock: new Decimal(stock_bar ?? 0) },
        { id: 2, stock: new Decimal(stock_snack ?? 0) },
        { id: 3, stock: new Decimal(stock_palapa ?? 0) },
      ];

      // Registrar en inventario de las 3 áreas
      for (const area of areas) {
        await tx.inventarioArea.create({
          data: {
            area_id: area.id,
            producto_id: nuevo.id,
            stock: area.stock,
            stock_minimo: stockMin,
            stock_maximo: new Decimal(999),
          },
        });
      }

      return nuevo;
    });

    return res.status(201).json({
      message: `Producto "${producto.nombre}" creado exitosamente`,
      id: producto.id,
      nombre: producto.nombre,
      precio_venta: Number(producto.precio_venta),
      categoria: producto.categoria,
    });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({ error: error.message || 'Error al crear el producto' });
  }
}

// 11. Obtener balances contables acumulados de caja (Solo Administradores)
// Agrega tanto pagos divididos (divisiones_cuentas) como pagos directos (cuentas.metodo_pago)
export async function obtenerBalanceCaja(req: AuthenticatedRequest, res: Response) {
  try {
    // 1. Pagos divididos por socios
    const balancesDivisiones = await prisma.divisionCuenta.groupBy({
      by: ['metodo_pago'],
      where: {
        estado_pago: 'PAGADO',
      },
      _sum: {
        monto_proporcional: true,
      },
    });

    // 2. Pagos directos (sin socios)
    const balancesDirectos = await prisma.cuenta.groupBy({
      by: ['metodo_pago'],
      where: {
        estado: 'PAGADA',
        metodo_pago: { not: null },
      },
      _sum: {
        total: true,
      },
    });

    const resultado = {
      efectivo: 0,
      tarjeta: 0,
      cargo_socio: 0,
    };

    // Sumar divisiones
    balancesDivisiones.forEach((item) => {
      const metodo = item.metodo_pago;
      const suma = Number(item._sum.monto_proporcional || 0);
      if (metodo === 'EFECTIVO') resultado.efectivo += suma;
      else if (metodo === 'TARJETA') resultado.tarjeta += suma;
      else if (metodo === 'CARGO_SOCIO') resultado.cargo_socio += suma;
    });

    // Sumar pagos directos
    balancesDirectos.forEach((item) => {
      const metodo = item.metodo_pago;
      const suma = Number(item._sum.total || 0);
      if (metodo === 'EFECTIVO') resultado.efectivo += suma;
      else if (metodo === 'TARJETA') resultado.tarjeta += suma;
      else if (metodo === 'CARGO_SOCIO') resultado.cargo_socio += suma;
    });

    return res.json(resultado);
  } catch (error) {
    console.error('Error al obtener balances de caja:', error);
    return res.status(500).json({ error: 'Error al consultar balances contables' });
  }
}

// 12. Actualizar método de pago de una cuenta ya pagada (Efectivo / Tarjeta / Cargo Socio)
export async function actualizarMetodoPagoCuenta(req: AuthenticatedRequest, res: Response) {
  const cuentaId = BigInt(req.params.cuentaId);
  const { metodo_pago, divisiones } = req.body; // divisiones = [ { cliente_id: number, metodo_pago: string } ]

  try {
    const cuenta = await prisma.cuenta.findUnique({
      where: { id: cuentaId },
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    if (cuenta.estado !== 'PAGADA') {
      return res.status(400).json({ error: 'Solo se puede modificar el método de pago de cuentas ya pagadas' });
    }

    await prisma.$transaction(async (tx) => {
      if (divisiones && Array.isArray(divisiones)) {
        for (const div of divisiones) {
          const esCargoSocio = div.metodo_pago === 'CARGO_SOCIO';
          await tx.divisionCuenta.update({
            where: {
              uq_cuenta_cliente_division: {
                cuenta_id: cuentaId,
                cliente_id: Number(div.cliente_id)
              }
            },
            data: {
              metodo_pago: div.metodo_pago,
              estado_pago: esCargoSocio ? 'PENDIENTE' : 'PAGADO',
              pagado_at: esCargoSocio ? null : new Date(),
            }
          });
        }
      } else if (metodo_pago) {
        await tx.cuenta.update({
          where: { id: cuentaId },
          data: { metodo_pago }
        });
      }
    });

    return res.json({ message: 'Método de pago de la cuenta actualizado correctamente' });
  } catch (error: any) {
    console.error('Error al actualizar método de pago:', error);
    return res.status(500).json({ error: error.message || 'Error al actualizar el método de pago' });
  }
}

// 13. Traspasar stock entre áreas
export async function transferirStock(req: AuthenticatedRequest, res: Response) {
  const { producto_id, origen_area_id, destino_area_id, cantidad, motivo } = req.body;
  const usuarioId = req.user?.id;

  if (!producto_id || !origen_area_id || !destino_area_id || cantidad === undefined || !usuarioId) {
    return res.status(400).json({ error: 'Producto, área de origen, área de destino, cantidad y usuario requeridos' });
  }

  const cantidadDec = new Decimal(cantidad);
  if (cantidadDec.lessThanOrEqualTo(0)) {
    return res.status(400).json({ error: 'La cantidad a traspasar debe ser mayor a cero' });
  }

  const prodId = parseInt(producto_id);
  const origenAreaId = parseInt(origen_area_id);
  const destinoAreaId = parseInt(destino_area_id);

  if (origenAreaId === destinoAreaId) {
    return res.status(400).json({ error: 'El área de origen y destino deben ser diferentes' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener inventario origen
      const invOrigen = await tx.inventarioArea.findUnique({
        where: {
          area_id_producto_id: {
            area_id: origenAreaId,
            producto_id: prodId,
          },
        },
        include: { producto: true },
      });

      if (!invOrigen) {
        throw new Error('El producto no está registrado en el área de origen');
      }

      const stockOrigen = new Decimal(invOrigen.stock);
      if (stockOrigen.lessThan(cantidadDec)) {
        throw new Error(`Stock insuficiente en el área de origen (${invOrigen.producto.nombre}). Disponible: ${stockOrigen.toNumber()}, Requerido: ${cantidadDec.toNumber()}`);
      }

      // 2. Obtener o crear inventario destino
      let invDestino = await tx.inventarioArea.findUnique({
        where: {
          area_id_producto_id: {
            area_id: destinoAreaId,
            producto_id: prodId,
          },
        },
      });

      if (!invDestino) {
        invDestino = await tx.inventarioArea.create({
          data: {
            area_id: destinoAreaId,
            producto_id: prodId,
            stock: new Decimal(0),
            stock_minimo: new Decimal(5),
            stock_maximo: new Decimal(999),
          },
        });
      }

      const stockDestino = new Decimal(invDestino.stock);

      const nuevoStockOrigen = stockOrigen.minus(cantidadDec);
      const nuevoStockDestino = stockDestino.plus(cantidadDec);

      // 3. Actualizar stock en origen
      await tx.inventarioArea.update({
        where: {
          area_id_producto_id: {
            area_id: origenAreaId,
            producto_id: prodId,
          },
        },
        data: { stock: nuevoStockOrigen },
      });

      // 4. Actualizar stock en destino
      await tx.inventarioArea.update({
        where: {
          area_id_producto_id: {
            area_id: destinoAreaId,
            producto_id: prodId,
          },
        },
        data: { stock: nuevoStockDestino },
      });

      // 5. Crear movimiento de inventario para origen (SALIDA)
      await tx.movimientoInventario.create({
        data: {
          area_id: origenAreaId,
          producto_id: prodId,
          tipo_movimiento: 'SALIDA_TRASPASO',
          cantidad: cantidadDec,
          stock_anterior: stockOrigen,
          stock_nuevo: nuevoStockOrigen,
          usuario_id: usuarioId,
          referencia_id: `TRASPASO-A-AREA-${destinoAreaId}`,
          motivo: motivo || `Traspaso a área ID ${destinoAreaId}`,
        },
      });

      // 6. Crear movimiento de inventario para destino (ENTRADA)
      await tx.movimientoInventario.create({
        data: {
          area_id: destinoAreaId,
          producto_id: prodId,
          tipo_movimiento: 'ENTRADA_TRASPASO',
          cantidad: cantidadDec,
          stock_anterior: stockDestino,
          stock_nuevo: nuevoStockDestino,
          usuario_id: usuarioId,
          referencia_id: `TRASPASO-DESDE-AREA-${origenAreaId}`,
          motivo: motivo || `Traspaso desde área ID ${origenAreaId}`,
        },
      });

      return {
        producto: invOrigen.producto.nombre,
        nuevoStockOrigen: nuevoStockOrigen.toNumber(),
        nuevoStockDestino: nuevoStockDestino.toNumber(),
      };
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('inventario:actualizar');
    }

    return res.json({
      message: `Traspaso de stock de "${result.producto}" realizado con éxito`,
      nuevo_stock_origen: result.nuevoStockOrigen,
      nuevo_stock_destino: result.nuevoStockDestino,
    });
  } catch (error: any) {
    console.error('Error al transferir stock:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar el traspaso de stock' });
  }
}

// 14. Listar todos los productos sin importar el área (para administración y recetas)
export async function listarTodosLosProductos(req: AuthenticatedRequest, res: Response) {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });

    const resultado = productos.map((p) => ({
      id: p.id,
      codigo_barras: p.codigo_barras,
      nombre: p.nombre,
      precio_venta: Number(p.precio_venta),
      categoria: p.categoria,
      activo: p.activo,
    }));

    return res.json(resultado);
  } catch (error) {
    console.error('Error al listar todos los productos:', error);
    return res.status(500).json({ error: 'Error al obtener catálogo de productos' });
  }
}

// 15. Registrar Merma de Stock de un Producto en un Área (Solo Administradores)
export async function registrarMermaStock(req: AuthenticatedRequest, res: Response) {
  const { area_id, producto_id, cantidad, motivo } = req.body;
  const usuarioId = req.user?.id;

  if (!area_id || !producto_id || cantidad === undefined || !usuarioId) {
    return res.status(400).json({ error: 'Área, producto, cantidad a mermar y usuario administrador requeridos' });
  }

  const cantidadMermar = parseFloat(cantidad);
  if (isNaN(cantidadMermar) || cantidadMermar <= 0) {
    return res.status(400).json({ error: 'La cantidad a mermar debe ser un número positivo mayor a cero' });
  }

  try {
    const areaIdInt = parseInt(area_id);
    const productoIdInt = parseInt(producto_id);

    const resultado = await prisma.$transaction(async (tx) => {
      const inv = await tx.inventarioArea.findUnique({
        where: {
          area_id_producto_id: {
            area_id: areaIdInt,
            producto_id: productoIdInt,
          },
        },
        include: {
          producto: true,
        },
      });

      if (!inv) {
        throw new Error('El producto no está registrado en el inventario de esta área');
      }

      const stockActual = new Decimal(inv.stock);
      const cantidadMermarDec = new Decimal(cantidadMermar);

      if (stockActual.lessThan(cantidadMermarDec)) {
        throw new Error(`Stock insuficiente para merma. Disponible: ${stockActual.toNumber()}, Requerido: ${cantidadMermarDec.toNumber()}`);
      }

      const nuevoStock = stockActual.minus(cantidadMermarDec);

      const invActualizado = await tx.inventarioArea.update({
        where: {
          area_id_producto_id: {
            area_id: areaIdInt,
            producto_id: productoIdInt,
          },
        },
        data: {
          stock: nuevoStock,
        },
        include: {
          producto: true,
        },
      });

      await tx.movimientoInventario.create({
        data: {
          area_id: areaIdInt,
          producto_id: productoIdInt,
          tipo_movimiento: 'SALIDA_MERMA',
          cantidad: cantidadMermarDec,
          stock_anterior: stockActual,
          stock_nuevo: nuevoStock,
          usuario_id: usuarioId,
          referencia_id: 'MERMA-MANUAL',
          motivo: motivo || 'Merma de inventario registrada por administrador',
        },
      });

      return invActualizado;
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('inventario:actualizar');
    }

    return res.json({
      message: 'Merma registrada con éxito',
      producto: resultado.producto.nombre,
      area_id: resultado.area_id,
      nuevo_stock: Number(resultado.stock),
      cantidad_mermada: cantidadMermar,
    });
  } catch (error: any) {
    console.error('Error al registrar merma:', error);
    return res.status(500).json({ error: error.message || 'Error al registrar la merma' });
  }
}

export async function listarMermas(req: AuthenticatedRequest, res: Response) {
  try {
    const mermas = await prisma.movimientoInventario.findMany({
      where: { tipo_movimiento: 'SALIDA_MERMA' },
      include: {
        producto: true,
        area: true,
        usuario: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const resultado = mermas.map((m) => ({
      id: m.id.toString(),
      producto: m.producto.nombre,
      area: m.area.nombre,
      cantidad: Number(m.cantidad),
      fecha: m.fecha,
      motivo: m.motivo || 'Sin motivo',
      registrado_por: m.usuario.nombre,
    }));

    return res.json(resultado);
  } catch (error: any) {
    console.error('Error al listar mermas:', error);
    return res.status(500).json({ error: error.message || 'Error al obtener historial de mermas' });
  }
}

// 16. Desactivar/Eliminar Producto (Solo Administradores)
export async function eliminarProducto(req: AuthenticatedRequest, res: Response) {
  const productoId = parseInt(req.params.productoId);

  if (isNaN(productoId)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }

  try {
    // Soft-delete: set activo to false
    await prisma.producto.update({
      where: { id: productoId },
      data: { activo: false },
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('inventario:actualizar');
    }

    return res.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({ error: error.message || 'Error al eliminar el producto' });
  }
}
