import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Package, Users, AlertTriangle, Check, RefreshCw, Trash2, Receipt, RotateCcw, Tag, Plus, Clock, DollarSign, CreditCard, Banknote, X, Briefcase, TrendingUp, Calendar, Search, FileText } from 'lucide-react';

interface GraficaMetodosPagoProps {
  efectivo: number;
  tarjeta: number;
  cargoSocio: number;
}

function GraficaMetodosPago({ efectivo, tarjeta, cargoSocio }: GraficaMetodosPagoProps) {
  const total = efectivo + tarjeta + cargoSocio;
  if (total === 0) {
    return (
      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-5 flex flex-col items-center justify-center h-48 text-slate-500 text-xs">
        <TrendingUp className="mb-2 opacity-30" size={24} />
        <span>Sin datos de pago para graficar hoy</span>
      </div>
    );
  }

  const pEfectivo = (efectivo / total) * 100;
  const pTarjeta = (tarjeta / total) * 100;
  const pCargo = (cargoSocio / total) * 100;

  const r = 38;
  const circ = 2 * Math.PI * r; // ~238.76
  
  const strokeEfectivo = (pEfectivo / 100) * circ;
  const strokeTarjeta = (pTarjeta / 100) * circ;
  const strokeCargo = (pCargo / 100) * circ;

  const offsetEfectivo = 0;
  const offsetTarjeta = strokeEfectivo;
  const offsetCargo = strokeEfectivo + strokeTarjeta;

  return (
    <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-5 flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Fondo */}
          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#1e293b" strokeWidth="8" />
          
          {/* Efectivo (Verde) */}
          {strokeEfectivo > 0 && (
            <circle
              cx="50" cy="50" r={r}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="8"
              strokeDasharray={`${strokeEfectivo} ${circ}`}
              strokeDashoffset={-offsetEfectivo}
              className="transition-all duration-500"
            />
          )}

          {/* Tarjeta (Azul) */}
          {strokeTarjeta > 0 && (
            <circle
              cx="50" cy="50" r={r}
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray={`${strokeTarjeta} ${circ}`}
              strokeDashoffset={-offsetTarjeta}
              className="transition-all duration-500"
            />
          )}

          {/* Cargos a Socio (Dorado) */}
          {strokeCargo > 0 && (
            <circle
              cx="50" cy="50" r={r}
              fill="transparent"
              stroke="#eab308"
              strokeWidth="8"
              strokeDasharray={`${strokeCargo} ${circ}`}
              strokeDashoffset={-offsetCargo}
              className="transition-all duration-500"
            />
          )}
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Total</span>
          <span className="text-[11px] font-extrabold text-white">${total.toFixed(0)}</span>
        </div>
      </div>

      <div className="flex-1 space-y-3.5 w-full">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Métodos de Pago</h4>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400 font-medium">Efectivo</span>
            </div>
            <span className="text-white font-bold">${efectivo.toFixed(2)} ({pEfectivo.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-400 font-medium">Tarjeta</span>
            </div>
            <span className="text-white font-bold">${tarjeta.toFixed(2)} ({pTarjeta.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span className="text-slate-400 font-medium">Cargo a Socio</span>
            </div>
            <span className="text-white font-bold">${cargoSocio.toFixed(2)} ({pCargo.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface GraficaVentasAreaProps {
  ventas: any[];
}

function GraficaVentasArea({ ventas }: GraficaVentasAreaProps) {
  const areaTotals: { [key: string]: number } = { Bar: 0, Snack: 0, Palapa: 0 };
  ventas.forEach((v: any) => {
    if (areaTotals[v.area] !== undefined) {
      areaTotals[v.area] += v.total;
    }
  });

  const total = Object.values(areaTotals).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-5 flex flex-col items-center justify-center h-48 text-slate-500 text-xs">
        <TrendingUp className="mb-2 opacity-30" size={24} />
        <span>Sin ventas registradas en áreas hoy</span>
      </div>
    );
  }

  const maxVal = Math.max(...Object.values(areaTotals), 1);

  return (
    <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-5 flex flex-col justify-between space-y-4">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas por Área</h4>
      <div className="flex items-end justify-around h-24 pt-2 border-b border-slate-800/60 pb-2">
        {Object.entries(areaTotals).map(([area, value]) => {
          const pct = (value / maxVal) * 100;
          return (
            <div key={area} className="flex flex-col items-center gap-1.5 group w-16">
              <span className="text-[8px] text-slate-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 -translate-y-1">
                ${value.toFixed(0)}
              </span>
              <div className="w-6 bg-slate-800/50 rounded-t-md overflow-hidden h-14 flex items-end">
                <div
                  style={{ height: `${pct}%` }}
                  className={`w-full rounded-t-md transition-all duration-700 ${
                    area === 'Bar' ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                    : area === 'Snack' ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                    : 'bg-gradient-to-t from-yellow-600 to-yellow-400'
                  }`}
                ></div>
              </div>
              <span className="text-[9px] text-slate-400 font-bold">{area}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
        <span>Áreas</span>
        <span>Máx: ${maxVal.toFixed(0)}</span>
      </div>
    </div>
  );
}

export default function AdminView() {
  const { token, user } = useStore();
  const esAdmin = user?.roles?.includes('ADMIN');
  const [inventario, setInventario] = useState<any[]>([]);
  const [cadis, setCadis] = useState<any[]>([]);
  const [socios, setSocios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Inputs Cadi
  const [numeroCadi, setNumeroCadi] = useState('');
  const [nombreCadi, setNombreCadi] = useState('');
  const [telefonoCadi, setTelefonoCadi] = useState('');

  // Inputs Socio Nuevo
  const [codigoSocioNuevo, setCodigoSocioNuevo] = useState('');
  const [nombreSocioNuevo, setNombreSocioNuevo] = useState('');
  const [telefonoSocioNuevo, setTelefonoSocioNuevo] = useState('');
  const [emailSocioNuevo, setEmailSocioNuevo] = useState('');

  // Asignación Cadi
  const [cadiSeleccionadoRonda, setCadiSeleccionadoRonda] = useState<string>('');
  const [sociosSeleccionadosRonda, setSociosSeleccionadosRonda] = useState<number[]>([]);

  // Modal Stock
  const [mostrarModalStock, setMostrarModalStock] = useState(false);
  const [prodSeleccionadoStock, setProdSeleccionadoStock] = useState<any>(null);
  const [nombreAjusteStock, setNombreAjusteStock] = useState('');
  const [precioAjusteStock, setPrecioAjusteStock] = useState<string | number>('');
  const [areaAjusteStock, setAreaAjusteStock] = useState<number>(1);
  const [valorAjusteStock, setValorAjusteStock] = useState<number>(0);
  const [motivoAjusteStock, setMotivoAjusteStock] = useState('');

  // Balances
  const [balances, setBalances] = useState({ efectivo: 0, tarjeta: 0, cargo_socio: 0 });

  // Cuentas y Adeudos
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [cargandoCuentas, setCargandoCuentas] = useState(false);
  const [mostrarConfirmReset, setMostrarConfirmReset] = useState(false);

  // Turno / Corte de Caja
  const [turnoData, setTurnoData] = useState<any>(null);
  const [turnoActivo, setTurnoActivo] = useState(false);
  const [fondoInicial, setFondoInicial] = useState('500');
  const [cargandoTurno, setCargandoTurno] = useState(false);
  const [mostrarConfirmCierre, setMostrarConfirmCierre] = useState(false);
  const [resumenCierre, setResumenCierre] = useState<any>(null);

  // Retiros de caja
  const [mostrarModalRetiro, setMostrarModalRetiro] = useState(false);
  const [montoRetiro, setMontoRetiro] = useState('');
  const [motivoRetiro, setMotivoRetiro] = useState('');
  const [cargandoRetiro, setCargandoRetiro] = useState(false);

  // Nuevo Producto
  const [mostrarFormProducto, setMostrarFormProducto] = useState(false);
  const [npNombre, setNpNombre] = useState('');
  const [npPrecio, setNpPrecio] = useState('');
  const [npCategoria, setNpCategoria] = useState('');
  const [npDescripcion, setNpDescripcion] = useState('');
  const [npStockBar, setNpStockBar] = useState('0');
  const [npStockSnack, setNpStockSnack] = useState('0');
  const [npStockPalapa, setNpStockPalapa] = useState('0');
  const [npStockMin, setNpStockMin] = useState('5');

  // Socios lista completa
  const [sociosLista, setSociosLista] = useState<any[]>([]);
  const [busquedaSocio, setBusquedaSocio] = useState('');

  // Reportes
  const [seccionActiva, setSeccionActiva] = useState<'gestion' | 'reportes' | 'usuarios' | 'cclourdes'>('gestion');

  // Reporte Semanal CCLourdes
  const [fechaSemanalGastos, setFechaSemanalGastos] = useState(() => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const localHoy = new Date(hoy.getTime() - (offset * 60 * 1000));
    return localHoy.toISOString().split('T')[0];
  });
  const [reporteSemanalGastos, setReporteSemanalGastos] = useState<any>(null);
  const [cargandoReporteSemanal, setCargandoReporteSemanal] = useState(false);
  const [cclConcepto, setCclConcepto] = useState('');
  const [cclMonto, setCclMonto] = useState('');
  const [cclTipoRegistro, setCclTipoRegistro] = useState('GASTO_FIJO');
  const [cclMetodoPago, setCclMetodoPago] = useState('EFECTIVO');

  const [fechaReporte, setFechaReporte] = useState(() => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const localHoy = new Date(hoy.getTime() - (offset * 60 * 1000));
    return localHoy.toISOString().split('T')[0];
  });
  const [rangoReporte, setRangoReporte] = useState<string>('diario');
  const [reporteDiario, setReporteDiario] = useState<any>(null);
  const [reporteCortes, setReporteCortes] = useState<any[]>([]);
  const [cargandoReporte, setCargandoReporte] = useState(false);

  // Gestión de Usuarios Internos
  const [usuariosLista, setUsuariosLista] = useState<any[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [nuUsername, setNuUsername] = useState('');
  const [nuPassword, setNuPassword] = useState('');
  const [nuNombre, setNuNombre] = useState('');
  const [nuEmail, setNuEmail] = useState('');
  const [nuRole, setNuRole] = useState('VENDEDOR');

  // Modal contraseña usuario
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
  const [usuarioSeleccionadoPassword, setUsuarioSeleccionadoPassword] = useState<any>(null);
  const [nuevaPassword, setNuevaPassword] = useState('');

  // Modal editar usuario
  const [mostrarModalEditarUsuario, setMostrarModalEditarUsuario] = useState(false);
  const [usuarioSeleccionadoEdit, setUsuarioSeleccionadoEdit] = useState<any>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('VENDEDOR');

  useEffect(() => {
    if (token) {
      cargarSociosLista();
      cargarTurnoActivo();

      if (esAdmin) {
        cargarBalances();
        cargarCuentas();
        cargarReporteDiario(fechaReporte, rangoReporte);
        cargarReporteCortes();
        cargarUsuariosLista();
        cargarReporteSemanalGastos(fechaSemanalGastos);
      }
    }
  }, [token, esAdmin]);

  const cargarUsuariosLista = async () => {
    setCargandoUsuarios(true);
    try {
      const res = await fetch('/api/admin/usuarios', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setUsuariosLista(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!nuUsername || !nuPassword || !nuNombre || !nuRole) {
      setError('Usuario, contraseña, nombre y rol son requeridos');
      return;
    }
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: nuUsername, password: nuPassword, nombre: nuNombre, email: nuEmail || undefined, role: nuRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
      setSuccess(`Usuario "${nuUsername}" creado exitosamente.`);
      setNuUsername(''); setNuPassword(''); setNuNombre(''); setNuEmail(''); setNuRole('VENDEDOR');
      cargarUsuariosLista();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!nuevaPassword) {
      setError('La nueva contraseña es requerida');
      return;
    }
    try {
      const res = await fetch(`/api/admin/usuarios/${usuarioSeleccionadoPassword.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: nuevaPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar contraseña');
      setSuccess(`Contraseña de "${usuarioSeleccionadoPassword.username}" actualizada.`);
      setMostrarModalPassword(false);
      setUsuarioSeleccionadoPassword(null);
      setNuevaPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEditUsuario = (u: any) => {
    setUsuarioSeleccionadoEdit(u);
    setEditUsername(u.username);
    setEditNombre(u.nombre);
    setEditEmail(u.email || '');
    setEditRole(u.roles[0] || 'VENDEDOR');
    setMostrarModalEditarUsuario(true);
  };

  const handleGuardarUsuarioEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionadoEdit) return;
    setError(''); setSuccess('');
    setCargandoUsuarios(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuarioSeleccionadoEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editUsername,
          nombre: editNombre,
          email: editEmail || null,
          role: editRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario');
      setSuccess(`Datos de "${editUsername}" actualizados.`);
      setMostrarModalEditarUsuario(false);
      setUsuarioSeleccionadoEdit(null);
      cargarUsuariosLista();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const handleToggleActivoUsuario = async (id: number) => {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/admin/usuarios/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar estado');
      setSuccess(data.message);
      cargarUsuariosLista();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cargarSociosLista = async () => {
    try {
      const res = await fetch('/api/socios', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setSociosLista(data);
    } catch (err) { console.error(err); }
  };

  const cargarReporteDiario = async (fecha: string, rango: string = rangoReporte) => {
    setCargandoReporte(true);
    try {
      const res = await fetch(`/api/admin/reportes/diario?fecha=${fecha}&rango=${rango}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReporteDiario(data);
      } else {
        setError(data.error || 'Error al cargar reporte');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de red al cargar reporte');
    } finally {
      setCargandoReporte(false);
    }
  };

  const cargarReporteCortes = async () => {
    setCargandoReporte(true);
    try {
      const res = await fetch('/api/admin/reportes/cortes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReporteCortes(data);
      } else {
        setError(data.error || 'Error al cargar reporte de cortes');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de red al cargar reporte de cortes');
    } finally {
      setCargandoReporte(false);
    }
  };

  const cargarReporteSemanalGastos = async (fecha: string) => {
    setCargandoReporteSemanal(true);
    try {
      const res = await fetch(`/api/admin/gastos-ingresos/semanal?fecha=${fecha}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReporteSemanalGastos(data);
      } else {
        setError(data.error || 'Error al cargar reporte semanal');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de red al cargar reporte semanal');
    } finally {
      setCargandoReporteSemanal(false);
    }
  };

  const handleCrearGastoIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!cclConcepto || !cclMonto || !cclTipoRegistro || !cclMetodoPago) {
      setError('Todos los campos son requeridos');
      return;
    }
    try {
      const res = await fetch('/api/admin/gastos-ingresos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fecha: fechaSemanalGastos,
          tipo_registro: cclTipoRegistro,
          concepto: cclConcepto.trim(),
          monto: parseFloat(cclMonto),
          metodo_pago: cclMetodoPago
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar registro');
      setSuccess(`Movimiento "${cclConcepto}" registrado exitosamente.`);
      setCclConcepto(''); setCclMonto('');
      cargarReporteSemanalGastos(fechaSemanalGastos);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEliminarGastoIngreso = async (id: number) => {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/admin/gastos-ingresos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      setSuccess('Registro eliminado.');
      cargarReporteSemanalGastos(fechaSemanalGastos);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cargarInventarioGlobal = async () => {
    setCargando(true);
    try {
      const fetchArea = async (id: number) => {
        const res = await fetch(`/api/pos/productos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        return await res.json();
      };
      const bar = await fetchArea(1);
      const snack = await fetchArea(2);
      const palapa = await fetchArea(3);
      const productosMap: { [key: number]: any } = {};
      const procesarProductosArea = (items: any[], areaName: string) => {
        if (!Array.isArray(items)) return;
        items.forEach((item) => {
          if (!productosMap[item.id]) {
            productosMap[item.id] = { id: item.id, nombre: item.nombre, precio_venta: item.precio_venta, categoria: item.categoria, min: item.stock_minimo, stocks: { Bar: 0, Snack: 0, Palapa: 0 } };
          }
          productosMap[item.id].stocks[areaName] = item.stock;
        });
      };
      procesarProductosArea(bar, 'Bar');
      procesarProductosArea(snack, 'Snack');
      procesarProductosArea(palapa, 'Palapa');
      setInventario(Object.values(productosMap));
    } catch (err) {
      console.error('Error al cargar inventario global:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarCadis = async () => {
    try {
      const res = await fetch('/api/cadis', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCadis(data);
    } catch (err) { console.error(err); }
  };

  const cargarSocios = async () => {
    try {
      const res = await fetch('/api/socio/buscar?q=SOCIO', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setSocios(data);
    } catch (err) { console.error(err); }
  };

  const cargarBalances = async () => {
    try {
      const res = await fetch('/api/admin/caja', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setBalances(data);
    } catch (err) { console.error(err); }
  };

  const cargarCuentas = async () => {
    setCargandoCuentas(true);
    try {
      const res = await fetch('/api/admin/cuentas', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCuentas(data);
    } catch (err) { console.error(err); }
    finally { setCargandoCuentas(false); }
  };

  // ===== TURNO / CORTE DE CAJA =====
  const cargarTurnoActivo = async () => {
    setCargandoTurno(true);
    try {
      const res = await fetch('/api/admin/turno/activo', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setTurnoActivo(data.activo);
        setTurnoData(data.activo ? data : null);
      }
    } catch (err) { console.error(err); }
    finally { setCargandoTurno(false); }
  };

  const handleAbrirTurno = async () => {
    setError(''); setSuccess(''); setCargandoTurno(true);
    const fondo = parseFloat(fondoInicial);
    if (isNaN(fondo) || fondo < 0) { setError('El fondo inicial debe ser un número positivo'); setCargandoTurno(false); return; }
    try {
      const res = await fetch('/api/admin/turno/abrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fondo_inicial: fondo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al abrir turno');
      setSuccess('Turno abierto exitosamente. ¡Buena jornada!');
      cargarTurnoActivo();
    } catch (err: any) { setError(err.message); }
    finally { setCargandoTurno(false); }
  };

  const handleCerrarTurno = async () => {
    setError(''); setSuccess(''); setCargandoTurno(true); setMostrarConfirmCierre(false);
    try {
      const res = await fetch('/api/admin/turno/cerrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cerrar turno');
      setResumenCierre(data.resumen);
      setSuccess('Turno cerrado y arqueado exitosamente.');
      cargarTurnoActivo();
      cargarBalances();
    } catch (err: any) { setError(err.message); }
    finally { setCargandoTurno(false); }
  };

  const handleRegistrarRetiro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setCargandoRetiro(true);
    const monto = parseFloat(montoRetiro);
    if (isNaN(monto) || monto <= 0) {
      setError('El monto de retiro debe ser un número positivo');
      setCargandoRetiro(false);
      return;
    }
    if (!motivoRetiro.trim()) {
      setError('Debes ingresar un motivo para el retiro de caja');
      setCargandoRetiro(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/turno/retiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monto, motivo: motivoRetiro }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar retiro');
      setSuccess('Retiro de caja registrado correctamente.');
      setMostrarModalRetiro(false);
      setMontoRetiro('');
      setMotivoRetiro('');
      cargarTurnoActivo();
      cargarBalances();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargandoRetiro(false);
    }
  };

  const handleGuardarAjusteStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setCargando(true);
    try {
      const res = await fetch('/api/admin/inventario', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          area_id: areaAjusteStock, 
          producto_id: prodSeleccionadoStock.id, 
          nuevo_stock: valorAjusteStock, 
          nombre: nombreAjusteStock,
          precio_venta: parseFloat(precioAjusteStock.toString()),
          motivo: motivoAjusteStock || 'Ajuste manual' 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al ajustar');
      setSuccess(`Stock y datos de "${nombreAjusteStock}" ajustados correctamente.`);
      setMostrarModalStock(false); 
      setProdSeleccionadoStock(null); 
      setNombreAjusteStock('');
      setPrecioAjusteStock('');
      setMotivoAjusteStock('');
      cargarInventarioGlobal();
    } catch (err: any) { setError(err.message); }
    finally { setCargando(false); }
  };

  const handleCrearSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setCargando(true);
    if (!codigoSocioNuevo || !nombreSocioNuevo) { setError('Código y nombre requeridos'); setCargando(false); return; }
    try {
      const res = await fetch('/api/pos/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ codigo_socio: codigoSocioNuevo, nombre: nombreSocioNuevo, email: emailSocioNuevo || undefined, telefono: telefonoSocioNuevo || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar socio');
      setSuccess(`Socio ${nombreSocioNuevo} registrado exitosamente.`);
      setCodigoSocioNuevo(''); setNombreSocioNuevo(''); setTelefonoSocioNuevo(''); setEmailSocioNuevo('');
      cargarSocios();
    } catch (err: any) { setError(err.message); }
    finally { setCargando(false); }
  };

  const handleCrearCadi = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!numeroCadi || !nombreCadi) { setError('Número y nombre requeridos'); return; }
    try {
      const res = await fetch('/api/cadis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ numero_cadi: numeroCadi, nombre: nombreCadi, telefono: telefonoCadi || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear cadi');
      setSuccess(`Cadi ${nombreCadi} registrado con éxito.`);
      setNumeroCadi(''); setNombreCadi(''); setTelefonoCadi('');
      cargarCadis();
    } catch (err: any) { setError(err.message); }
  };

  const handleIniciarRondaManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!cadiSeleccionadoRonda || sociosSeleccionadosRonda.length === 0) { setError('Debes seleccionar un Cadi y al menos un Socio'); return; }
    try {
      const res = await fetch('/api/cadis/asignar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cadi_id: cadiSeleccionadoRonda, cliente_ids: sociosSeleccionadosRonda }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar ronda');
      setSuccess('Ronda iniciada con éxito. Cadi asignado.');
      cargarCadis(); setSociosSeleccionadosRonda([]); setCadiSeleccionadoRonda('');
    } catch (err: any) { setError(err.message); }
  };

  const toggleSeleccionSocio = (id: number) => {
    if (sociosSeleccionadosRonda.includes(id)) {
      setSociosSeleccionadosRonda(sociosSeleccionadosRonda.filter(x => x !== id));
    } else {
      setSociosSeleccionadosRonda([...sociosSeleccionadosRonda, id]);
    }
  };

  const handleEliminarCuenta = async (cuentaId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cuenta? Esta acción no se puede deshacer.')) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/admin/cuentas/${cuentaId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      setSuccess('Cuenta eliminada correctamente.');
      cargarCuentas(); cargarBalances();
    } catch (err: any) { setError(err.message); }
  };

  const handleEliminarCadi = async (cadiId: number) => {
    if (!window.confirm('¿Eliminar este cadi? Se borrarán sus asignaciones activas.')) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/cadis/${cadiId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      setSuccess('Cadi eliminado.');
      cargarCadis();
    } catch (err: any) { setError(err.message); }
  };

  const handleEliminarSocio = async (socioId: number) => {
    if (!window.confirm('¿Eliminar este socio? Se borrarán sus divisiones y asignaciones.')) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/socios/${socioId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      setSuccess('Socio eliminado.');
      cargarSociosLista();
    } catch (err: any) { setError(err.message); }
  };

  const handleResetearDatos = async () => {
    setError(''); setMostrarConfirmReset(false);
    try {
      const res = await fetch('/api/admin/reset', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al resetear');
      setSuccess('Datos reseteados. Todas las cuentas y asignaciones eliminadas.');
      cargarCuentas(); cargarBalances(); cargarCadis();
    } catch (err: any) { setError(err.message); }
  };

  const handleCrearProducto = async (e: React.FormEvent) => {    e.preventDefault();
    setError(''); setSuccess(''); setCargando(true);
    try {
      const res = await fetch('/api/admin/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: npNombre, precio_venta: parseFloat(npPrecio), categoria: npCategoria || 'General',
          descripcion: npDescripcion || undefined,
          stock_bar: parseFloat(npStockBar) || 0, stock_snack: parseFloat(npStockSnack) || 0,
          stock_palapa: parseFloat(npStockPalapa) || 0, stock_minimo: parseFloat(npStockMin) || 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear producto');
      setSuccess(`Producto "${data.nombre}" creado con precio $${Number(data.precio_venta).toFixed(2)}.`);
      setNpNombre(''); setNpPrecio(''); setNpCategoria(''); setNpDescripcion('');
      setNpStockBar('0'); setNpStockSnack('0'); setNpStockPalapa('0'); setNpStockMin('5');
      setMostrarFormProducto(false);
      cargarInventarioGlobal();
    } catch (err: any) { setError(err.message); }
    finally { setCargando(false); }
  };
  // Filtrar socios por nombre/código/contacto
  const sociosListaFiltrada = sociosLista.filter((s) => {
    const query = busquedaSocio.toLowerCase().trim();
    if (!query) return true;
    return (
      s.nombre?.toLowerCase().includes(query) ||
      s.codigo_socio?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.telefono?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Mensajes globales */}
      {error && <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-xl border border-red-500/20 text-center">{error}</div>}
      {success && <div className="bg-emerald-500/10 text-emerald-400 text-xs p-3 rounded-xl border border-emerald-500/20 text-center">{success}</div>}

      {/* Sub-navegación Admin: Gestión vs Reportes */}
      <div className="flex bg-slate-900/60 p-1 rounded-2xl w-fit border border-slate-800/80">
        <button
          type="button"
          onClick={() => setSeccionActiva('gestion')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            seccionActiva === 'gestion'
              ? 'bg-campestre-green text-white shadow-lg shadow-campestre-green/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase size={14} />
          Gestión Operativa
        </button>
        {esAdmin && (
          <button
            type="button"
            onClick={() => {
              setSeccionActiva('reportes');
              cargarReporteDiario(fechaReporte);
              cargarReporteCortes();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              seccionActiva === 'reportes'
                ? 'bg-campestre-gold text-slate-950 shadow-lg shadow-campestre-gold/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={14} />
            Reportes y Auditoría
          </button>
        )}
        {esAdmin && (
          <button
            type="button"
            onClick={() => {
              setSeccionActiva('cclourdes');
              cargarReporteSemanalGastos(fechaSemanalGastos);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              seccionActiva === 'cclourdes'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            Reporte CCLourdes (Gastos/Ingresos)
          </button>
        )}
        {esAdmin && (
          <button
            type="button"
            onClick={() => {
              setSeccionActiva('usuarios');
              cargarUsuariosLista();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              seccionActiva === 'usuarios'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={14} />
            Gestión de Personal/Vendedores
          </button>
        )}
      </div>

      {seccionActiva === 'gestion' ? (
        <>
          {/* ===== CORTE DE CAJA / TURNO (Visible para Admin y Vendedor) ===== */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="text-campestre-gold" size={20} />
            <span>Corte de Caja — Turno Activo</span>
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={cargarTurnoActivo}
              className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Recargar estado del turno"
            >
              <RefreshCw size={14} className={cargandoTurno ? 'animate-spin' : ''} />
            </button>
            {turnoActivo && (
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Turno Abierto
              </span>
            )}
            {!turnoActivo && !cargandoTurno && (
              <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                Sin Turno Activo
              </span>
            )}
          </div>
        </div>

        {/* --- SI NO HAY TURNO ACTIVO: FORMULARIO APERTURA --- */}
        {!turnoActivo && !cargandoTurno && !resumenCierre && (
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-campestre-gold/10 rounded-2xl flex items-center justify-center border border-campestre-gold/20">
                <Banknote className="text-campestre-gold" size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Abrir Nuevo Turno de Caja</h4>
                <p className="text-[10px] text-slate-400">Ingresa el fondo inicial para iniciar el turno. Se registrará la hora de apertura.</p>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Fondo Inicial de Caja (MXN)</label>
                <input type="number" min="0" step="0.01" placeholder="500.00"
                  value={fondoInicial} onChange={e => setFondoInicial(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-campestre-gold font-bold"
                />
              </div>
              <button onClick={handleAbrirTurno} disabled={cargandoTurno}
                className="px-6 py-2.5 bg-campestre-green hover:bg-campestre-green/90 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-campestre-green/20 flex items-center gap-2"
              >
                <Clock size={16} />
                {cargandoTurno ? 'Abriendo...' : 'Abrir Turno'}
              </button>
            </div>
          </div>
        )}

        {/* --- RESUMEN DE CIERRE PREVIO --- */}
        {resumenCierre && !turnoActivo && (
          <div className="bg-slate-900/60 rounded-2xl border border-emerald-500/20 p-6 space-y-4 relative">
            <button onClick={() => setResumenCierre(null)} className="absolute top-3 right-3 text-slate-500 hover:text-white p-1">
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <Check className="text-emerald-400" size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Resumen del Corte de Caja</h4>
                <p className="text-[10px] text-slate-400">
                  Turno #{resumenCierre.id} • Cerrado: {new Date(resumenCierre.cerrado_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Fondo Inicial</span>
                <span className="text-lg font-extrabold text-slate-300">${resumenCierre.fondo_inicial.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 border border-emerald-500/15">
                <span className="text-[9px] text-emerald-400 uppercase tracking-wider block font-bold">💵 Efectivo Ventas</span>
                <span className="text-lg font-extrabold text-emerald-400">${resumenCierre.efectivo_ventas.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 border border-blue-500/15">
                <span className="text-[9px] text-blue-400 uppercase tracking-wider block font-bold">💳 Tarjeta Ventas</span>
                <span className="text-lg font-extrabold text-blue-400">${resumenCierre.tarjeta_ventas.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 border border-yellow-500/15">
                <span className="text-[9px] text-yellow-400 uppercase tracking-wider block font-bold">⛳ Cargos Socios</span>
                <span className="text-lg font-extrabold text-yellow-400">${resumenCierre.cargos_socios_adeudos.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-campestre-gold/5 border border-campestre-gold/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-campestre-gold uppercase tracking-wider block font-bold">💰 Total Efectivo a Entregar</span>
                <span className="text-[9px] text-slate-400 block">Fondo inicial + ventas en efectivo</span>
              </div>
              <span className="text-2xl font-extrabold text-campestre-gold">${resumenCierre.efectivo_total_entregar.toFixed(2)} MXN</span>
            </div>
          </div>
        )}

        {/* --- SI HAY TURNO ACTIVO: DASHBOARD FINANCIERO --- */}
        {turnoActivo && turnoData && (
          <div className="space-y-4">
            {/* Info del turno */}
            <div className="flex flex-wrap gap-3 items-center text-[10px] text-slate-400 bg-slate-900/40 rounded-xl px-4 py-2.5 border border-slate-800">
              <span className="flex items-center gap-1"><Clock size={12} /> Abierto: <b className="text-white">{new Date(turnoData.turno.abierto_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</b></span>
              <span className="text-slate-700">•</span>
              <span>Fondo inicial: <b className="text-white">${turnoData.turno.fondo_inicial.toFixed(2)}</b></span>
              <span className="text-slate-700">•</span>
              <span>Ventas registradas: <b className="text-white">{turnoData.ventas.length}</b></span>
            </div>

            {/* Tarjetas de balance financiero */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/60 rounded-2xl border border-emerald-500/15 p-4 flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1"><Banknote size={11} className="text-emerald-400" /> Efectivo Ventas</span>
                <h4 className="text-xl font-extrabold text-emerald-400 mt-1">${turnoData.balances.efectivo.toFixed(2)}</h4>
                <span className="text-[8px] text-slate-500 mt-0.5">Cobrado en efectivo este turno</span>
              </div>
              <div className="bg-slate-900/60 rounded-2xl border border-campestre-gold/20 p-4 flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1"><DollarSign size={11} className="text-campestre-gold" /> Total en Caja</span>
                <h4 className="text-xl font-extrabold text-campestre-gold mt-1">${turnoData.balances.total_caja_efectivo.toFixed(2)}</h4>
                <span className="text-[8px] text-slate-500 mt-0.5">
                  Fondo + ventas
                  {turnoData.balances.total_retiros > 0 && ` - retiros ($${turnoData.balances.total_retiros.toFixed(2)})`}
                </span>
              </div>
              <div className="bg-slate-900/60 rounded-2xl border border-blue-500/15 p-4 flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1"><CreditCard size={11} className="text-blue-400" /> Tarjeta</span>
                <h4 className="text-xl font-extrabold text-blue-400 mt-1">${turnoData.balances.tarjeta.toFixed(2)}</h4>
                <span className="text-[8px] text-slate-500 mt-0.5">Cobrado con tarjeta</span>
              </div>
              <div className="bg-slate-900/60 rounded-2xl border border-yellow-500/15 p-4 flex flex-col">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">⛳ Cargos Socios</span>
                <h4 className="text-xl font-extrabold text-yellow-400 mt-1">${turnoData.balances.cargo_socio.toFixed(2)}</h4>
                <span className="text-[8px] text-slate-500 mt-0.5">Cuentas por cobrar</span>
              </div>
            </div>

            {/* Historial de ventas del turno */}
            {turnoData.ventas.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt size={13} className="text-campestre-gold" /> Ventas del Turno
                </span>
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {turnoData.ventas.map((v: any) => (
                    <div key={v.id} className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-xs text-white font-bold block">{v.area} (Vendedor: {v.atendido_por || 'Desconocido'}) — #{v.id}</span>
                        <span className="text-[10px] text-slate-400 block">{v.items.join(', ')}</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {v.pagos.map((p: any, i: number) => (
                            <span key={i} className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                              p.metodo === 'EFECTIVO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : p.metodo === 'TARJETA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {p.metodo === 'EFECTIVO' ? '💵' : p.metodo === 'TARJETA' ? '💳' : '⛳'} {p.nombre}: ${p.monto.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-white block">${v.total.toFixed(2)}</span>
                        <span className="text-[9px] text-slate-500 block">{v.fecha ? new Date(v.fecha).toLocaleString('es-MX', { timeStyle: 'short' }) : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {turnoData.ventas.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Receipt className="mx-auto mb-2 opacity-30" size={28} />
                <p className="text-xs">Aún no hay ventas registradas en este turno.</p>
              </div>
            )}

            {/* Historial de retiros del turno */}
            {turnoData.retiros && turnoData.retiros.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-800/60">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  💸 Retiros de Caja (Salidas de Efectivo)
                </span>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                  {turnoData.retiros.map((r: any) => (
                    <div key={r.id} className="bg-slate-900/40 border border-amber-500/10 rounded-xl px-4 py-3 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-xs text-white font-bold block">Retiro #{r.id}</span>
                        <span className="text-[10px] text-slate-400 block">Motivo: {r.motivo}</span>
                        <span className="text-[8px] text-slate-500 block">
                          Hora: {new Date(r.fecha).toLocaleTimeString('es-MX', { timeStyle: 'short' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-amber-400 block">-${r.monto.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de Turno */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {esAdmin && (
                <button
                  type="button"
                  onClick={() => setMostrarModalRetiro(true)}
                  className="flex-1 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/25 transition-colors flex items-center justify-center gap-2"
                >
                  <DollarSign size={14} />
                  Retirar Efectivo
                </button>
              )}
              <button
                type="button"
                onClick={() => setMostrarConfirmCierre(true)}
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl text-xs border border-red-500/25 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                Cerrar Turno y Hacer Corte
              </button>
            </div>
          </div>
        )}
      </div>

          {esAdmin && (
            <>
      {/* ===== PANEL FINANCIERO GLOBAL ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">💵 Caja de Efectivo (Global)</span>
            <h4 className="text-2xl font-extrabold text-emerald-400">${balances.efectivo.toFixed(2)} MXN</h4>
            <span className="text-[9px] text-slate-500 block">Acumulado total en efectivo</span>
          </div>
          <span className="text-3xl opacity-30">💵</span>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">💳 Terminal de Tarjetas (Global)</span>
            <h4 className="text-2xl font-extrabold text-blue-400">${balances.tarjeta.toFixed(2)} MXN</h4>
            <span className="text-[9px] text-slate-500 block">Acumulado total con tarjeta</span>
          </div>
          <span className="text-3xl opacity-30">💳</span>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">⛳ Cargos a Socios (Global)</span>
            <h4 className="text-2xl font-extrabold text-yellow-400">${balances.cargo_socio.toFixed(2)} MXN</h4>
            <span className="text-[9px] text-slate-500 block">Cuentas por cobrar de miembros</span>
          </div>
          <span className="text-3xl opacity-30">⛳</span>
        </div>
      </div>

      {/* ===== AGREGAR NUEVO PRODUCTO ===== */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Tag className="text-yellow-400" size={18} />
            <span>Agregar Nuevo Producto al Menú</span>
          </h3>
          <button
            type="button"
            onClick={() => setMostrarFormProducto(!mostrarFormProducto)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-yellow-300 transition-colors"
          >
            <Plus size={14} />
            {mostrarFormProducto ? 'Cancelar' : 'Nuevo Producto'}
          </button>
        </div>

        {mostrarFormProducto && (
          <form onSubmit={handleCrearProducto} className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Nombre *</label>
              <input required type="text" placeholder="E.g. Corona Extra 355ml"
                value={npNombre} onChange={e => setNpNombre(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Precio de Venta (MXN) *</label>
              <input required type="number" min="0" step="0.01" placeholder="0.00"
                value={npPrecio} onChange={e => setNpPrecio(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Categoría *</label>
              <select
                required
                value={npCategoria}
                onChange={e => setNpCategoria(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
              >
                <option value="">-- Seleccionar Categoría --</option>
                <option value="descuentos">30% de Descuento (Empleados)</option>
                <option value="bebidas">Bebidas</option>
                <option value="botanas">Botanas</option>
                <option value="cenas">Cenas</option>
                <option value="cervezas">Cervezas</option>
                <option value="cigarros">Cigarros</option>
                <option value="comida">Comida</option>
                <option value="desayunos">Desayunos</option>
                <option value="niños">Niños</option>
                <option value="ron, brandy y vodka">Ron, Brandy y Vodka</option>
                <option value="tacos de guisos">Tacos de Guisos</option>
                <option value="tequilas">Tequilas</option>
                <option value="whisky">Whisky</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Stock Bar 🍺</label>
              <input type="number" min="0" placeholder="0"
                value={npStockBar} onChange={e => setNpStockBar(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Stock Snack 🍔</label>
              <input type="number" min="0" placeholder="0"
                value={npStockSnack} onChange={e => setNpStockSnack(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Stock Palapa 🌴</label>
              <input type="number" min="0" placeholder="0"
                value={npStockPalapa} onChange={e => setNpStockPalapa(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Stock Mínimo (alerta)</label>
              <input type="number" min="0" placeholder="5"
                value={npStockMin} onChange={e => setNpStockMin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Descripción</label>
              <input type="text" placeholder="Descripción breve..."
                value={npDescripcion} onChange={e => setNpDescripcion(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={cargando}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-xl text-xs transition-colors"
              >
                {cargando ? 'Creando...' : '✓ Crear Producto'}
              </button>
            </div>
          </form>
        )}
      </div>


      {/* ===== CUENTAS Y ADEUDOS DE SOCIOS ===== */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Receipt className="text-yellow-400" size={18} />
            <span>💳 Cuentas y Adeudos de Socios</span>
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={cargarCuentas}
              className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Recargar cuentas"
            >
              <RefreshCw size={14} className={cargandoCuentas ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setMostrarConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl text-xs border border-red-500/25 transition-colors"
            >
              <RotateCcw size={13} />
              Resetear Todos los Datos
            </button>
          </div>
        </div>

        {cuentas.length === 0 && !cargandoCuentas ? (
          <div className="text-center py-10 text-slate-500">
            <Receipt className="mx-auto mb-3 opacity-30" size={32} />
            <p className="text-sm">No hay cuentas registradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Área / Ref.</th>
                  <th className="px-4 py-3">Socios / Cargos</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Fecha</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cuentas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400 text-[10px]">#{c.id.slice(-6)}</td>
                    <td className="px-4 py-3">
                      <span className="text-white font-bold block">{c.area}</span>
                      <span className="text-[10px] text-slate-400">{c.referencia}</span>
                    </td>
                    <td className="px-4 py-3">
                      {c.divisiones.length > 0 ? (
                        <div className="space-y-0.5">
                          {c.divisiones.map((d: any, i: number) => (
                            <div key={i} className="text-[10px]">
                              <span className="text-white font-medium">{d.cliente}</span>
                              <span className="text-slate-400 ml-1">${d.monto.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px] italic">Sin socios</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-extrabold text-yellow-400">${c.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        c.estado === 'PAGADA' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : c.estado === 'ABIERTA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                        : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 text-[10px]">
                      {new Date(c.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleEliminarCuenta(c.id)}
                        className="flex items-center gap-1 mx-auto px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-lg text-[10px] font-bold border border-red-500/20 transition-colors"
                      >
                        <Trash2 size={11} />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
            </>
          )}

      {/* ===== REGISTRAR NUEVO SOCIO ===== */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>👤</span><span>Registrar Nuevo Socio</span>
        </h3>
        <form onSubmit={handleCrearSocio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Código de Socio *</label>
            <input type="text" required placeholder="E.g. SOCIO-105"
              value={codigoSocioNuevo} onChange={e => setCodigoSocioNuevo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Nombre Completo *</label>
            <input type="text" required placeholder="María Elena Ruíz García"
              value={nombreSocioNuevo} onChange={e => setNombreSocioNuevo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Correo Electrónico</label>
            <input type="email" placeholder="correo@socio.com"
              value={emailSocioNuevo} onChange={e => setEmailSocioNuevo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Teléfono</label>
            <input type="text" placeholder="555-200-1005"
              value={telefonoSocioNuevo} onChange={e => setTelefonoSocioNuevo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit"
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Dar de Alta Socio
            </button>
          </div>
        </form>
      </div>

      {/* ===== LISTA DE SOCIOS ===== */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Users className="text-yellow-400" size={18} />
            <span>Socios Registrados</span>
          </h3>
          <button onClick={cargarSociosLista} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Buscador de Socios por nombre/código */}
        {sociosLista.length > 0 && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Buscar socio por nombre, código, email o teléfono..."
              value={busquedaSocio}
              onChange={(e) => setBusquedaSocio(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-campestre-gold/50 transition-all font-medium"
            />
          </div>
        )}

        {sociosListaFiltrada.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">
            {busquedaSocio.trim() !== '' ? 'No se encontraron socios que coincidan con la búsqueda.' : 'No hay socios registrados.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sociosListaFiltrada.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono text-yellow-400 font-bold">{s.codigo_socio}</td>
                    <td className="px-4 py-3 text-white font-medium">{s.nombre}</td>
                    <td className="px-4 py-3 text-slate-400">{s.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{s.telefono || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => handleEliminarSocio(s.id)}
                        className="flex items-center gap-1 mx-auto px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-lg text-[10px] font-bold border border-red-500/20 transition-colors">
                        <Trash2 size={11} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      ) : seccionActiva === 'reportes' ? (
        <div className="space-y-6">
          {/* Ventas Diarias */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Calendar className="text-campestre-gold" size={20} />
                  <span>Reporte de Ventas ({rangoReporte === 'diario' ? 'Diario' : rangoReporte === 'semanal' ? 'Semanal' : 'Mensual'})</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  {rangoReporte === 'diario' 
                    ? 'Consulta el desglose de ventas y formas de pago para un día específico.' 
                    : rangoReporte === 'semanal' 
                    ? 'Consulta el desglose de ventas y formas de pago para la semana del día seleccionado.' 
                    : 'Consulta el desglose de ventas y formas de pago para el mes del día seleccionado.'}
                </p>
                {reporteDiario && (rangoReporte === 'semanal' || rangoReporte === 'mensual') && (
                  <p className="text-[11px] text-yellow-400 font-semibold mt-1">
                    Período: {new Date(reporteDiario.fecha_inicio).toLocaleDateString('es-MX')} al {new Date(reporteDiario.fecha_fin).toLocaleDateString('es-MX')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={rangoReporte}
                  onChange={(e) => {
                    setRangoReporte(e.target.value);
                    cargarReporteDiario(fechaReporte, e.target.value);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-campestre-gold font-bold cursor-pointer"
                >
                  <option value="diario">Diario 📅</option>
                  <option value="semanal">Semanal 📅</option>
                  <option value="mensual">Mensual 📅</option>
                </select>
                <input
                  type="date"
                  value={fechaReporte}
                  onChange={(e) => {
                    setFechaReporte(e.target.value);
                    cargarReporteDiario(e.target.value, rangoReporte);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-campestre-gold font-bold"
                />
                <button
                  type="button"
                  onClick={() => cargarReporteDiario(fechaReporte, rangoReporte)}
                  className="px-4 py-2 bg-campestre-green hover:bg-campestre-green/90 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={cargandoReporte ? 'animate-spin' : ''} />
                  Consultar
                </button>
              </div>
            </div>

            {/* Tarjetas de Resumen del Día */}
            {reporteDiario && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">💵 Efectivo Ventas</span>
                  <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                    ${reporteDiario.resumen.efectivo.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">💳 Tarjeta Ventas</span>
                  <span className="text-xl font-extrabold text-blue-400 mt-1 block">
                    ${reporteDiario.resumen.tarjeta.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">⛳ Cargos a Socios</span>
                  <span className="text-xl font-extrabold text-yellow-400 mt-1 block">
                    ${reporteDiario.resumen.cargo_socio.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-900/60 rounded-2xl border border-red-500/20 p-4 bg-red-500/5">
                  <span className="text-[9px] text-red-400 uppercase tracking-wider font-bold block">🏷️ Descuentos Otorgados</span>
                  <span className="text-xl font-extrabold text-red-400 mt-1 block">
                    ${(reporteDiario.resumen.total_descuentos || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-900/60 rounded-2xl border border-campestre-gold/20 p-4 bg-campestre-gold/5">
                  <span className="text-[9px] text-campestre-gold uppercase tracking-wider font-bold block">📈 Ventas Netas Totales</span>
                  <span className="text-xl font-extrabold text-campestre-gold mt-1 block">
                    ${reporteDiario.resumen.total_ventas.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Gráficas de Reportes */}
            {reporteDiario && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <GraficaMetodosPago
                  efectivo={reporteDiario.resumen.efectivo}
                  tarjeta={reporteDiario.resumen.tarjeta}
                  cargoSocio={reporteDiario.resumen.cargo_socio}
                />
                <GraficaVentasArea ventas={reporteDiario.ventas} />
              </div>
            )}

            {/* Tabla de Ventas Diarias */}
            {reporteDiario && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Desglose de Cuentas Cerradas</h4>
                {reporteDiario.ventas.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 border border-slate-800/40 rounded-2xl bg-slate-900/20">
                    <Receipt className="mx-auto mb-2 opacity-30" size={24} />
                    <p className="text-xs">No hay ventas registradas para este día.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">ID / Hora</th>
                          <th className="px-4 py-3">Área</th>
                          <th className="px-4 py-3">Atendido Por</th>
                          <th className="px-4 py-3">Productos Vendidos</th>
                          <th className="px-4 py-3">Detalle de Pago</th>
                          <th className="px-4 py-3 text-right">Descuento</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {reporteDiario.ventas.map((v: any) => (
                          <tr key={v.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-white font-mono font-bold block">#{v.id.slice(-6)}</span>
                              <span className="text-[9px] text-slate-500">{new Date(v.fecha).toLocaleTimeString('es-MX', { timeStyle: 'short' })}</span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-300">{v.area}</td>
                            <td className="px-4 py-3 text-slate-400">{v.atendido_por}</td>
                            <td className="px-4 py-3">
                              <div className="max-w-[200px] truncate" title={v.items.join(', ')}>
                                {v.items.join(', ')}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {v.pagos.map((p: any, i: number) => (
                                  <span
                                    key={i}
                                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                                      p.metodo === 'EFECTIVO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : p.metodo === 'TARJETA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}
                                  >
                                    {p.metodo === 'EFECTIVO' ? '💵' : p.metodo === 'TARJETA' ? '💳' : '⛳'} {p.nombre}: ${p.monto.toFixed(2)}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-red-400">
                              {v.descuento > 0 ? `-$${v.descuento.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-extrabold text-white">${v.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Historial de Cortes de Caja */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <DollarSign className="text-campestre-gold" size={20} />
                  <span>Historial de Cortes de Caja (Turnos)</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Listado histórico de turnos con arqueos registrados de efectivo, tarjetas, cargos a socios y ventas netas.
                </p>
              </div>
              <button
                type="button"
                onClick={cargarReporteCortes}
                className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Recargar historial de turnos"
              >
                <RefreshCw size={14} className={cargandoReporte ? 'animate-spin' : ''} />
              </button>
            </div>

            {reporteCortes.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Clock className="mx-auto mb-3 opacity-30" size={32} />
                <p className="text-sm">No se han registrado turnos en el sistema.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-3">Turno ID</th>
                      <th className="px-3 py-3">Estado</th>
                      <th className="px-3 py-3">Atendido Por</th>
                      <th className="px-3 py-3">Apertura</th>
                      <th className="px-3 py-3">Cierre</th>
                      <th className="px-3 py-3 text-right">Fondo Inicial</th>
                      <th className="px-3 py-3 text-right">Caja Efectivo</th>
                      <th className="px-3 py-3 text-right">Ventas Efectivo</th>
                      <th className="px-3 py-3 text-right">Ventas Tarjeta</th>
                      <th className="px-3 py-3 text-right">Cargos Socios</th>
                      <th className="px-3 py-3 text-right">Ventas Netas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reporteCortes.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-3 py-3 font-mono font-bold text-slate-400">#{t.id}</td>
                        <td className="px-3 py-3">
                          {t.activo ? (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wide">
                              Activo
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-700 uppercase tracking-wide">
                              Cerrado
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-300 font-medium">{t.atendido_por}</td>
                        <td className="px-3 py-3 text-[10px] text-slate-400">
                          {new Date(t.abierto_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-3 py-3 text-[10px] text-slate-400">
                          {t.cerrado_at 
                            ? new Date(t.cerrado_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
                            : '—'
                          }
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-400">${t.fondo_inicial.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right font-bold text-slate-300">
                          ${t.efectivo_total_caja.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-emerald-400">
                          ${t.efectivo_ventas.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-blue-400">
                          ${t.tarjeta_ventas.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-yellow-400">
                          ${t.cargos_socios.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-right font-extrabold text-campestre-gold bg-campestre-gold/5">
                          ${t.ventas_netas.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : seccionActiva === 'usuarios' ? (
        <div className="space-y-6">
          {/* Formulario Crear Usuario */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>👤</span><span>Registrar Nuevo Personal (Vendedor/Admin)</span>
            </h3>
            <form onSubmit={handleCrearUsuario} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Nombre de Usuario *</label>
                <input type="text" required placeholder="E.g. roberto"
                  value={nuUsername} onChange={e => setNuUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Contraseña Temporal *</label>
                <input type="password" required placeholder="••••••••"
                  value={nuPassword} onChange={e => setNuPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Nombre Completo *</label>
                <input type="text" required placeholder="Roberto Gómez"
                  value={nuNombre} onChange={e => setNuNombre(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Correo Electrónico</label>
                <input type="email" placeholder="roberto@campestre.com"
                  value={nuEmail} onChange={e => setNuEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Rol en el Sistema *</label>
                <select
                  required
                  value={nuRole}
                  onChange={e => setNuRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="VENDEDOR">Vendedor (Acceso POS y Turnos)</option>
                  <option value="ADMIN">Administrador (Control Total)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Registrar Personal
                </button>
              </div>
            </form>
          </div>

          {/* Listado de Usuarios */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users className="text-blue-400" size={18} />
                <span>Personal Registrado en el Sistema</span>
              </h3>
              <button onClick={cargarUsuariosLista} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
                <RefreshCw size={14} className={cargandoUsuarios ? 'animate-spin' : ''} />
              </button>
            </div>

            {usuariosLista.length === 0 && !cargandoUsuarios ? (
              <p className="text-slate-500 text-sm text-center py-6">No hay usuarios registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Usuario</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Roles</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usuariosLista.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-white font-medium">{u.nombre}</td>
                        <td className="px-4 py-3 font-mono text-blue-400 font-bold">{u.username}</td>
                        <td className="px-4 py-3 text-slate-400">{u.email || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {u.roles.map((r: string, idx: number) => (
                              <span key={idx} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                                r === 'ADMIN' ? 'bg-campestre-gold/10 text-campestre-gold border-campestre-gold/25'
                                : 'bg-campestre-green/10 text-campestre-green border-campestre-green/25'
                              }`}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActivoUsuario(u.id)}
                            className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                              u.activo
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            }`}
                          >
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center flex justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditUsuario(u)}
                            className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/25 text-blue-400 rounded-lg text-[10px] font-bold border border-blue-500/20 transition-colors"
                          >
                            📝 Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUsuarioSeleccionadoPassword(u);
                              setMostrarModalPassword(true);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 transition-colors"
                          >
                            🔑 Contraseña
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Cambiar Contraseña */}
          {mostrarModalPassword && usuarioSeleccionadoPassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white">Cambiar Contraseña</h4>
                  <button
                    onClick={() => {
                      setMostrarModalPassword(false);
                      setUsuarioSeleccionadoPassword(null);
                      setNuevaPassword('');
                    }}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-slate-450">
                  Estás cambiando la contraseña para el usuario: <span className="font-bold text-blue-400">{usuarioSeleccionadoPassword.username}</span>
                </p>
                <form onSubmit={handleCambiarPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Nueva Contraseña:</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarModalPassword(false);
                        setUsuarioSeleccionadoPassword(null);
                        setNuevaPassword('');
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-450 font-bold rounded-xl text-xs transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Guardar Contraseña
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Editar Usuario */}
          {mostrarModalEditarUsuario && usuarioSeleccionadoEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white">Editar Datos de Personal</h4>
                  <button
                    onClick={() => {
                      setMostrarModalEditarUsuario(false);
                      setUsuarioSeleccionadoEdit(null);
                    }}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleGuardarUsuarioEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Roberto Gómez"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre de Usuario *</label>
                    <input
                      type="text"
                      required
                      placeholder="roberto"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="roberto@campestre.com"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Rol en el Sistema *</label>
                    <select
                      required
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="VENDEDOR">Vendedor (Acceso POS y Turnos)</option>
                      <option value="ADMIN">Administrador (Control Total)</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarModalEditarUsuario(false);
                        setUsuarioSeleccionadoEdit(null);
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-450 font-bold rounded-xl text-xs transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={cargandoUsuarios}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      {cargandoUsuarios ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header of Reporte CCLourdes */}
          <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <FileText className="text-emerald-500" size={20} />
                  <span>Reporte Semanal CCLourdes</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Control semanal de ingresos y gastos (fijos, variables y materiales). Selecciona cualquier día para cargar la semana correspondiente.
                </p>
                {reporteSemanalGastos && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                    Semana del: {new Date(reporteSemanalGastos.inicio_semana).toLocaleDateString('es-MX', { timeZone: 'UTC' })} al {new Date(reporteSemanalGastos.fin_semana).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={fechaSemanalGastos}
                  onChange={(e) => {
                    setFechaSemanalGastos(e.target.value);
                    cargarReporteSemanalGastos(e.target.value);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500 font-bold"
                />
                <button
                  type="button"
                  onClick={() => cargarReporteSemanalGastos(fechaSemanalGastos)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={cargandoReporteSemanal ? 'animate-spin' : ''} />
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de registro (Izquierda) */}
            <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4 h-fit">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>➕</span><span>Registrar Gasto o Ingreso</span>
              </h4>
              <form onSubmit={handleCrearGastoIngreso} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Tipo de Registro *</label>
                  <select
                    value={cclTipoRegistro}
                    onChange={(e) => setCclTipoRegistro(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="GASTO_FIJO">Gastos Fijos 🏢</option>
                    <option value="GASTO_VARIABLE">Gastos Variables 🔄</option>
                    <option value="GASTO_MATERIAL">Gastos Materiales 📦</option>
                    <option value="INGRESO">Ingresos 💰</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Concepto *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Abogado, Bolsa Basura, Papitas, Cerveza"
                    value={cclConcepto}
                    onChange={(e) => setCclConcepto(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    list="ccl-conceptos-sugeridos"
                  />
                  <datalist id="ccl-conceptos-sugeridos">
                    <option value="Abogado" />
                    <option value="Agua" />
                    <option value="Contador" />
                    <option value="Gasolina" />
                    <option value="BOLSA BASURA" />
                    <option value="BOLSA TRANSPARENTE" />
                    <option value="CANASTAS ROJAS" />
                    <option value="CARNE DE RES" />
                    <option value="CERVEZA" />
                    <option value="COCA COLA" />
                    <option value="MONSTER" />
                    <option value="GALLETAS" />
                    <option value="LIMON" />
                    <option value="Vinos" />
                    <option value="HIELO" />
                    <option value="Ingreso efevo" />
                    <option value="Ingreso izettle" />
                    <option value="Ingreso Banregio" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Monto ($) *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={cclMonto}
                    onChange={(e) => setCclMonto(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Método de Pago / Canal *</label>
                  <select
                    value={cclMetodoPago}
                    onChange={(e) => setCclMetodoPago(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="EFECTIVO">💵 Efectivo / Caja</option>
                    <option value="IZETTLE">💳 Izettle</option>
                    <option value="BANREGIO">⛳ Banregio</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/10"
                >
                  ✓ Registrar Movimiento
                </button>
              </form>
            </div>

            {/* Sumario Semanal en Formato del PDF (Derecha, ocupa 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {reporteSemanalGastos ? (
                <>
                  <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3 flex justify-between">
                      <span>📊 Sumario Semanal</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-normal">Calculado automáticamente</span>
                    </h4>

                    {/* Resumen de los 3 bloques de gastos y los ingresos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-4">
                        <span className="text-[8px] text-slate-450 uppercase tracking-wider font-bold block">🏢 Gastos Fijos</span>
                        <span className="text-lg font-extrabold text-white mt-1 block">
                          ${reporteSemanalGastos.sumario.gastos_fijos.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-4">
                        <span className="text-[8px] text-slate-450 uppercase tracking-wider font-bold block">🔄 Gastos Variables</span>
                        <span className="text-lg font-extrabold text-white mt-1 block">
                          ${reporteSemanalGastos.sumario.gastos_variables.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-4">
                        <span className="text-[8px] text-slate-450 uppercase tracking-wider font-bold block">📦 Gastos Materiales</span>
                        <span className="text-lg font-extrabold text-white mt-1 block">
                          ${reporteSemanalGastos.sumario.gastos_materiales.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/10 p-4">
                        <span className="text-[8px] text-emerald-450 uppercase tracking-wider font-bold block">💰 Ingresos Totales (Caja)</span>
                        <span className="text-lg font-extrabold text-emerald-400 mt-1 block">
                          ${reporteSemanalGastos.sumario.cierre_caja.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Tabla de Cierre Semanal Detallada por Canales */}
                    <div className="border border-slate-800 rounded-2xl overflow-hidden mt-4">
                      <table className="w-full text-xs text-left text-slate-350">
                        <thead className="bg-slate-950 text-slate-450 uppercase text-[9px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-2.5">Concepto de Cierre</th>
                            <th className="px-4 py-2.5 text-right">Ingresos</th>
                            <th className="px-4 py-2.5 text-right">Egresos/Salidas</th>
                            <th className="px-4 py-2.5 text-right">Cierre Neto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          <tr>
                            <td className="px-4 py-2.5 text-white font-sans font-medium">💵 Cierre Semanal Efectivo</td>
                            <td className="px-4 py-2.5 text-right text-emerald-500">${reporteSemanalGastos.sumario.ingreso_efectivo.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-right text-red-400">${reporteSemanalGastos.sumario.egreso_efectivo.toFixed(2)}</td>
                            <td className={`px-4 py-2.5 text-right font-bold ${reporteSemanalGastos.sumario.cierre_semanal_efectivo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              ${reporteSemanalGastos.sumario.cierre_semanal_efectivo.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 text-white font-sans font-medium">💳 Cierre Semanal Izettle</td>
                            <td className="px-4 py-2.5 text-right text-emerald-500">${reporteSemanalGastos.sumario.ingreso_izettle.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-right text-red-400">${reporteSemanalGastos.sumario.egreso_izettle.toFixed(2)}</td>
                            <td className={`px-4 py-2.5 text-right font-bold ${reporteSemanalGastos.sumario.cierre_semanal_izettle >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              ${reporteSemanalGastos.sumario.cierre_semanal_izettle.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 text-white font-sans font-medium">⛳ Cierre Semanal Banregio</td>
                            <td className="px-4 py-2.5 text-right text-emerald-500">${reporteSemanalGastos.sumario.ingreso_banregio.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-right text-red-400">${reporteSemanalGastos.sumario.egreso_banregio.toFixed(2)}</td>
                            <td className={`px-4 py-2.5 text-right font-bold ${reporteSemanalGastos.sumario.cierre_semanal_banregio >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              ${reporteSemanalGastos.sumario.cierre_semanal_banregio.toFixed(2)}
                            </td>
                          </tr>
                          <tr className="bg-slate-900 font-sans">
                            <td className="px-4 py-3 text-campestre-gold font-extrabold">📊 Total Neto Semanal</td>
                            <td className="px-4 py-3 text-right"></td>
                            <td className="px-4 py-3 text-right"></td>
                            <td className={`px-4 py-3 text-right font-black text-sm ${reporteSemanalGastos.sumario.total_semanal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              ${reporteSemanalGastos.sumario.total_semanal.toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 glass-card rounded-3xl border border-slate-800">
                  <FileText className="mx-auto mb-3 opacity-30 animate-pulse" size={32} />
                  <p className="text-sm">Selecciona una fecha y pulsa actualizar para generar el reporte semanal.</p>
                </div>
              )}
            </div>
          </div>

          {/* Listado de movimientos de la semana (Full Width) */}
          {reporteSemanalGastos && (
            <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>📋</span><span>Movimientos Registrados en esta Semana</span>
              </h4>
              {reporteSemanalGastos.registros.length === 0 ? (
                <p className="text-slate-500 text-center py-6 text-xs italic">No hay movimientos registrados para esta semana.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-355 text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Concepto</th>
                        <th className="px-4 py-3">Método / Canal</th>
                        <th className="px-4 py-3 text-right">Monto</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {reporteSemanalGastos.registros.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 text-slate-450 font-mono text-[10px]">
                            {new Date(r.fecha).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' })}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              r.tipo_registro === 'GASTO_FIJO' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : r.tipo_registro === 'GASTO_VARIABLE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : r.tipo_registro === 'GASTO_MATERIAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {r.tipo_registro.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white font-medium">{r.concepto}</td>
                          <td className="px-4 py-3 font-medium text-slate-400">
                            {r.metodo_pago === 'EFECTIVO' ? '💵 Efectivo' : r.metodo_pago === 'IZETTLE' ? '💳 Izettle' : '⛳ Banregio'}
                          </td>
                          <td className={`px-4 py-3 text-right font-extrabold ${r.tipo_registro === 'INGRESO' ? 'text-emerald-400' : 'text-white'}`}>
                            {r.tipo_registro === 'INGRESO' ? '+' : '-'}${r.monto.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleEliminarGastoIngreso(r.id)}
                              className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold border border-red-500/20 transition-all active:scale-[0.98]"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== MODAL CONFIRMAR RESET ===== */}
      {mostrarConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-3xl p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <RotateCcw size={26} />
            </div>
            <h4 className="text-base font-bold text-white">¿Resetear todos los datos?</h4>
            <p className="text-xs text-slate-400">
              Esto eliminará <span className="text-red-400 font-bold">permanentemente</span> todas las cuentas,
              divisiones, movimientos de inventario y asignaciones de cadi. Esta acción <span className="font-bold">no se puede deshacer</span>.
            </p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setMostrarConfirmReset(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button type="button" onClick={handleResetearDatos}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Sí, Resetear Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CONFIRMAR CIERRE DE TURNO ===== */}
      {mostrarConfirmCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <DollarSign size={26} />
            </div>
            <h4 className="text-base font-bold text-white">¿Cerrar turno y hacer corte de caja?</h4>
            <p className="text-xs text-slate-400">
              Se calculará el arqueo con los totales de <span className="text-emerald-400 font-bold">efectivo</span>,{' '}
              <span className="text-blue-400 font-bold">tarjeta</span> y{' '}
              <span className="text-yellow-400 font-bold">cargos a socios</span> registrados durante este turno.
              Esta acción <span className="font-bold">no se puede deshacer</span>.
            </p>
            {turnoData && (
              <div className="grid grid-cols-3 gap-2 text-left bg-slate-950 rounded-xl p-3 border border-slate-800">
                <div>
                  <span className="text-[8px] text-emerald-400 uppercase font-bold block">Efectivo</span>
                  <span className="text-xs font-bold text-white">${turnoData.balances.efectivo.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[8px] text-blue-400 uppercase font-bold block">Tarjeta</span>
                  <span className="text-xs font-bold text-white">${turnoData.balances.tarjeta.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[8px] text-yellow-400 uppercase font-bold block">Cargos</span>
                  <span className="text-xs font-bold text-white">${turnoData.balances.cargo_socio.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setMostrarConfirmCierre(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button type="button" onClick={handleCerrarTurno} disabled={cargandoTurno}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {cargandoTurno ? 'Cerrando...' : 'Sí, Cerrar Turno'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ===== MODAL RETIRO DE EFECTIVO ===== */}
      {mostrarModalRetiro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <span>💸</span><span>Registrar Retiro de Efectivo de Caja</span>
            </h4>
            <p className="text-xs text-slate-400">
              Retirar dinero de la caja activa. El monto se restará del efectivo total a entregar en el corte de este turno.
            </p>
            <form onSubmit={handleRegistrarRetiro} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Monto a Retirar ($):</label>
                <input type="number" required min={0.01} step="0.01" placeholder="0.00"
                  value={montoRetiro} onChange={e => setMontoRetiro(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Comentario / Motivo del Retiro:</label>
                <textarea placeholder="Explica detalladamente por qué retiras este dinero (ej. Pago a proveedor de hielo, Merma, etc.)..."
                  required
                  value={motivoRetiro} onChange={e => setMotivoRetiro(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 h-24 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button"
                  onClick={() => { setMostrarModalRetiro(false); setMontoRetiro(''); setMotivoRetiro(''); }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl text-xs transition-colors border border-slate-700"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={cargandoRetiro}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                >
                  {cargandoRetiro ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Registrar Salida</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
