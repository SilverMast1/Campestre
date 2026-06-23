import React, { useState } from 'react';
import { useStore } from './store';
import POSView from './views/POSView';
import SocioView from './views/SocioView';
import AdminView from './views/AdminView';
import CargosSociosView from './views/CargosSociosView';
import StockView from './views/StockView';
import InsumosView from './views/InsumosView';
import DividirCadiView from './views/DividirCadiView';
import VentasTurnoView from './views/VentasTurnoView';
import { Shield, Users, LogOut, Menu, UserCheck, Lock } from 'lucide-react';
import Logo from './components/Logo';

function App() {
  const { token, userType, user, socio, logout, setSession } = useStore();
  const [activeTab, setActiveTab] = useState<'login-vendedor' | 'login-socio' | 'registro-socio'>('login-vendedor');
  const [currentInternalView, setCurrentInternalView] = useState<'pos' | 'cargos' | 'dividir-cadi' | 'admin' | 'stock' | 'insumos' | 'ventas-turno'>('pos');
  const isAdmin = userType === 'INTERNAL' && user?.roles?.includes('ADMIN');

  // Estados de formularios
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [codigoSocio, setCodigoSocio] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!token) {
      setCurrentInternalView('pos');
    }
  }, [token]);

  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const handleNombreChange = async (val: string) => {
    setNombre(val);
    if (val.length >= 2) {
      try {
        const response = await fetch(`/api/auth/socios/buscar?q=${encodeURIComponent(val)}`);
        if (response.ok) {
          const data = await response.json();
          setSugerencias(data);
          setMostrarSugerencias(true);
        }
      } catch (err) {
        console.error('Error fetching socio suggestions:', err);
      }
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  const handleLoginVendedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login-interno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fallo de autenticación');
      }

      setSession(data.token, data.usuario, 'INTERNAL');
      setSuccess('Sesión iniciada correctamente');
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  const handleLoginSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fallo de autenticación');
      }

      setSession(data.token, data.cliente, 'CLIENT');
      setSuccess('Sesión iniciada correctamente');
      setNombre('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Si no está autenticado, mostrar portal de accesos (Login/Registro)
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
        {/* Decoración de fondo premium estilo golf */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-campestre-green/10 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-campestre-gold/5 blur-[100px] animate-pulse-slow"></div>

        <div className="w-full max-w-md glass-card rounded-3xl shadow-glass p-8 relative z-10">
          <div className="text-center mb-6">
            <Logo size="lg" className="mx-auto" />
            <p className="text-slate-400 text-xs mt-2">POS & Portal de Gestión de Socios</p>
          </div>

          {/* Pestanas de acceso */}
          <div className="flex border-b border-slate-800 mb-6 bg-slate-900/50 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('login-vendedor'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg btn-premium ${
                activeTab === 'login-vendedor'
                  ? 'bg-campestre-green text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vendedores
            </button>
            <button
              onClick={() => { setActiveTab('login-socio'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg btn-premium ${
                activeTab === 'login-socio'
                  ? 'bg-campestre-gold text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Socios Log-In
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl mb-4 text-center font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2.5 rounded-xl mb-4 text-center font-medium">
              {success}
            </div>
          )}

          {/* Formulario 1: Login Vendedores / Admin */}
          {activeTab === 'login-vendedor' && (
            <form onSubmit={handleLoginVendedor} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Usuario del Sistema</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Shield size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 input-premium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Contraseña</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 input-premium"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-campestre-green hover:bg-campestre-green/90 text-white font-bold rounded-xl btn-premium mt-6 shadow-lg shadow-campestre-green/20"
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión POS'}
              </button>
            </form>
          )}

          {/* Formulario 2: Login Socios (Simplificado por Nombre) */}
          {activeTab === 'login-socio' && (
            <form onSubmit={handleLoginSocio} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre Completo del Socio</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Users size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Juan Pérez García"
                    value={nombre}
                    onChange={(e) => handleNombreChange(e.target.value)}
                    onFocus={() => {
                      if (nombre.length >= 2) {
                        setMostrarSugerencias(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                    className="w-full pl-10 input-premium"
                  />
                  {mostrarSugerencias && sugerencias.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-lg max-h-40 overflow-y-auto divide-y divide-slate-800">
                      {sugerencias.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setNombre(s.nombre);
                            setSugerencias([]);
                            setMostrarSugerencias(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-800 text-slate-350 hover:text-white transition-colors flex justify-between items-center"
                        >
                          <span className="font-semibold">{s.nombre}</span>
                          <span className="text-[10px] text-campestre-gold font-mono">#{s.codigo_socio}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-campestre-gold hover:bg-campestre-gold/90 text-slate-950 font-bold rounded-xl btn-premium mt-6 shadow-lg shadow-campestre-gold/20"
              >
                {loading ? 'Ingresando...' : 'Ingresar a mi Portal'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- NAVEGACIÓN Y PANTALLAS PRINCIPALES PARA USUARIOS AUTENTICADOS ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Premium */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="sm" className="hidden sm:block" />
            <div>
              <span className="font-extrabold text-sm tracking-tight Outfit block sm:hidden">
                CCL <span className="gold-gradient-text">Lourdes</span>
              </span>
              <span className="text-[9px] text-slate-400 tracking-wider uppercase block">
                {userType === 'INTERNAL' ? 'Punto de Venta POS' : 'Portal del Socio'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <span className="text-xs text-slate-400 block">Bienvenido,</span>
              <span className="text-sm font-semibold text-white">
                {userType === 'INTERNAL' ? user?.nombre : socio?.nombre}
              </span>
            </div>
            
            {userType === 'INTERNAL' && user?.roles?.includes('ADMIN') && (
              <span className="bg-campestre-gold/10 text-campestre-gold text-[10px] font-bold px-2.5 py-1 rounded-full border border-campestre-gold/20 uppercase tracking-wider">
                Admin
              </span>
            )}
            
            {userType === 'INTERNAL' && !user?.roles?.includes('ADMIN') && (
              <span className="bg-campestre-green/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-campestre-green/20 uppercase tracking-wider">
                Vendedor
              </span>
            )}

            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-400 btn-premium"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Renderizado de vistas según tipo de usuario */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {userType === 'INTERNAL' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl w-fit border border-slate-800 gap-1">
              <button
                onClick={() => setCurrentInternalView('pos')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg btn-premium transition-all ${
                  currentInternalView === 'pos' ? 'bg-campestre-green text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Punto de Venta (POS)
              </button>
              <button
                onClick={() => setCurrentInternalView('cargos')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg btn-premium transition-all ${
                  currentInternalView === 'cargos' ? 'bg-campestre-gold text-slate-950 shadow-sm' : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                Cargos a Socios
              </button>
              <button
                onClick={() => setCurrentInternalView('dividir-cadi')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg btn-premium transition-all ${
                  currentInternalView === 'dividir-cadi' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                Dividir Cuentas (Cadi)
              </button>
              <button
                onClick={() => setCurrentInternalView('ventas-turno')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg btn-premium transition-all ${
                  currentInternalView === 'ventas-turno' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                Ventas de Turno
              </button>
              {isAdmin ? (
                <>
                  <button
                    onClick={() => setCurrentInternalView('admin')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg btn-premium transition-all ${
                      currentInternalView === 'admin' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    Gestión Administrativa
                  </button>
                  <button
                    onClick={() => setCurrentInternalView('stock')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg btn-premium transition-all ${
                      currentInternalView === 'stock' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    Inventario y Stock
                  </button>
                  <button
                    onClick={() => setCurrentInternalView('insumos')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg btn-premium transition-all ${
                      currentInternalView === 'insumos' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    Insumos de Comida
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCurrentInternalView('admin')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg btn-premium transition-all ${
                    currentInternalView === 'admin' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  Corte de Caja
                </button>
              )}
            </div>

            {currentInternalView === 'pos' && <POSView />}
            {currentInternalView === 'cargos' && <CargosSociosView />}
            {currentInternalView === 'dividir-cadi' && <DividirCadiView />}
            {currentInternalView === 'ventas-turno' && <VentasTurnoView />}
            {currentInternalView === 'admin' && <AdminView />}
            {isAdmin && currentInternalView === 'stock' && <StockView />}
            {isAdmin && currentInternalView === 'insumos' && <InsumosView />}
          </div>
        ) : (
          // Socio va a la vista de socio
          <SocioView />
        )}
      </main>
    </div>
  );
}

export default App;
