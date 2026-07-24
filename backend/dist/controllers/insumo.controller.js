"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarInsumos = listarInsumos;
exports.crearInsumo = crearInsumo;
exports.actualizarInsumo = actualizarInsumo;
exports.eliminarInsumo = eliminarInsumo;
exports.guardarReceta = guardarReceta;
exports.obtenerReceta = obtenerReceta;
const decimal_js_1 = require("decimal.js");
const db_1 = __importDefault(require("../db"));
// 1. Listar todos los insumos con alerta de stock crítico
async function listarInsumos(req, res) {
    try {
        const insumos = await db_1.default.insumo.findMany({
            orderBy: { nombre: 'asc' },
        });
        const resultado = insumos.map((i) => ({
            id: i.id,
            nombre: i.nombre,
            stock: Number(i.stock),
            unidad: i.unidad,
            stock_minimo: Number(i.stock_minimo),
            critico: Number(i.stock) <= Number(i.stock_minimo),
        }));
        return res.json(resultado);
    }
    catch (error) {
        console.error('Error al listar insumos:', error);
        return res.status(500).json({ error: 'Error al consultar catálogo de insumos' });
    }
}
// 2. Crear insumo
async function crearInsumo(req, res) {
    const { nombre, stock, unidad, stock_minimo } = req.body;
    if (!nombre || !unidad) {
        return res.status(400).json({ error: 'Nombre y unidad de medida son obligatorios' });
    }
    try {
        const nuevo = await db_1.default.insumo.create({
            data: {
                nombre,
                stock: new decimal_js_1.Decimal(stock || 0),
                unidad,
                stock_minimo: new decimal_js_1.Decimal(stock_minimo || 0),
            },
        });
        return res.status(201).json({
            message: 'Insumo creado correctamente',
            insumo: {
                id: nuevo.id,
                nombre: nuevo.nombre,
                stock: Number(nuevo.stock),
                unidad: nuevo.unidad,
                stock_minimo: Number(nuevo.stock_minimo),
            },
        });
    }
    catch (error) {
        console.error('Error al crear insumo:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe un insumo con ese nombre' });
        }
        return res.status(500).json({ error: 'Error al dar de alta el insumo' });
    }
}
// 3. Actualizar insumo
async function actualizarInsumo(req, res) {
    const id = parseInt(req.params.id);
    const { nombre, stock, unidad, stock_minimo } = req.body;
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de insumo inválido' });
    }
    try {
        const dataUpdate = {};
        if (nombre !== undefined)
            dataUpdate.nombre = nombre;
        if (stock !== undefined)
            dataUpdate.stock = new decimal_js_1.Decimal(stock);
        if (unidad !== undefined)
            dataUpdate.unidad = unidad;
        if (stock_minimo !== undefined)
            dataUpdate.stock_minimo = new decimal_js_1.Decimal(stock_minimo);
        const actualizado = await db_1.default.insumo.update({
            where: { id },
            data: dataUpdate,
        });
        return res.json({
            message: 'Insumo actualizado correctamente',
            insumo: {
                id: actualizado.id,
                nombre: actualizado.nombre,
                stock: Number(actualizado.stock),
                unidad: actualizado.unidad,
                stock_minimo: Number(actualizado.stock_minimo),
            },
        });
    }
    catch (error) {
        console.error('Error al actualizar insumo:', error);
        return res.status(500).json({ error: 'Error al actualizar el insumo' });
    }
}
// 4. Eliminar insumo
async function eliminarInsumo(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de insumo inválido' });
    }
    try {
        await db_1.default.insumo.delete({
            where: { id },
        });
        return res.json({ message: 'Insumo eliminado correctamente' });
    }
    catch (error) {
        console.error('Error al eliminar insumo:', error);
        return res.status(500).json({ error: 'Error al eliminar el insumo' });
    }
}
// 5. Guardar/Actualizar receta de un producto
async function guardarReceta(req, res) {
    const productoId = parseInt(req.params.productoId);
    const { ingredientes } = req.body; // ingredientes = [ { insumo_id: number, cantidad: number } ]
    if (isNaN(productoId)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
    }
    if (!Array.isArray(ingredientes)) {
        return res.status(400).json({ error: 'Los ingredientes deben ser enviados como un arreglo' });
    }
    try {
        await db_1.default.$transaction(async (tx) => {
            // Eliminar receta existente
            await tx.recetaIngrediente.deleteMany({
                where: { producto_id: productoId },
            });
            // Crear nuevos registros de receta
            for (const ing of ingredientes) {
                await tx.recetaIngrediente.create({
                    data: {
                        producto_id: productoId,
                        insumo_id: parseInt(ing.insumo_id),
                        cantidad: new decimal_js_1.Decimal(ing.cantidad),
                    },
                });
            }
        });
        return res.json({ message: 'Receta guardada exitosamente' });
    }
    catch (error) {
        console.error('Error al guardar receta:', error);
        return res.status(500).json({ error: 'Error al guardar la receta del producto' });
    }
}
// 6. Obtener receta de un producto
async function obtenerReceta(req, res) {
    const productoId = parseInt(req.params.productoId);
    if (isNaN(productoId)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
    }
    try {
        const receta = await db_1.default.recetaIngrediente.findMany({
            where: { producto_id: productoId },
            include: {
                insumo: true,
            },
        });
        const resultado = receta.map((r) => ({
            insumo_id: r.insumo_id,
            nombre_insumo: r.insumo.nombre,
            unidad: r.insumo.unidad,
            cantidad: Number(r.cantidad),
        }));
        return res.json(resultado);
    }
    catch (error) {
        console.error('Error al obtener receta:', error);
        return res.status(500).json({ error: 'Error al obtener la receta' });
    }
}
