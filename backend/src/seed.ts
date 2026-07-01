import { PrismaClient } from '@prisma/client';
import prisma from './db';

async function main() {
  console.log('Iniciando carga de datos desde seed personalizado...');

  // Limpiar tablas para evitar duplicados / conflictos de claves primarias
  console.log('Limpiando tablas de base de datos...');
  await prisma.usuarioRole.deleteMany({});
  await prisma.inventarioArea.deleteMany({});
  await prisma.recetaIngrediente.deleteMany({});
  await prisma.divisionCuenta.deleteMany({});
  await prisma.detalleCuenta.deleteMany({});
  await prisma.cuenta.deleteMany({});
  await prisma.movimientoInventario.deleteMany({});
  await prisma.retiroCaja.deleteMany({});
  await prisma.turno.deleteMany({});
  await prisma.asignacionCadiCliente.deleteMany({});
  await prisma.producto.deleteMany({});
  await prisma.insumo.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.cadi.deleteMany({});
  await prisma.area.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.usuario.deleteMany({});
  console.log('Limpieza completada');

  // 1. Roles
  console.log('Insertando roles...');
  await prisma.role.createMany({
    data: [
  {
    "id": 1,
    "nombre": "ADMIN",
    "descripcion": "Superusuario con control total sobre inventario y usuarios",
    "created_at": "2026-06-19T05:50:34.882Z",
    "updated_at": "2026-06-19T05:50:34.882Z"
  },
  {
    "id": 2,
    "nombre": "VENDEDOR",
    "descripcion": "Vendedor del punto de venta por ├írea",
    "created_at": "2026-06-19T05:50:34.893Z",
    "updated_at": "2026-06-19T05:50:34.893Z"
  }
]
  });

  // 2. Usuarios
  console.log('Insertando usuarios...');
  await prisma.usuario.createMany({
    data: [
  {
    "id": 1,
    "username": "admin",
    "password_hash": "$2b$12$plYLoJpRJpzeDe4b8eHb7.YZkeZt8lCiVf4jMV24B0OG60VBcQ3l6",
    "nombre": "Administrador General",
    "email": "admin@campestre.com",
    "activo": true,
    "created_at": "2026-06-19T05:50:35.377Z",
    "updated_at": "2026-06-19T05:50:35.377Z"
  },
  {
    "id": 2,
    "username": "vendedor",
    "password_hash": "$2b$12$.dihLo4vWm5JoIcHXa.jRO0tWNp8e9W5wL.vGzlrve6AShW7pY64m",
    "nombre": "Vendedor Palapa",
    "email": "vendedor@campestre.com",
    "activo": true,
    "created_at": "2026-06-19T05:50:35.386Z",
    "updated_at": "2026-06-19T05:50:35.386Z"
  },
  {
    "id": 3,
    "username": "david",
    "password_hash": "$2b$12$xpN1NuzxI2J/H3vYF.u3He5ENgvpn6KeIxOvUSMWlPbpKIjBzdBE2",
    "nombre": "David G├│mez",
    "email": "david@campestre.com",
    "activo": true,
    "created_at": "2026-06-19T19:49:11.306Z",
    "updated_at": "2026-06-19T19:49:11.306Z"
  },
  {
    "id": 4,
    "username": "roger",
    "password_hash": "$2b$12$I.u.nUQV6eI64IvY0ZSmAObQ3InpcL.s.rWqw9oC.U8g/Dif9qMLu",
    "nombre": "Roger Mart├¡nez",
    "email": "roger@campestre.com",
    "activo": true,
    "created_at": "2026-06-19T19:49:11.331Z",
    "updated_at": "2026-06-19T19:49:11.331Z"
  },
  {
    "id": 5,
    "username": "gabriel",
    "password_hash": "$2b$12$bVnQ38u2Ru1rp0P1X2oaneS.OoWnScsEpkNYAvgQi3QBj80msq22m",
    "nombre": "Gabriel Torres",
    "email": "gabriel@campestre.com",
    "activo": true,
    "created_at": "2026-06-19T19:49:11.362Z",
    "updated_at": "2026-06-19T19:49:11.362Z"
  },
  {
    "id": 6,
    "username": "luis",
    "password_hash": "$2b$12$S1CVyXBVIIiDod1NcNF6MOMSOR.ZhPeKDtb9cEP/Pe8jHIQXNOePC",
    "nombre": "Luis Hern├índez",
    "email": "luis@campestre.com",
    "activo": true,
    "created_at": "2026-06-19T19:49:11.376Z",
    "updated_at": "2026-06-19T19:49:11.376Z"
  },
  {
    "id": 7,
    "username": "Miguel",
    "password_hash": "$2b$12$t5uJJQi8ESxvIGu0VkuhDOsbGCpsuqjdO10Xu7qOjMIicIJTMfwIO",
    "nombre": "Miguel",
    "email": null,
    "activo": true,
    "created_at": "2026-06-23T05:59:21.769Z",
    "updated_at": "2026-06-23T06:03:34.952Z"
  }
]
  });

  // 3. Usuario Roles
  console.log('Insertando roles de usuario...');
  await prisma.usuarioRole.createMany({
    data: [
  {
    "usuario_id": 1,
    "role_id": 1
  },
  {
    "usuario_id": 2,
    "role_id": 2
  },
  {
    "usuario_id": 3,
    "role_id": 2
  },
  {
    "usuario_id": 4,
    "role_id": 2
  },
  {
    "usuario_id": 5,
    "role_id": 2
  },
  {
    "usuario_id": 6,
    "role_id": 2
  },
  {
    "usuario_id": 7,
    "role_id": 1
  }
]
  });

  // 4. Áreas
  console.log('Insertando áreas...');
  await prisma.area.createMany({
    data: [
  {
    "id": 1,
    "nombre": "Bar",
    "descripcion": "Bar de la Casa Club",
    "activo": true,
    "created_at": "2026-06-19T05:50:35.404Z"
  },
  {
    "id": 2,
    "nombre": "Snack",
    "descripcion": "Snack en el Hoyo 9",
    "activo": true,
    "created_at": "2026-06-19T05:50:35.411Z"
  },
  {
    "id": 3,
    "nombre": "Palapa",
    "descripcion": "Palapa de la alberca / exterior",
    "activo": true,
    "created_at": "2026-06-19T05:50:35.415Z"
  }
]
  });

  // 5. Clientes (Socios)
  console.log('Insertando clientes/socios...');
  await prisma.cliente.createMany({
    data: [
  {
    "id": 48,
    "codigo_socio": "SOCIO-1",
    "nombre": "GUSTAVO SOLIS",
    "email": null,
    "password_hash": null,
    "telefono": null,
    "qr_token": "68d882c4-320f-4111-8bd6-2bdf95c9eb39",
    "activo": true,
    "created_at": "2026-06-23T17:17:40.664Z",
    "updated_at": "2026-06-23T17:17:40.664Z"
  },
  {
    "id": 49,
    "codigo_socio": "SOCIO-2",
    "nombre": "EUGENIO GONZALEZ",
    "email": null,
    "password_hash": null,
    "telefono": null,
    "qr_token": "804bf1a4-22bd-4d40-a41f-b4f6ddcd9b83",
    "activo": true,
    "created_at": "2026-06-23T18:40:25.340Z",
    "updated_at": "2026-06-23T18:40:25.340Z"
  },
  {
    "id": 50,
    "codigo_socio": "SOCIO-3",
    "nombre": "JUAN PABLO",
    "email": null,
    "password_hash": null,
    "telefono": null,
    "qr_token": "b2ec1102-e922-489f-90ad-510b5b1caabe",
    "activo": true,
    "created_at": "2026-06-23T18:41:23.658Z",
    "updated_at": "2026-06-23T18:41:23.658Z"
  },
  {
    "id": 51,
    "codigo_socio": "EMPLEADO-1",
    "nombre": "PATY",
    "email": null,
    "password_hash": null,
    "telefono": null,
    "qr_token": "98ee414c-ce2f-4493-b8ac-0c87d6909a7c",
    "activo": true,
    "created_at": "2026-06-23T18:42:14.628Z",
    "updated_at": "2026-06-23T18:42:14.628Z"
  },
  {
    "id": 52,
    "codigo_socio": "SOCIO-4",
    "nombre": "IVAN GONZALEZ NI├æO",
    "email": null,
    "password_hash": null,
    "telefono": null,
    "qr_token": "689d55b2-7ae4-4178-a762-c8c993b98386",
    "activo": true,
    "created_at": "2026-06-23T20:45:31.082Z",
    "updated_at": "2026-06-23T20:45:31.082Z"
  },
  {
    "id": 54,
    "codigo_socio": "SOCIO-10",
    "nombre": "GONZALO",
    "email": null,
    "password_hash": null,
    "telefono": null,
    "qr_token": "633f98c0-a3f7-48e0-bd72-3378363eeb02",
    "activo": true,
    "created_at": "2026-06-23T20:58:28.152Z",
    "updated_at": "2026-06-23T20:58:28.152Z"
  },
  {
    "id": 55,
    "codigo_socio": "SOCIO-11",
    "nombre": "JORGE HERNANDEZ",
    "email": null,
    "password_hash": null,
    "telefono": null,
    "qr_token": "a545c47c-6f44-4d86-8283-449a62689f1f",
    "activo": true,
    "created_at": "2026-06-23T22:29:20.338Z",
    "updated_at": "2026-06-23T22:29:20.338Z"
  },
  {
    "id": 56,
    "codigo_socio": "SOCIO-12",
    "nombre": "HERNAN QUINTANILLA",
    "email": null,
    "password_hash": null,
    "telefono": null,
    "qr_token": "8eea0249-83eb-44ec-8702-fd251c8cd3a5",
    "activo": true,
    "created_at": "2026-06-23T22:29:47.090Z",
    "updated_at": "2026-06-23T22:29:47.090Z"
  }
]
  });

  // 6. Cadis
  console.log('Insertando cadis...');
  await prisma.cadi.createMany({
    data: []
  });

  // 7. Productos
  console.log('Insertando productos...');
  await prisma.producto.createMany({
    data: [
  {
    "id": 396,
    "codigo_barras": "7502026300001",
    "nombre": "Agua de sabor",
    "descripcion": null,
    "precio_venta": "35",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.311Z",
    "updated_at": "2026-06-23T18:03:13.100Z"
  },
  {
    "id": 397,
    "codigo_barras": "7502026300002",
    "nombre": "Agua Mineral",
    "descripcion": null,
    "precio_venta": "35",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.327Z",
    "updated_at": "2026-06-23T16:50:07.520Z"
  },
  {
    "id": 398,
    "codigo_barras": "7502026300003",
    "nombre": "Agua Mineral Prep",
    "descripcion": null,
    "precio_venta": "45",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.333Z",
    "updated_at": "2026-06-23T06:14:12.333Z"
  },
  {
    "id": 399,
    "codigo_barras": "7502026300004",
    "nombre": "Agua Natural 500 ml",
    "descripcion": null,
    "precio_venta": "20",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.342Z",
    "updated_at": "2026-06-23T16:51:45.940Z"
  },
  {
    "id": 400,
    "codigo_barras": "7502026300005",
    "nombre": "Agua natural Lt",
    "descripcion": null,
    "precio_venta": "30",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.350Z",
    "updated_at": "2026-06-23T16:51:55.503Z"
  },
  {
    "id": 401,
    "codigo_barras": "7502026300006",
    "nombre": "Agua T├│nica",
    "descripcion": null,
    "precio_venta": "30",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.358Z",
    "updated_at": "2026-06-23T16:52:10.545Z"
  },
  {
    "id": 402,
    "codigo_barras": "7502026300007",
    "nombre": "Amper",
    "descripcion": null,
    "precio_venta": "40",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.364Z",
    "updated_at": "2026-06-23T16:52:25.102Z"
  },
  {
    "id": 403,
    "codigo_barras": "7502026300008",
    "nombre": "Coca Vidrio",
    "descripcion": null,
    "precio_venta": "30",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.370Z",
    "updated_at": "2026-06-24T16:11:29.234Z"
  },
  {
    "id": 404,
    "codigo_barras": "7502026300009",
    "nombre": "Electrolit",
    "descripcion": null,
    "precio_venta": "38",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.377Z",
    "updated_at": "2026-06-23T16:53:26.565Z"
  },
  {
    "id": 405,
    "codigo_barras": "7502026300010",
    "nombre": "Fuze tea",
    "descripcion": null,
    "precio_venta": "33",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.384Z",
    "updated_at": "2026-06-23T16:53:46.627Z"
  },
  {
    "id": 406,
    "codigo_barras": "7502026300011",
    "nombre": "Gatorade",
    "descripcion": null,
    "precio_venta": "38",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.393Z",
    "updated_at": "2026-06-23T16:54:19.564Z"
  },
  {
    "id": 407,
    "codigo_barras": "7502026300012",
    "nombre": "Jugo de naranja",
    "descripcion": null,
    "precio_venta": "45",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.400Z",
    "updated_at": "2026-06-23T06:14:12.400Z"
  },
  {
    "id": 408,
    "codigo_barras": "7502026300013",
    "nombre": "Juguito Jumex",
    "descripcion": null,
    "precio_venta": "25",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.407Z",
    "updated_at": "2026-06-23T16:54:35.898Z"
  },
  {
    "id": 409,
    "codigo_barras": "7502026300014",
    "nombre": "Monster",
    "descripcion": null,
    "precio_venta": "55",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.413Z",
    "updated_at": "2026-06-23T16:54:50.753Z"
  },
  {
    "id": 410,
    "codigo_barras": "7502026300015",
    "nombre": "Pe├▒afiel Twist",
    "descripcion": null,
    "precio_venta": "33",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.419Z",
    "updated_at": "2026-06-23T16:54:01.409Z"
  },
  {
    "id": 411,
    "codigo_barras": "7502026300016",
    "nombre": "Powerade",
    "descripcion": null,
    "precio_venta": "38",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.426Z",
    "updated_at": "2026-06-24T16:07:03.537Z"
  },
  {
    "id": 412,
    "codigo_barras": "7502026300017",
    "nombre": "Refresco",
    "descripcion": null,
    "precio_venta": "33",
    "categoria": "bebidas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.434Z",
    "updated_at": "2026-06-23T17:26:00.537Z"
  },
  {
    "id": 413,
    "codigo_barras": "7502026300018",
    "nombre": "Cacahuates con ajo",
    "descripcion": null,
    "precio_venta": "35",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.442Z",
    "updated_at": "2026-06-23T17:02:16.210Z"
  },
  {
    "id": 414,
    "codigo_barras": "7502026300019",
    "nombre": "Cacahuates japoneses",
    "descripcion": null,
    "precio_venta": "20",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.448Z",
    "updated_at": "2026-06-23T17:03:13.633Z"
  },
  {
    "id": 415,
    "codigo_barras": "7502026300020",
    "nombre": "Cacahuates salados",
    "descripcion": null,
    "precio_venta": "30",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.454Z",
    "updated_at": "2026-06-23T17:04:11.082Z"
  },
  {
    "id": 416,
    "codigo_barras": "7502026300021",
    "nombre": "Chicharrones",
    "descripcion": null,
    "precio_venta": "30",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.461Z",
    "updated_at": "2026-06-23T17:26:11.690Z"
  },
  {
    "id": 417,
    "codigo_barras": "7502026300022",
    "nombre": "Chocolate",
    "descripcion": null,
    "precio_venta": "40",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.466Z",
    "updated_at": "2026-06-23T17:06:00.851Z"
  },
  {
    "id": 418,
    "codigo_barras": "7502026300023",
    "nombre": "Cigarro suelto",
    "descripcion": null,
    "precio_venta": "10",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.474Z",
    "updated_at": "2026-06-23T06:14:12.474Z"
  },
  {
    "id": 419,
    "codigo_barras": "7502026300024",
    "nombre": "Cigarros caja",
    "descripcion": null,
    "precio_venta": "100",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.481Z",
    "updated_at": "2026-06-23T06:14:12.481Z"
  },
  {
    "id": 420,
    "codigo_barras": "7502026300025",
    "nombre": "Galletas",
    "descripcion": null,
    "precio_venta": "30",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.490Z",
    "updated_at": "2026-06-23T06:14:12.490Z"
  },
  {
    "id": 421,
    "codigo_barras": "7502026300026",
    "nombre": "Kinder delice",
    "descripcion": null,
    "precio_venta": "25",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.496Z",
    "updated_at": "2026-06-23T17:07:37.133Z"
  },
  {
    "id": 422,
    "codigo_barras": "7502026300027",
    "nombre": "Sabritas",
    "descripcion": null,
    "precio_venta": "25",
    "categoria": "botanas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.501Z",
    "updated_at": "2026-06-24T16:11:18.089Z"
  },
  {
    "id": 423,
    "codigo_barras": "7502026300028",
    "nombre": "Aderezo Extra",
    "descripcion": null,
    "precio_venta": "35",
    "categoria": "cenas",
    "activo": false,
    "created_at": "2026-06-23T06:14:12.507Z",
    "updated_at": "2026-06-23T16:58:37.219Z"
  },
  {
    "id": 424,
    "codigo_barras": "7502026300029",
    "nombre": "Boneless",
    "descripcion": null,
    "precio_venta": "109",
    "categoria": "cenas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.513Z",
    "updated_at": "2026-06-23T06:14:12.513Z"
  },
  {
    "id": 425,
    "codigo_barras": "7502026300030",
    "nombre": "Dedos de queso",
    "descripcion": null,
    "precio_venta": "99",
    "categoria": "cenas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.519Z",
    "updated_at": "2026-06-23T06:14:12.519Z"
  },
  {
    "id": 426,
    "codigo_barras": "7502026300031",
    "nombre": "Extra papas",
    "descripcion": null,
    "precio_venta": "35",
    "categoria": "cenas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.526Z",
    "updated_at": "2026-06-23T06:14:12.526Z"
  },
  {
    "id": 427,
    "codigo_barras": "7502026300032",
    "nombre": "Hamburguesa",
    "descripcion": null,
    "precio_venta": "115",
    "categoria": "cenas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.532Z",
    "updated_at": "2026-06-23T06:14:12.532Z"
  },
  {
    "id": 428,
    "codigo_barras": "7502026300033",
    "nombre": "Hotdog",
    "descripcion": null,
    "precio_venta": "69",
    "categoria": "cenas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.539Z",
    "updated_at": "2026-06-23T06:14:12.539Z"
  },
  {
    "id": 429,
    "codigo_barras": "7502026300034",
    "nombre": "Papas a la francesa",
    "descripcion": null,
    "precio_venta": "69",
    "categoria": "cenas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.547Z",
    "updated_at": "2026-06-23T06:14:12.547Z"
  },
  {
    "id": 430,
    "codigo_barras": "7502026300035",
    "nombre": "Papas preparadas",
    "descripcion": null,
    "precio_venta": "89",
    "categoria": "cenas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.555Z",
    "updated_at": "2026-06-23T06:14:12.555Z"
  },
  {
    "id": 431,
    "codigo_barras": "7502026300036",
    "nombre": "Tacos de bistec",
    "descripcion": null,
    "precio_venta": "110",
    "categoria": "cenas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.564Z",
    "updated_at": "2026-06-23T06:14:12.564Z"
  },
  {
    "id": 432,
    "codigo_barras": "7502026300037",
    "nombre": "Amstel Ultra",
    "descripcion": null,
    "precio_venta": "35",
    "categoria": "cervezas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.572Z",
    "updated_at": "2026-06-23T16:56:19.753Z"
  },
  {
    "id": 433,
    "codigo_barras": "7502026300038",
    "nombre": "Carta Blanca",
    "descripcion": null,
    "precio_venta": "30",
    "categoria": "cervezas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.579Z",
    "updated_at": "2026-06-23T18:26:03.827Z"
  },
  {
    "id": 434,
    "codigo_barras": "7502026300039",
    "nombre": "Indio",
    "descripcion": null,
    "precio_venta": "28",
    "categoria": "cervezas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.589Z",
    "updated_at": "2026-06-23T16:56:54.892Z"
  },
  {
    "id": 435,
    "codigo_barras": "7502026300040",
    "nombre": "Miller High Life",
    "descripcion": null,
    "precio_venta": "40",
    "categoria": "cervezas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.596Z",
    "updated_at": "2026-06-23T16:57:11.628Z"
  },
  {
    "id": 436,
    "codigo_barras": "7502026300041",
    "nombre": "Prep Chelada",
    "descripcion": null,
    "precio_venta": "65",
    "categoria": "cervezas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.602Z",
    "updated_at": "2026-06-23T06:14:12.602Z"
  },
  {
    "id": 437,
    "codigo_barras": "7502026300042",
    "nombre": "Prep. Clamato",
    "descripcion": null,
    "precio_venta": "75",
    "categoria": "cervezas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.608Z",
    "updated_at": "2026-06-23T06:14:12.608Z"
  },
  {
    "id": 438,
    "codigo_barras": "7502026300043",
    "nombre": "Prep. Michelada",
    "descripcion": null,
    "precio_venta": "70",
    "categoria": "cervezas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.614Z",
    "updated_at": "2026-06-23T06:14:12.614Z"
  },
  {
    "id": 439,
    "codigo_barras": "7502026300044",
    "nombre": "Tecate Light",
    "descripcion": null,
    "precio_venta": "28",
    "categoria": "cervezas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.620Z",
    "updated_at": "2026-06-23T16:57:43.142Z"
  },
  {
    "id": 440,
    "codigo_barras": "7502026300045",
    "nombre": "XX Lager",
    "descripcion": null,
    "precio_venta": "30",
    "categoria": "cervezas",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.627Z",
    "updated_at": "2026-06-23T16:58:02.106Z"
  },
  {
    "id": 441,
    "codigo_barras": "7502026300046",
    "nombre": "Puro Don gal coronita",
    "descripcion": null,
    "precio_venta": "100",
    "categoria": "cigarros",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.633Z",
    "updated_at": "2026-06-23T17:10:27.594Z"
  },
  {
    "id": 442,
    "codigo_barras": "7502026300047",
    "nombre": "Puro don gal doble robusto",
    "descripcion": null,
    "precio_venta": "150",
    "categoria": "cigarros",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.642Z",
    "updated_at": "2026-06-23T17:10:35.809Z"
  },
  {
    "id": 443,
    "codigo_barras": "7502026300048",
    "nombre": "Puro don gal robusto",
    "descripcion": null,
    "precio_venta": "120",
    "categoria": "cigarros",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.677Z",
    "updated_at": "2026-06-23T17:10:47.513Z"
  },
  {
    "id": 444,
    "codigo_barras": "7502026300049",
    "nombre": "Puro gabriel'o robusto",
    "descripcion": null,
    "precio_venta": "120",
    "categoria": "cigarros",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.686Z",
    "updated_at": "2026-06-23T17:11:01.086Z"
  },
  {
    "id": 445,
    "codigo_barras": "7502026300050",
    "nombre": "Puro grabiel'o coronita",
    "descripcion": null,
    "precio_venta": "100",
    "categoria": "cigarros",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.696Z",
    "updated_at": "2026-06-23T17:11:08.502Z"
  },
  {
    "id": 446,
    "codigo_barras": "7502026300051",
    "nombre": "Descuento Empleado",
    "descripcion": null,
    "precio_venta": "0",
    "categoria": "descuentos",
    "activo": true,
    "created_at": "2026-06-23T06:14:12.703Z",
    "updated_at": "2026-06-23T06:14:12.703Z"
  },
  {
    "id": 447,
    "codigo_barras": "7502026400001",
    "nombre": "Arroz frito c/ verduras",
    "descripcion": null,
    "precio_venta": "75",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.581Z",
    "updated_at": "2026-06-23T06:15:16.581Z"
  },
  {
    "id": 448,
    "codigo_barras": "7502026400002",
    "nombre": "Chicharr├│n de Ribeye",
    "descripcion": null,
    "precio_venta": "290",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.604Z",
    "updated_at": "2026-06-23T06:15:16.604Z"
  },
  {
    "id": 449,
    "codigo_barras": "7502026400003",
    "nombre": "Enchiladas Suizas",
    "descripcion": null,
    "precio_venta": "110",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.612Z",
    "updated_at": "2026-06-23T06:15:16.612Z"
  },
  {
    "id": 450,
    "codigo_barras": "7502026400004",
    "nombre": "Panini de pollo al chipotle",
    "descripcion": null,
    "precio_venta": "95",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.621Z",
    "updated_at": "2026-06-23T06:15:16.621Z"
  },
  {
    "id": 451,
    "codigo_barras": "7502026400005",
    "nombre": "Pechuga de pollo",
    "descripcion": null,
    "precio_venta": "110",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.627Z",
    "updated_at": "2026-06-23T06:15:16.627Z"
  },
  {
    "id": 452,
    "codigo_barras": "7502026400006",
    "nombre": "Platillo",
    "descripcion": null,
    "precio_venta": "95",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.634Z",
    "updated_at": "2026-06-23T17:11:30.318Z"
  },
  {
    "id": 453,
    "codigo_barras": "7502026400007",
    "nombre": "Queso fundido",
    "descripcion": null,
    "precio_venta": "139",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.640Z",
    "updated_at": "2026-06-23T06:15:16.640Z"
  },
  {
    "id": 454,
    "codigo_barras": "7502026400008",
    "nombre": "Tacos de fideo c/ chicharron",
    "descripcion": null,
    "precio_venta": "149",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.647Z",
    "updated_at": "2026-06-23T06:15:16.647Z"
  },
  {
    "id": 455,
    "codigo_barras": "7502026400009",
    "nombre": "Tiradito de at├║n",
    "descripcion": null,
    "precio_venta": "195",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.654Z",
    "updated_at": "2026-06-23T06:15:16.654Z"
  },
  {
    "id": 456,
    "codigo_barras": "7502026400010",
    "nombre": "Tostada de ceviche de pescado",
    "descripcion": null,
    "precio_venta": "65",
    "categoria": "comida",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.660Z",
    "updated_at": "2026-06-23T06:15:16.660Z"
  },
  {
    "id": 457,
    "codigo_barras": "7502026400011",
    "nombre": "1/2 menudo",
    "descripcion": null,
    "precio_venta": "80",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.666Z",
    "updated_at": "2026-06-23T17:11:56.580Z"
  },
  {
    "id": 458,
    "codigo_barras": "7502026400012",
    "nombre": "Menudo",
    "descripcion": null,
    "precio_venta": "110",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.672Z",
    "updated_at": "2026-06-23T06:15:16.672Z"
  },
  {
    "id": 459,
    "codigo_barras": "7502026400013",
    "nombre": "Chilaquiles",
    "descripcion": null,
    "precio_venta": "110",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.678Z",
    "updated_at": "2026-06-23T06:15:16.678Z"
  },
  {
    "id": 460,
    "codigo_barras": "7502026400014",
    "nombre": "Fruta con yogurt",
    "descripcion": null,
    "precio_venta": "75",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.684Z",
    "updated_at": "2026-06-23T06:15:16.684Z"
  },
  {
    "id": 461,
    "codigo_barras": "7502026400015",
    "nombre": "Huevos al gusto",
    "descripcion": null,
    "precio_venta": "80",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.691Z",
    "updated_at": "2026-06-23T06:15:16.691Z"
  },
  {
    "id": 462,
    "codigo_barras": "7502026400016",
    "nombre": "Huevos divorciados",
    "descripcion": null,
    "precio_venta": "85",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.698Z",
    "updated_at": "2026-06-23T06:15:16.698Z"
  },
  {
    "id": 463,
    "codigo_barras": "7502026400017",
    "nombre": "Molletes",
    "descripcion": null,
    "precio_venta": "69",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.707Z",
    "updated_at": "2026-06-23T06:15:16.707Z"
  },
  {
    "id": 464,
    "codigo_barras": "7502026400018",
    "nombre": "Molletes Especiales",
    "descripcion": null,
    "precio_venta": "85",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.715Z",
    "updated_at": "2026-06-23T06:15:16.715Z"
  },
  {
    "id": 465,
    "codigo_barras": "7502026400019",
    "nombre": "Omelette",
    "descripcion": null,
    "precio_venta": "79",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.722Z",
    "updated_at": "2026-06-23T06:15:16.722Z"
  },
  {
    "id": 466,
    "codigo_barras": "7502026400020",
    "nombre": "Quesadillas",
    "descripcion": null,
    "precio_venta": "70",
    "categoria": "desayunos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.729Z",
    "updated_at": "2026-06-23T06:15:16.729Z"
  },
  {
    "id": 467,
    "codigo_barras": "7502026400021",
    "nombre": "Nuggets con papas",
    "descripcion": null,
    "precio_venta": "85",
    "categoria": "ni├▒os",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.735Z",
    "updated_at": "2026-06-23T06:15:16.735Z"
  },
  {
    "id": 468,
    "codigo_barras": "7502026400022",
    "nombre": "Tenders con papas",
    "descripcion": null,
    "precio_venta": "95",
    "categoria": "ni├▒os",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.741Z",
    "updated_at": "2026-06-23T06:15:16.741Z"
  },
  {
    "id": 469,
    "codigo_barras": "7502026400023",
    "nombre": "Bacardi a├▒ejo Botella",
    "descripcion": null,
    "precio_venta": "499",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.748Z",
    "updated_at": "2026-06-23T17:12:38.686Z"
  },
  {
    "id": 470,
    "codigo_barras": "7502026400024",
    "nombre": "Bacardi A├▒ejo prep",
    "descripcion": null,
    "precio_venta": "60",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.754Z",
    "updated_at": "2026-06-23T17:12:48.561Z"
  },
  {
    "id": 471,
    "codigo_barras": "7502026400025",
    "nombre": "Bacardi A├▒ejo shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.760Z",
    "updated_at": "2026-06-23T17:13:02.678Z"
  },
  {
    "id": 472,
    "codigo_barras": "7502026400026",
    "nombre": "Bacardi Bco prep",
    "descripcion": null,
    "precio_venta": "60",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.767Z",
    "updated_at": "2026-06-23T17:13:11.635Z"
  },
  {
    "id": 473,
    "codigo_barras": "7502026400027",
    "nombre": "Bacardi Bco. Botella",
    "descripcion": null,
    "precio_venta": "499",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.773Z",
    "updated_at": "2026-06-23T17:13:25.506Z"
  },
  {
    "id": 474,
    "codigo_barras": "7502026400028",
    "nombre": "Bacardi Bco. Shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.781Z",
    "updated_at": "2026-06-23T17:13:33.168Z"
  },
  {
    "id": 475,
    "codigo_barras": "7502026400029",
    "nombre": "Beefeater Botella",
    "descripcion": null,
    "precio_venta": "799",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.787Z",
    "updated_at": "2026-06-23T17:14:00.506Z"
  },
  {
    "id": 476,
    "codigo_barras": "7502026400030",
    "nombre": "Capitan Morgan Botella",
    "descripcion": null,
    "precio_venta": "450",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.794Z",
    "updated_at": "2026-06-23T17:14:11.543Z"
  },
  {
    "id": 477,
    "codigo_barras": "7502026400031",
    "nombre": "Capitan Morgan prep",
    "descripcion": null,
    "precio_venta": "60",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.801Z",
    "updated_at": "2026-06-23T17:14:20.064Z"
  },
  {
    "id": 478,
    "codigo_barras": "7502026400032",
    "nombre": "Capitan Morgan shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.809Z",
    "updated_at": "2026-06-23T17:14:26.945Z"
  },
  {
    "id": 479,
    "codigo_barras": "7502026400033",
    "nombre": "Don Pedro Botella",
    "descripcion": null,
    "precio_venta": "399",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.815Z",
    "updated_at": "2026-06-23T17:14:38.837Z"
  },
  {
    "id": 480,
    "codigo_barras": "7502026400034",
    "nombre": "Don Pedro Prep",
    "descripcion": null,
    "precio_venta": "60",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.826Z",
    "updated_at": "2026-06-23T17:14:44.186Z"
  },
  {
    "id": 481,
    "codigo_barras": "7502026400035",
    "nombre": "Don Pedro Shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.839Z",
    "updated_at": "2026-06-23T17:14:48.662Z"
  },
  {
    "id": 482,
    "codigo_barras": "7502026400036",
    "nombre": "Matusalem Platino Botella",
    "descripcion": null,
    "precio_venta": "599",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.851Z",
    "updated_at": "2026-06-23T17:15:06.528Z"
  },
  {
    "id": 483,
    "codigo_barras": "7502026400037",
    "nombre": "Matusalem Platino prep",
    "descripcion": null,
    "precio_venta": "60",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.864Z",
    "updated_at": "2026-06-23T17:15:12.532Z"
  },
  {
    "id": 484,
    "codigo_barras": "7502026400038",
    "nombre": "Matusalem Platino shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.872Z",
    "updated_at": "2026-06-23T17:15:18.488Z"
  },
  {
    "id": 485,
    "codigo_barras": "7502026400039",
    "nombre": "Util",
    "descripcion": null,
    "precio_venta": "0",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.881Z",
    "updated_at": "2026-06-23T20:30:48.367Z"
  },
  {
    "id": 486,
    "codigo_barras": "7502026400040",
    "nombre": "Vodka Botella",
    "descripcion": null,
    "precio_venta": "499",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.891Z",
    "updated_at": "2026-06-23T17:15:34.755Z"
  },
  {
    "id": 487,
    "codigo_barras": "7502026400041",
    "nombre": "Vodka Prep",
    "descripcion": null,
    "precio_venta": "70",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.901Z",
    "updated_at": "2026-06-23T17:15:45.689Z"
  },
  {
    "id": 488,
    "codigo_barras": "7502026400042",
    "nombre": "Vodka Shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "ron, brandy y vodka",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.911Z",
    "updated_at": "2026-06-23T17:15:56.256Z"
  },
  {
    "id": 489,
    "codigo_barras": "7502026400043",
    "nombre": "Gorditas",
    "descripcion": null,
    "precio_venta": "33",
    "categoria": "tacos de guisos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.921Z",
    "updated_at": "2026-06-23T17:18:18.157Z"
  },
  {
    "id": 490,
    "codigo_barras": "7502026400044",
    "nombre": "Quesadilla con guiso",
    "descripcion": null,
    "precio_venta": "33",
    "categoria": "tacos de guisos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.930Z",
    "updated_at": "2026-06-23T17:18:36.553Z"
  },
  {
    "id": 491,
    "codigo_barras": "7502026400045",
    "nombre": "Taco de barbacoa",
    "descripcion": null,
    "precio_venta": "28",
    "categoria": "tacos de guisos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.936Z",
    "updated_at": "2026-06-23T06:15:16.936Z"
  },
  {
    "id": 492,
    "codigo_barras": "7502026400046",
    "nombre": "Taco de chicharron",
    "descripcion": null,
    "precio_venta": "28",
    "categoria": "tacos de guisos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.944Z",
    "updated_at": "2026-06-23T06:15:16.944Z"
  },
  {
    "id": 493,
    "codigo_barras": "7502026400047",
    "nombre": "Taco de choriqueso",
    "descripcion": null,
    "precio_venta": "28",
    "categoria": "tacos de guisos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.951Z",
    "updated_at": "2026-06-23T06:15:16.951Z"
  },
  {
    "id": 494,
    "codigo_barras": "7502026400048",
    "nombre": "Taco de huevo",
    "descripcion": null,
    "precio_venta": "24",
    "categoria": "tacos de guisos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.958Z",
    "updated_at": "2026-06-23T17:19:14.012Z"
  },
  {
    "id": 495,
    "codigo_barras": "7502026400049",
    "nombre": "Taco de papa c/ chorizo",
    "descripcion": null,
    "precio_venta": "24",
    "categoria": "tacos de guisos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.965Z",
    "updated_at": "2026-06-23T17:19:21.604Z"
  },
  {
    "id": 496,
    "codigo_barras": "7502026400050",
    "nombre": "Taco de picadillo",
    "descripcion": null,
    "precio_venta": "24",
    "categoria": "tacos de guisos",
    "activo": true,
    "created_at": "2026-06-23T06:15:16.971Z",
    "updated_at": "2026-06-23T17:19:29.983Z"
  },
  {
    "id": 497,
    "codigo_barras": "7502026500001",
    "nombre": "Black & White Botella",
    "descripcion": null,
    "precio_venta": "480",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.115Z",
    "updated_at": "2026-06-23T17:23:12.097Z"
  },
  {
    "id": 498,
    "codigo_barras": "7502026500002",
    "nombre": "Black & White Prep",
    "descripcion": null,
    "precio_venta": "70",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.129Z",
    "updated_at": "2026-06-23T17:23:20.089Z"
  },
  {
    "id": 499,
    "codigo_barras": "7502026500003",
    "nombre": "Black & White Shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.139Z",
    "updated_at": "2026-06-23T17:23:25.901Z"
  },
  {
    "id": 500,
    "codigo_barras": "7502026500004",
    "nombre": "Buchanans 12 Botella",
    "descripcion": null,
    "precio_venta": "999",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.147Z",
    "updated_at": "2026-06-23T17:23:39.255Z"
  },
  {
    "id": 501,
    "codigo_barras": "7502026500005",
    "nombre": "Buchanans 12 prep",
    "descripcion": null,
    "precio_venta": "95",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.155Z",
    "updated_at": "2026-06-23T17:23:47.439Z"
  },
  {
    "id": 502,
    "codigo_barras": "7502026500006",
    "nombre": "Buchanans 12 Shot",
    "descripcion": null,
    "precio_venta": "75",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.161Z",
    "updated_at": "2026-06-23T17:23:54.107Z"
  },
  {
    "id": 503,
    "codigo_barras": "7502026500007",
    "nombre": "Chivas 12 Botella",
    "descripcion": null,
    "precio_venta": "999",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.168Z",
    "updated_at": "2026-06-23T17:24:05.323Z"
  },
  {
    "id": 504,
    "codigo_barras": "7502026500008",
    "nombre": "Chivas 12 prep",
    "descripcion": null,
    "precio_venta": "95",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.174Z",
    "updated_at": "2026-06-23T17:24:13.143Z"
  },
  {
    "id": 505,
    "codigo_barras": "7502026500009",
    "nombre": "Chivas 12 Shot",
    "descripcion": null,
    "precio_venta": "75",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.181Z",
    "updated_at": "2026-06-23T17:24:29.053Z"
  },
  {
    "id": 506,
    "codigo_barras": "7502026500010",
    "nombre": "Etiq. Negra Botella",
    "descripcion": null,
    "precio_venta": "1099",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.187Z",
    "updated_at": "2026-06-23T17:24:42.299Z"
  },
  {
    "id": 507,
    "codigo_barras": "7502026500011",
    "nombre": "Etiq. Negra Prep.",
    "descripcion": null,
    "precio_venta": "95",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.195Z",
    "updated_at": "2026-06-23T17:24:47.408Z"
  },
  {
    "id": 508,
    "codigo_barras": "7502026500012",
    "nombre": "Etiq. Negra Shot",
    "descripcion": null,
    "precio_venta": "75",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.201Z",
    "updated_at": "2026-06-23T17:24:52.625Z"
  },
  {
    "id": 509,
    "codigo_barras": "7502026500013",
    "nombre": "Etiq. Roja Botella",
    "descripcion": null,
    "precio_venta": "499",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.207Z",
    "updated_at": "2026-06-23T17:25:05.295Z"
  },
  {
    "id": 510,
    "codigo_barras": "7502026500014",
    "nombre": "Etiq. Roja prep",
    "descripcion": null,
    "precio_venta": "70",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.215Z",
    "updated_at": "2026-06-23T17:25:12.171Z"
  },
  {
    "id": 511,
    "codigo_barras": "7502026500015",
    "nombre": "Etiq. Roja shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "whisky",
    "activo": true,
    "created_at": "2026-06-23T06:17:05.221Z",
    "updated_at": "2026-06-23T17:25:18.323Z"
  },
  {
    "id": 512,
    "codigo_barras": "7502026600001",
    "nombre": "Centenario A├▒ejo",
    "descripcion": null,
    "precio_venta": "100",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.914Z",
    "updated_at": "2026-06-23T17:19:41.645Z"
  },
  {
    "id": 513,
    "codigo_barras": "7502026600002",
    "nombre": "Centenario plata botella",
    "descripcion": null,
    "precio_venta": "798",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.928Z",
    "updated_at": "2026-06-23T17:19:57.831Z"
  },
  {
    "id": 514,
    "codigo_barras": "7502026600003",
    "nombre": "Centenario plata prep",
    "descripcion": null,
    "precio_venta": "70",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.936Z",
    "updated_at": "2026-06-23T17:20:07.666Z"
  },
  {
    "id": 515,
    "codigo_barras": "7502026600004",
    "nombre": "Centenario plata shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.943Z",
    "updated_at": "2026-06-23T17:20:15.603Z"
  },
  {
    "id": 516,
    "codigo_barras": "7502026600005",
    "nombre": "Don Julio 70 Botella",
    "descripcion": null,
    "precio_venta": "1499",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.949Z",
    "updated_at": "2026-06-23T17:20:27.590Z"
  },
  {
    "id": 517,
    "codigo_barras": "7502026600006",
    "nombre": "Don Julio 70 Prep",
    "descripcion": null,
    "precio_venta": "130",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.956Z",
    "updated_at": "2026-06-23T17:20:32.426Z"
  },
  {
    "id": 518,
    "codigo_barras": "7502026600007",
    "nombre": "Don Julio 70 Shot",
    "descripcion": null,
    "precio_venta": "110",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.962Z",
    "updated_at": "2026-06-23T17:20:38.920Z"
  },
  {
    "id": 519,
    "codigo_barras": "7502026600008",
    "nombre": "Don Julio Reposado Botella",
    "descripcion": null,
    "precio_venta": "1299",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.969Z",
    "updated_at": "2026-06-23T17:20:47.722Z"
  },
  {
    "id": 520,
    "codigo_barras": "7502026600009",
    "nombre": "Don Julio Reposado Prep",
    "descripcion": null,
    "precio_venta": "120",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.975Z",
    "updated_at": "2026-06-23T17:20:53.980Z"
  },
  {
    "id": 521,
    "codigo_barras": "7502026600010",
    "nombre": "Don Julio Reposado Shot",
    "descripcion": null,
    "precio_venta": "100",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.981Z",
    "updated_at": "2026-06-23T17:21:01.635Z"
  },
  {
    "id": 522,
    "codigo_barras": "7502026600011",
    "nombre": "Hacienda tepa shot",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.987Z",
    "updated_at": "2026-06-23T17:21:41.916Z"
  },
  {
    "id": 523,
    "codigo_barras": "7502026600012",
    "nombre": "Hacienda tepa botella",
    "descripcion": null,
    "precio_venta": "799",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:08.993Z",
    "updated_at": "2026-06-23T17:21:52.160Z"
  },
  {
    "id": 524,
    "codigo_barras": "7502026600013",
    "nombre": "Hacienda tepa prep",
    "descripcion": null,
    "precio_venta": "70",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:09.000Z",
    "updated_at": "2026-06-23T17:21:59.826Z"
  },
  {
    "id": 525,
    "codigo_barras": "7502026600014",
    "nombre": "Maestro Dobel Botella",
    "descripcion": null,
    "precio_venta": "1299",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:09.007Z",
    "updated_at": "2026-06-23T17:22:13.471Z"
  },
  {
    "id": 526,
    "codigo_barras": "7502026600015",
    "nombre": "Maestro Dobel Prep",
    "descripcion": null,
    "precio_venta": "120",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:09.013Z",
    "updated_at": "2026-06-23T17:22:21.342Z"
  },
  {
    "id": 527,
    "codigo_barras": "7502026600016",
    "nombre": "Maestro Dobel Shot",
    "descripcion": null,
    "precio_venta": "100",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:09.019Z",
    "updated_at": "2026-06-23T17:22:26.767Z"
  },
  {
    "id": 528,
    "codigo_barras": "7502026600017",
    "nombre": "Tradicional Repo Botella",
    "descripcion": null,
    "precio_venta": "799",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:09.025Z",
    "updated_at": "2026-06-23T17:22:38.675Z"
  },
  {
    "id": 529,
    "codigo_barras": "7502026600018",
    "nombre": "Tradicional repo prep",
    "descripcion": null,
    "precio_venta": "70",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:09.031Z",
    "updated_at": "2026-06-23T17:22:51.341Z"
  },
  {
    "id": 530,
    "codigo_barras": "7502026600019",
    "nombre": "Tradicional Reposado",
    "descripcion": null,
    "precio_venta": "50",
    "categoria": "tequilas",
    "activo": true,
    "created_at": "2026-06-23T06:19:09.038Z",
    "updated_at": "2026-06-23T17:23:00.294Z"
  },
  {
    "id": 545,
    "codigo_barras": null,
    "nombre": "Agua Mineral Grande",
    "descripcion": "Agua mineral grande para preparado (no para venta directa)",
    "precio_venta": "0",
    "categoria": "Bebidas",
    "activo": true,
    "created_at": "2026-06-23T17:36:05.585Z",
    "updated_at": "2026-06-23T17:38:10.170Z"
  }
]
  });

  // 8. Inventario por área
  console.log('Insertando inventario por área...');
  await prisma.inventarioArea.createMany({
    data: [
  {
    "area_id": 3,
    "producto_id": 397,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.332Z"
  },
  {
    "area_id": 1,
    "producto_id": 398,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.335Z"
  },
  {
    "area_id": 2,
    "producto_id": 398,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.338Z"
  },
  {
    "area_id": 3,
    "producto_id": 398,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.340Z"
  },
  {
    "area_id": 2,
    "producto_id": 399,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.346Z"
  },
  {
    "area_id": 3,
    "producto_id": 399,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.348Z"
  },
  {
    "area_id": 3,
    "producto_id": 400,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.356Z"
  },
  {
    "area_id": 2,
    "producto_id": 401,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.361Z"
  },
  {
    "area_id": 3,
    "producto_id": 401,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.362Z"
  },
  {
    "area_id": 3,
    "producto_id": 403,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.375Z"
  },
  {
    "area_id": 3,
    "producto_id": 404,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.382Z"
  },
  {
    "area_id": 2,
    "producto_id": 405,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.388Z"
  },
  {
    "area_id": 3,
    "producto_id": 405,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.391Z"
  },
  {
    "area_id": 1,
    "producto_id": 407,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.401Z"
  },
  {
    "area_id": 2,
    "producto_id": 407,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.403Z"
  },
  {
    "area_id": 3,
    "producto_id": 407,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.405Z"
  },
  {
    "area_id": 3,
    "producto_id": 408,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.411Z"
  },
  {
    "area_id": 3,
    "producto_id": 409,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.417Z"
  },
  {
    "area_id": 2,
    "producto_id": 410,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.422Z"
  },
  {
    "area_id": 3,
    "producto_id": 410,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.424Z"
  },
  {
    "area_id": 3,
    "producto_id": 411,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.432Z"
  },
  {
    "area_id": 2,
    "producto_id": 412,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.438Z"
  },
  {
    "area_id": 3,
    "producto_id": 412,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.440Z"
  },
  {
    "area_id": 3,
    "producto_id": 413,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.447Z"
  },
  {
    "area_id": 3,
    "producto_id": 414,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.453Z"
  },
  {
    "area_id": 3,
    "producto_id": 415,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.460Z"
  },
  {
    "area_id": 3,
    "producto_id": 416,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.465Z"
  },
  {
    "area_id": 2,
    "producto_id": 417,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.469Z"
  },
  {
    "area_id": 3,
    "producto_id": 417,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.471Z"
  },
  {
    "area_id": 1,
    "producto_id": 418,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.476Z"
  },
  {
    "area_id": 2,
    "producto_id": 418,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.478Z"
  },
  {
    "area_id": 3,
    "producto_id": 418,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.479Z"
  },
  {
    "area_id": 2,
    "producto_id": 419,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.486Z"
  },
  {
    "area_id": 3,
    "producto_id": 419,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.487Z"
  },
  {
    "area_id": 3,
    "producto_id": 420,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.494Z"
  },
  {
    "area_id": 3,
    "producto_id": 422,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.506Z"
  },
  {
    "area_id": 1,
    "producto_id": 424,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.515Z"
  },
  {
    "area_id": 2,
    "producto_id": 424,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.516Z"
  },
  {
    "area_id": 3,
    "producto_id": 424,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.517Z"
  },
  {
    "area_id": 1,
    "producto_id": 425,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.520Z"
  },
  {
    "area_id": 2,
    "producto_id": 425,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.523Z"
  },
  {
    "area_id": 3,
    "producto_id": 425,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.525Z"
  },
  {
    "area_id": 1,
    "producto_id": 426,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.528Z"
  },
  {
    "area_id": 2,
    "producto_id": 426,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.529Z"
  },
  {
    "area_id": 3,
    "producto_id": 426,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.530Z"
  },
  {
    "area_id": 1,
    "producto_id": 427,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.533Z"
  },
  {
    "area_id": 2,
    "producto_id": 427,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.534Z"
  },
  {
    "area_id": 3,
    "producto_id": 427,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.536Z"
  },
  {
    "area_id": 1,
    "producto_id": 428,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.541Z"
  },
  {
    "area_id": 1,
    "producto_id": 411,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-24T16:07:06.791Z"
  },
  {
    "area_id": 1,
    "producto_id": 397,
    "stock": "45",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T22:00:05.280Z"
  },
  {
    "area_id": 1,
    "producto_id": 420,
    "stock": "18",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T22:48:08.973Z"
  },
  {
    "area_id": 1,
    "producto_id": 402,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:52:25.117Z"
  },
  {
    "area_id": 2,
    "producto_id": 403,
    "stock": "34",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:36:30.569Z"
  },
  {
    "area_id": 1,
    "producto_id": 412,
    "stock": "49",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-24T16:06:23.361Z"
  },
  {
    "area_id": 1,
    "producto_id": 405,
    "stock": "6",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-24T16:08:27.846Z"
  },
  {
    "area_id": 1,
    "producto_id": 422,
    "stock": "58",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-24T16:11:18.096Z"
  },
  {
    "area_id": 1,
    "producto_id": 410,
    "stock": "1",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:54:01.424Z"
  },
  {
    "area_id": 2,
    "producto_id": 406,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:54:19.575Z"
  },
  {
    "area_id": 3,
    "producto_id": 406,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:54:19.576Z"
  },
  {
    "area_id": 1,
    "producto_id": 406,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:54:19.579Z"
  },
  {
    "area_id": 1,
    "producto_id": 408,
    "stock": "22",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:54:35.911Z"
  },
  {
    "area_id": 1,
    "producto_id": 409,
    "stock": "7",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:54:50.765Z"
  },
  {
    "area_id": 1,
    "producto_id": 404,
    "stock": "11",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:44:30.434Z"
  },
  {
    "area_id": 3,
    "producto_id": 396,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:03:13.103Z"
  },
  {
    "area_id": 1,
    "producto_id": 403,
    "stock": "5",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-24T16:11:29.241Z"
  },
  {
    "area_id": 1,
    "producto_id": 413,
    "stock": "6",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:02:16.258Z"
  },
  {
    "area_id": 1,
    "producto_id": 415,
    "stock": "13",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:04:11.099Z"
  },
  {
    "area_id": 1,
    "producto_id": 417,
    "stock": "16",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:06:00.870Z"
  },
  {
    "area_id": 1,
    "producto_id": 421,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:07:37.152Z"
  },
  {
    "area_id": 2,
    "producto_id": 421,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:07:37.150Z"
  },
  {
    "area_id": 3,
    "producto_id": 421,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:07:37.157Z"
  },
  {
    "area_id": 1,
    "producto_id": 401,
    "stock": "1",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T20:03:04.071Z"
  },
  {
    "area_id": 1,
    "producto_id": 416,
    "stock": "17",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:27:04.805Z"
  },
  {
    "area_id": 2,
    "producto_id": 397,
    "stock": "26",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T22:00:05.288Z"
  },
  {
    "area_id": 2,
    "producto_id": 396,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:03:13.103Z"
  },
  {
    "area_id": 2,
    "producto_id": 409,
    "stock": "1",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:36:11.330Z"
  },
  {
    "area_id": 2,
    "producto_id": 402,
    "stock": "1",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:36:23.391Z"
  },
  {
    "area_id": 2,
    "producto_id": 411,
    "stock": "4",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:36:52.069Z"
  },
  {
    "area_id": 2,
    "producto_id": 404,
    "stock": "2",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:37:39.292Z"
  },
  {
    "area_id": 2,
    "producto_id": 400,
    "stock": "9",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:37:50.563Z"
  },
  {
    "area_id": 2,
    "producto_id": 408,
    "stock": "3",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:38:03.755Z"
  },
  {
    "area_id": 2,
    "producto_id": 422,
    "stock": "9",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:38:11.926Z"
  },
  {
    "area_id": 2,
    "producto_id": 416,
    "stock": "12",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:38:20.692Z"
  },
  {
    "area_id": 2,
    "producto_id": 414,
    "stock": "3",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:38:35.604Z"
  },
  {
    "area_id": 2,
    "producto_id": 420,
    "stock": "4",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:38:43.703Z"
  },
  {
    "area_id": 2,
    "producto_id": 413,
    "stock": "2",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:38:53.304Z"
  },
  {
    "area_id": 2,
    "producto_id": 415,
    "stock": "5",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:38:59.166Z"
  },
  {
    "area_id": 1,
    "producto_id": 419,
    "stock": "19",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:40:02.596Z"
  },
  {
    "area_id": 1,
    "producto_id": 414,
    "stock": "21",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T22:29:49.344Z"
  },
  {
    "area_id": 2,
    "producto_id": 428,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.543Z"
  },
  {
    "area_id": 3,
    "producto_id": 428,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.545Z"
  },
  {
    "area_id": 1,
    "producto_id": 429,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.549Z"
  },
  {
    "area_id": 2,
    "producto_id": 429,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.551Z"
  },
  {
    "area_id": 3,
    "producto_id": 429,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.553Z"
  },
  {
    "area_id": 1,
    "producto_id": 430,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.558Z"
  },
  {
    "area_id": 2,
    "producto_id": 430,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.560Z"
  },
  {
    "area_id": 3,
    "producto_id": 430,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.562Z"
  },
  {
    "area_id": 1,
    "producto_id": 431,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.566Z"
  },
  {
    "area_id": 2,
    "producto_id": 431,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.568Z"
  },
  {
    "area_id": 3,
    "producto_id": 431,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.569Z"
  },
  {
    "area_id": 3,
    "producto_id": 432,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.578Z"
  },
  {
    "area_id": 3,
    "producto_id": 433,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.587Z"
  },
  {
    "area_id": 3,
    "producto_id": 434,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.595Z"
  },
  {
    "area_id": 3,
    "producto_id": 435,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.600Z"
  },
  {
    "area_id": 1,
    "producto_id": 436,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.603Z"
  },
  {
    "area_id": 2,
    "producto_id": 436,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.605Z"
  },
  {
    "area_id": 3,
    "producto_id": 436,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.607Z"
  },
  {
    "area_id": 1,
    "producto_id": 437,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.610Z"
  },
  {
    "area_id": 2,
    "producto_id": 437,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.611Z"
  },
  {
    "area_id": 3,
    "producto_id": 437,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.613Z"
  },
  {
    "area_id": 1,
    "producto_id": 438,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.616Z"
  },
  {
    "area_id": 2,
    "producto_id": 438,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.617Z"
  },
  {
    "area_id": 3,
    "producto_id": 438,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.618Z"
  },
  {
    "area_id": 3,
    "producto_id": 439,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.625Z"
  },
  {
    "area_id": 3,
    "producto_id": 440,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.632Z"
  },
  {
    "area_id": 2,
    "producto_id": 441,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.638Z"
  },
  {
    "area_id": 3,
    "producto_id": 441,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.640Z"
  },
  {
    "area_id": 2,
    "producto_id": 442,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.668Z"
  },
  {
    "area_id": 3,
    "producto_id": 442,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.674Z"
  },
  {
    "area_id": 2,
    "producto_id": 443,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.682Z"
  },
  {
    "area_id": 3,
    "producto_id": 443,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.684Z"
  },
  {
    "area_id": 2,
    "producto_id": 444,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.690Z"
  },
  {
    "area_id": 3,
    "producto_id": 444,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.693Z"
  },
  {
    "area_id": 2,
    "producto_id": 445,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.699Z"
  },
  {
    "area_id": 3,
    "producto_id": 445,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.701Z"
  },
  {
    "area_id": 2,
    "producto_id": 446,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.708Z"
  },
  {
    "area_id": 3,
    "producto_id": 446,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:14:12.710Z"
  },
  {
    "area_id": 1,
    "producto_id": 447,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.593Z"
  },
  {
    "area_id": 2,
    "producto_id": 447,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.597Z"
  },
  {
    "area_id": 3,
    "producto_id": 447,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.600Z"
  },
  {
    "area_id": 1,
    "producto_id": 448,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.606Z"
  },
  {
    "area_id": 2,
    "producto_id": 448,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.609Z"
  },
  {
    "area_id": 3,
    "producto_id": 448,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.610Z"
  },
  {
    "area_id": 1,
    "producto_id": 449,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.615Z"
  },
  {
    "area_id": 2,
    "producto_id": 449,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.617Z"
  },
  {
    "area_id": 3,
    "producto_id": 449,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.619Z"
  },
  {
    "area_id": 1,
    "producto_id": 450,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.622Z"
  },
  {
    "area_id": 2,
    "producto_id": 450,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.624Z"
  },
  {
    "area_id": 3,
    "producto_id": 450,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.626Z"
  },
  {
    "area_id": 1,
    "producto_id": 451,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.629Z"
  },
  {
    "area_id": 2,
    "producto_id": 451,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.631Z"
  },
  {
    "area_id": 3,
    "producto_id": 451,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.632Z"
  },
  {
    "area_id": 2,
    "producto_id": 452,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.637Z"
  },
  {
    "area_id": 3,
    "producto_id": 452,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.639Z"
  },
  {
    "area_id": 1,
    "producto_id": 453,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.642Z"
  },
  {
    "area_id": 2,
    "producto_id": 453,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.644Z"
  },
  {
    "area_id": 3,
    "producto_id": 453,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.645Z"
  },
  {
    "area_id": 1,
    "producto_id": 454,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.648Z"
  },
  {
    "area_id": 2,
    "producto_id": 454,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.650Z"
  },
  {
    "area_id": 3,
    "producto_id": 454,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.652Z"
  },
  {
    "area_id": 1,
    "producto_id": 455,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.655Z"
  },
  {
    "area_id": 2,
    "producto_id": 455,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.657Z"
  },
  {
    "area_id": 3,
    "producto_id": 455,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.658Z"
  },
  {
    "area_id": 1,
    "producto_id": 456,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.662Z"
  },
  {
    "area_id": 2,
    "producto_id": 456,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.663Z"
  },
  {
    "area_id": 3,
    "producto_id": 456,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.664Z"
  },
  {
    "area_id": 2,
    "producto_id": 457,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.669Z"
  },
  {
    "area_id": 3,
    "producto_id": 457,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.671Z"
  },
  {
    "area_id": 1,
    "producto_id": 458,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.674Z"
  },
  {
    "area_id": 2,
    "producto_id": 458,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.675Z"
  },
  {
    "area_id": 3,
    "producto_id": 458,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.676Z"
  },
  {
    "area_id": 1,
    "producto_id": 459,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.679Z"
  },
  {
    "area_id": 2,
    "producto_id": 459,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.680Z"
  },
  {
    "area_id": 3,
    "producto_id": 459,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.682Z"
  },
  {
    "area_id": 1,
    "producto_id": 460,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.686Z"
  },
  {
    "area_id": 2,
    "producto_id": 460,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.688Z"
  },
  {
    "area_id": 2,
    "producto_id": 439,
    "stock": "144",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:26:28.314Z"
  },
  {
    "area_id": 1,
    "producto_id": 446,
    "stock": "14",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-24T16:07:57.176Z"
  },
  {
    "area_id": 1,
    "producto_id": 439,
    "stock": "69",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:57:43.158Z"
  },
  {
    "area_id": 1,
    "producto_id": 440,
    "stock": "30",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:58:02.121Z"
  },
  {
    "area_id": 1,
    "producto_id": 442,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:10:35.836Z"
  },
  {
    "area_id": 1,
    "producto_id": 443,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:10:47.526Z"
  },
  {
    "area_id": 1,
    "producto_id": 444,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:11:01.098Z"
  },
  {
    "area_id": 1,
    "producto_id": 445,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:11:08.519Z"
  },
  {
    "area_id": 1,
    "producto_id": 452,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:11:30.331Z"
  },
  {
    "area_id": 1,
    "producto_id": 457,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:11:56.594Z"
  },
  {
    "area_id": 1,
    "producto_id": 434,
    "stock": "11",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T20:45:06.119Z"
  },
  {
    "area_id": 1,
    "producto_id": 433,
    "stock": "16",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:26:03.833Z"
  },
  {
    "area_id": 2,
    "producto_id": 432,
    "stock": "71",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:26:44.880Z"
  },
  {
    "area_id": 2,
    "producto_id": 434,
    "stock": "31",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:26:52.418Z"
  },
  {
    "area_id": 2,
    "producto_id": 435,
    "stock": "5",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:27:00.701Z"
  },
  {
    "area_id": 2,
    "producto_id": 440,
    "stock": "36",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:27:12.044Z"
  },
  {
    "area_id": 2,
    "producto_id": 433,
    "stock": "24",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:27:20.195Z"
  },
  {
    "area_id": 1,
    "producto_id": 435,
    "stock": "18",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:44:30.449Z"
  },
  {
    "area_id": 3,
    "producto_id": 460,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.690Z"
  },
  {
    "area_id": 1,
    "producto_id": 461,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.693Z"
  },
  {
    "area_id": 2,
    "producto_id": 461,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.695Z"
  },
  {
    "area_id": 3,
    "producto_id": 461,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.696Z"
  },
  {
    "area_id": 1,
    "producto_id": 462,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.700Z"
  },
  {
    "area_id": 2,
    "producto_id": 462,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.703Z"
  },
  {
    "area_id": 3,
    "producto_id": 462,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.705Z"
  },
  {
    "area_id": 1,
    "producto_id": 463,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.709Z"
  },
  {
    "area_id": 2,
    "producto_id": 463,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.711Z"
  },
  {
    "area_id": 3,
    "producto_id": 463,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.713Z"
  },
  {
    "area_id": 1,
    "producto_id": 464,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.717Z"
  },
  {
    "area_id": 2,
    "producto_id": 464,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.719Z"
  },
  {
    "area_id": 3,
    "producto_id": 464,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.720Z"
  },
  {
    "area_id": 1,
    "producto_id": 465,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.724Z"
  },
  {
    "area_id": 2,
    "producto_id": 465,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.725Z"
  },
  {
    "area_id": 3,
    "producto_id": 465,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.727Z"
  },
  {
    "area_id": 1,
    "producto_id": 466,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.731Z"
  },
  {
    "area_id": 2,
    "producto_id": 466,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.732Z"
  },
  {
    "area_id": 3,
    "producto_id": 466,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.734Z"
  },
  {
    "area_id": 1,
    "producto_id": 467,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.737Z"
  },
  {
    "area_id": 2,
    "producto_id": 467,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.738Z"
  },
  {
    "area_id": 3,
    "producto_id": 467,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.740Z"
  },
  {
    "area_id": 1,
    "producto_id": 468,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.743Z"
  },
  {
    "area_id": 2,
    "producto_id": 468,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.745Z"
  },
  {
    "area_id": 3,
    "producto_id": 468,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.746Z"
  },
  {
    "area_id": 2,
    "producto_id": 469,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.751Z"
  },
  {
    "area_id": 3,
    "producto_id": 469,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.753Z"
  },
  {
    "area_id": 2,
    "producto_id": 470,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.757Z"
  },
  {
    "area_id": 3,
    "producto_id": 470,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.759Z"
  },
  {
    "area_id": 2,
    "producto_id": 471,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.764Z"
  },
  {
    "area_id": 3,
    "producto_id": 471,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.766Z"
  },
  {
    "area_id": 2,
    "producto_id": 472,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.770Z"
  },
  {
    "area_id": 3,
    "producto_id": 472,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.771Z"
  },
  {
    "area_id": 2,
    "producto_id": 473,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.777Z"
  },
  {
    "area_id": 3,
    "producto_id": 473,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.779Z"
  },
  {
    "area_id": 2,
    "producto_id": 474,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.784Z"
  },
  {
    "area_id": 3,
    "producto_id": 474,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.785Z"
  },
  {
    "area_id": 2,
    "producto_id": 475,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.790Z"
  },
  {
    "area_id": 3,
    "producto_id": 475,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.792Z"
  },
  {
    "area_id": 2,
    "producto_id": 476,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.798Z"
  },
  {
    "area_id": 3,
    "producto_id": 476,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.799Z"
  },
  {
    "area_id": 2,
    "producto_id": 477,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.805Z"
  },
  {
    "area_id": 3,
    "producto_id": 477,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.807Z"
  },
  {
    "area_id": 2,
    "producto_id": 478,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.812Z"
  },
  {
    "area_id": 3,
    "producto_id": 478,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.813Z"
  },
  {
    "area_id": 2,
    "producto_id": 479,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.820Z"
  },
  {
    "area_id": 3,
    "producto_id": 479,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.823Z"
  },
  {
    "area_id": 2,
    "producto_id": 480,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.832Z"
  },
  {
    "area_id": 3,
    "producto_id": 480,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.835Z"
  },
  {
    "area_id": 2,
    "producto_id": 481,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.845Z"
  },
  {
    "area_id": 3,
    "producto_id": 481,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.848Z"
  },
  {
    "area_id": 2,
    "producto_id": 482,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.857Z"
  },
  {
    "area_id": 3,
    "producto_id": 482,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.860Z"
  },
  {
    "area_id": 2,
    "producto_id": 483,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.868Z"
  },
  {
    "area_id": 3,
    "producto_id": 483,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.870Z"
  },
  {
    "area_id": 2,
    "producto_id": 484,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.876Z"
  },
  {
    "area_id": 3,
    "producto_id": 484,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.878Z"
  },
  {
    "area_id": 2,
    "producto_id": 485,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.886Z"
  },
  {
    "area_id": 3,
    "producto_id": 485,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.888Z"
  },
  {
    "area_id": 2,
    "producto_id": 486,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.896Z"
  },
  {
    "area_id": 3,
    "producto_id": 486,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.898Z"
  },
  {
    "area_id": 2,
    "producto_id": 487,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.906Z"
  },
  {
    "area_id": 3,
    "producto_id": 487,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.908Z"
  },
  {
    "area_id": 2,
    "producto_id": 488,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.916Z"
  },
  {
    "area_id": 3,
    "producto_id": 488,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.919Z"
  },
  {
    "area_id": 2,
    "producto_id": 489,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.926Z"
  },
  {
    "area_id": 3,
    "producto_id": 489,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.928Z"
  },
  {
    "area_id": 2,
    "producto_id": 490,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.933Z"
  },
  {
    "area_id": 3,
    "producto_id": 490,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.935Z"
  },
  {
    "area_id": 1,
    "producto_id": 491,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.938Z"
  },
  {
    "area_id": 2,
    "producto_id": 491,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.940Z"
  },
  {
    "area_id": 3,
    "producto_id": 491,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.942Z"
  },
  {
    "area_id": 2,
    "producto_id": 492,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.948Z"
  },
  {
    "area_id": 3,
    "producto_id": 492,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.949Z"
  },
  {
    "area_id": 1,
    "producto_id": 470,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:12:48.575Z"
  },
  {
    "area_id": 1,
    "producto_id": 471,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:13:02.696Z"
  },
  {
    "area_id": 1,
    "producto_id": 472,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:13:11.656Z"
  },
  {
    "area_id": 1,
    "producto_id": 473,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:13:25.522Z"
  },
  {
    "area_id": 1,
    "producto_id": 474,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:13:33.182Z"
  },
  {
    "area_id": 1,
    "producto_id": 476,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:14:11.559Z"
  },
  {
    "area_id": 1,
    "producto_id": 477,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:14:20.075Z"
  },
  {
    "area_id": 1,
    "producto_id": 478,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:14:26.955Z"
  },
  {
    "area_id": 1,
    "producto_id": 479,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:14:38.846Z"
  },
  {
    "area_id": 1,
    "producto_id": 480,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:14:44.207Z"
  },
  {
    "area_id": 1,
    "producto_id": 481,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:14:48.675Z"
  },
  {
    "area_id": 1,
    "producto_id": 482,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:15:06.542Z"
  },
  {
    "area_id": 1,
    "producto_id": 483,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:15:12.545Z"
  },
  {
    "area_id": 1,
    "producto_id": 484,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:15:18.500Z"
  },
  {
    "area_id": 1,
    "producto_id": 486,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:15:34.768Z"
  },
  {
    "area_id": 1,
    "producto_id": 487,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:15:45.704Z"
  },
  {
    "area_id": 1,
    "producto_id": 488,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:15:56.270Z"
  },
  {
    "area_id": 1,
    "producto_id": 489,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:18:18.176Z"
  },
  {
    "area_id": 1,
    "producto_id": 490,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:18:36.577Z"
  },
  {
    "area_id": 1,
    "producto_id": 492,
    "stock": "18",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:40:02.580Z"
  },
  {
    "area_id": 1,
    "producto_id": 485,
    "stock": "999",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T20:30:48.382Z"
  },
  {
    "area_id": 1,
    "producto_id": 493,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.952Z"
  },
  {
    "area_id": 2,
    "producto_id": 493,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.954Z"
  },
  {
    "area_id": 3,
    "producto_id": 493,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.955Z"
  },
  {
    "area_id": 2,
    "producto_id": 494,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.962Z"
  },
  {
    "area_id": 3,
    "producto_id": 494,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.963Z"
  },
  {
    "area_id": 2,
    "producto_id": 495,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.968Z"
  },
  {
    "area_id": 3,
    "producto_id": 495,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.969Z"
  },
  {
    "area_id": 2,
    "producto_id": 496,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.974Z"
  },
  {
    "area_id": 3,
    "producto_id": 496,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:15:16.975Z"
  },
  {
    "area_id": 2,
    "producto_id": 497,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.125Z"
  },
  {
    "area_id": 3,
    "producto_id": 497,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.127Z"
  },
  {
    "area_id": 2,
    "producto_id": 498,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.134Z"
  },
  {
    "area_id": 3,
    "producto_id": 498,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.136Z"
  },
  {
    "area_id": 2,
    "producto_id": 499,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.143Z"
  },
  {
    "area_id": 3,
    "producto_id": 499,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.145Z"
  },
  {
    "area_id": 2,
    "producto_id": 500,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.152Z"
  },
  {
    "area_id": 3,
    "producto_id": 500,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.154Z"
  },
  {
    "area_id": 2,
    "producto_id": 501,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.158Z"
  },
  {
    "area_id": 3,
    "producto_id": 501,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.160Z"
  },
  {
    "area_id": 2,
    "producto_id": 502,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.165Z"
  },
  {
    "area_id": 3,
    "producto_id": 502,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.166Z"
  },
  {
    "area_id": 2,
    "producto_id": 503,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.171Z"
  },
  {
    "area_id": 3,
    "producto_id": 503,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.172Z"
  },
  {
    "area_id": 2,
    "producto_id": 504,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.177Z"
  },
  {
    "area_id": 3,
    "producto_id": 504,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.179Z"
  },
  {
    "area_id": 2,
    "producto_id": 505,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.184Z"
  },
  {
    "area_id": 3,
    "producto_id": 505,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.186Z"
  },
  {
    "area_id": 2,
    "producto_id": 506,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.191Z"
  },
  {
    "area_id": 3,
    "producto_id": 506,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.193Z"
  },
  {
    "area_id": 2,
    "producto_id": 507,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.198Z"
  },
  {
    "area_id": 3,
    "producto_id": 507,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.200Z"
  },
  {
    "area_id": 2,
    "producto_id": 508,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.205Z"
  },
  {
    "area_id": 3,
    "producto_id": 508,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.206Z"
  },
  {
    "area_id": 2,
    "producto_id": 509,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.211Z"
  },
  {
    "area_id": 3,
    "producto_id": 509,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.213Z"
  },
  {
    "area_id": 2,
    "producto_id": 510,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.218Z"
  },
  {
    "area_id": 3,
    "producto_id": 510,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.219Z"
  },
  {
    "area_id": 2,
    "producto_id": 511,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.224Z"
  },
  {
    "area_id": 3,
    "producto_id": 511,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:17:05.226Z"
  },
  {
    "area_id": 2,
    "producto_id": 512,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.924Z"
  },
  {
    "area_id": 3,
    "producto_id": 512,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.926Z"
  },
  {
    "area_id": 2,
    "producto_id": 513,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.932Z"
  },
  {
    "area_id": 3,
    "producto_id": 513,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.934Z"
  },
  {
    "area_id": 2,
    "producto_id": 514,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.940Z"
  },
  {
    "area_id": 3,
    "producto_id": 514,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.941Z"
  },
  {
    "area_id": 2,
    "producto_id": 515,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.946Z"
  },
  {
    "area_id": 3,
    "producto_id": 515,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.948Z"
  },
  {
    "area_id": 2,
    "producto_id": 516,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.953Z"
  },
  {
    "area_id": 3,
    "producto_id": 516,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.954Z"
  },
  {
    "area_id": 2,
    "producto_id": 517,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.960Z"
  },
  {
    "area_id": 3,
    "producto_id": 517,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.961Z"
  },
  {
    "area_id": 2,
    "producto_id": 518,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.966Z"
  },
  {
    "area_id": 3,
    "producto_id": 518,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.968Z"
  },
  {
    "area_id": 2,
    "producto_id": 519,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.972Z"
  },
  {
    "area_id": 3,
    "producto_id": 519,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.973Z"
  },
  {
    "area_id": 2,
    "producto_id": 520,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.978Z"
  },
  {
    "area_id": 3,
    "producto_id": 520,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.979Z"
  },
  {
    "area_id": 2,
    "producto_id": 521,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.984Z"
  },
  {
    "area_id": 3,
    "producto_id": 521,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.985Z"
  },
  {
    "area_id": 2,
    "producto_id": 522,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.990Z"
  },
  {
    "area_id": 3,
    "producto_id": 522,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.991Z"
  },
  {
    "area_id": 2,
    "producto_id": 523,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.996Z"
  },
  {
    "area_id": 3,
    "producto_id": 523,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:08.998Z"
  },
  {
    "area_id": 2,
    "producto_id": 524,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.003Z"
  },
  {
    "area_id": 3,
    "producto_id": 524,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.005Z"
  },
  {
    "area_id": 1,
    "producto_id": 495,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:19:21.617Z"
  },
  {
    "area_id": 1,
    "producto_id": 496,
    "stock": "14",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T22:31:16.037Z"
  },
  {
    "area_id": 1,
    "producto_id": 512,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:19:41.664Z"
  },
  {
    "area_id": 1,
    "producto_id": 513,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:19:57.846Z"
  },
  {
    "area_id": 1,
    "producto_id": 514,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:20:07.680Z"
  },
  {
    "area_id": 1,
    "producto_id": 516,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:20:27.604Z"
  },
  {
    "area_id": 1,
    "producto_id": 517,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:20:32.434Z"
  },
  {
    "area_id": 1,
    "producto_id": 518,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:20:38.931Z"
  },
  {
    "area_id": 1,
    "producto_id": 519,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:20:47.734Z"
  },
  {
    "area_id": 1,
    "producto_id": 520,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:20:53.992Z"
  },
  {
    "area_id": 1,
    "producto_id": 521,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:21:01.646Z"
  },
  {
    "area_id": 1,
    "producto_id": 522,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:21:41.929Z"
  },
  {
    "area_id": 1,
    "producto_id": 523,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:21:52.172Z"
  },
  {
    "area_id": 1,
    "producto_id": 524,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:21:59.842Z"
  },
  {
    "area_id": 1,
    "producto_id": 525,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:22:13.482Z"
  },
  {
    "area_id": 1,
    "producto_id": 497,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:23:12.114Z"
  },
  {
    "area_id": 1,
    "producto_id": 498,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:23:20.097Z"
  },
  {
    "area_id": 1,
    "producto_id": 499,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:23:25.910Z"
  },
  {
    "area_id": 1,
    "producto_id": 500,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:23:39.268Z"
  },
  {
    "area_id": 1,
    "producto_id": 501,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:23:47.451Z"
  },
  {
    "area_id": 1,
    "producto_id": 502,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:23:54.122Z"
  },
  {
    "area_id": 1,
    "producto_id": 503,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:24:05.335Z"
  },
  {
    "area_id": 1,
    "producto_id": 504,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:24:13.153Z"
  },
  {
    "area_id": 1,
    "producto_id": 505,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:24:29.065Z"
  },
  {
    "area_id": 1,
    "producto_id": 506,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:24:42.310Z"
  },
  {
    "area_id": 1,
    "producto_id": 508,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:24:52.635Z"
  },
  {
    "area_id": 1,
    "producto_id": 509,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:25:05.308Z"
  },
  {
    "area_id": 1,
    "producto_id": 510,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:25:12.184Z"
  },
  {
    "area_id": 1,
    "producto_id": 511,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:25:18.334Z"
  },
  {
    "area_id": 2,
    "producto_id": 525,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.010Z"
  },
  {
    "area_id": 3,
    "producto_id": 525,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.012Z"
  },
  {
    "area_id": 2,
    "producto_id": 526,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.016Z"
  },
  {
    "area_id": 3,
    "producto_id": 526,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.018Z"
  },
  {
    "area_id": 2,
    "producto_id": 527,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.022Z"
  },
  {
    "area_id": 3,
    "producto_id": 527,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.024Z"
  },
  {
    "area_id": 2,
    "producto_id": 528,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.029Z"
  },
  {
    "area_id": 3,
    "producto_id": 528,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.030Z"
  },
  {
    "area_id": 2,
    "producto_id": 529,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.034Z"
  },
  {
    "area_id": 3,
    "producto_id": 529,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.036Z"
  },
  {
    "area_id": 2,
    "producto_id": 530,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.041Z"
  },
  {
    "area_id": 3,
    "producto_id": 530,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T06:19:09.043Z"
  },
  {
    "area_id": 3,
    "producto_id": 423,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:49:33.327Z"
  },
  {
    "area_id": 2,
    "producto_id": 423,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:49:33.329Z"
  },
  {
    "area_id": 1,
    "producto_id": 423,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:49:33.356Z"
  },
  {
    "area_id": 3,
    "producto_id": 402,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:52:25.125Z"
  },
  {
    "area_id": 1,
    "producto_id": 432,
    "stock": "34",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T16:56:19.772Z"
  },
  {
    "area_id": 1,
    "producto_id": 441,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:10:27.608Z"
  },
  {
    "area_id": 1,
    "producto_id": 469,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:12:38.715Z"
  },
  {
    "area_id": 1,
    "producto_id": 475,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:14:00.520Z"
  },
  {
    "area_id": 1,
    "producto_id": 494,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:19:14.028Z"
  },
  {
    "area_id": 1,
    "producto_id": 515,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:20:15.614Z"
  },
  {
    "area_id": 1,
    "producto_id": 526,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:22:21.355Z"
  },
  {
    "area_id": 1,
    "producto_id": 527,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:22:26.779Z"
  },
  {
    "area_id": 1,
    "producto_id": 528,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:22:38.683Z"
  },
  {
    "area_id": 1,
    "producto_id": 529,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:22:51.349Z"
  },
  {
    "area_id": 1,
    "producto_id": 530,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:23:00.312Z"
  },
  {
    "area_id": 1,
    "producto_id": 507,
    "stock": "20",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T17:24:47.417Z"
  },
  {
    "area_id": 3,
    "producto_id": 545,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "999",
    "ubicacion_estante": null,
    "updated_at": "2026-06-23T17:36:05.597Z"
  },
  {
    "area_id": 1,
    "producto_id": 545,
    "stock": "3",
    "stock_minimo": "5",
    "stock_maximo": "999",
    "ubicacion_estante": null,
    "updated_at": "2026-06-23T17:38:10.176Z"
  },
  {
    "area_id": 1,
    "producto_id": 396,
    "stock": "0",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T18:03:13.105Z"
  },
  {
    "area_id": 2,
    "producto_id": 545,
    "stock": "2",
    "stock_minimo": "5",
    "stock_maximo": "999",
    "ubicacion_estante": null,
    "updated_at": "2026-06-23T18:27:29.247Z"
  },
  {
    "area_id": 1,
    "producto_id": 399,
    "stock": "18",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T20:03:04.106Z"
  },
  {
    "area_id": 1,
    "producto_id": 400,
    "stock": "10",
    "stock_minimo": "5",
    "stock_maximo": "50",
    "ubicacion_estante": "Almac├®n general ├írea",
    "updated_at": "2026-06-23T20:03:04.136Z"
  }
]
  });

  // 9. Insumos
  console.log('Insertando insumos...');
  await prisma.insumo.createMany({
    data: []
  });

  // 10. Recetas
  console.log('Insertando recetas...');
  await prisma.recetaIngrediente.createMany({
    data: []
  });

  console.log('Seed ejecutado con éxito. Se importaron todos los catálogos y stock locales.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
