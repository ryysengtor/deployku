import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'landing' | 'home' | 'product' | 'checkout' | 'payment' | 'transaction' | 'check-transaction' | 'admin';
export type ThemeSlug = 'craig-of-the-creek' | 'cartoon-network' | 'adventure-cartoon' | 'forest-cartoon' | 'night-adventure';

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  variantLabel: string;
  price: number;
  quantity: number;
}

export interface PaymentInfo {
  transactionId: string;
  cashifyTransactionId?: string;
  amount: number;
  totalAmount: number;
  uniqueNominal: number;
  paymentMethod: string;
  qrString?: string;
  status: string;
  expiredAt?: string;
}

interface StoreState {
  // Navigation
  currentView: ViewMode;
  setView: (view: ViewMode) => void;

  // Selected product
  selectedProductId: string | null;
  setSelectedProduct: (id: string | null) => void;

  // Cart / Checkout
  cartItem: CartItem | null;
  setCartItem: (item: CartItem | null) => void;

  // Customer info
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;

  // Payment
  paymentInfo: PaymentInfo | null;
  setPaymentInfo: (info: PaymentInfo | null | ((prev: PaymentInfo | null) => PaymentInfo | null)) => void;

  // Theme
  currentTheme: ThemeSlug;
  setTheme: (theme: ThemeSlug) => void;

  // Admin
  isAdminAuth: boolean;
  setAdminAuth: (auth: boolean) => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;
  adminSidebarOpen: boolean;
  setAdminSidebarOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Voucher
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  voucherDiscount: number;
  setVoucherDiscount: (discount: number) => void;

  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Landing page visited
  hasVisitedLanding: boolean;
  setHasVisitedLanding: (visited: boolean) => void;

  // Site settings from API
  siteName: string;
  setSiteName: (name: string) => void;
  siteSlogan: string;
  setSiteSlogan: (slogan: string) => void;

  // Hydration flag - to know when persisted state has been loaded
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      currentView: 'home',
      setView: (view) => set({ currentView: view }),

      selectedProductId: null,
      setSelectedProduct: (id) => set({ selectedProductId: id }),

      cartItem: null,
      setCartItem: (item) => set({ cartItem: item }),

      customerName: '',
      setCustomerName: (name) => set({ customerName: name }),

      customerPhone: '',
      setCustomerPhone: (phone) => set({ customerPhone: phone }),

      paymentInfo: null,
      setPaymentInfo: (info) => {
        if (typeof info === 'function') {
          set((state) => ({ paymentInfo: info(state.paymentInfo) }));
        } else {
          set({ paymentInfo: info });
        }
      },

      currentTheme: 'craig-of-the-creek',
      setTheme: (theme) => set({ currentTheme: theme }),

      isAdminAuth: false,
      setAdminAuth: (auth) => set({ isAdminAuth: auth }),

      adminTab: 'dashboard',
      setAdminTab: (tab) => set({ adminTab: tab }),

      adminSidebarOpen: false,
      setAdminSidebarOpen: (open) => set({ adminSidebarOpen: open }),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      selectedCategory: 'all',
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      voucherCode: '',
      setVoucherCode: (code) => set({ voucherCode: code }),

      voucherDiscount: 0,
      setVoucherDiscount: (discount) => set({ voucherDiscount: discount }),

      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      hasVisitedLanding: false,
      setHasVisitedLanding: (visited) => set({ hasVisitedLanding: visited }),

      siteName: 'Craig Of the Creek',
      setSiteName: (name) => set({ siteName: name }),

      siteSlogan: 'Digital Store Cartoon Network Style',
      setSiteSlogan: (slogan) => set({ siteSlogan: slogan }),

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'craig-store-persist',
      partialize: (state) => ({
        currentView: state.currentView,
        selectedProductId: state.selectedProductId,
        cartItem: state.cartItem,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        paymentInfo: state.paymentInfo,
        currentTheme: state.currentTheme,
        isAdminAuth: state.isAdminAuth,
        adminTab: state.adminTab,
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        voucherCode: state.voucherCode,
        voucherDiscount: state.voucherDiscount,
        hasVisitedLanding: state.hasVisitedLanding,
        siteName: state.siteName,
        siteSlogan: state.siteSlogan,
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('Zustand persist rehydration error:', error);
          }
          // Always mark as hydrated after rehydration attempt,
          // even if it failed - this prevents getting stuck on loading screen
          useStore.setState({ _hasHydrated: true });
        };
      },
    }
  )
);
