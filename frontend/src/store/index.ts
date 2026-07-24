import { create } from 'zustand';

interface User {
  id: number;
  username?: string;
  nombre: string;
  email?: string;
  roles?: string[];
}

interface Socio {
  id: number;
  codigo_socio: string;
  nombre: string;
  email: string;
}

interface CartItem {
  id: number | string;
  nombre: string;
  precio_venta: number;
  cantidad: number;
  categoria?: string;
  precio_unitario?: number;
  notas?: string;
  guardado?: boolean;
  esNuevo?: boolean;
  created_at?: string;
  detalle_id?: number;
}

interface POSState {
  token: string | null;
  user: User | null;
  socio: Socio | null;
  userType: 'INTERNAL' | 'CLIENT' | null;
  areaId: number | null;
  cadiId: number | null;
  nombreReferencia: string;
  productos: any[];
  cart: CartItem[];
  cuentaId: number | null;
  cuentaDetalle: any | null;
  splitPreview: any | null;
  socketConnected: boolean;
  tema: 'oscuro' | 'claro';
  toggleTema: () => void;
  currentView: 'pos' | 'cargos' | 'dividir-cadi' | 'admin' | 'stock' | 'insumos' | 'ventas-turno';
  setCurrentView: (view: 'pos' | 'cargos' | 'dividir-cadi' | 'admin' | 'stock' | 'insumos' | 'ventas-turno') => void;
  sociosSeleccionados: any[];
  setSociosSeleccionados: (socios: any[]) => void;

  // Acciones
  setSession: (token: string, data: any, type: 'INTERNAL' | 'CLIENT') => void;
  logout: () => void;
  setAreaId: (areaId: number | null) => void;
  setCadiId: (cadiId: number | null) => void;
  setNombreReferencia: (ref: string) => void;
  setProductos: (productos: any[]) => void;
  addToCart: (producto: any) => void;
  removeFromCart: (productoId: number | string) => void;
  updateCartQuantity: (productoId: number | string, cantidad: number) => void;
  updateCartNotes: (productoId: number | string, notas: string) => void;
  clearCart: () => void;
  setCuentaId: (id: number | null) => void;
  setCuentaDetalle: (detalle: any | null) => void;
  setSplitPreview: (split: any | null) => void;
  setSocketConnected: (connected: boolean) => void;
}

const loadSavedCart = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem('campestre_active_cart') || '[]');
  } catch {
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem('campestre_active_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Error guardando borrador del carrito:', e);
  }
};

