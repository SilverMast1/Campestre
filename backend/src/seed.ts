import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import prisma from './db';

async function main() {
  console.log('Iniciando carga de datos de prueba (Seed)...');

  // 1. Roles
  const rolAdmin = await prisma.role.upsert({
    where: { nombre: 'ADMIN' },
    update: {},
    create: { nombre: 'ADMIN', descripcion: 'Superusuario con control total sobre inventario y usuarios' },
  });

  const rolVendedor = await prisma.role.upsert({
    where: { nombre: 'VENDEDOR' },
    update: {},
    create: { nombre: 'VENDEDOR', descripcion: 'Vendedor del punto de venta por área' },
  });

  console.log('Roles listos');

  // 2. Usuarios del personal (contraseñas encriptadas)
  const passwordHashAdmin = await bcrypt.hash('admin123', 12);
  const passwordHashVendedor = await bcrypt.hash('vendedor123', 12);
  const passwordHashDavid = await bcrypt.hash('david123', 12);
  const passwordHashRoger = await bcrypt.hash('roger123', 12);
  const passwordHashGabriel = await bcrypt.hash('gabriel123', 12);
  const passwordHashLuis = await bcrypt.hash('luis123', 12);

  const usuarioAdmin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: passwordHashAdmin,
      nombre: 'Administrador General',
      email: 'admin@campestre.com',
      activo: true,
    },
  });

  const usuarioVendedor = await prisma.usuario.upsert({
    where: { username: 'vendedor' },
    update: {},
    create: {
      username: 'vendedor',
      password_hash: passwordHashVendedor,
      nombre: 'Vendedor Palapa',
      email: 'vendedor@campestre.com',
      activo: true,
    },
  });

  // Crear 4 vendedores adicionales solicitados
  const vendedoresNuevos = [
    { username: 'david', hash: passwordHashDavid, nombre: 'David Gómez', email: 'david@campestre.com' },
    { username: 'roger', hash: passwordHashRoger, nombre: 'Roger Martínez', email: 'roger@campestre.com' },
    { username: 'gabriel', hash: passwordHashGabriel, nombre: 'Gabriel Torres', email: 'gabriel@campestre.com' },
    { username: 'luis', hash: passwordHashLuis, nombre: 'Luis Hernández', email: 'luis@campestre.com' },
  ];

  const usuariosVendedoresCreados = [];
  for (const v of vendedoresNuevos) {
    const u = await prisma.usuario.upsert({
      where: { username: v.username },
      update: {},
      create: {
        username: v.username,
        password_hash: v.hash,
        nombre: v.nombre,
        email: v.email,
        activo: true,
      },
    });
    usuariosVendedoresCreados.push(u);
  }

  // Asignar roles a los usuarios internos
  await prisma.usuarioRole.upsert({
    where: { usuario_id_role_id: { usuario_id: usuarioAdmin.id, role_id: rolAdmin.id } },
    update: {},
    create: { usuario_id: usuarioAdmin.id, role_id: rolAdmin.id },
  });

  await prisma.usuarioRole.upsert({
    where: { usuario_id_role_id: { usuario_id: usuarioVendedor.id, role_id: rolVendedor.id } },
    update: {},
    create: { usuario_id: usuarioVendedor.id, role_id: rolVendedor.id },
  });

  for (const u of usuariosVendedoresCreados) {
    await prisma.usuarioRole.upsert({
      where: { usuario_id_role_id: { usuario_id: u.id, role_id: rolVendedor.id } },
      update: {},
      create: { usuario_id: u.id, role_id: rolVendedor.id },
    });
  }

  console.log('Usuarios internos listos');

  // 3. Áreas físicas del club
  const areas = [
    { id: 1, nombre: 'Bar', descripcion: 'Bar de la Casa Club' },
    { id: 2, nombre: 'Snack', descripcion: 'Snack en el Hoyo 9' },
    { id: 3, nombre: 'Palapa', descripcion: 'Palapa de la alberca / exterior' },
  ];

  for (const area of areas) {
    await prisma.area.upsert({
      where: { nombre: area.nombre },
      update: {},
      create: area,
    });
  }

  console.log('Áreas listas');

  // Limpiar tablas de transacciones, inventarios y productos para evitar conflictos
  console.log('Limpiando tablas de base de datos...');
  await prisma.divisionCuenta.deleteMany({});
  await prisma.detalleCuenta.deleteMany({});
  await prisma.cuenta.deleteMany({});
  await prisma.movimientoInventario.deleteMany({});
  await prisma.inventarioArea.deleteMany({});
  await prisma.producto.deleteMany({});
  console.log('Limpieza completada');

  const productosBase = [
    // Category: ron, brandy y vodka
    { nombre: 'Bacardi añejo Botella', precio_venta: 850.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Bacardi Añejo prep', precio_venta: 85.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Bacardi Añejo shot', precio_venta: 70.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Bacardi Bco prep', precio_venta: 80.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Bacardi Bco. Botella', precio_venta: 800.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Bacardi Bco. Shot', precio_venta: 65.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Beefeater Botella', precio_venta: 1200.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Capitan Morgan Botella', precio_venta: 750.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Capitan Morgan prep', precio_venta: 80.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Capitan Morgan shot', precio_venta: 65.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Don Pedro Botella', precio_venta: 900.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Don Pedro Prep', precio_venta: 90.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Don Pedro Shot', precio_venta: 75.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Matusalem Platino Botella', precio_venta: 800.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Matusalem Platino prep', precio_venta: 85.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Matusalem Platino shot', precio_venta: 70.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Util', precio_venta: 0.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Vodka Botella', precio_venta: 850.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Vodka Prep', precio_venta: 90.00, categoria: 'ron, brandy y vodka' },
    { nombre: 'Vodka Shot', precio_venta: 70.00, categoria: 'ron, brandy y vodka' },

    // Category: comida
    { nombre: 'Arroz frito c/ verduras', precio_venta: 75.00, categoria: 'comida' },
    { nombre: 'Chicharrón de Ribeye', precio_venta: 220.00, categoria: 'comida' },
    { nombre: 'Enchiladas Suizas', precio_venta: 110.00, categoria: 'comida' },
    { nombre: 'Panini de pollo al chipotle', precio_venta: 95.00, categoria: 'comida' },
    { nombre: 'Pechuga de pollo', precio_venta: 125.00, categoria: 'comida' },
    { nombre: 'Queso fundido', precio_venta: 85.00, categoria: 'comida' },
    { nombre: 'Tacos de fideo c/ chicharron', precio_venta: 95.00, categoria: 'comida' },
    { nombre: 'Tiradito de atún', precio_venta: 175.00, categoria: 'comida' },
    { nombre: 'Tostada de ceviche de pescado', precio_venta: 60.00, categoria: 'comida' },
    { nombre: 'Platillo', precio_venta: 100.00, categoria: 'comida' },

    // Category: desayunos
    { nombre: '1/2 menudo', precio_venta: 70.00, categoria: 'desayunos' },
    { nombre: 'Menudo', precio_venta: 110.00, categoria: 'desayunos' },
    { nombre: 'Chilaquiles', precio_venta: 95.00, categoria: 'desayunos' },
    { nombre: 'Fruta con yogurt', precio_venta: 65.00, categoria: 'desayunos' },
    { nombre: 'Huevos al gusto', precio_venta: 80.00, categoria: 'desayunos' },
    { nombre: 'Huevos divorciados', precio_venta: 90.00, categoria: 'desayunos' },
    { nombre: 'Molletes', precio_venta: 70.00, categoria: 'desayunos' },
    { nombre: 'Molletes Especiales', precio_venta: 85.00, categoria: 'desayunos' },
    { nombre: 'Omelette', precio_venta: 95.00, categoria: 'desayunos' },
    { nombre: 'Quesadillas', precio_venta: 70.00, categoria: 'desayunos' },

    // Category: niños
    { nombre: 'Nuggets con papas', precio_venta: 85.00, categoria: 'niños' },
    { nombre: 'Tenders con papas', precio_venta: 95.00, categoria: 'niños' },

    // Category: tacos de guisos
    { nombre: 'Gordita', precio_venta: 25.00, categoria: 'tacos de guisos' },
    { nombre: 'Quesadilla con guiso', precio_venta: 35.00, categoria: 'tacos de guisos' },
    { nombre: 'Taco de barbacoa', precio_venta: 28.00, categoria: 'tacos de guisos' },
    { nombre: 'Taco de chicharron', precio_venta: 25.00, categoria: 'tacos de guisos' },
    { nombre: 'Taco de choriqueso', precio_venta: 25.00, categoria: 'tacos de guisos' },
    { nombre: 'Taco de huevo', precio_venta: 22.00, categoria: 'tacos de guisos' },
    { nombre: 'Taco de papa c/ chorizo', precio_venta: 25.00, categoria: 'tacos de guisos' },
    { nombre: 'Taco de picadillo', precio_venta: 25.00, categoria: 'tacos de guisos' },

    // Category: cervezas
    { nombre: 'Amstel Ultra', precio_venta: 50.00, categoria: 'cervezas' },
    { nombre: 'Carta Blanca', precio_venta: 40.00, categoria: 'cervezas' },
    { nombre: 'Indio', precio_venta: 45.00, categoria: 'cervezas' },
    { nombre: 'Miller High Life', precio_venta: 50.00, categoria: 'cervezas' },
    { nombre: 'Prep Chelada', precio_venta: 65.00, categoria: 'cervezas' },
    { nombre: 'Prep. Clamato', precio_venta: 75.00, categoria: 'cervezas' },
    { nombre: 'Prep. Michelada', precio_venta: 70.00, categoria: 'cervezas' },
    { nombre: 'Tecate Light', precio_venta: 45.00, categoria: 'cervezas' },
    { nombre: 'XX Lager', precio_venta: 45.00, categoria: 'cervezas' },

    // Category: bebidas
    { nombre: 'Agua de sabor', precio_venta: 35.00, categoria: 'bebidas' },
    { nombre: 'Agua Mineral', precio_venta: 30.00, categoria: 'bebidas' },
    { nombre: 'Agua Mineral Prep', precio_venta: 45.00, categoria: 'bebidas' },
    { nombre: 'Agua Natural 500 ml', precio_venta: 20.00, categoria: 'bebidas' },
    { nombre: 'Agua natural Lt', precio_venta: 35.00, categoria: 'bebidas' },
    { nombre: 'Agua Tónica', precio_venta: 35.00, categoria: 'bebidas' },
    { nombre: 'Amper', precio_venta: 40.00, categoria: 'bebidas' },
    { nombre: 'Coca Vidrio', precio_venta: 30.00, categoria: 'bebidas' },
    { nombre: 'Electrolit', precio_venta: 45.00, categoria: 'bebidas' },
    { nombre: 'Fuze tea', precio_venta: 35.00, categoria: 'bebidas' },
    { nombre: 'Gatorade', precio_venta: 40.00, categoria: 'bebidas' },
    { nombre: 'Jugo de naranja', precio_venta: 45.00, categoria: 'bebidas' },
    { nombre: 'Juguito Jumex', precio_venta: 25.00, categoria: 'bebidas' },
    { nombre: 'Monster', precio_venta: 60.00, categoria: 'bebidas' },
    { nombre: 'Peñafiel Twist', precio_venta: 30.00, categoria: 'bebidas' },
    { nombre: 'Powerade', precio_venta: 40.00, categoria: 'bebidas' },
    { nombre: 'Refresco', precio_venta: 30.00, categoria: 'bebidas' },

    // Category: tequilas
    { nombre: 'Centenario Añejo', precio_venta: 110.00, categoria: 'tequilas' },
    { nombre: 'Centenario plata botella', precio_venta: 1000.00, categoria: 'tequilas' },
    { nombre: 'Centenario plata prep', precio_venta: 110.00, categoria: 'tequilas' },
    { nombre: 'Centenario plata shot', precio_venta: 90.00, categoria: 'tequilas' },
    { nombre: 'Don Julio 70 Botella', precio_venta: 1700.00, categoria: 'tequilas' },
    { nombre: 'Don Julio 70 Prep', precio_venta: 160.00, categoria: 'tequilas' },
    { nombre: 'Don Julio 70 Shot', precio_venta: 140.00, categoria: 'tequilas' },
    { nombre: 'Don Julio Reposado Botella', precio_venta: 1400.00, categoria: 'tequilas' },
    { nombre: 'Don Julio Reposado Prep', precio_venta: 130.00, categoria: 'tequilas' },
    { nombre: 'Don Julio Reposado Shot', precio_venta: 110.00, categoria: 'tequilas' },
    { nombre: 'Haciena tepa shot', precio_venta: 65.00, categoria: 'tequilas' },
    { nombre: 'Hacienda tepa botella', precio_venta: 600.00, categoria: 'tequilas' },
    { nombre: 'Haciena tepa prep', precio_venta: 80.00, categoria: 'tequilas' },
    { nombre: 'Maestro Dobel Botella', precio_venta: 1600.00, categoria: 'tequilas' },
    { nombre: 'Maestro Dobel Prep', precio_venta: 150.00, categoria: 'tequilas' },
    { nombre: 'Maestro Dobel Shot', precio_venta: 130.00, categoria: 'tequilas' },
    { nombre: 'Tradicional Repo Botella', precio_venta: 950.00, categoria: 'tequilas' },
    { nombre: 'Tradicional repo prep', precio_venta: 105.00, categoria: 'tequilas' },
    { nombre: 'Tradicional Reposado', precio_venta: 90.00, categoria: 'tequilas' },

    // Category: descuentos (necesario para la lógica de descuentos del sistema)
    { nombre: 'Descuento Empleado', precio_venta: 0.00, categoria: 'descuentos' },
  ];

  console.log('Insertando productos base...');
  const productosCreados = [];
  let barcodeCounter = 100001;
  for (const prod of productosBase) {
    const nuevoProd = await prisma.producto.create({
      data: {
        nombre: prod.nombre,
        precio_venta: prod.precio_venta,
        categoria: prod.categoria,
        codigo_barras: `7502026${barcodeCounter++}`,
        activo: true,
      },
    });
    productosCreados.push(nuevoProd);
  }
  console.log('Productos base listos');

  // 5. Cargar stock de 20 para todas las áreas (Bar, Snack, Palapa)
  console.log('Configurando stock de 20 para todos los productos en todas las áreas...');
  const areaIds = [1, 2, 3]; // 1: Bar, 2: Snack, 3: Palapa
  const stockInicial = 20;

  for (const prod of productosCreados) {
    for (const areaId of areaIds) {
      await prisma.inventarioArea.create({
        data: {
          area_id: areaId,
          producto_id: prod.id,
          stock: stockInicial,
          stock_minimo: 5,
          stock_maximo: 50,
          ubicacion_estante: 'Almacén general área',
        },
      });
    }
  }

  console.log('Inventario por área listo');

  console.log('Seeding completado con éxito. Sin socios ni cadis de prueba — créalos desde la app.');
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
