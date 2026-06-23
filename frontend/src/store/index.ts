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
  clearCart: () => void;
  setCuentaId: (id: number | null) => void;
  setCuentaDetalle: (detalle: any | null) => void;
  setSplitPreview: (split: any | null) => void;
  setSocketConnected: (connected: boolean) => void;
}

export const useStore = create<POSState>((set) => ({
  token: localStorage.getItem('campestre_token'),
  user: JSON.parse(localStorage.getItem('campestre_user') || 'null'),
  socio: JSON.parse(localStorage.getItem('campestre_socio') || 'null'),
  userType: localStorage.getItem('campestre_user_type') as 'INTERNAL' | 'CLIENT' | null,
  areaId: null,
  cadiId: null,
  nombreReferencia: '',
  productos: [],
  cart: [],
  cuentaId: null,
  cuentaDetalle: null,
  splitPreview: null,
  socketConnected: false,

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

  setAreaId: (areaId) => set({ areaId, cart: [], cuentaId: null, cuentaDetalle: null, cadiId: null }),
  setCadiId: (cadiId) => set({ cadiId }),
  setNombreReferencia: (nombreReferencia) => set({ nombreReferencia }),
  setProductos: (productos) => set({ productos }),
  
  addToCart: (producto) => set((state) => {
    const existing = state.cart.find((item) => item.id === producto.id);
    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        ),
      };
    }
    return {
      cart: [...state.cart, { id: producto.id, nombre: producto.nombre, precio_venta: producto.precio_venta, cantidad: 1, categoria: producto.categoria }],
    };
  }),

  removeFromCart: (productoId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== productoId),
  })),

  updateCartQuantity: (productoId, cantidad) => set((state) => ({
    cart: state.cart.map((item) =>
      item.id === productoId ? { ...item, cantidad: Math.max(0.01, cantidad) } : item
    ),
  })),

  clearCart: () => set({ cart: [], cadiId: null, nombreReferencia: '', cuentaId: null, cuentaDetalle: null, splitPreview: null }),
  setCuentaId: (cuentaId) => set({ cuentaId }),
  setCuentaDetalle: (cuentaDetalle) => set({ cuentaDetalle }),
  setSplitPreview: (splitPreview) => set({ splitPreview }),
  setSocketConnected: (socketConnected) => set({ socketConnected }),
}));