export const useStore = create<POSState>((set) => ({
  token: localStorage.getItem('campestre_token'),
  user: JSON.parse(localStorage.getItem('campestre_user') || 'null'),
  socio: JSON.parse(localStorage.getItem('campestre_socio') || 'null'),
  userType: localStorage.getItem('campestre_user_type') as 'INTERNAL' | 'CLIENT' | null,
  areaId: localStorage.getItem('campestre_area_id') ? Number(localStorage.getItem('campestre_area_id')) : null,
  cadiId: localStorage.getItem('campestre_cadi_id') ? Number(localStorage.getItem('campestre_cadi_id')) : null,
  nombreReferencia: localStorage.getItem('campestre_nombre_referencia') || '',
  productos: [],
  cart: loadSavedCart(),
  cuentaId: localStorage.getItem('campestre_cuenta_id') ? Number(localStorage.getItem('campestre_cuenta_id')) : null,
  cuentaDetalle: null,
  splitPreview: null,
  socketConnected: false,
  tema: (localStorage.getItem('campestre_tema') as 'oscuro' | 'claro') || 'oscuro',
  currentView: 'pos',
  setCurrentView: (currentView) => set({ currentView }),
  sociosSeleccionados: [],
  setSociosSeleccionados: (sociosSeleccionados) => set({ sociosSeleccionados }),

  setSession: (token, data, type) => {
    localStorage.setItem('campestre_token', token);
    localStorage.setItem('campestre_user_type', type);
    if (type === 'INTERNAL') {
      localStorage.setItem('campestre_user', JSON.stringify(data));
      set({ token, user: data, userType: type, socio: null });
    } else {
      localStorage.setItem('campestre_socio', JSON.stringify(data));
      set({ token, socio: data, userType: type, user: null });
    }
  },

  logout: () => {
    localStorage.removeItem('campestre_token');
    localStorage.removeItem('campestre_user_type');
    localStorage.removeItem('campestre_user');
    localStorage.removeItem('campestre_socio');
    localStorage.removeItem('campestre_area_id');
    localStorage.removeItem('campestre_cadi_id');
    localStorage.removeItem('campestre_nombre_referencia');
    localStorage.removeItem('campestre_cuenta_id');
    localStorage.removeItem('campestre_active_cart');
    set({
      token: null,
      user: null,
      socio: null,
      userType: null,
      areaId: null,
      cadiId: null,
      nombreReferencia: '',
      cart: [],
      cuentaId: null,
      cuentaDetalle: null,
      splitPreview: null,
    });
  },

  setAreaId: (areaId) => {
    if (areaId === null) {
      localStorage.removeItem('campestre_area_id');
    } else {
      localStorage.setItem('campestre_area_id', String(areaId));
    }
    localStorage.removeItem('campestre_cadi_id');
    localStorage.removeItem('campestre_nombre_referencia');
    localStorage.removeItem('campestre_cuenta_id');
    localStorage.removeItem('campestre_active_cart');
    set({ areaId, cart: [], cuentaId: null, cuentaDetalle: null, cadiId: null, nombreReferencia: '' });
  },

  setCadiId: (cadiId) => {
    if (cadiId === null) localStorage.removeItem('campestre_cadi_id');
    else localStorage.setItem('campestre_cadi_id', String(cadiId));
    set({ cadiId });
  },

  setNombreReferencia: (nombreReferencia) => {
    if (!nombreReferencia) localStorage.removeItem('campestre_nombre_referencia');
    else localStorage.setItem('campestre_nombre_referencia', nombreReferencia);
    set({ nombreReferencia });
  },

  setProductos: (productos) => set({ productos }),
  
  addToCart: (producto) => set((state) => {
    const existing = state.cart.find((item) => item.id === producto.id);
    let newCart: CartItem[];
    if (existing) {
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      newCart = state.cart.map((item) => {
        if (item.id === producto.id) {
          const currentNotes = item.notas ? item.notas.trim() : '';
          const newNotes = currentNotes 
            ? `${currentNotes} | +1 @ ${timeStr}`
            : `+1 @ ${timeStr}`;
          return {
            ...item,
            cantidad: item.cantidad + 1,
            notas: newNotes,
            esNuevo: true
          };
        }
        return item;
      });
    } else {
      newCart = [
        { id: producto.id, nombre: producto.nombre, precio_venta: producto.precio_venta, cantidad: 1, categoria: producto.categoria, guardado: false, esNuevo: true, created_at: new Date().toISOString() },
        ...state.cart
      ];
    }
    saveCartToStorage(newCart);
    return { cart: newCart };
  }),

  removeFromCart: (productoId) => set((state) => {
    const newCart = state.cart.filter((item) => item.id !== productoId);
    saveCartToStorage(newCart);
    return { cart: newCart };
  }),

  updateCartQuantity: (productoId, cantidad) => set((state) => {
    const newCart = state.cart.map((item) =>
      item.id === productoId ? { ...item, cantidad: Math.max(0.01, cantidad) } : item
    );
    saveCartToStorage(newCart);
    return { cart: newCart };
  }),

  updateCartNotes: (productoId, notas) => set((state) => {
    const newCart = state.cart.map((item) =>
      item.id === productoId ? { ...item, notas } : item
    );
    saveCartToStorage(newCart);
    return { cart: newCart };
  }),

  clearCart: () => {
    localStorage.removeItem('campestre_cadi_id');
    localStorage.removeItem('campestre_nombre_referencia');
    localStorage.removeItem('campestre_cuenta_id');
    localStorage.removeItem('campestre_active_cart');
    set({ cart: [], cadiId: null, nombreReferencia: '', cuentaId: null, cuentaDetalle: null, splitPreview: null });
  },

  setCuentaId: (cuentaId) => {
    if (cuentaId === null) localStorage.removeItem('campestre_cuenta_id');
    else localStorage.setItem('campestre_cuenta_id', String(cuentaId));
    set({ cuentaId });
  },

  setCuentaDetalle: (cuentaDetalle) => set({ cuentaDetalle }),
  setSplitPreview: (splitPreview) => set({ splitPreview }),
  setSocketConnected: (socketConnected) => set({ socketConnected }),
  toggleTema: () => set((state) => {
    const nuevo = state.tema === 'oscuro' ? 'claro' : 'oscuro';
    localStorage.setItem('campestre_tema', nuevo);
    document.documentElement.classList.toggle('tema-claro', nuevo === 'claro');
    return { tema: nuevo };
  }),
}));
