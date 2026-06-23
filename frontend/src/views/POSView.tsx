import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { ShoppingCart, User, Users, Search, Plus, Minus, Trash2, CreditCard, Check, Sparkles, RefreshCw, Clock, X } from 'lucide-react';
import { io } from 'socket.io-client';

export default function POSView() {
  const {
    token,
    areaId,
    setAreaId,
    productos,
    setProductos,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cadiId,
    setCadiId,
    nombreReferencia,
    setNombreReferencia,
    cuentaId,
    setCuentaId,
  } = useStore();

  const [cadis, setCadis] = useState<any[]>([]);
  const [sociosBusqueda, setSociosBusqueda] = useState<any[]>([]);
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [sociosSeleccionadosCadi, setSociosSeleccionadosCadi] = useState<any[]>([]);
  const [mostrarBuscadorSocios, setMostrarBuscadorSocios] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Estados de Cobro
  const [mostrarModalCobro, setMostrarModalCobro] = useState(false);
  const [splitPreview, setSplitPreview] = useState<any>(null);
  const [metodosPago, setMetodosPago] = useState<{ [clienteId: number]: string }>({});
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [metodoPagoDirecto, setMetodoPagoDirecto] = useState<string>('EFECTIVO');

  // Simulador de Escaneo QR
  const [simularQrToken, setSimularQrToken] = useState('');
  const [mostrarSimuladorQR, setMostrarSimuladorQR] = useState(false);

  // Filtro de Categorías / Mini-menús
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODOS');
  const [busquedaProducto, setBusquedaProducto] = useState('');

  // Cuentas pendientes para los vendedores
  const [cuentasPendientes, setCuentasPendientes] = useState<any[]>([]);
  const [cargandoCuentas, setCargandoCuentas] = useState(false);
  const [busquedaPendientes, setBusquedaPendientes] = useState('');

  // Cuentas pagadas del turno activo
  const [cuentasPagadas, setCuentasPagadas] = useState<any[]>([]);
  const [cargandoPagadas, setCargandoPagadas] = useState(false);
  const [busquedaPagadas, setBusquedaPagadas] = useState('');

  // Estado del turno activo y validación diaria
  const [turnoActivo, setTurnoActivo] = useState<any | null>(null);
  const [turnoAbiertoHoy, setTurnoAbiertoHoy] = useState(false);
  const [fondoInicialPOS, setFondoInicialPOS] = useState('500');
  const [cargandoAbrirTurno, setCargandoAbrirTurno] = useState(false);
  const [errorAbrirTurno, setErrorAbrirTurno] = useState('');
  const [cuentaParaEditarPago, setCuentaParaEditarPago] = useState<any | null>(null);
  const [mostrarModalEditarPago, setMostrarModalEditarPago] = useState(false);
  const [nuevosMetodosPago, setNuevosMetodosPago] = useState<{ [key: string]: string }>({});
  const [guardandoMetodoPago, setGuardandoMetodoPago] = useState(false);

  // Estados para deudas y liquidación de socios en modal de cobro
  const [deudasSocios, setDeudasSocios] = useState<{ [clienteId: number]: { total: number; divisiones: any[] } }>({});
  const [liquidarDeudaSocio, setLiquidarDeudaSocio] = useState<{ [clienteId: number]: boolean }>({});
  const [metodosPagoLiquidacion, setMetodosPagoLiquidacion] = useState<{ [clienteId: number]: string }>({});

  // Estados para creación rápida de Socios y Cadis en POS (Vendedores)
  const [mostrarModalCrearSocio, setMostrarModalCrearSocio] = useState(false);
  const [mostrarModalIniciarRonda, setMostrarModalIniciarRonda] = useState(false);
  const [mostrarFormCrearCadiInterno, setMostrarFormCrearCadiInterno] = useState(false);

  // Inputs Socio Nuevo
  const [codigoSocioNuevo, setCodigoSocioNuevo] = useState('');
  const [nombreSocioNuevo, setNombreSocioNuevo] = useState('');
  const [emailSocioNuevo, setEmailSocioNuevo] = useState('');
  const [telefonoSocioNuevo, setTelefonoSocioNuevo] = useState('');

  // Inputs Cadi Nuevo (dentro de Iniciar Ronda)
  const [numeroCadiNuevo, setNumeroCadiNuevo] = useState('');
  const [nombreCadiNuevo, setNombreCadiNuevo] = useState('');
  const [telefonoCadiNuevo, setTelefonoCadiNuevo] = useState('');

  // Estados Asignación / Iniciar Ronda
  const [todosLosCadis, setTodosLosCadis] = useState<any[]>([]);
  const [cadiSeleccionadoRonda, setCadiSeleccionadoRonda] = useState<string>('');
  const [sociosSeleccionadosRonda, setSociosSeleccionadosRonda] = useState<any[]>([]);
  const [busquedaSocioRonda, setBusquedaSocioRonda] = useState('');
  const [resultadosSocioRonda, setResultadosSocioRonda] = useState<any[]>([]);

  // Estados para mezclador
  const [mostrarModalMezclador, setMostrarModalMezclador] = useState(false);
  const [productoPreparadoSeleccionado, setProductoPreparadoSeleccionado] = useState<any | null>(null);
  const [busquedaMezclador, setBusquedaMezclador] = useState('');

  useEffect(() => {
    if (mostrarModalIniciarRonda) {
      cargarTodosLosCadis();
    }
  }, [mostrarModalIniciarRonda]);

  useEffect(() => {
    if (mostrarModalCobro && splitPreview) {
      setDeudasSocios({});
      setLiquidarDeudaSocio({});
      setMetodosPagoLiquidacion({});

      if (splitPreview.divisiones && splitPreview.divisiones.length > 0) {
        // Cargar cargos pendientes para cada socio de las divisiones
        splitPreview.divisiones.forEach(async (d: any) => {
          try {
            const res = await fetch(`/api/pos/socios/${d.cliente_id}/cargos/detalle`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data) && data.length > 0) {
              const totalAdeudo = data.reduce((sum, item) => sum + Number(item.monto), 0);
              setDeudasSocios(prev => ({
                ...prev,
                [d.cliente_id]: {
                  total: totalAdeudo,
                  divisiones: data,
                }
              }));
            }
          } catch (error) {
            console.error(`Error al cargar cargos del socio ${d.cliente_id}:`, error);
          }
        });
      } else if (nombreReferencia && nombreReferencia.trim() !== '') {
        // En modo directo, buscar si el nombreReferencia coincide con algún socio activo
        (async () => {
          try {
            const q = nombreReferencia.trim();
            const resBusqueda = await fetch(`/api/socio/buscar?q=${encodeURIComponent(q)}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const socios = await resBusqueda.json();
            if (resBusqueda.ok && Array.isArray(socios)) {
              // Buscar coincidencia exacta
              const socioExacto = socios.find(s => s.nombre.toLowerCase().trim() === q.toLowerCase());
              if (socioExacto) {
                // Consultar cargos del socio exacto
                const resCargos = await fetch(`/api/pos/socios/${socioExacto.id}/cargos/detalle`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const data = await resCargos.json();
                if (resCargos.ok && Array.isArray(data) && data.length > 0) {
                  const totalAdeudo = data.reduce((sum, item) => sum + Number(item.monto), 0);
                  setDeudasSocios({
                    [socioExacto.id]: {
                      total: totalAdeudo,
                      divisiones: data,
                    }
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error al cargar cargos por referencia de nombre:', error);
          }
        })();
      }
    }
  }, [mostrarModalCobro, splitPreview, token, nombreReferencia]);

  // Conexión WebSockets
  useEffect(() => {
    if (!token) return;
    const socket = io('/', { path: '/socket.io' }); // En local asume misma url

    socket.on('connect', () => {
      console.log('Conectado a WebSockets del POS');
      if (areaId) {
        socket.emit('join:area', areaId);
      }
    });

    socket.on('inventario:actualizar', () => {
      if (areaId) cargarProductos(areaId);
    });

    socket.on('cuenta:actualizar', () => {
      cargarCuentasPendientes();
      cargarCuentasPagadas();
      cargarCadis();
    });

    return () => {
      socket.disconnect();
    };
  }, [areaId, token]);

  useEffect(() => {
    if (token) {
      cargarCadis();
      cargarCuentasPendientes();
      cargarCuentasPagadas();
    }
  }, [token]);

  useEffect(() => {
    if (areaId) {
      cargarProductos(areaId);
      setCategoriaSeleccionada('TODOS');
      cargarCuentasPendientes();
      cargarCuentasPagadas();
    }
  }, [areaId]);

  // Actualizar socios del Cadi cuando cambie el Cadi seleccionado en POS
  useEffect(() => {
    if (cadiId) {
      const cadiSeleccionado = cadis.find(c => c.id === cadiId);
      if (cadiSeleccionado && cadiSeleccionado.clientes) {
        setSociosSeleccionadosCadi(cadiSeleccionado.clientes);
      } else {
        setSociosSeleccionadosCadi([]);
      }
    } else {
      setSociosSeleccionadosCadi([]);
    }
  }, [cadiId, cadis]);

  // Auto-completar referencia con el nombre del socio si no hay referencia manual o es default "Mesa X"
  useEffect(() => {
    if (sociosSeleccionadosCadi.length > 0) {
      const esDefaultOMesa = !nombreReferencia || /^Mesa(\s+\d+)?$/i.test(nombreReferencia.trim());
      if (esDefaultOMesa) {
        const nombresSocios = sociosSeleccionadosCadi.map(s => s.nombre).join(', ');
        setNombreReferencia(nombresSocios);
      }
    }
  }, [sociosSeleccionadosCadi]);

  const cargarProductos = async (idArea: number) => {
    try {
      const res = await fetch(`/api/pos/productos/${idArea}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const cargarCadis = async () => {
    try {
      const res = await fetch('/api/cadis/activos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCadis(data);
    } catch (error) {
      console.error('Error al cargar cadis:', error);
    }
  };

  const cargarTodosLosCadis = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/cadis', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTodosLosCadis(data);
    } catch (error) {
      console.error('Error al cargar todos los cadis:', error);
    }
  };

  const buscarSocioParaRonda = async (texto: string) => {
    setBusquedaSocioRonda(texto);
    if (texto.length < 2) {
      setResultadosSocioRonda([]);
      return;
    }
    try {
      const res = await fetch(`/api/socio/buscar?q=${encodeURIComponent(texto)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setResultadosSocioRonda(data);
      }
    } catch (error) {
      console.error('Error al buscar socios para ronda:', error);
    }
  };

  const handleCrearSocioRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoSocioNuevo || !nombreSocioNuevo) {
      alert('Código y nombre del socio son requeridos');
      return;
    }
    setCargando(true);
    try {
      const res = await fetch('/api/pos/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          codigo_socio: codigoSocioNuevo,
          nombre: nombreSocioNuevo,
          email: emailSocioNuevo || undefined,
          telefono: telefonoSocioNuevo || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar socio');
      alert(`Socio ${nombreSocioNuevo} registrado exitosamente.`);
      
      const nuevoSocioObj = data.cliente;
      
      // Auto-agregar a la selección de la ronda si el modal está abierto
      if (mostrarModalIniciarRonda) {
        setSociosSeleccionadosRonda(prev => [...prev, nuevoSocioObj]);
      } else {
        // Si se abrió el modal simple, agregar al carrito del POS
        if (!sociosSeleccionadosCadi.some(x => x.id === nuevoSocioObj.id)) {
          setSociosSeleccionadosCadi(prev => [...prev, nuevoSocioObj]);
        }
      }
      
      setCodigoSocioNuevo('');
      setNombreSocioNuevo('');
      setEmailSocioNuevo('');
      setTelefonoSocioNuevo('');
      setMostrarModalCrearSocio(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearCadiRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroCadiNuevo || !nombreCadiNuevo) {
      alert('Número y nombre del cadi son requeridos');
      return;
    }
    setCargando(true);
    try {
      const res = await fetch('/api/cadis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numero_cadi: numeroCadiNuevo,
          nombre: nombreCadiNuevo,
          telefono: telefonoCadiNuevo || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear cadi');
      alert(`Cadi ${nombreCadiNuevo} registrado exitosamente.`);
      
      await cargarTodosLosCadis();
      setCadiSeleccionadoRonda(data.id.toString());
      
      setNumeroCadiNuevo('');
      setNombreCadiNuevo('');
      setTelefonoCadiNuevo('');
      setMostrarFormCrearCadiInterno(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIniciarRondaPOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadiSeleccionadoRonda) {
      alert('Debe seleccionar un cadi');
      return;
    }
    if (sociosSeleccionadosRonda.length === 0) {
      alert('Debe asociar al menos un socio a la ronda');
      return;
    }
    setCargando(true);
    try {
      const res = await fetch('/api/cadis/asignar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cadi_id: cadiSeleccionadoRonda,
          cliente_ids: sociosSeleccionadosRonda.map(s => s.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar ronda');
      alert('Ronda iniciada con éxito y Cadi asignado.');
      
      await cargarCadis();
      setCadiId(parseInt(cadiSeleccionadoRonda));
      
      setCadiSeleccionadoRonda('');
      setSociosSeleccionadosRonda([]);
      setBusquedaSocioRonda('');
      setResultadosSocioRonda([]);
      setMostrarModalIniciarRonda(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCargando(false);
    }
  };

  const esMismoDia = (dateStr: string) => {
    const d = new Date(dateStr);
    const hoy = new Date();
    return d.getFullYear() === hoy.getFullYear() &&
           d.getMonth() === hoy.getMonth() &&
           d.getDate() === hoy.getDate();
  };

  const cargarCuentasPendientes = async () => {
    if (!token) return;
    setCargandoCuentas(true);
    try {
      const res = await fetch('/api/admin/cuentas?solo_turno_activo=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const abiertas = data.filter((c: any) => c.estado === 'ABIERTA');
        setCuentasPendientes(abiertas);
      }
    } catch (error) {
      console.error('Error al cargar cuentas abiertas:', error);
    } finally {
      setCargandoCuentas(false);
    }
  };

  const cargarCuentasPagadas = async () => {
    if (!token) return;
    setCargandoPagadas(true);
    try {
      const res = await fetch('/api/admin/turno/activo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.activo) {
        setTurnoActivo(data.turno);
        const hoyTurno = esMismoDia(data.turno.abierto_at);
        setTurnoAbiertoHoy(hoyTurno);
        if (hoyTurno) {
          setCuentasPagadas(data.ventas || []);
        } else {
          setCuentasPagadas([]);
        }
      } else {
        setTurnoActivo(null);
        setTurnoAbiertoHoy(false);
        setCuentasPagadas([]);
      }
    } catch (error) {
      console.error('Error al cargar cuentas pagadas:', error);
    } finally {
      setCargandoPagadas(false);
    }
  };

  const handleAbrirTurnoPOS = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorAbrirTurno('');
    setCargandoAbrirTurno(true);
    const fondo = parseFloat(fondoInicialPOS);
    if (isNaN(fondo) || fondo < 0) {
      setErrorAbrirTurno('El fondo inicial debe ser un número positivo');
      setCargandoAbrirTurno(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/turno/abrir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fondo_inicial: fondo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al abrir turno');
      
      // Recargar el turno activo
      await cargarCuentasPagadas();
      setFondoInicialPOS('500');
    } catch (err: any) {
      setErrorAbrirTurno(err.message || 'Error de conexión');
    } finally {
      setCargandoAbrirTurno(false);
    }
  };

  const iniciarEdicionPago = (cuenta: any) => {
    setCuentaParaEditarPago(cuenta);
    const iniciales: { [key: string]: string } = {};
    cuenta.pagos.forEach((p: any) => {
      if (p.cliente_id !== null) {
        iniciales[p.cliente_id] = p.metodo;
      } else {
        iniciales['directo'] = p.metodo;
      }
    });
    setNuevosMetodosPago(iniciales);
    setMostrarModalEditarPago(true);
  };

  const handleActualizarMetodoPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuentaParaEditarPago) return;
    setGuardandoMetodoPago(true);
    setErrorMsg('');

    const tieneDivisiones = cuentaParaEditarPago.pagos.length > 0 && cuentaParaEditarPago.pagos[0].cliente_id !== null;

    let bodyPayload: any = {};
    if (tieneDivisiones) {
      bodyPayload.divisiones = cuentaParaEditarPago.pagos.map((p: any) => ({
        cliente_id: p.cliente_id,
        metodo_pago: nuevosMetodosPago[p.cliente_id] || p.metodo,
      }));
    } else {
      bodyPayload.metodo_pago = nuevosMetodosPago['directo'] || cuentaParaEditarPago.pagos[0].metodo;
    }

    try {
      const res = await fetch(`/api/pos/cuentas/${cuentaParaEditarPago.id}/metodo-pago`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar método de pago');

      setMostrarModalEditarPago(false);
      setCuentaParaEditarPago(null);
      cargarCuentasPagadas();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de red');
    } finally {
      setGuardandoMetodoPago(false);
    }
  };

  const handleCancelarEdicion = () => {
    clearCart();
    setSociosSeleccionadosCadi([]);
  };

  const handleSeleccionarCuenta = (cuenta: any) => {
    const itemsCart = cuenta.productos.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      precio_venta: p.precio_venta,
      cantidad: p.cantidad,
      categoria: p.categoria,
    }));

    useStore.setState({
      areaId: cuenta.area_id,
      cuentaId: Number(cuenta.id),
      cadiId: cuenta.cadi_id,
      nombreReferencia: cuenta.referencia,
      cart: itemsCart,
    });

    setSociosSeleccionadosCadi(cuenta.socios || []);
  };

  const handlePagarCuentaDirecto = async (cuenta: any) => {
    setCargando(true);
    setErrorMsg('');
    try {
      useStore.setState({
        areaId: cuenta.area_id,
        cuentaId: Number(cuenta.id),
        cadiId: cuenta.cadi_id,
        nombreReferencia: cuenta.referencia,
      });
      const sociosCta = cuenta.socios || [];
      setSociosSeleccionadosCadi(sociosCta);

      const resSplit = await fetch(`/api/pos/cuentas/${cuenta.id}/split-preview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataSplit = await resSplit.json();
      
      if (resSplit.ok) {
        let finalSplit = dataSplit;
        if (!dataSplit.split_automatico && sociosCta.length > 0) {
          const totalVal = dataSplit.total;
          const cantidad = sociosCta.length;
          const montoBase = Math.round((totalVal / cantidad) * 100) / 100;
          let totalDividido = montoBase * cantidad;
          let residuo = Math.round((totalVal - totalDividido) * 100) / 100;

          const divisiones = sociosCta.map((s: any, index: number) => {
            let montoCliente = montoBase;
            if (index === cantidad - 1 && residuo !== 0) {
              montoCliente = Math.round((montoCliente + residuo) * 100) / 100;
            }
            return {
              cliente_id: s.id,
              nombre: s.nombre,
              codigo_socio: s.codigo_socio,
              porcentaje: 100 / cantidad,
              monto: montoCliente,
            };
          });

          finalSplit = {
            split_automatico: true,
            total: totalVal,
            divisiones,
          };
        }

        setSplitPreview(finalSplit);
        const metodosIniciales: { [key: number]: string } = {};
        finalSplit.divisiones.forEach((d: any) => {
          metodosIniciales[d.cliente_id] = 'CARGO_SOCIO';
        });
        setMetodosPago(metodosIniciales);
        setMetodoPagoDirecto('EFECTIVO');
        setMostrarModalCobro(true);
      } else {
        throw new Error(dataSplit.error || 'Error al calcular la división');
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleSoloGuardarConsumos = async () => {
    if (cart.length === 0) return;
    setCargando(true);
    setErrorMsg('');

    try {
      let idCuenta = cuentaId;
      const refName = (() => {
        if (sociosSeleccionadosCadi.length > 0) {
          const esDefaultOMesa = !nombreReferencia || /^Mesa(\s+\d+)?$/i.test(nombreReferencia.trim());
          if (esDefaultOMesa) {
            return sociosSeleccionadosCadi.map(s => s.nombre).join(', ');
          }
        }
        return nombreReferencia || `Mesa ${Math.floor(Math.random() * 20) + 1}`;
      })();

      // Actualizar el estado local para reflejar el nombre final
      setNombreReferencia(refName);

      if (!idCuenta) {
        const resCuenta = await fetch('/api/pos/cuentas/abrir', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            area_id: areaId,
            cadi_id: cadiId,
            nombre_referencia: refName,
            cliente_id: sociosSeleccionadosCadi[0]?.id || null,
          }),
        });

        const dataCuenta = await resCuenta.json();
        if (!resCuenta.ok) throw new Error(dataCuenta.error || 'Error al abrir la cuenta');
        idCuenta = Number(dataCuenta.id);
        setCuentaId(idCuenta);
      }

      const payloadProductos = cart.map(item => ({
        producto_id: typeof item.id === 'string' ? parseInt(item.id.split('-')[0]) : item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario !== undefined ? item.precio_unitario : item.precio_venta,
      }));

      const resConsumos = await fetch(`/api/pos/cuentas/${idCuenta}/consumos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productos: payloadProductos,
          cadi_id: cadiId,
          nombre_referencia: refName,
          cliente_id: sociosSeleccionadosCadi[0]?.id || null,
        }),
      });

      const dataConsumos = await resConsumos.json();
      if (!resConsumos.ok) throw new Error(dataConsumos.error || 'Error al guardar consumos');

      const socket = io();
      socket.emit('cuenta:cambio', { cadi_id: cadiId });

      clearCart();
      setSociosSeleccionadosCadi([]);
      cargarCuentasPendientes();
      if (areaId) cargarProductos(areaId);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Buscar socios por texto (Autocompletar)
  const buscarSocios = async (texto: string) => {
    setBusquedaTexto(texto);
    if (texto.length < 2) {
      setSociosBusqueda([]);
      return;
    }

    try {
      const res = await fetch(`/api/socio/buscar?q=${encodeURIComponent(texto)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSociosBusqueda(data);
    } catch (error) {
      console.error('Error al buscar socios:', error);
    }
  };

  // Simular escaneo de QR
  const procesarEscaneoQRSimulado = async () => {
    if (!simularQrToken) return;
    setErrorMsg('');

    try {
      const res = await fetch('/api/socio/buscar-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_token: simularQrToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Token QR inválido');
      }

      // Si el socio fue encontrado, agregarlo al grupo temporal del Cadi
      // En un club real, primero debemos tener una asignación activa de Cadi.
      // Si no hay un cadi, podemos abrir la cuenta directamente a nombre de este socio.
      // Para simularlo, lo agregamos a los socios asociados.
      if (!sociosSeleccionadosCadi.some(s => s.id === data.id)) {
        setSociosSeleccionadosCadi([...sociosSeleccionadosCadi, data]);
      }
      setSimularQrToken('');
      setMostrarSimuladorQR(false);
      setMostrarBuscadorSocios(false);
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  // Guardar cuenta abierta e iniciar el split
  const handleGuardarCuenta = async () => {
    if (cart.length === 0) return;
    setCargando(true);
    setErrorMsg('');

    try {
      // 1. Abrir cuenta en DB si no existe
      let idCuenta = cuentaId;
      const refName = (() => {
        if (sociosSeleccionadosCadi.length > 0) {
          const esDefaultOMesa = !nombreReferencia || /^Mesa(\s+\d+)?$/i.test(nombreReferencia.trim());
          if (esDefaultOMesa) {
            return sociosSeleccionadosCadi.map(s => s.nombre).join(', ');
          }
        }
        return nombreReferencia || `Mesa ${Math.floor(Math.random() * 20) + 1}`;
      })();

      // Actualizar el estado local para reflejar el nombre final
      setNombreReferencia(refName);

      if (!idCuenta) {
        const resCuenta = await fetch('/api/pos/cuentas/abrir', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            area_id: areaId,
            cadi_id: cadiId,
            nombre_referencia: refName,
            cliente_id: sociosSeleccionadosCadi[0]?.id || null,
          }),
        });

        const dataCuenta = await resCuenta.json();
        if (!resCuenta.ok) throw new Error(dataCuenta.error || 'Error al abrir la cuenta');
        idCuenta = Number(dataCuenta.id);
        setCuentaId(idCuenta);
      }

      // 2. Guardar los consumos (detalle_cuentas)
      const payloadProductos = cart.map(item => ({
        producto_id: typeof item.id === 'string' ? parseInt(item.id.split('-')[0]) : item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario !== undefined ? item.precio_unitario : item.precio_venta,
      }));

      const resConsumos = await fetch(`/api/pos/cuentas/${idCuenta}/consumos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productos: payloadProductos,
          cadi_id: cadiId,
          nombre_referencia: refName,
          cliente_id: sociosSeleccionadosCadi[0]?.id || null,
        }),
      });

      const dataConsumos = await resConsumos.json();
      if (!resConsumos.ok) throw new Error(dataConsumos.error || 'Error al guardar consumos');

      // 3. Emitir evento de cambio vía sockets
      const socket = io();
      socket.emit('cuenta:cambio', { cadi_id: cadiId });

      // Cargar previsualización del split
      const resSplit = await fetch(`/api/pos/cuentas/${idCuenta}/split-preview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataSplit = await resSplit.json();
      
      if (resSplit.ok) {
        let finalSplit = dataSplit;
        if (!dataSplit.split_automatico && sociosSeleccionadosCadi.length > 0) {
          const totalVal = dataSplit.total;
          const cantidad = sociosSeleccionadosCadi.length;
          const montoBase = Math.round((totalVal / cantidad) * 100) / 100;
          let totalDividido = montoBase * cantidad;
          let residuo = Math.round((totalVal - totalDividido) * 100) / 100;

          const divisiones = sociosSeleccionadosCadi.map((s, index) => {
            let montoCliente = montoBase;
            if (index === cantidad - 1 && residuo !== 0) {
              montoCliente = Math.round((montoCliente + residuo) * 100) / 100;
            }
            return {
              cliente_id: s.id,
              nombre: s.nombre,
              codigo_socio: s.codigo_socio,
              porcentaje: 100 / cantidad,
              monto: montoCliente,
            };
          });

          finalSplit = {
            split_automatico: true,
            total: totalVal,
            divisiones,
          };
        }

        setSplitPreview(finalSplit);
        // Inicializar métodos de pago por cliente
        const metodosIniciales: { [key: number]: string } = {};
        finalSplit.divisiones.forEach((d: any) => {
          metodosIniciales[d.cliente_id] = 'CARGO_SOCIO'; // Por defecto cargo a socio
        });
        setMetodosPago(metodosIniciales);
        setMetodoPagoDirecto('EFECTIVO');
        setMostrarModalCobro(true);
      } else {
        throw new Error(dataSplit.error || 'Error al calcular la división');
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Confirmar cobro directo (sin socios)
  const handleCobroDirecto = async () => {
    if (!cuentaId) return;
    setCargando(true);
    setErrorMsg('');

    if (metodoPagoDirecto === 'CARGO_SOCIO' && sociosSeleccionadosCadi.length === 0) {
      setErrorMsg('Debe asignar un socio en la sección derecha para poder realizar un Cargo a Socio');
      setCargando(false);
      return;
    }

    try {
      const response = await fetch(`/api/pos/cuentas/${cuentaId}/pagar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ metodo_pago: metodoPagoDirecto }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el proceso de cobro');
      }

      // Liquidar deudas seleccionadas en modo directo
      for (const key of Object.keys(deudasSocios)) {
        const clienteId = Number(key);
        if (liquidarDeudaSocio[clienteId] && deudasSocios[clienteId]) {
          const divisionesIds = deudasSocios[clienteId].divisiones.map((x: any) => x.division_id);
          
          let metodoLiquidar = metodoPagoDirecto;
          if (metodoLiquidar === 'CARGO_SOCIO') {
            metodoLiquidar = 'EFECTIVO';
          }

          const resLiq = await fetch(`/api/pos/socios/${clienteId}/cargos/liquidar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              metodo_pago: metodoLiquidar,
              divisionesIds,
            }),
          });
          
          const dataLiq = await resLiq.json();
          if (!resLiq.ok) {
            console.error(`Error al liquidar cargos en modo directo:`, dataLiq.error);
          }
        }
      }

      setPagoExitoso(true);
      setTimeout(() => {
        setPagoExitoso(false);
        setMostrarModalCobro(false);
        setSplitPreview(null);
        clearCart();
        if (areaId) cargarProductos(areaId);
        cargarCadis();
        cargarCuentasPendientes();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Confirmar el cobro dividido final
  const handleConfirmarCobro = async () => {
    if (!cuentaId || !splitPreview) return;
    setCargando(true);
    setErrorMsg('');

    try {
      const payloadPagos = splitPreview.divisiones.map((d: any) => ({
        cliente_id: d.cliente_id,
        monto: d.monto,
        metodo_pago: metodosPago[d.cliente_id] || 'CARGO_SOCIO',
      }));

      const response = await fetch(`/api/pos/cuentas/${cuentaId}/pagar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pagos: payloadPagos }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el proceso de cobro');
      }

      // Liquidar deudas seleccionadas
      for (const d of splitPreview.divisiones) {
        if (liquidarDeudaSocio[d.cliente_id] && deudasSocios[d.cliente_id]) {
          const divisionesIds = deudasSocios[d.cliente_id].divisiones.map((x: any) => x.division_id);
          
          let metodoLiquidar = metodosPago[d.cliente_id];
          if (!metodoLiquidar || metodoLiquidar === 'CARGO_SOCIO') {
            metodoLiquidar = metodosPagoLiquidacion[d.cliente_id] || 'EFECTIVO';
          }

          const resLiq = await fetch(`/api/pos/socios/${d.cliente_id}/cargos/liquidar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              metodo_pago: metodoLiquidar,
              divisionesIds,
            }),
          });
          
          const dataLiq = await resLiq.json();
          if (!resLiq.ok) {
            console.error(`Error al liquidar cargos del socio ${d.nombre}:`, dataLiq.error);
          }
        }
      }

      setPagoExitoso(true);
      setTimeout(() => {
        setPagoExitoso(false);
        setMostrarModalCobro(false);
        setSplitPreview(null);
        clearCart();
        if (areaId) cargarProductos(areaId);
        cargarCadis();
        cargarCuentasPendientes();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarProductoAlCarrito = (prod: any) => {
    const nombreLower = prod.nombre.toLowerCase();
    const esPreparada = nombreLower.includes('prep') || nombreLower.includes('clamato');
    
    if (esPreparada) {
      setProductoPreparadoSeleccionado(prod);
      setBusquedaMezclador('');
      setMostrarModalMezclador(true);
    } else {
      addToCart(prod);
    }
  };

  const handleSeleccionarMezclador = (mezclador: any) => {
    if (!productoPreparadoSeleccionado) return;
    
    // Agregar la bebida preparada
    addToCart(productoPreparadoSeleccionado);
    
    // Agregar el mezclador con precio 0 y un ID único
    const mezcladorModificado = {
      ...mezclador,
      id: `${mezclador.id}-mixer`,
      nombre: `${mezclador.nombre} (Mezclador)`,
      precio_venta: 0,
      precio_unitario: 0,
    };
    addToCart(mezcladorModificado);
    
    setMostrarModalMezclador(false);
    setProductoPreparadoSeleccionado(null);
    setBusquedaMezclador('');
  };

  const handleAgregarSinMezclador = () => {
    if (productoPreparadoSeleccionado) {
      addToCart(productoPreparadoSeleccionado);
    }
    setMostrarModalMezclador(false);
    setProductoPreparadoSeleccionado(null);
    setBusquedaMezclador('');
  };

  // Verificar si hay algún item de descuento en el carrito
  const tieneDescuento = cart.some(item => item.categoria?.toLowerCase() === 'descuentos');

  // Calcular subtotal (suma de todos los productos que no son de la categoría 'descuentos')
  const subtotalLocal = cart
    .filter(item => item.categoria?.toLowerCase() !== 'descuentos')
    .reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);

  // Calcular descuento (30% de los productos sin descuento, si está activado)
  const descuentoLocal = tieneDescuento ? subtotalLocal * 0.30 : 0;

  // Calcular total final
  const totalLocal = subtotalLocal - descuentoLocal;

  // Filtrar productos por búsqueda y por categoría seleccionada
  const productosFiltrados = productos.filter((prod) => {
    // Ocultar del catálogo principal de venta la "Agua Mineral Grande"
    const nombreNormalizado = prod.nombre?.toLowerCase().trim() || '';
    if (nombreNormalizado === 'agua mineral grande') return false;

    // Si no es BAR (areaId === 1), excluir comidas, cenas, desayunos, niños y tacos de guisos
    const categoriaNormalizada = prod.categoria?.toLowerCase().trim() || '';
    const esExcluido = ['comida', 'comidas', 'cenas', 'desayunos', 'niños', 'tacos de guisos'].includes(categoriaNormalizada);
    if (areaId !== 1 && esExcluido) return false;

    if (busquedaProducto.trim() !== '') {
      const q = busquedaProducto.toLowerCase().trim();
      const nombreOk = prod.nombre?.toLowerCase().includes(q);
      const descOk = prod.descripcion?.toLowerCase().includes(q);
      const catOk = prod.categoria?.toLowerCase().includes(q);
      return nombreOk || descOk || catOk;
    }
    if (categoriaSeleccionada === 'TODOS') return true;
    return prod.categoria?.toLowerCase() === categoriaSeleccionada.toLowerCase();
  });

  // Suma de adeudos que se van a cobrar en este momento (tanto en división como en directo)
  const totalAdeudosACobrar = (() => {
    if (!splitPreview) return 0;
    if (splitPreview.divisiones && splitPreview.divisiones.length > 0) {
      return splitPreview.divisiones.reduce((sum: number, d: any) => {
        if (liquidarDeudaSocio[d.cliente_id] && deudasSocios[d.cliente_id]) {
          return sum + deudasSocios[d.cliente_id].total;
        }
        return sum;
      }, 0);
    } else {
      return Object.keys(deudasSocios).reduce((sum: number, key: string) => {
        const clienteId = Number(key);
        if (liquidarDeudaSocio[clienteId] && deudasSocios[clienteId]) {
          return sum + deudasSocios[clienteId].total;
        }
        return sum;
      }, 0);
    }
  })();

  // Filtrar cuentas pendientes según el buscador
  const cuentasPendientesFiltradas = cuentasPendientes.filter((cta) => {
    const query = busquedaPendientes.toLowerCase().trim();
    if (!query) return true;
    return (
      cta.referencia?.toLowerCase().includes(query) ||
      cta.id?.toString().toLowerCase().includes(query) ||
      cta.cadi?.toString().toLowerCase().includes(query) ||
      cta.area?.toLowerCase().includes(query)
    );
  });

  // Filtrar cuentas pagadas según el buscador
  const cuentasPagadasFiltradas = cuentasPagadas.filter((cta) => {
    const query = busquedaPagadas.toLowerCase().trim();
    if (!query) return true;
    return (
      cta.referencia?.toLowerCase().includes(query) ||
      cta.id?.toString().toLowerCase().includes(query) ||
      cta.cadi?.toString().toLowerCase().includes(query) ||
      cta.area?.toLowerCase().includes(query) ||
      cta.pagos?.some((p: any) => p.nombre?.toLowerCase().includes(query) || p.metodo?.toLowerCase().includes(query))
    );
  });

  const totalMasAdeudos = splitPreview ? splitPreview.total + totalAdeudosACobrar : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Sección izquierda y central: Selección de área y catálogo de productos */}
      <div className="lg:col-span-2 space-y-6">
        {/* Banners de Estado del Turno */}
        {!turnoActivo && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex gap-3 text-amber-400">
            <span className="text-xl">⛳</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Caja Cerrada</h4>
              <p className="text-[11px] text-slate-350 mt-1">
                No hay un turno de caja activo para el día de hoy. Abre la caja ingresando el fondo inicial abajo para poder operar en el POS.
              </p>
            </div>
          </div>
        )}

        {turnoActivo && !turnoAbiertoHoy && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex gap-3 text-red-400">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Turno de Caja Rezagado</h4>
              <p className="text-[11px] text-slate-350 mt-1">
                Hay una caja activa abierta en un día anterior (Inició: {new Date(turnoActivo.abierto_at).toLocaleDateString('es-MX')}). Debes realizar el <b>corte de caja</b> en Administración para poder operar hoy.
              </p>
            </div>
          </div>
        )}

        {/* Selector de Áreas Físicas */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Seleccionar Entorno:</h2>
          <div className="flex space-x-2">
            {[
              { id: 1, name: 'Bar 🍺' },
              { id: 2, name: 'Snack 🍔' },
              { id: 3, name: 'Palapa 🌴' },
            ].map((area) => (
              <button
                key={area.id}
                onClick={() => setAreaId(area.id)}
                className={`px-5 py-2.5 btn-premium text-sm ${
                  areaId === area.id
                    ? 'bg-campestre-green text-white font-bold shadow-lg shadow-campestre-green/20'
                    : 'bg-slate-800 text-slate-350 hover:bg-slate-750'
                }`}
              >
                {area.name}
              </button>
            ))}
          </div>
        </div>

        {/* Catálogo de Productos */}
        {!areaId ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 flex flex-col justify-center items-center">
            <span className="text-5xl animate-bounce">⛳</span>
            <h3 className="text-xl font-bold mt-4">Punto de Venta POS</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              Por favor selecciona un área física arriba (Bar, Snack o Palapa) para cargar el catálogo de productos y stock local.
            </p>
          </div>
        ) : !turnoAbiertoHoy ? (
          <div className="glass-card rounded-3xl p-10 text-center border border-slate-800 flex flex-col justify-center items-center bg-slate-900/10">
            <span className="text-5xl animate-pulse mb-2">🔒</span>
            <h3 className="text-lg font-bold text-amber-500/90 mt-4">Punto de Venta Inactivo</h3>
            
            {!turnoActivo ? (
              <div className="mt-4 w-full max-w-sm space-y-4">
                <p className="text-slate-350 text-xs">
                  No hay un turno de caja abierto para el día de hoy. Ingresa el fondo inicial para abrir la caja y comenzar a vender.
                </p>
                <form onSubmit={handleAbrirTurnoPOS} className="space-y-3">
                  <div className="text-left">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Fondo Inicial en Caja ($)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej. 500"
                      value={fondoInicialPOS}
                      onChange={(e) => setFondoInicialPOS(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800/85 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-campestre-green transition-all"
                      required
                      min="0"
                      step="any"
                    />
                  </div>
                  
                  {errorAbrirTurno && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 p-2 rounded-lg">
                      {errorAbrirTurno}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={cargandoAbrirTurno}
                    className="w-full py-3 bg-campestre-green hover:bg-campestre-green/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {cargandoAbrirTurno ? 'Abriendo...' : 'Aperturar Turno en Caja'}
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-slate-400 text-xs mt-2 max-w-md">
                Existe un turno activo de otra fecha ({new Date(turnoActivo.abierto_at).toLocaleDateString('es-MX')}). Se requiere hacer el corte de caja antes de iniciar la jornada de hoy. Solicita a un administrador realizar el arqueo.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-bold Outfit">
                Menú y Productos del Área
              </h3>
              <div className="flex items-center gap-3">
                {/* Buscador de Productos */}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, desc o cat..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-800/80 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-campestre-gold transition-colors"
                  />
                  {busquedaProducto && (
                    <button
                      onClick={() => setBusquedaProducto('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => {
                    cargarProductos(areaId);
                    setBusquedaProducto('');
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Recargar inventario"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Mini-menús (Categorías) */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <button
                onClick={() => setCategoriaSeleccionada('TODOS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  categoriaSeleccionada === 'TODOS'
                    ? 'bg-campestre-gold text-slate-950 shadow-md shadow-campestre-gold/15'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-white'
                }`}
              >
                Todos
              </button>
              {[
                { id: 'descuentos', label: 'Descuentos 🏷️' },
                { id: 'bebidas', label: 'Bebidas 🥤' },
                { id: 'botanas', label: 'Botanas 🍟' },
                { id: 'cenas', label: 'Cenas 🍽️' },
                { id: 'cervezas', label: 'Cervezas 🍺' },
                { id: 'cigarros', label: 'Cigarros 🚬' },
                { id: 'comida', label: 'Comida 🍔' },
                { id: 'desayunos', label: 'Desayunos 🍳' },
                { id: 'niños', label: 'Niños 👦👧' },
                { id: 'ron, brandy y vodka', label: 'Ron/Brandy/Vodka 🥃' },
                { id: 'tacos de guisos', label: 'Tacos de Guisos 🌮' },
                { id: 'tequilas', label: 'Tequilas 🌵' },
                { id: 'whisky', label: 'Whisky 🥃' },
              ].filter((cat) => {
                if (areaId !== 1) {
                  const esExcluido = ['comida', 'comidas', 'cenas', 'desayunos', 'niños', 'tacos de guisos'].includes(cat.id.toLowerCase());
                  return !esExcluido;
                }
                return true;
              }).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSeleccionada(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    categoriaSeleccionada === cat.id
                      ? 'bg-campestre-gold text-slate-950 shadow-md shadow-campestre-gold/15'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {productosFiltrados.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 flex flex-col justify-center items-center">
                <span className="text-4xl animate-bounce">🍽️</span>
                <h4 className="text-sm font-bold text-white mt-4">No hay productos en esta categoría</h4>
                <p className="text-slate-400 text-xs mt-1 max-w-sm">
                  Crea productos asignados a esta categoría desde el panel de administración.
                </p>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {productosFiltrados.map((prod) => {
                    const sinStock = prod.stock <= 0;
                    return (
                      <button
                        key={prod.id}
                        disabled={sinStock}
                        onClick={() => handleAgregarProductoAlCarrito(prod)}
                        className={`glass-card rounded-2xl p-4 border text-left flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                          sinStock 
                            ? 'border-slate-900 opacity-50 cursor-not-allowed'
                            : 'border-slate-800 hover:border-campestre-green/50 active:scale-[0.98]'
                        }`}
                      >
                        {/* Efecto hover */}
                        <div className="absolute inset-0 bg-campestre-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Badge Sin Stock / Categoría */}
                        {sinStock ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-md w-fit mb-3">
                            Sin Disponible
                          </span>
                        ) : (
                          <span className="text-[10px] text-campestre-gold font-semibold uppercase tracking-wider bg-campestre-gold/10 px-2 py-0.5 rounded-md w-fit mb-3">
                            {prod.categoria?.toLowerCase() === 'descuentos' ? '30% de Descuento' : (prod.categoria || 'Común')}
                          </span>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight group-hover:text-campestre-gold transition-colors">{prod.nombre}</h4>
                          <p className="text-xs text-slate-400 mt-1">Stock: <b className={sinStock ? 'text-red-400' : ''}>{prod.stock}</b> pz</p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-800/80">
                          {prod.categoria?.toLowerCase() === 'descuentos' ? (
                            <span className="text-xs font-bold text-emerald-400 Outfit">Aplica 30% a la cuenta</span>
                          ) : (
                            <span className="text-base font-extrabold text-white Outfit">${prod.precio_venta.toFixed(2)}</span>
                          )}
                          {sinStock ? (
                            <span className="p-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold">🚫</span>
                          ) : (
                            <span className="p-1 rounded-lg bg-campestre-green/10 text-campestre-green group-hover:bg-campestre-green group-hover:text-white transition-all">
                              <Plus size={14} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cuentas Pendientes de Pago */}
        <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="text-campestre-gold" size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">
                Cuentas Pendientes (Mesa/Ronda Abiertas)
              </h3>
            </div>
            <button
              type="button"
              onClick={cargarCuentasPendientes}
              className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold border border-slate-700"
            >
              <RefreshCw size={12} className={cargandoCuentas ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>

          {/* Buscador Cuentas Pendientes */}
          {turnoAbiertoHoy && cuentasPendientes.length > 0 && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Buscar por referencia, mesa, socio o ID..."
                value={busquedaPendientes}
                onChange={(e) => setBusquedaPendientes(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-campestre-gold/50 transition-all font-medium"
              />
            </div>
          )}

          {!turnoAbiertoHoy ? (
            <div className="text-center py-6 text-slate-500 bg-slate-900/20 border border-dashed border-slate-800/80 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-500/80">⚠️ Caja Cerrada o del Día Anterior</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {!turnoActivo 
                  ? "Para visualizar cuentas y vender, primero debe aperturar la caja del día."
                  : "Por favor, realice el corte de caja anterior en Administración para operar hoy."}
              </p>
            </div>
          ) : cuentasPendientesFiltradas.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <p className="text-xs">
                {busquedaPendientes.trim() !== '' 
                  ? "No se encontraron cuentas pendientes que coincidan con la búsqueda."
                  : "No hay cuentas pendientes abiertas en el POS."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {cuentasPendientesFiltradas.map((cta) => (
                <div
                  key={cta.id}
                  className={`bg-slate-900/50 border rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition-all ${
                    cuentaId === Number(cta.id)
                      ? 'border-yellow-500/40 bg-yellow-500/5 shadow-md shadow-yellow-500/5'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider block w-fit mb-1.5 ${
                        cta.area_id === 1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : cta.area_id === 2 ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                      }`}>
                        {cta.area}
                      </span>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {cta.referencia}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {cta.cadi ? `Cadi: ${cta.cadi}` : 'Sin Cadi'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-campestre-gold Outfit block">
                        ${cta.total.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-500 block font-mono mt-1">
                        #{cta.id.slice(-6)}
                      </span>
                    </div>
                  </div>

                  {cta.productos.length > 0 && (
                    <div className="text-[9px] text-slate-400 bg-slate-950/40 rounded-lg p-2 max-h-16 overflow-y-auto border border-slate-900">
                      <span className="font-semibold block text-slate-500 mb-0.5 uppercase tracking-wider">Consumo:</span>
                      {cta.productos.map((p: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <span>{p.cantidad}x {p.nombre}</span>
                          <span className="text-slate-300 font-bold">${p.subtotal.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-800/80 pt-2.5">
                    <span>Abierta: {new Date(cta.fecha).toLocaleTimeString('es-MX', { timeStyle: 'short' })}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSeleccionarCuenta(cta)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-700 flex items-center gap-1 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePagarCuentaDirecto(cta)}
                        className="px-2.5 py-1.5 bg-campestre-green hover:bg-campestre-green/90 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cuentas Pagadas (Turno Activo) */}
        <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Check className="text-emerald-400" size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">
                Cuentas Pagadas (Turno Activo)
              </h3>
            </div>
            <button
              type="button"
              onClick={cargarCuentasPagadas}
              className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold border border-slate-700"
            >
              <RefreshCw size={12} className={cargandoPagadas ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>

          {/* Buscador Cuentas Pagadas */}
          {turnoAbiertoHoy && cuentasPagadas.length > 0 && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Buscar por referencia, socio, método de pago o ID..."
                value={busquedaPagadas}
                onChange={(e) => setBusquedaPagadas(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-campestre-gold/50 transition-all font-medium"
              />
            </div>
          )}

          {!turnoAbiertoHoy ? (
            <div className="text-center py-6 text-slate-500 bg-slate-900/20 border border-dashed border-slate-800/80 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-500/80">⚠️ Caja Cerrada o del Día Anterior</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {!turnoActivo 
                  ? "Para visualizar cuentas y vender, primero debe aperturar la caja del día."
                  : "Por favor, realice el corte de caja anterior en Administración para operar hoy."}
              </p>
            </div>
          ) : cuentasPagadasFiltradas.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <p className="text-xs">
                {busquedaPagadas.trim() !== '' 
                  ? "No se encontraron cuentas pagadas que coincidan con la búsqueda."
                  : "No hay cuentas pagadas en el turno activo."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {cuentasPagadasFiltradas.map((cta) => (
                <div
                  key={cta.id}
                  className="bg-slate-900/30 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition-all hover:border-slate-750"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider block w-fit ${
                          cta.area === 'Bar' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : cta.area === 'Snack' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                        }`}>
                          {cta.area}
                        </span>
                        {cta.atendido_por && (
                          <span className="text-[10px] text-slate-400">
                            Vendedor: {cta.atendido_por}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {cta.referencia}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-450 Outfit block">
                        ${cta.total.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-500 block font-mono mt-1">
                        #{cta.id.toString().slice(-6)}
                      </span>
                    </div>
                  </div>

                  {/* Consumo Resumen */}
                  {cta.items && cta.items.length > 0 && (
                    <div className="text-[9px] text-slate-450 bg-slate-950/40 rounded-lg p-2 max-h-16 overflow-y-auto border border-slate-900">
                      <span className="font-semibold block text-slate-550 mb-0.5 uppercase tracking-wider">Consumo:</span>
                      {cta.items.map((itemStr: string, idx: number) => (
                        <div key={idx} className="text-slate-350">
                          {itemStr}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Detalle Pagos */}
                  <div className="text-[9px] space-y-1 bg-slate-950/20 rounded-xl p-2.5 border border-slate-900/60">
                    <span className="font-semibold block text-slate-550 text-[9px] uppercase tracking-wider mb-1">
                      Método de Pago:
                    </span>
                    {cta.pagos.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-slate-300">
                        <span className="truncate max-w-[120px]">{p.nombre}</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                          p.metodo === 'EFECTIVO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                          p.metodo === 'TARJETA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                        }`}>
                          {p.metodo} (${p.monto.toFixed(0)})
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-800/80 pt-2.5">
                    <span>Abierta: {cta.fecha ? new Date(cta.fecha).toLocaleTimeString('es-MX', { timeStyle: 'short' }) : '—'}</span>
                    <button
                      type="button"
                      onClick={() => iniciarEdicionPago(cta)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-lg font-bold border border-slate-700 transition-colors"
                    >
                      Editar Pago
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección derecha: Carrito de Compras, Cadi y Split */}
      <div className="space-y-6">
        <div className="glass-card rounded-3xl border border-slate-800 flex flex-col min-h-[500px]">
          {/* Header Carrito */}
          <div className="p-6 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="text-campestre-gold" size={20} />
                <h3 className="font-extrabold text-base Outfit">Detalle del Pedido</h3>
              </div>
              {cart.length > 0 && !cuentaId && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center space-x-1"
                >
                  <Trash2 size={12} />
                  <span>Vaciar</span>
                </button>
              )}
            </div>
            {cuentaId && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="text-[10px] text-yellow-400">
                  <span className="font-bold uppercase block">Edición Activa</span>
                  <span>Cuenta #{cuentaId.toString().slice(-6)} ({nombreReferencia || 'Sin Ref'})</span>
                </div>
                <button
                  onClick={handleCancelarEdicion}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-350 px-2 py-1 rounded-lg border border-slate-700 transition-colors font-bold"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Lista del Carrito */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[300px]">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-sm">El carrito está vacío</p>
                <p className="text-xs mt-1">Agrega consumos desde el menú</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-slate-800/40 last:border-0">
                  <div className="flex-1 pr-2">
                    <h5 className="text-sm font-semibold text-white line-clamp-1">{item.nombre}</h5>
                    {item.categoria?.toLowerCase() === 'descuentos' ? (
                      <span className="text-xs text-emerald-400 font-bold mt-0.5 block">Aplicado (-${descuentoLocal.toFixed(2)})</span>
                    ) : (
                      <p className="text-xs text-campestre-gold font-medium mt-0.5">${item.precio_venta.toFixed(2)} c/u</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2.5">
                    {item.categoria?.toLowerCase() !== 'descuentos' && (
                      <>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.cantidad - 1)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold text-white w-6 text-center">{item.cantidad}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.cantidad + 1)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Plus size={12} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Asignación de Cadi y Clientes (solo si el carrito tiene productos) */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-900/40 border-t border-slate-800 space-y-4">
              {/* Selección de Cadi */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Asociar a un Cadi:</label>
                  <button
                    onClick={() => setMostrarModalIniciarRonda(true)}
                    className="text-[10px] text-campestre-gold hover:underline font-bold"
                  >
                    + Iniciar Ronda
                  </button>
                </div>
                <select
                  value={cadiId || ''}
                  onChange={(e) => setCadiId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-campestre-gold"
                >
                  <option value="">-- Sin Cadi Asignado --</option>
                  {cadis.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.numero_cadi} - {c.nombre} ({c.clientes.length} socios)
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre de Referencia/Mesa */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Referencia de Mesa / Ubicación:</label>
                <input
                  type="text"
                  placeholder="E.g. Mesa 4, Hoyo 9, Camastro Alberca"
                  value={nombreReferencia}
                  onChange={(e) => setNombreReferencia(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-campestre-gold"
                />
              </div>

              {/* Socios Vinculados */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Socios en Ronda:</span>
                  <div className="flex space-x-2">
                    {!cadiId && (
                      <button
                        onClick={() => setMostrarBuscadorSocios(!mostrarBuscadorSocios)}
                        className="text-[10px] text-campestre-gold hover:underline font-bold"
                      >
                        {mostrarBuscadorSocios ? 'Cerrar Buscador' : '+ Añadir Socio'}
                      </button>
                    )}
                    <button
                      onClick={() => setMostrarModalCrearSocio(true)}
                      className="text-[10px] text-campestre-gold hover:underline font-bold"
                    >
                      + Crear Socio
                    </button>
                  </div>
                </div>

                {/* Buscador de Socios Directo (si no hay Cadi) */}
                {mostrarBuscadorSocios && !cadiId && (
                  <div className="bg-slate-850 p-3 rounded-xl border border-slate-700 space-y-2 mb-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        value={busquedaTexto}
                        onChange={(e) => buscarSocios(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                    {/* Botón Escanear QR */}
                    <button
                      onClick={() => setMostrarSimuladorQR(true)}
                      className="w-full py-1.5 bg-campestre-gold/10 text-campestre-gold hover:bg-campestre-gold/20 text-[10px] font-bold rounded-lg border border-campestre-gold/25"
                    >
                      📷 Simular Escaneo Código QR
                    </button>

                    {/* Resultados buscador */}
                    {sociosBusqueda.length > 0 && (
                      <div className="max-h-24 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg mt-1 text-xs">
                        {sociosBusqueda.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              if (!sociosSeleccionadosCadi.some(x => x.id === s.id)) {
                                setSociosSeleccionadosCadi([...sociosSeleccionadosCadi, s]);
                              }
                              setSociosBusqueda([]);
                              setBusquedaTexto('');
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 border-b border-slate-800 last:border-0 text-white flex justify-between"
                          >
                            <span>{s.nombre}</span>
                            <span className="text-[10px] text-slate-400">{s.codigo_socio}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Mostrar lista de socios asociados */}
                {sociosSeleccionadosCadi.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No hay socios vinculados. Se cobrará a una cuenta global.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {sociosSeleccionadosCadi.map((socio) => (
                      <div key={socio.id} className="flex justify-between items-center bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                        <div className="flex items-center space-x-1.5">
                          <User size={12} className="text-slate-400" />
                          <span className="text-white font-medium truncate max-w-[120px]">{socio.nombre}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-350">{socio.codigo_socio}</span>
                          {!cadiId && (
                            <button
                              onClick={() => setSociosSeleccionadosCadi(sociosSeleccionadosCadi.filter(s => s.id !== socio.id))}
                              className="text-red-400 hover:text-red-300 text-[10px] font-bold"
                            >
                              x
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {cadiId && (
                      <p className="text-[9px] text-emerald-400 flex items-center space-x-1 mt-1 font-medium">
                        <Users size={10} />
                        <span>Split automático activo por Cadi ({sociosSeleccionadosCadi.length} partes).</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Totales y Botón Guardar / Pagar */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-800 space-y-4">
              <div className="space-y-2">
                {tieneDescuento && (
                  <>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-white">${subtotalLocal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                      <span>Descuento Empleado (30%):</span>
                      <span>-${descuentoLocal.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className={`flex justify-between text-base font-extrabold text-white Outfit ${tieneDescuento ? 'border-t border-slate-800/60 pt-2' : ''}`}>
                  <span>Total del Pedido:</span>
                  <span className="gold-gradient-text">${totalLocal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSoloGuardarConsumos}
                  disabled={cargando}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-350 font-bold rounded-xl border border-slate-700 transition-colors text-xs"
                >
                  {cuentaId ? 'Guardar Cambios' : 'Dejar Abierta'}
                </button>
                <button
                  onClick={handleGuardarCuenta}
                  disabled={cargando}
                  className="flex-1 py-3 bg-campestre-green hover:bg-campestre-green/90 text-white font-bold rounded-xl btn-premium shadow-lg shadow-campestre-green/20 text-xs"
                >
                  {cargando ? 'Procesando...' : 'Pagar Cuenta'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DE COBRO --- */}
      {mostrarModalCobro && splitPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-glass p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold Outfit flex items-center space-x-2">
                <Sparkles className="text-campestre-gold" size={18} />
                <span>{splitPreview.divisiones.length > 0 ? 'Cobro con División (Split)' : 'Cobrar Cuenta'}</span>
              </h3>
              {!pagoExitoso && (
                <button
                  onClick={() => setMostrarModalCobro(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  Cerrar
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl text-center font-medium">
                {errorMsg}
              </div>
            )}

            {pagoExitoso ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check size={36} />
                </div>
                <h4 className="text-xl font-bold text-white font-sans">¡Transacción Exitosa!</h4>
                <p className="text-xs text-slate-400">Los stocks se han descontado y el pago fue registrado correctamente.</p>
              </div>
            ) : splitPreview.divisiones.length > 0 ? (
              /* === MODO SPLIT (con socios) === */
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Cadi Asignado:</span>
                    <span className="text-white font-bold">{splitPreview.cadi || 'Sin Cadi'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block font-medium">
                      {totalAdeudosACobrar > 0 ? 'Total a Cobrar (con Adeudos):' : 'Total de la Cuenta:'}
                    </span>
                    <span className="text-campestre-gold font-extrabold text-sm">${totalMasAdeudos.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Distribución del Pago:</span>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {splitPreview.divisiones.map((d: any) => (
                      <div key={d.cliente_id} className="space-y-2.5 p-3.5 bg-slate-850 border border-slate-800 rounded-2xl">
                        {/* Fila principal */}
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-xs font-bold block">{d.nombre}</span>
                            <span className="text-[10px] text-slate-400 block">{d.codigo_socio} • {d.porcentaje.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-extrabold text-white Outfit">${d.monto.toFixed(2)}</span>
                            <select
                              value={metodosPago[d.cliente_id] || 'CARGO_SOCIO'}
                              onChange={(e) => setMetodosPago({ ...metodosPago, [d.cliente_id]: e.target.value })}
                              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:border-campestre-gold outline-none"
                            >
                              <option value="CARGO_SOCIO">Cargo a Socio</option>
                              <option value="TARJETA">Tarjeta Cred/Deb</option>
                              <option value="EFECTIVO">Efectivo</option>
                            </select>
                          </div>
                        </div>

                        {/* Adeudo Info y Opción de Cobro */}
                        {deudasSocios[d.cliente_id] && deudasSocios[d.cliente_id].total > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60 mt-1.5">
                            <div className="text-[10px] text-yellow-400 font-semibold flex items-center gap-1.5">
                              <span>⚠️</span>
                              <span>Debe adeudo de cargos: <b className="text-white">${deudasSocios[d.cliente_id].total.toFixed(2)}</b></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-350 hover:text-white font-medium select-none">
                                <input
                                  type="checkbox"
                                  checked={!!liquidarDeudaSocio[d.cliente_id]}
                                  onChange={(e) => setLiquidarDeudaSocio({ ...liquidarDeudaSocio, [d.cliente_id]: e.target.checked })}
                                  className="rounded border-slate-700 bg-slate-800 text-campestre-gold focus:ring-campestre-gold focus:ring-offset-0"
                                />
                                <span>Cobrar adeudo</span>
                              </label>
                              {liquidarDeudaSocio[d.cliente_id] && (metodosPago[d.cliente_id] === 'CARGO_SOCIO' || !metodosPago[d.cliente_id]) && (
                                <select
                                  value={metodosPagoLiquidacion[d.cliente_id] || 'EFECTIVO'}
                                  onChange={(e) => setMetodosPagoLiquidacion({ ...metodosPagoLiquidacion, [d.cliente_id]: e.target.value })}
                                  className="bg-slate-800 border border-slate-700 text-[10px] text-white rounded px-1.5 py-0.5 outline-none focus:border-campestre-gold"
                                >
                                  <option value="EFECTIVO">Efectivo</option>
                                  <option value="TARJETA">Tarjeta</option>
                                </select>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleConfirmarCobro}
                  disabled={cargando}
                  className="w-full py-3.5 bg-campestre-gold hover:bg-campestre-gold/90 text-slate-950 font-bold rounded-xl btn-premium mt-6 flex justify-center items-center space-x-2 shadow-lg shadow-campestre-gold/20 transition-all active:scale-[0.98]"
                >
                  <CreditCard size={16} />
                  <span>
                    {cargando 
                      ? 'Procesando transacciones...' 
                      : `Pagar $${totalMasAdeudos.toFixed(2)}`
                    }
                  </span>
                </button>
              </div>
            ) : (
              /* === MODO PAGO DIRECTO (sin socios) === */
              <div className="space-y-5">
                <div className="p-4 bg-slate-950 rounded-2xl text-center">
                  <span className="text-slate-400 text-xs block font-medium">Total a Cobrar:</span>
                  <span className="text-3xl font-extrabold text-campestre-gold Outfit mt-1 block">${totalMasAdeudos.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Selecciona Método de Pago:</span>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setMetodoPagoDirecto('EFECTIVO')}
                      className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                        metodoPagoDirecto === 'EFECTIVO'
                          ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl block mb-1">💵</span>
                      <span className={`text-xs font-bold block ${metodoPagoDirecto === 'EFECTIVO' ? 'text-emerald-400' : 'text-slate-300'}`}>Efectivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodoPagoDirecto('TARJETA')}
                      className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                        metodoPagoDirecto === 'TARJETA'
                          ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl block mb-1">💳</span>
                      <span className={`text-xs font-bold block ${metodoPagoDirecto === 'TARJETA' ? 'text-blue-400' : 'text-slate-300'}`}>Tarjeta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetodoPagoDirecto('CARGO_SOCIO')}
                      className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                        metodoPagoDirecto === 'CARGO_SOCIO'
                          ? 'border-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl block mb-1">⛳</span>
                      <span className={`text-xs font-bold block ${metodoPagoDirecto === 'CARGO_SOCIO' ? 'text-yellow-400' : 'text-slate-300'}`}>Cargo Socio</span>
                    </button>
                  </div>
                </div>

                {/* Adeudo Info y Opción de Cobro en Modo Directo */}
                {Object.keys(deudasSocios).map((key) => {
                  const clienteId = Number(key);
                  const deuda = deudasSocios[clienteId];
                  if (deuda && deuda.total > 0) {
                    return (
                      <div key={clienteId} className="space-y-2.5 p-3.5 bg-slate-850 border border-slate-800 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-[10px] text-yellow-400 font-semibold flex items-center gap-1.5">
                            <span>⚠️</span>
                            <span>Debe adeudo de cargos: <b className="text-white">${deuda.total.toFixed(2)}</b></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-350 hover:text-white font-medium select-none">
                              <input
                                type="checkbox"
                                checked={!!liquidarDeudaSocio[clienteId]}
                                onChange={(e) => setLiquidarDeudaSocio({ ...liquidarDeudaSocio, [clienteId]: e.target.checked })}
                                className="rounded border-slate-700 bg-slate-800 text-campestre-gold focus:ring-campestre-gold focus:ring-offset-0"
                              />
                              <span>Cobrar adeudo</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={handleCobroDirecto}
                  disabled={cargando}
                  className={`w-full py-3.5 font-bold rounded-xl btn-premium flex justify-center items-center space-x-2 shadow-lg transition-all ${
                    metodoPagoDirecto === 'EFECTIVO' ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'
                    : metodoPagoDirecto === 'TARJETA' ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'
                    : 'bg-campestre-gold hover:bg-campestre-gold/90 text-slate-950 shadow-campestre-gold/20'
                  }`}
                >
                  <CreditCard size={16} />
                  <span>
                    {cargando 
                      ? 'Procesando...' 
                      : `Cobrar $${totalMasAdeudos.toFixed(2)} con ${metodoPagoDirecto === 'EFECTIVO' ? 'Efectivo' : metodoPagoDirecto === 'TARJETA' ? 'Tarjeta' : 'Cargo a Socio'}`
                    }
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL SIMULADOR QR SOCIO --- */}
      {mostrarSimuladorQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>📷</span>
              <span>Simular Lector QR del POS</span>
            </h4>
            <p className="text-xs text-slate-400">
              Ingresa el token dinámico de QR del socio. Puedes copiar el token desde el portal del cliente para simular el escaneo de la tablet.
            </p>
            <input
              type="text"
              placeholder="Pegar token de QR del socio..."
              value={simularQrToken}
              onChange={(e) => setSimularQrToken(e.target.value)}
              className="w-full input-premium text-xs"
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => setMostrarSimuladorQR(false)}
                className="flex-1 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={procesarEscaneoQRSimulado}
                className="flex-1 py-2 bg-campestre-gold text-slate-950 font-bold rounded-lg text-xs btn-premium"
              >
                Escanear QR
              </button>
            </div>
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 text-center">
              <b>Tokens Demo de QR (del seed):</b>
              <div className="mt-1 font-mono text-[9px]">
                Juan Pérez: <b>juan@socio.com</b> (puedes buscarlo por autocompletar)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDITAR PAGO --- */}
      {mostrarModalEditarPago && cuentaParaEditarPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-glass p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold Outfit flex items-center space-x-2">
                <span>✏️</span>
                <span>Editar Método de Pago</span>
              </h3>
              {!guardandoMetodoPago && (
                <button
                  onClick={() => {
                    setMostrarModalEditarPago(false);
                    setCuentaParaEditarPago(null);
                  }}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  Cerrar
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleActualizarMetodoPago} className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl">
                <span className="text-slate-400 text-xs block">Cuenta:</span>
                <span className="text-sm font-bold text-white block mt-0.5">{cuentaParaEditarPago.referencia}</span>
                <span className="text-xs text-slate-500 block">ID: #{cuentaParaEditarPago.id} • Total: ${cuentaParaEditarPago.total.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Métodos de Pago:</span>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cuentaParaEditarPago.pagos.map((p: any) => {
                    const key = p.cliente_id !== null ? p.cliente_id.toString() : 'directo';
                    return (
                      <div key={key} className="flex justify-between items-center p-3 bg-slate-850 border border-slate-800 rounded-2xl">
                        <div className="flex-1 pr-2">
                          <span className="text-white text-xs font-bold block truncate">{p.nombre}</span>
                          <span className="text-[10px] text-slate-400 block">${p.monto.toFixed(2)}</span>
                        </div>
                        <select
                          value={nuevosMetodosPago[key] || p.metodo}
                          onChange={(e) => setNuevosMetodosPago({ ...nuevosMetodosPago, [key]: e.target.value })}
                          className="bg-slate-850 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:border-campestre-gold outline-none"
                        >
                          <option value="EFECTIVO">Efectivo</option>
                          <option value="TARJETA">Tarjeta</option>
                          <option value="CARGO_SOCIO">Cargo Socio</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={guardandoMetodoPago}
                  onClick={() => {
                    setMostrarModalEditarPago(false);
                    setCuentaParaEditarPago(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoMetodoPago}
                  className="flex-1 py-2.5 bg-campestre-gold hover:bg-campestre-gold/90 text-slate-950 font-bold rounded-xl text-xs btn-premium shadow-lg shadow-campestre-gold/25 transition-colors"
                >
                  {guardandoMetodoPago ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL SELECCIONAR MEZCLADOR --- */}
      {mostrarModalMezclador && productoPreparadoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-glass p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold Outfit text-white flex items-center space-x-2">
                  <Sparkles className="text-campestre-gold" size={18} />
                  <span>Seleccionar Mezclador / Acompañamiento</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Bebida preparada: <b className="text-white">{productoPreparadoSeleccionado.nombre}</b>. Elige un mezclador para descontar su stock (sin costo adicional).
                </p>
              </div>
              <button
                onClick={() => {
                  setMostrarModalMezclador(false);
                  setProductoPreparadoSeleccionado(null);
                }}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                Cerrar
              </button>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-550">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Buscar mezclador (agua mineral, Coca, cerveza)..."
                value={busquedaMezclador}
                onChange={(e) => setBusquedaMezclador(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-955 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-campestre-gold transition-colors"
              />
              {busquedaMezclador && (
                <button
                  type="button"
                  onClick={() => setBusquedaMezclador('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs font-bold font-mono"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {/* Opción 1: Agua Mineral */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">💧 Aguas Minerales</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {productos.filter(p => p.nombre.toLowerCase().includes('agua mineral') && !p.nombre.toLowerCase().includes('prep') && p.stock > 0 && (!busquedaMezclador.trim() || p.nombre.toLowerCase().includes(busquedaMezclador.toLowerCase()))).map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleSeleccionarMezclador(m)}
                      className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-campestre-gold/50 rounded-xl text-left text-xs text-white transition-all flex flex-col justify-between"
                    >
                      <span className="font-bold line-clamp-1">{m.nombre}</span>
                      <span className="text-[9px] text-slate-400 mt-1 font-mono">Stock: {m.stock}</span>
                    </button>
                  ))}
                  {productos.filter(p => p.nombre.toLowerCase().includes('agua mineral') && !p.nombre.toLowerCase().includes('prep') && p.stock > 0 && (!busquedaMezclador.trim() || p.nombre.toLowerCase().includes(busquedaMezclador.toLowerCase()))).length === 0 && (
                    <p className="text-[10px] text-slate-550 italic col-span-3">Sin agua mineral coincidente.</p>
                  )}
                </div>
              </div>

              {/* Opción 2: Refrescos */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">🥤 Refrescos</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {productos.filter(p => p.categoria?.toLowerCase() === 'bebidas' && !p.nombre.toLowerCase().includes('agua') && !p.nombre.toLowerCase().includes('prep') && p.stock > 0 && (!busquedaMezclador.trim() || p.nombre.toLowerCase().includes(busquedaMezclador.toLowerCase()))).map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleSeleccionarMezclador(m)}
                      className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-campestre-gold/50 rounded-xl text-left text-xs text-white transition-all flex flex-col justify-between"
                    >
                      <span className="font-bold line-clamp-1">{m.nombre}</span>
                      <span className="text-[9px] text-slate-400 mt-1 font-mono">Stock: {m.stock}</span>
                    </button>
                  ))}
                  {productos.filter(p => p.categoria?.toLowerCase() === 'bebidas' && !p.nombre.toLowerCase().includes('agua') && !p.nombre.toLowerCase().includes('prep') && p.stock > 0 && (!busquedaMezclador.trim() || p.nombre.toLowerCase().includes(busquedaMezclador.toLowerCase()))).length === 0 && (
                    <p className="text-[10px] text-slate-550 italic col-span-3">Sin refrescos coincidentes.</p>
                  )}
                </div>
              </div>

              {/* Opción 3: Cervezas */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">🍺 Cervezas</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {productos.filter(p => p.categoria?.toLowerCase() === 'cervezas' && !p.nombre.toLowerCase().includes('prep') && p.stock > 0 && (!busquedaMezclador.trim() || p.nombre.toLowerCase().includes(busquedaMezclador.toLowerCase()))).map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleSeleccionarMezclador(m)}
                      className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-campestre-gold/50 rounded-xl text-left text-xs text-white transition-all flex flex-col justify-between"
                    >
                      <span className="font-bold line-clamp-1">{m.nombre}</span>
                      <span className="text-[9px] text-slate-400 mt-1 font-mono">Stock: {m.stock}</span>
                    </button>
                  ))}
                  {productos.filter(p => p.categoria?.toLowerCase() === 'cervezas' && !p.nombre.toLowerCase().includes('prep') && p.stock > 0 && (!busquedaMezclador.trim() || p.nombre.toLowerCase().includes(busquedaMezclador.toLowerCase()))).length === 0 && (
                    <p className="text-[10px] text-slate-550 italic col-span-3">Sin cervezas coincidentes.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setMostrarModalMezclador(false);
                  setProductoPreparadoSeleccionado(null);
                }}
                className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAgregarSinMezclador}
                className="flex-1 py-2.5 bg-campestre-gold hover:bg-campestre-gold/90 text-slate-950 font-bold rounded-xl text-xs btn-premium shadow-lg shadow-campestre-gold/25 transition-colors"
              >
                Agregar sin Mezclador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL REGISTRAR NUEVO SOCIO --- */}
      {mostrarModalCrearSocio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-glass p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold Outfit text-white flex items-center space-x-2">
                <User size={18} className="text-campestre-gold" />
                <span>Registrar Nuevo Socio</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setMostrarModalCrearSocio(false);
                  setCodigoSocioNuevo('');
                  setNombreSocioNuevo('');
                  setEmailSocioNuevo('');
                  setTelefonoSocioNuevo('');
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearSocioRapido} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Código de Socio *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. SOCIO-105"
                  value={codigoSocioNuevo}
                  onChange={e => setCodigoSocioNuevo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-campestre-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Alejandro G. Ruiz"
                  value={nombreSocioNuevo}
                  onChange={e => setNombreSocioNuevo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-campestre-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Email (Opcional)</label>
                <input
                  type="email"
                  placeholder="E.g. alejandro@correo.com"
                  value={emailSocioNuevo}
                  onChange={e => setEmailSocioNuevo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-campestre-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Teléfono (Opcional)</label>
                <input
                  type="text"
                  placeholder="E.g. 555-019-2834"
                  value={telefonoSocioNuevo}
                  onChange={e => setTelefonoSocioNuevo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-campestre-gold"
                />
              </div>

              <div className="flex space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalCrearSocio(false);
                    setCodigoSocioNuevo('');
                    setNombreSocioNuevo('');
                    setEmailSocioNuevo('');
                    setTelefonoSocioNuevo('');
                  }}
                  className="flex-1 py-2.5 bg-slate-855 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 py-2.5 bg-campestre-gold hover:bg-campestre-gold/90 text-slate-950 font-bold rounded-xl text-xs btn-premium shadow-lg shadow-campestre-gold/25 transition-colors"
                >
                  {cargando ? 'Registrando...' : 'Registrar Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL INICIAR RONDA --- */}
      {mostrarModalIniciarRonda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-glass p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold Outfit text-white flex items-center space-x-2">
                <Users size={18} className="text-campestre-gold" />
                <span>Iniciar Ronda de Golf (Asignar Cadi)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setMostrarModalIniciarRonda(false);
                  setCadiSeleccionadoRonda('');
                  setSociosSeleccionadosRonda([]);
                  setBusquedaSocioRonda('');
                  setResultadosSocioRonda([]);
                  setMostrarFormCrearCadiInterno(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Sección Cadi */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cadi de la Ronda:</span>
                  {!mostrarFormCrearCadiInterno && (
                    <button
                      type="button"
                      onClick={() => setMostrarFormCrearCadiInterno(true)}
                      className="text-[10px] text-campestre-gold hover:underline font-bold"
                    >
                      + Registrar Nuevo Cadi
                    </button>
                  )}
                </div>

                {mostrarFormCrearCadiInterno ? (
                  <form onSubmit={handleCrearCadiRapido} className="space-y-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-300 block uppercase font-Outfit">Nuevo Cadi</span>
                    <div>
                      <label className="block text-[9px] font-medium text-slate-400 mb-0.5">Código/Número de Cadi *</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. CADI-105"
                        value={numeroCadiNuevo}
                        onChange={e => setNumeroCadiNuevo(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-campestre-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-medium text-slate-400 mb-0.5">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. Pedro Juárez"
                        value={nombreCadiNuevo}
                        onChange={e => setNombreCadiNuevo(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-campestre-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-medium text-slate-400 mb-0.5">Teléfono (Opcional)</label>
                      <input
                        type="text"
                        placeholder="E.g. 555-888-2938"
                        value={telefonoCadiNuevo}
                        onChange={e => setTelefonoCadiNuevo(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-campestre-gold"
                      />
                    </div>
                    <div className="flex space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarFormCrearCadiInterno(false);
                          setNumeroCadiNuevo('');
                          setNombreCadiNuevo('');
                          setTelefonoCadiNuevo('');
                        }}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 font-bold rounded-lg text-[10px] transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={cargando}
                        className="flex-1 py-1.5 bg-campestre-gold hover:bg-campestre-gold/90 text-slate-950 font-bold rounded-lg text-[10px] transition-colors"
                      >
                        Guardar Cadi
                      </button>
                    </div>
                  </form>
                ) : (
                  <select
                    value={cadiSeleccionadoRonda}
                    onChange={e => setCadiSeleccionadoRonda(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-campestre-gold"
                  >
                    <option value="">-- Seleccionar Cadi Disponible --</option>
                    {todosLosCadis
                      .filter(c => c.estado === 'DISPONIBLE' || c.id.toString() === cadiSeleccionadoRonda)
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.numero_cadi} - {c.nombre}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Sección Socios */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Socios de esta Ronda:</label>
                  <button
                    type="button"
                    onClick={() => setMostrarModalCrearSocio(true)}
                    className="text-[10px] text-campestre-gold hover:underline font-bold"
                  >
                    + Registrar Nuevo Socio
                  </button>
                </div>

                {/* Buscador de Socios */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Buscar socio por nombre o ID..."
                    value={busquedaSocioRonda}
                    onChange={e => buscarSocioParaRonda(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-campestre-gold"
                  />

                  {resultadosSocioRonda.length > 0 && (
                    <div className="absolute left-0 right-0 max-h-36 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl mt-1 text-xs z-10 shadow-lg pr-1">
                      {resultadosSocioRonda.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            if (!sociosSeleccionadosRonda.some(x => x.id === s.id)) {
                              setSociosSeleccionadosRonda([...sociosSeleccionadosRonda, s]);
                            }
                            setResultadosSocioRonda([]);
                            setBusquedaSocioRonda('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800 border-b border-slate-850 last:border-0 text-white flex justify-between items-center"
                        >
                          <span className="font-medium">{s.nombre}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">{s.codigo_socio}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Socios Seleccionados */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto bg-slate-950/50 p-3 rounded-2xl border border-slate-850">
                  {sociosSeleccionadosRonda.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic text-center py-2">Ningún socio seleccionado aún.</p>
                  ) : (
                    sociosSeleccionadosRonda.map(s => (
                      <div key={s.id} className="flex justify-between items-center bg-slate-900/80 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-xs">
                        <span className="text-white font-medium truncate max-w-[200px]">{s.nombre}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] bg-slate-850 px-2 py-0.5 rounded text-slate-400">{s.codigo_socio}</span>
                          <button
                            type="button"
                            onClick={() => setSociosSeleccionadosRonda(sociosSeleccionadosRonda.filter(x => x.id !== s.id))}
                            className="text-red-400 hover:text-red-300 font-bold px-1"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalIniciarRonda(false);
                    setCadiSeleccionadoRonda('');
                    setSociosSeleccionadosRonda([]);
                    setBusquedaSocioRonda('');
                    setResultadosSocioRonda([]);
                    setMostrarFormCrearCadiInterno(false);
                  }}
                  className="flex-1 py-2.5 bg-slate-855 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleIniciarRondaPOS}
                  disabled={cargando || !cadiSeleccionadoRonda || sociosSeleccionadosRonda.length === 0}
                  className="flex-1 py-2.5 bg-campestre-gold hover:bg-campestre-gold/90 text-slate-950 font-bold rounded-xl text-xs btn-premium shadow-lg shadow-campestre-gold/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? 'Iniciando...' : 'Iniciar Ronda'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
