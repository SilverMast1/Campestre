"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function fixEncoding(str) {
    if (!str)
        return null;
    return str
        .replace(/├í/g, 'á')
        .replace(/├®/g, 'é')
        .replace(/├¡/g, 'í')
        .replace(/├│/g, 'ó')
        .replace(/├║/g, 'ú')
        .replace(/├▒/g, 'ñ')
        .replace(/├æ/g, 'Ñ')
        .replace(/├ü/g, 'Á')
        .replace(/├ë/g, 'É')
        .replace(/├═/g, 'Í')
        .replace(/├У/g, 'Ó')
        .replace(/├ó/g, 'â')
        .replace(/├┤/g, 'ô')
        .replace(/├╝/g, 'ü')
        .replace(/├┐/g, '¿')
        .replace(/├в/g, 'â');
}
async function fixDatabase() {
    console.log('--- INICIANDO CORRECCIÓN DE CODIFICACIÓN EN BD ---');
    // 1. Usuarios
    const usuarios = await db_1.default.usuario.findMany();
    for (const u of usuarios) {
        const fixedNombre = fixEncoding(u.nombre);
        if (fixedNombre && fixedNombre !== u.nombre) {
            await db_1.default.usuario.update({
                where: { id: u.id },
                data: { nombre: fixedNombre }
            });
            console.log(`Usuario ID ${u.id}: "${u.nombre}" -> "${fixedNombre}"`);
        }
    }
    // 2. Roles
    const roles = await db_1.default.role.findMany();
    for (const r of roles) {
        const fixedDesc = fixEncoding(r.descripcion);
        if (fixedDesc && fixedDesc !== r.descripcion) {
            await db_1.default.role.update({
                where: { id: r.id },
                data: { descripcion: fixedDesc }
            });
            console.log(`Rol ID ${r.id}: "${r.descripcion}" -> "${fixedDesc}"`);
        }
    }
    // 3. Areas
    const areas = await db_1.default.area.findMany();
    for (const a of areas) {
        const fixedDesc = fixEncoding(a.descripcion);
        if (fixedDesc && fixedDesc !== a.descripcion) {
            await db_1.default.area.update({
                where: { id: a.id },
                data: { descripcion: fixedDesc }
            });
            console.log(`Área ID ${a.id}: "${a.descripcion}" -> "${fixedDesc}"`);
        }
    }
    // 4. Productos
    const productos = await db_1.default.producto.findMany();
    for (const p of productos) {
        const fixedNombre = fixEncoding(p.nombre);
        const fixedDesc = fixEncoding(p.descripcion);
        const fixedCat = fixEncoding(p.categoria);
        const updateData = {};
        if (fixedNombre && fixedNombre !== p.nombre)
            updateData.nombre = fixedNombre;
        if (fixedDesc && fixedDesc !== p.descripcion)
            updateData.descripcion = fixedDesc;
        if (fixedCat && fixedCat !== p.categoria)
            updateData.categoria = fixedCat;
        if (Object.keys(updateData).length > 0) {
            await db_1.default.producto.update({
                where: { id: p.id },
                data: updateData
            });
            console.log(`Producto ID ${p.id}: "${p.nombre}" corregido`);
        }
    }
    // 5. Clientes
    const clientes = await db_1.default.cliente.findMany();
    for (const c of clientes) {
        const fixedNombre = fixEncoding(c.nombre);
        if (fixedNombre && fixedNombre !== c.nombre) {
            await db_1.default.cliente.update({
                where: { id: c.id },
                data: { nombre: fixedNombre }
            });
            console.log(`Cliente ID ${c.id}: "${c.nombre}" -> "${fixedNombre}"`);
        }
    }
    // 6. Insumos
    const insumos = await db_1.default.insumo.findMany();
    for (const i of insumos) {
        const fixedNombre = fixEncoding(i.nombre);
        if (fixedNombre && fixedNombre !== i.nombre) {
            await db_1.default.insumo.update({
                where: { id: i.id },
                data: { nombre: fixedNombre }
            });
            console.log(`Insumo ID ${i.id}: "${i.nombre}" -> "${fixedNombre}"`);
        }
    }
    // 7. InventarioArea (ubicacion_estante)
    const inventarios = await db_1.default.inventarioArea.findMany();
    for (const inv of inventarios) {
        const fixedUbicacion = fixEncoding(inv.ubicacion_estante);
        if (fixedUbicacion && fixedUbicacion !== inv.ubicacion_estante) {
            await db_1.default.inventarioArea.update({
                where: {
                    area_id_producto_id: {
                        area_id: inv.area_id,
                        producto_id: inv.producto_id
                    }
                },
                data: { ubicacion_estante: fixedUbicacion }
            });
            console.log(`Inventario Area ${inv.area_id} Prod ${inv.producto_id}: "${inv.ubicacion_estante}" -> "${fixedUbicacion}"`);
        }
    }
    // 8. Cuentas (nombre_referencia)
    const cuentas = await db_1.default.cuenta.findMany();
    for (const cu of cuentas) {
        const fixedRef = fixEncoding(cu.nombre_referencia);
        if (fixedRef && fixedRef !== cu.nombre_referencia) {
            await db_1.default.cuenta.update({
                where: { id: cu.id },
                data: { nombre_referencia: fixedRef }
            });
            console.log(`Cuenta ID ${cu.id}: "${cu.nombre_referencia}" -> "${fixedRef}"`);
        }
    }
    console.log('--- DB CORREGIDA EXITOSAMENTE ---');
}
function fixSeedFile() {
    console.log('--- CORRIGIENDO ARCHIVO SEED ---');
    const seedPath = path.join(__dirname, 'seed.ts');
    if (fs.existsSync(seedPath)) {
        const content = fs.readFileSync(seedPath, 'utf8');
        const fixedContent = fixEncoding(content);
        if (fixedContent) {
            fs.writeFileSync(seedPath, fixedContent, 'utf8');
            console.log('Archivo seed.ts corregido exitosamente.');
        }
    }
    else {
        console.log('No se encontró seed.ts');
    }
}
async function main() {
    fixSeedFile();
    await fixDatabase();
}
main().catch(console.error);
