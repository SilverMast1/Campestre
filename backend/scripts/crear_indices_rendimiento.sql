-- ============================================================
-- Script de Índices de Rendimiento — Club Campestre POS
-- Ejecutar en Supabase SQL Editor: https://supabase.com/dashboard
-- Estos índices NO modifican datos, solo aceleran lecturas.
-- ============================================================

-- 1. Cuentas: filtrar por estado (ABIERTA / PAGADA) — muy frecuente
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cuentas_estado
  ON cuentas (estado);

-- 2. Cuentas: filtrar por turno_id y estado — listarTodasLasCuentas con solo_turno_activo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cuentas_turno_estado
  ON cuentas (turno_id, estado);

-- 3. Cuentas: filtrar por rango de fecha de cierre — reportes diarios/semanales
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cuentas_closed_at
  ON cuentas (closed_at DESC NULLS LAST);

-- 4. DivisionCuenta: filtrar por cliente, método pago y estado — listarCargosSocios, obtenerDetalleCargos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_divisiones_cliente_estado
  ON "divisionCuenta" (cliente_id, metodo_pago, estado_pago);

-- 5. DivisionCuenta: filtrar por pagado_at — reportes de liquidaciones diarias
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_divisiones_pagado_at
  ON "divisionCuenta" (pagado_at DESC NULLS LAST);

-- 6. DivisionCuenta: filtrar por turno_pago_id — liquidaciones del turno activo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_divisiones_turno_pago
  ON "divisionCuenta" (turno_pago_id);

-- 7. DetalleCuenta: filtrar por cuenta_id — cada vez que se guardan consumos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_detalle_cuenta_id
  ON "detalleCuenta" (cuenta_id);

-- 8. InventarioArea: filtrar por area_id — listarProductosPorArea
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventario_area_id
  ON "inventarioArea" (area_id);

-- 9. Turnos: filtrar por activo — obtenerTurnoActivo, abrirTurno, guardarConsumos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_turnos_activo
  ON turnos (activo, area_id);

-- 10. Clientes: buscar por nombre (búsqueda de socios en login)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clientes_nombre
  ON clientes (nombre);

-- 11. Clientes: filtrar activos — listarSocios
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clientes_activo
  ON clientes (activo, nombre);

-- 12. MovimientoInventario: filtrar por area_id y producto_id — historial de stock
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_movimiento_area_producto
  ON "movimientoInventario" (area_id, producto_id);

-- 13. AsignacionCadiCliente: filtrar por cadi_id y activa — asignaciones de mesas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asignacion_cadi_activa
  ON "asignacionCadiCliente" (cadi_id, activa);

-- ============================================================
-- VERIFICAR índices creados:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
-- ============================================================
