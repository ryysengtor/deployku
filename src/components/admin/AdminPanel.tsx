'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Tags, Zap, Ticket, Bell, CreditCard,
  Users, Image, Settings, Globe, Palette, Layout, LogOut, Plus, Trash2,
  Edit, Check, X, Upload, Eye, ChevronRight, Menu, Lock, BarChart3,
  DollarSign, Save, MessageSquare, Send, QrCode
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import FileUpload from '@/components/admin/FileUpload';

/* ============================================================
   TYPES
   ============================================================ */

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  variants: { name: string; options: { label: string; price: number; stock: number }[] }[];
  isActive: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleEndTime?: string;
  deliveryType?: string;
  downloadLink?: string;
  digitalFile?: string;
  gdriveLink?: string;
  accessInstructions?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface Banner {
  _id: string;
  title: string;
  image: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
}

interface Voucher {
  _id: string;
  code: string;
  discountType: string;
  discount: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

interface DashboardStats {
  totalTransactions: number;
  totalRevenue: number;
  pendingCount: number;
  todayCount: number;
}

interface ThemeData {
  _id: string;
  name: string;
  slug: string;
  colors: Record<string, string>;
  effects: Record<string, boolean>;
  isActive: boolean;
}

/* ============================================================
   SIDEBAR NAV ITEMS
   ============================================================ */

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'produk', label: 'Produk', icon: ShoppingBag },
  { id: 'kategori', label: 'Kategori', icon: Tags },
  { id: 'flash-sale', label: 'Flash Sale', icon: Zap },
  { id: 'voucher', label: 'Voucher', icon: Ticket },
  { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'kelola-admin', label: 'Kelola Admin', icon: Users },
  { id: 'banner-logo', label: 'Banner & Logo', icon: Image },
  { id: 'pengaturan', label: 'Pengaturan Website', icon: Settings },
  { id: 'sosmed', label: 'Sosmed', icon: Globe },
  { id: 'tema', label: 'Tema Website', icon: Palette },
  { id: 'landing', label: 'Landing Page Setting', icon: Layout },
] as const;

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function AdminPanel() {
  const {
    setView, isAdminAuth, setAdminAuth, adminTab, setAdminTab,
    adminSidebarOpen, setAdminSidebarOpen, currentTheme, setTheme,
  } = useStore();

  // ---------- state ----------
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', image: '', price: 0, category: '',
    variants: [{ name: 'Default', options: [{ label: 'Default', price: 0, stock: 999 }] }],
    isActive: true, isFlashSale: false, flashSalePrice: 0, flashSaleEndTime: '',
    deliveryType: 'manual', downloadLink: '', digitalFile: '', gdriveLink: '', accessInstructions: '',
  });

  // Category form
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: '📦', color: 'var(--primary)' });

  // Banner form
  const [newBanner, setNewBanner] = useState({ title: '', image: '', link: '', sortOrder: 0, isActive: true });

  // Voucher form
  const [newVoucher, setNewVoucher] = useState({
    code: '', discountType: 'percentage', discount: 0, minPurchase: 0, maxUses: 100, expiresAt: '',
  });

  // Admin password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Landing
  const [landingEnabled, setLandingEnabled] = useState(false);
  const [landingWelcome, setLandingWelcome] = useState('');
  const [landingBg, setLandingBg] = useState('default');

  // Flash sale form
  const [flashProduct, setFlashProduct] = useState('');
  const [flashPrice, setFlashPrice] = useState(0);
  const [flashDuration, setFlashDuration] = useState(24);

  // Pengaturan local state (for batch save)
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [localSosmed, setLocalSosmed] = useState<Record<string, string>>({});
  const [localLanding, setLocalLanding] = useState<Record<string, string>>({});
  const [logoFavicon, setLogoFavicon] = useState<Record<string, string>>({});

  /* ============================================================
     DATA FETCHING
     ============================================================ */

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* ignore */ }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch { /* ignore */ }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch { /* ignore */ }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setLocalSettings(data.data);
        setLocalSosmed(data.data);
        setLocalLanding(data.data);
        setLogoFavicon(data.data);
        // Sync landing state
        setLandingEnabled(data.data['landing_enabled'] === 'true');
        setLandingWelcome(data.data['landing_welcome'] || '');
        setLandingBg(data.data['landing_bg_style'] || 'default');
      }
    } catch { /* ignore */ }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions?limit=20');
      const data = await res.json();
      if (data.success) setTransactions(data.data || []);
    } catch { /* ignore */ }
  }, []);

  const fetchThemes = useCallback(async () => {
    try {
      const res = await fetch('/api/themes');
      const data = await res.json();
      if (data.success) setThemes(data.data?.themes || []);
    } catch { /* ignore */ }
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch { /* ignore */ }
  }, []);

  const fetchVouchers = useCallback(async () => {
    try {
      const res = await fetch('/api/vouchers');
      const data = await res.json();
      if (data.success) setVouchers(data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (isAdminAuth) {
      fetchDashboard();
      fetchProducts();
      fetchCategories();
      fetchSettings();
      fetchTransactions();
      fetchThemes();
      fetchBanners();
      fetchVouchers();
    }
  }, [isAdminAuth, fetchDashboard, fetchProducts, fetchCategories, fetchSettings, fetchTransactions, fetchThemes, fetchBanners, fetchVouchers]);

  /* ============================================================
     ACTIONS
     ============================================================ */

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminAuth(true);
        setAuthError('');
      } else {
        setAuthError('Password salah!');
      }
    } catch {
      setAuthError('Gagal login');
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  /* Batch save helper - saves multiple settings at once */
  const batchSaveSettings = async (settingsMap: Record<string, string>, label: string) => {
    try {
      setSaving(true);
      setSaveMsg('');
      const entries = Object.entries(settingsMap);
      for (const [key, value] of entries) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
      }
      setSettings(prev => ({ ...prev, ...settingsMap }));
      setSaveMsg(`${label} berhasil disimpan!`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Gagal menyimpan!');
    } finally {
      setSaving(false);
    }
  };

  const addProduct = async () => {
    try {
      setLoading(true);
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addProduct', data: productForm }),
      });
      setShowAddProduct(false);
      resetProductForm();
      fetchProducts();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const updateProduct = async () => {
    if (!editingProduct) return;
    try {
      setLoading(true);
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateProduct', id: editingProduct._id, data: productForm }),
      });
      setEditingProduct(null);
      resetProductForm();
      fetchProducts();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteProduct', id }),
      });
      fetchProducts();
    } catch { /* ignore */ }
  };

  const addCategory = async () => {
    try {
      setLoading(true);
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addCategory', data: { ...newCategory, isActive: true } }),
      });
      setNewCategory({ name: '', slug: '', icon: '📦', color: 'var(--primary)' });
      fetchCategories();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteCategory', id }),
      });
      fetchCategories();
    } catch { /* ignore */ }
  };

  const addBanner = async () => {
    try {
      setLoading(true);
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addBanner', data: newBanner }),
      });
      setNewBanner({ title: '', image: '', link: '', sortOrder: 0, isActive: true });
      fetchBanners();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Hapus banner ini?')) return;
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteBanner', id }),
      });
      fetchBanners();
    } catch { /* ignore */ }
  };

  const addVoucher = async () => {
    try {
      setLoading(true);
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addVoucher', data: { ...newVoucher, isActive: true, usedCount: 0 } }),
      });
      setNewVoucher({ code: '', discountType: 'percentage', discount: 0, minPurchase: 0, maxUses: 100, expiresAt: '' });
      fetchVouchers();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const deleteVoucher = async (id: string) => {
    if (!confirm('Hapus voucher ini?')) return;
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteVoucher', id }),
      });
      fetchVouchers();
    } catch { /* ignore */ }
  };

  const switchTheme = async (slug: string) => {
    try {
      await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      setTheme(slug as any);
      fetchThemes();
    } catch { /* ignore */ }
  };

  const changeAdminPassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMsg('Isi semua field!');
      return;
    }
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentPassword }),
      });
      const data = await res.json();
      if (data.success) {
        await updateSetting('admin_password', newPassword);
        setPasswordMsg('Password berhasil diubah!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordMsg('Password lama salah!');
      }
    } catch {
      setPasswordMsg('Gagal mengubah password');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '', description: '', image: '', price: 0, category: '',
      variants: [{ name: 'Default', options: [{ label: 'Default', price: 0, stock: 999 }] }],
      isActive: true, isFlashSale: false, flashSalePrice: 0, flashSaleEndTime: '',
      deliveryType: 'manual', downloadLink: '', digitalFile: '', gdriveLink: '', accessInstructions: '',
    });
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      image: product.image || '',
      price: product.price || 0,
      category: product.category || '',
      variants: product.variants?.length ? product.variants : [{ name: 'Default', options: [{ label: 'Default', price: 0, stock: 999 }] }],
      isActive: product.isActive,
      isFlashSale: product.isFlashSale,
      flashSalePrice: product.flashSalePrice || 0,
      flashSaleEndTime: product.flashSaleEndTime ? new Date(product.flashSaleEndTime).toISOString().slice(0, 16) : '',
      deliveryType: product.deliveryType || 'manual',
      downloadLink: product.downloadLink || '',
      digitalFile: product.digitalFile || '',
      gdriveLink: product.gdriveLink || '',
      accessInstructions: product.accessInstructions || '',
    });
  };

  /* ============================================================
     LOGIN SCREEN
     ============================================================ */

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full max-w-md"
        >
          <div className="cartoon-card p-8">
            <div className="text-center mb-6">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--primary)', border: '3px solid var(--foreground)', boxShadow: '4px 4px 0px var(--foreground)' }}
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="cartoon-title text-2xl" style={{ color: 'var(--foreground)' }}>ADMIN PANEL</h1>
              <p className="mt-1 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Craig Of the Creek Dashboard</p>
            </div>

            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Password Admin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="cartoon-input h-12 text-lg font-bold w-full"
              />

              <AnimatePresence>
                {authError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-bold text-center" style={{ color: 'var(--destructive)' }}
                  >
                    {authError}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                onClick={handleLogin}
                className="cartoon-btn w-full h-12 text-lg text-white"
                style={{ background: 'var(--primary)' }}
              >
                <Lock className="w-5 h-5 mr-2" /> MASUK
              </Button>

              <Button
                onClick={() => setView('home')}
                variant="outline"
                className="w-full h-10 font-bold"
                style={{ border: '3px solid var(--foreground)' }}
              >
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Kembali ke Store
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ============================================================
     SIDEBAR
     ============================================================ */

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: 'var(--sidebar)', color: 'var(--sidebar-foreground)' }}>
      {/* Logo Area */}
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: '2px solid var(--sidebar-border)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--sidebar-primary)' }}>
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="cartoon-title text-sm text-white">CRAIG ADMIN</h1>
          <p className="text-xs opacity-70">Dashboard Panel</p>
        </div>
      </div>

      {/* Nav Items */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = adminTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setAdminTab(item.id);
                  setAdminSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'text-white'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  background: isActive ? 'var(--sidebar-primary)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--sidebar-accent)' : '4px solid transparent',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--sidebar-accent)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="p-3" style={{ borderTop: '2px solid var(--sidebar-border)' }}>
        <button
          onClick={() => {
            fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {});
            setAdminAuth(false);
            setView('home');
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
          style={{ background: 'var(--destructive)', color: 'white' }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  /* ============================================================
     TAB TITLE HELPER
     ============================================================ */

  const getTabTitle = (tab: string) => {
    const item = SIDEBAR_ITEMS.find(i => i.id === tab);
    return item?.label || tab;
  };

  /* ============================================================
     RENDER TAB CONTENT
     ============================================================ */

  const renderTabContent = () => {
    switch (adminTab) {

      /* --------------------------------------------------------
         DASHBOARD (QRIS ONLY - No ACC button for manual payments)
         -------------------------------------------------------- */
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Transaksi', value: stats?.totalTransactions || 0, icon: BarChart3, color: 'var(--primary)' },
                { label: 'Total Pendapatan', value: `Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`, icon: DollarSign, color: 'var(--secondary)' },
                { label: 'Pending', value: stats?.pendingCount || 0, icon: CreditCard, color: 'var(--accent)' },
                { label: 'Hari Ini', value: stats?.todayCount || 0, icon: ShoppingBag, color: 'var(--destructive)' },
              ].map((stat, i) => (
                <div key={i} className="cartoon-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.color }}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
                  <p className="text-xl font-black mt-1" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Transactions - QRIS only, no ACC button */}
            <div>
              <h3 className="cartoon-title text-lg mb-4" style={{ color: 'var(--foreground)' }}>Transaksi Terbaru</h3>
              <div className="cartoon-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ background: 'var(--primary)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-black text-white">ID</th>
                        <th className="px-4 py-3 text-left font-black text-white">Produk</th>
                        <th className="px-4 py-3 text-left font-black text-white">Pelanggan</th>
                        <th className="px-4 py-3 text-left font-black text-white">Total</th>
                        <th className="px-4 py-3 text-left font-black text-white">Pembayaran</th>
                        <th className="px-4 py-3 text-left font-black text-white">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((tx: any) => (
                        <tr key={tx._id} className="border-t-2" style={{ borderColor: 'var(--muted)' }}>
                          <td className="px-4 py-3 font-mono font-bold text-xs">{tx.transactionId?.slice(0, 15)}...</td>
                          <td className="px-4 py-3 font-semibold">{tx.productName}</td>
                          <td className="px-4 py-3">{tx.customerName}</td>
                          <td className="px-4 py-3 font-bold">Rp {tx.totalAmount?.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <QrCode className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                              <span className="font-semibold text-xs">QRIS</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="cartoon-badge" style={{
                              background: tx.status === 'paid' || tx.status === 'success' ? 'var(--secondary)' :
                                tx.status === 'pending' ? 'var(--primary)' : 'var(--destructive)',
                              color: 'white',
                            }}>
                              {tx.status?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center font-bold" style={{ color: 'var(--muted-foreground)' }}>Belum ada transaksi</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      /* --------------------------------------------------------
         PRODUK (with FileUpload for images and digital files)
         -------------------------------------------------------- */
      case 'produk':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Produk</h3>
              <Button onClick={() => { resetProductForm(); setShowAddProduct(true); }}
                className="cartoon-btn text-white"
                style={{ background: 'var(--secondary)' }}>
                <Plus className="w-4 h-4 mr-1" /> Tambah Produk
              </Button>
            </div>

            {/* Add/Edit Product Form */}
            <AnimatePresence>
              {(showAddProduct || editingProduct) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="cartoon-card p-6 space-y-4">
                    <h4 className="cartoon-title text-base" style={{ color: 'var(--foreground)' }}>
                      {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-bold mb-1 block">Nama Produk</Label>
                        <Input placeholder="Nama Produk" value={productForm.name}
                          onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                          className="cartoon-input h-11 font-bold w-full" />
                      </div>
                      <div>
                        <Label className="font-bold mb-1 block">Kategori</Label>
                        <Select value={productForm.category} onValueChange={(v) => setProductForm(p => ({ ...p, category: v }))}>
                          <SelectTrigger className="cartoon-input h-11 font-bold w-full"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat._id} value={cat.slug}>{cat.icon} {cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Product Image Upload - uses FileUpload component */}
                    <FileUpload
                      subdirectory="products"
                      label="Gambar Produk"
                      value={productForm.image}
                      onChange={(url) => setProductForm(p => ({ ...p, image: url }))}
                      preview={true}
                    />

                    <div>
                      <Label className="font-bold mb-1 block">Deskripsi</Label>
                      <Textarea placeholder="Deskripsi produk..." value={productForm.description}
                        onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                        className="cartoon-input font-semibold w-full" rows={3} />
                    </div>

                    {/* Variant Management */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-bold">Varian</Label>
                        <Button size="sm" onClick={() => setProductForm(p => ({
                          ...p,
                          variants: [...p.variants, { name: '', options: [{ label: '', price: 0, stock: 999 }] }]
                        }))} className="text-xs font-bold" style={{ background: 'var(--accent)', color: 'white' }}>
                          <Plus className="w-3 h-3 mr-1" /> Grup Varian
                        </Button>
                      </div>
                      {productForm.variants.map((variant, vi) => (
                        <div key={vi} className="cartoon-card p-4 mb-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Input placeholder="Nama Varian" value={variant.name}
                              onChange={(e) => {
                                const v = [...productForm.variants];
                                v[vi] = { ...v[vi], name: e.target.value };
                                setProductForm(p => ({ ...p, variants: v }));
                              }}
                              className="cartoon-input h-9 font-bold flex-1" />
                            {productForm.variants.length > 1 && (
                              <Button size="sm" onClick={() => setProductForm(p => ({ ...p, variants: p.variants.filter((_, i) => i !== vi) }))}
                                style={{ background: 'var(--destructive)', color: 'white' }} className="h-9 w-9 p-0">
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          {variant.options.map((opt, oi) => (
                            <div key={oi} className="flex gap-2 mb-2">
                              <Input placeholder="Label" value={opt.label}
                                onChange={(e) => {
                                  const v = [...productForm.variants];
                                  v[vi].options[oi] = { ...v[vi].options[oi], label: e.target.value };
                                  setProductForm(p => ({ ...p, variants: v }));
                                }}
                                className="cartoon-input h-9 font-bold flex-1" />
                              <Input type="number" placeholder="Harga" value={opt.price || ''}
                                onChange={(e) => {
                                  const v = [...productForm.variants];
                                  v[vi].options[oi] = { ...v[vi].options[oi], price: Number(e.target.value) };
                                  setProductForm(p => ({ ...p, variants: v }));
                                }}
                                className="cartoon-input h-9 font-bold w-28" />
                              <Input type="number" placeholder="Stock" value={opt.stock || ''}
                                onChange={(e) => {
                                  const v = [...productForm.variants];
                                  v[vi].options[oi] = { ...v[vi].options[oi], stock: Number(e.target.value) };
                                  setProductForm(p => ({ ...p, variants: v }));
                                }}
                                className="cartoon-input h-9 font-bold w-24" />
                              <Button size="sm" onClick={() => {
                                const v = [...productForm.variants];
                                v[vi].options = v[vi].options.filter((_, i) => i !== oi);
                                setProductForm(p => ({ ...p, variants: v }));
                              }} style={{ background: 'var(--destructive)', color: 'white' }} className="h-9 w-9 p-0">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button size="sm" onClick={() => {
                            const v = [...productForm.variants];
                            v[vi].options = [...v[vi].options, { label: '', price: 0, stock: 999 }];
                            setProductForm(p => ({ ...p, variants: v }));
                          }} className="text-xs font-bold" style={{ background: 'var(--muted)' }}>
                            <Plus className="w-3 h-3 mr-1" /> Opsi
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Digital Delivery Settings */}
                    <div className="cartoon-card p-4">
                      <Label className="font-bold mb-2 block">Pengiriman Digital</Label>
                      <Select value={productForm.deliveryType} onValueChange={(v) => setProductForm(p => ({ ...p, deliveryType: v }))}>
                        <SelectTrigger className="cartoon-input h-11 font-bold w-full mb-3"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Otomatis</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="link">Link Download</SelectItem>
                          <SelectItem value="file">File Upload</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* When deliveryType is 'link', show download link input */}
                      {productForm.deliveryType === 'link' && (
                        <div className="mb-3">
                          <Label className="font-bold mb-1 block">Link Download</Label>
                          <Input placeholder="https://drive.google.com/..." value={productForm.downloadLink}
                            onChange={(e) => setProductForm(p => ({ ...p, downloadLink: e.target.value }))}
                            className="cartoon-input h-11 font-bold w-full" />
                        </div>
                      )}

                      {/* When deliveryType is 'file', show FileUpload for digital file */}
                      {productForm.deliveryType === 'file' && (
                        <div className="mb-3">
                          <FileUpload
                            subdirectory="files"
                            accept="application/zip,application/pdf"
                            label="File Digital (ZIP/PDF)"
                            value={productForm.digitalFile}
                            onChange={(url) => setProductForm(p => ({ ...p, digitalFile: url }))}
                            preview={false}
                          />
                        </div>
                      )}

                      {/* Google Drive link - always visible */}
                      <div className="mb-3">
                        <Label className="font-bold mb-1 block">Google Drive Link (opsional)</Label>
                        <Input placeholder="https://drive.google.com/..." value={productForm.gdriveLink}
                          onChange={(e) => setProductForm(p => ({ ...p, gdriveLink: e.target.value }))}
                          className="cartoon-input h-11 font-bold w-full" />
                      </div>

                      {/* Access instructions - always visible */}
                      <div>
                        <Label className="font-bold mb-1 block">Instruksi Akses (opsional)</Label>
                        <Textarea placeholder="Cara mengakses produk digital..." value={productForm.accessInstructions}
                          onChange={(e) => setProductForm(p => ({ ...p, accessInstructions: e.target.value }))}
                          className="cartoon-input font-semibold w-full" rows={2} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={editingProduct ? updateProduct : addProduct} disabled={loading}
                        className="cartoon-btn text-white" style={{ background: 'var(--secondary)' }}>
                        <Check className="w-4 h-4 mr-1" /> {loading ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                      <Button onClick={() => { setShowAddProduct(false); setEditingProduct(null); resetProductForm(); }}
                        className="cartoon-btn text-white" style={{ background: 'var(--destructive)' }}>
                        <X className="w-4 h-4 mr-1" /> Batal
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="cartoon-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-base truncate" style={{ color: 'var(--foreground)' }}>{product.name}</h4>
                      <p className="text-xs mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>{product.description?.slice(0, 50)}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="cartoon-badge" style={{ background: 'var(--primary)', color: 'white' }}>{product.category}</span>
                        {product.isFlashSale && (
                          <span className="cartoon-badge" style={{ background: 'var(--destructive)', color: 'white' }}>FLASH SALE</span>
                        )}
                        {product.deliveryType && product.deliveryType !== 'manual' && (
                          <span className="cartoon-badge" style={{ background: 'var(--accent)', color: 'white' }}>
                            {product.deliveryType === 'file' ? 'FILE' : product.deliveryType === 'link' ? 'LINK' : product.deliveryType.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold mt-2" style={{ color: 'var(--muted-foreground)' }}>
                        {product.variants?.[0]?.options?.length || 0} varian
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <button onClick={() => openEditProduct(product)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--accent)', color: 'white', border: '2px solid var(--foreground)' }}>
                        <Edit className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteProduct(product._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--destructive)', color: 'white', border: '2px solid var(--foreground)' }}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="cartoon-card p-8 col-span-full text-center">
                  <p className="font-bold" style={{ color: 'var(--muted-foreground)' }}>Belum ada produk</p>
                </div>
              )}
            </div>
          </div>
        );

      /* --------------------------------------------------------
         KATEGORI
         -------------------------------------------------------- */
      case 'kategori':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Kategori</h3>

            {/* Add Category Form */}
            <div className="cartoon-card p-6">
              <h4 className="font-black mb-4" style={{ color: 'var(--foreground)' }}>Tambah Kategori</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="font-bold mb-1 block">Nama</Label>
                  <Input placeholder="Nama Kategori" value={newCategory.name}
                    onChange={(e) => setNewCategory(c => ({ ...c, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Slug</Label>
                  <Input placeholder="slug-kategori" value={newCategory.slug}
                    onChange={(e) => setNewCategory(c => ({ ...c, slug: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Icon</Label>
                  <Input placeholder="emoji" value={newCategory.icon}
                    onChange={(e) => setNewCategory(c => ({ ...c, icon: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full text-center text-2xl" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Warna</Label>
                  <div className="flex gap-2">
                    <input type="color" value={newCategory.color}
                      onChange={(e) => setNewCategory(c => ({ ...c, color: e.target.value }))}
                      className="w-11 h-11 rounded-xl cursor-pointer" style={{ border: '3px solid var(--foreground)' }} />
                    <Input value={newCategory.color}
                      onChange={(e) => setNewCategory(c => ({ ...c, color: e.target.value }))}
                      className="cartoon-input h-11 font-bold flex-1" />
                  </div>
                </div>
              </div>
              <Button onClick={addCategory} disabled={loading} className="cartoon-btn text-white mt-4"
                style={{ background: 'var(--secondary)' }}>
                <Plus className="w-4 h-4 mr-1" /> {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>

            {/* Category List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat._id} className="cartoon-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                      <p className="font-black" style={{ color: 'var(--foreground)' }}>{cat.name}</p>
                      <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full" style={{ background: cat.color, border: '2px solid var(--foreground)' }} />
                    <button onClick={() => deleteCategory(cat._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--destructive)', color: 'white', border: '2px solid var(--foreground)' }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      /* --------------------------------------------------------
         FLASH SALE
         -------------------------------------------------------- */
      case 'flash-sale':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Flash Sale</h3>

            {/* Add Flash Sale Form */}
            <div className="cartoon-card p-6">
              <h4 className="font-black mb-4" style={{ color: 'var(--foreground)' }}>Buat Flash Sale</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="font-bold mb-1 block">Produk</Label>
                  <Select value={flashProduct} onValueChange={setFlashProduct}>
                    <SelectTrigger className="cartoon-input h-11 font-bold w-full"><SelectValue placeholder="Pilih Produk" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Harga Flash Sale</Label>
                  <Input type="number" placeholder="0" value={flashPrice || ''}
                    onChange={(e) => setFlashPrice(Number(e.target.value))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Durasi (Jam)</Label>
                  <Select value={String(flashDuration)} onValueChange={(v) => setFlashDuration(Number(v))}>
                    <SelectTrigger className="cartoon-input h-11 font-bold w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Jam</SelectItem>
                      <SelectItem value="12">12 Jam</SelectItem>
                      <SelectItem value="24">24 Jam</SelectItem>
                      <SelectItem value="48">48 Jam</SelectItem>
                      <SelectItem value="72">72 Jam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timer Preview */}
              {flashProduct && flashPrice > 0 && (
                <div className="mt-4 p-4 rounded-xl flex items-center gap-4" style={{ background: 'var(--muted)' }}>
                  <Zap className="w-8 h-8" style={{ color: 'var(--primary)' }} />
                  <div>
                    <p className="font-black" style={{ color: 'var(--foreground)' }}>
                      {products.find(p => p._id === flashProduct)?.name}
                    </p>
                    <p className="text-sm font-bold" style={{ color: 'var(--destructive)' }}>
                      Rp {flashPrice.toLocaleString('id-ID')} - {flashDuration} Jam
                    </p>
                  </div>
                </div>
              )}

              <Button onClick={async () => {
                if (!flashProduct) return;
                setLoading(true);
                const product = products.find(p => p._id === flashProduct);
                if (product) {
                  const endTime = new Date(Date.now() + flashDuration * 60 * 60 * 1000).toISOString();
                  await fetch('/api/admin/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'updateProduct', id: flashProduct,
                      data: { isFlashSale: true, flashSalePrice: flashPrice, flashSaleEndTime: endTime },
                    }),
                  });
                  fetchProducts();
                  setFlashProduct('');
                  setFlashPrice(0);
                }
                setLoading(false);
              }} disabled={loading || !flashProduct} className="cartoon-btn text-white mt-4"
                style={{ background: 'var(--primary)' }}>
                <Zap className="w-4 h-4 mr-1" /> {loading ? 'Menyimpan...' : 'Aktifkan Flash Sale'}
              </Button>
            </div>

            {/* Active Flash Sales */}
            <h4 className="font-black" style={{ color: 'var(--foreground)' }}>Flash Sale Aktif</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.filter(p => p.isFlashSale).map(product => {
                const isExpired = product.flashSaleEndTime ? new Date(product.flashSaleEndTime) < new Date() : true;
                return (
                  <div key={product._id} className="cartoon-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isExpired ? 'var(--muted)' : 'var(--destructive)' }}>
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-black" style={{ color: 'var(--foreground)' }}>{product.name}</p>
                          <p className="text-xs font-bold" style={{ color: 'var(--destructive)' }}>
                            Rp {product.flashSalePrice?.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isExpired ? 'secondary' : 'destructive'} className="font-bold">
                        {isExpired ? 'EXPIRED' : 'AKTIF'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {products.filter(p => p.isFlashSale).length === 0 && (
                <div className="cartoon-card p-6 text-center">
                  <p className="font-bold" style={{ color: 'var(--muted-foreground)' }}>Tidak ada flash sale aktif</p>
                </div>
              )}
            </div>
          </div>
        );

      /* --------------------------------------------------------
         VOUCHER
         -------------------------------------------------------- */
      case 'voucher':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Voucher</h3>

            {/* Add Voucher Form */}
            <div className="cartoon-card p-6">
              <h4 className="font-black mb-4" style={{ color: 'var(--foreground)' }}>Tambah Voucher</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label className="font-bold mb-1 block">Kode</Label>
                  <Input placeholder="DISKON50" value={newVoucher.code}
                    onChange={(e) => setNewVoucher(v => ({ ...v, code: e.target.value.toUpperCase() }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Tipe Diskon</Label>
                  <Select value={newVoucher.discountType} onValueChange={(v) => setNewVoucher(v2 => ({ ...v2, discountType: v }))}>
                    <SelectTrigger className="cartoon-input h-11 font-bold w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Persentase (%)</SelectItem>
                      <SelectItem value="fixed">Potongan Tetap (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Nilai Diskon</Label>
                  <Input type="number" placeholder="0" value={newVoucher.discount || ''}
                    onChange={(e) => setNewVoucher(v => ({ ...v, discount: Number(e.target.value) }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Min. Pembelian</Label>
                  <Input type="number" placeholder="0" value={newVoucher.minPurchase || ''}
                    onChange={(e) => setNewVoucher(v => ({ ...v, minPurchase: Number(e.target.value) }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Max Penggunaan</Label>
                  <Input type="number" placeholder="100" value={newVoucher.maxUses || ''}
                    onChange={(e) => setNewVoucher(v => ({ ...v, maxUses: Number(e.target.value) }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Masa Berlaku</Label>
                  <Input type="datetime-local" value={newVoucher.expiresAt}
                    onChange={(e) => setNewVoucher(v => ({ ...v, expiresAt: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
              </div>
              <Button onClick={addVoucher} disabled={loading} className="cartoon-btn text-white mt-4"
                style={{ background: 'var(--secondary)' }}>
                <Plus className="w-4 h-4 mr-1" /> {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>

            {/* Voucher List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vouchers.map((v) => (
                <div key={v._id} className="cartoon-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-lg" style={{ color: 'var(--primary)' }}>{v.code}</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                        {v.discountType === 'percentage' ? `${v.discount}%` : `Rp ${v.discount.toLocaleString('id-ID')}`}
                        {v.minPurchase > 0 && <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}> min. Rp {v.minPurchase.toLocaleString('id-ID')}</span>}
                      </p>
                      <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                        {v.usedCount}/{v.maxUses} digunakan
                      </p>
                    </div>
                    <Button size="sm" onClick={() => deleteVoucher(v._id)}
                      style={{ background: 'var(--destructive)', color: 'white' }}
                      className="h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {vouchers.length === 0 && (
                <div className="cartoon-card p-6 text-center col-span-full">
                  <p className="font-bold" style={{ color: 'var(--muted-foreground)' }}>Belum ada voucher</p>
                </div>
              )}
            </div>
          </div>
        );

      /* --------------------------------------------------------
         NOTIFIKASI
         -------------------------------------------------------- */
      case 'notifikasi':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Notifikasi</h3>

            {/* Telegram Config */}
            <div className="cartoon-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#0088cc' }}>
                  <Send className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-black" style={{ color: 'var(--foreground)' }}>Konfigurasi Telegram</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold mb-1 block">Bot Token</Label>
                  <Input type="password" value={settings['telegram_bot_token'] || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, telegram_bot_token: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Admin Chat ID</Label>
                  <Input value={settings['telegram_chat_id'] || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="cartoon-btn text-white" style={{ background: '#0088cc' }}
                  onClick={() => alert('Test notification sent!')}>
                  <Send className="w-4 h-4 mr-1" /> Test Telegram
                </Button>
                <Button className="cartoon-btn text-white" style={{ background: 'var(--secondary)' }}
                  onClick={() => batchSaveSettings({
                    telegram_bot_token: settings['telegram_bot_token'] || '',
                    telegram_chat_id: settings['telegram_chat_id'] || '',
                  }, 'Notifikasi Telegram')}
                  disabled={saving}>
                  <Save className="w-4 h-4 mr-1" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>

            {/* WhatsApp Fonnte Config */}
            <div className="cartoon-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#25D366' }}>
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-black" style={{ color: 'var(--foreground)' }}>Konfigurasi WhatsApp (Fonnte)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold mb-1 block">Fonnte API Key</Label>
                  <Input type="password" value={settings['whatsapp_fonnnte_token'] || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_fonnnte_token: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Nomor Admin</Label>
                  <Input placeholder="6281234567890" value={settings['whatsapp_admin_number'] || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_admin_number: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="cartoon-btn text-white" style={{ background: '#25D366' }}
                  onClick={() => alert('Test notification sent!')}>
                  <MessageSquare className="w-4 h-4 mr-1" /> Test WhatsApp
                </Button>
                <Button className="cartoon-btn text-white" style={{ background: 'var(--secondary)' }}
                  onClick={() => batchSaveSettings({
                    whatsapp_fonnnte_token: settings['whatsapp_fonnnte_token'] || '',
                    whatsapp_admin_number: settings['whatsapp_admin_number'] || '',
                  }, 'Notifikasi WhatsApp')}
                  disabled={saving}>
                  <Save className="w-4 h-4 mr-1" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </div>
        );

      /* --------------------------------------------------------
         PAYMENT (QRIS ONLY - No manual payment options)
         -------------------------------------------------------- */
      case 'payment':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Payment</h3>

            {/* Payment Methods - QRIS Only */}
            <div className="cartoon-card p-6">
              <h4 className="font-black mb-4" style={{ color: 'var(--foreground)' }}>Metode Pembayaran</h4>
              <div className="space-y-4">
                {/* QRIS - Primary payment method */}
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--muted)', border: '3px solid var(--primary)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E91E63' }}>
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-black" style={{ color: 'var(--foreground)' }}>QRIS</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Pembayaran utama via QR Code</p>
                    </div>
                  </div>
                  <Badge style={{ background: 'var(--secondary)', color: 'white', border: '2px solid var(--foreground)' }} className="font-bold">
                    AKTIF
                  </Badge>
                </div>
              </div>
            </div>

            {/* QRIS Transactions */}
            <div className="cartoon-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-black" style={{ color: 'var(--foreground)' }}>Transaksi QRIS</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ background: 'var(--primary)' }}>
                    <tr>
                      <th className="px-3 py-2 text-left font-black text-white text-xs">ID</th>
                      <th className="px-3 py-2 text-left font-black text-white text-xs">Produk</th>
                      <th className="px-3 py-2 text-left font-black text-white text-xs">Total</th>
                      <th className="px-3 py-2 text-left font-black text-white text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.filter((tx: any) => tx.paymentMethod === 'qris' || !tx.paymentMethod).slice(0, 10).map((tx: any) => (
                      <tr key={tx._id} className="border-t-2" style={{ borderColor: 'var(--muted)' }}>
                        <td className="px-3 py-2 font-mono font-bold text-xs">{tx.transactionId?.slice(0, 12)}...</td>
                        <td className="px-3 py-2 font-semibold text-xs">{tx.productName}</td>
                        <td className="px-3 py-2 font-bold text-xs">Rp {tx.totalAmount?.toLocaleString('id-ID')}</td>
                        <td className="px-3 py-2">
                          <span className="cartoon-badge text-xs" style={{
                            background: tx.status === 'paid' || tx.status === 'success' ? 'var(--secondary)' :
                              tx.status === 'pending' ? 'var(--primary)' : 'var(--destructive)',
                            color: 'white',
                          }}>
                            {tx.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {transactions.filter((tx: any) => tx.paymentMethod === 'qris' || !tx.paymentMethod).length === 0 && (
                      <tr><td colSpan={4} className="px-3 py-6 text-center font-bold text-xs" style={{ color: 'var(--muted-foreground)' }}>Belum ada transaksi QRIS</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cashify Config */}
            <div className="cartoon-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-black" style={{ color: 'var(--foreground)' }}>Konfigurasi Cashify</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold mb-1 block">License Key</Label>
                  <Input type="password" value={settings['cashify_license_key'] || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, cashify_license_key: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">QR ID</Label>
                  <Input value={settings['cashify_qr_id'] || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, cashify_qr_id: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
              </div>
              <Button className="cartoon-btn text-white mt-4" style={{ background: 'var(--secondary)' }}
                onClick={() => batchSaveSettings({
                  cashify_license_key: settings['cashify_license_key'] || '',
                  cashify_qr_id: settings['cashify_qr_id'] || '',
                }, 'Konfigurasi Cashify')}
                disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> {saving ? 'Menyimpan...' : 'Simpan Cashify Config'}
              </Button>
            </div>
          </div>
        );

      /* --------------------------------------------------------
         KELOLA ADMIN
         -------------------------------------------------------- */
      case 'kelola-admin':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Kelola Admin</h3>

            <div className="cartoon-card p-6 max-w-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--foreground)' }}>
                  <Lock className="w-5 h-5" style={{ color: 'var(--sidebar-foreground)' }} />
                </div>
                <h4 className="font-black" style={{ color: 'var(--foreground)' }}>Ubah Password Admin</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="font-bold mb-1 block">Password Saat Ini</Label>
                  <Input type="password" value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Password Baru</Label>
                  <Input type="password" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                {passwordMsg && (
                  <p className="font-bold text-sm"
                    style={{ color: passwordMsg.includes('berhasil') ? 'var(--secondary)' : 'var(--destructive)' }}>
                    {passwordMsg}
                  </p>
                )}
                <Button onClick={changeAdminPassword} className="cartoon-btn text-white"
                  style={{ background: 'var(--primary)' }}>
                  <Save className="w-4 h-4 mr-1" /> Ubah Password
                </Button>
              </div>
            </div>
          </div>
        );

      /* --------------------------------------------------------
         BANNER & LOGO (with FileUpload for banner, logo, favicon)
         -------------------------------------------------------- */
      case 'banner-logo':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Banner & Logo</h3>

            {/* Add Banner */}
            <div className="cartoon-card p-6">
              <h4 className="font-black mb-4" style={{ color: 'var(--foreground)' }}>Tambah Banner</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold mb-1 block">Judul</Label>
                  <Input placeholder="Judul Banner" value={newBanner.title}
                    onChange={(e) => setNewBanner(b => ({ ...b, title: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Link</Label>
                  <Input placeholder="https://..." value={newBanner.link}
                    onChange={(e) => setNewBanner(b => ({ ...b, link: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Urutan</Label>
                  <Input type="number" value={newBanner.sortOrder || 0}
                    onChange={(e) => setNewBanner(b => ({ ...b, sortOrder: Number(e.target.value) }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
              </div>

              {/* Banner Image Upload - uses FileUpload component */}
              <div className="mt-4">
                <FileUpload
                  subdirectory="banners"
                  label="Gambar Banner"
                  value={newBanner.image}
                  onChange={(url) => setNewBanner(b => ({ ...b, image: url }))}
                  preview={true}
                />
              </div>

              <Button onClick={addBanner} disabled={loading} className="cartoon-btn text-white mt-4"
                style={{ background: 'var(--secondary)' }}>
                <Plus className="w-4 h-4 mr-1" /> {loading ? 'Menyimpan...' : 'Simpan Banner'}
              </Button>
            </div>

            {/* Banner List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <div key={banner._id} className="cartoon-card overflow-hidden">
                  {banner.image && (
                    <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url(${banner.image})` }} />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black" style={{ color: 'var(--foreground)' }}>{banner.title}</p>
                        <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Urutan: {banner.sortOrder}</p>
                      </div>
                      <Button size="sm" onClick={() => deleteBanner(banner._id)}
                        style={{ background: 'var(--destructive)', color: 'white' }}
                        className="h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="cartoon-card p-6 text-center col-span-full">
                  <p className="font-bold" style={{ color: 'var(--muted-foreground)' }}>Belum ada banner</p>
                </div>
              )}
            </div>

            {/* Logo & Favicon Settings with FileUpload */}
            <div className="cartoon-card p-6">
              <h4 className="font-black mb-4" style={{ color: 'var(--foreground)' }}>Logo & Favicon</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Site Logo Upload */}
                <FileUpload
                  subdirectory="logos"
                  label="Logo Website"
                  value={logoFavicon['site_logo'] || ''}
                  onChange={(url) => setLogoFavicon(prev => ({ ...prev, site_logo: url }))}
                  preview={true}
                />

                {/* Favicon Upload */}
                <FileUpload
                  subdirectory="favicons"
                  label="Favicon"
                  value={logoFavicon['site_favicon'] || ''}
                  onChange={(url) => setLogoFavicon(prev => ({ ...prev, site_favicon: url }))}
                  preview={true}
                />
              </div>

              <Button
                className="cartoon-btn text-white mt-4"
                style={{ background: 'var(--secondary)' }}
                onClick={() => batchSaveSettings({
                  site_logo: logoFavicon['site_logo'] || '',
                  site_favicon: logoFavicon['site_favicon'] || '',
                }, 'Logo & Favicon')}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-1" /> {saving ? 'Menyimpan...' : 'Simpan Logo & Favicon'}
              </Button>
            </div>
          </div>
        );

      /* --------------------------------------------------------
         PENGATURAN WEBSITE (with Save button)
         -------------------------------------------------------- */
      case 'pengaturan':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Pengaturan Website</h3>

            <div className="cartoon-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold mb-1 block">Nama Website</Label>
                  <Input value={localSettings['site_name'] || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, site_name: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Slogan</Label>
                  <Input value={localSettings['site_slogan'] || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, site_slogan: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div className="md:col-span-2">
                  <Label className="font-bold mb-1 block">Deskripsi</Label>
                  <Textarea value={localSettings['site_description'] || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, site_description: e.target.value }))}
                    className="cartoon-input font-semibold w-full" rows={3} />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Owner Name</Label>
                  <Input value={localSettings['owner_name'] || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, owner_name: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
                <div>
                  <Label className="font-bold mb-1 block">Contact Email</Label>
                  <Input value={localSettings['contact_email'] || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                    className="cartoon-input h-11 font-bold w-full" />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <Button className="cartoon-btn text-white"
                  style={{ background: 'var(--secondary)' }}
                  onClick={() => batchSaveSettings({
                    site_name: localSettings['site_name'] || '',
                    site_slogan: localSettings['site_slogan'] || '',
                    site_description: localSettings['site_description'] || '',
                    owner_name: localSettings['owner_name'] || '',
                    contact_email: localSettings['contact_email'] || '',
                  }, 'Pengaturan Website')}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-1" /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
                {saveMsg && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-bold text-sm"
                    style={{ color: saveMsg.includes('berhasil') ? 'var(--secondary)' : 'var(--destructive)' }}
                  >
                    {saveMsg}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        );

      /* --------------------------------------------------------
         SOSMED (with Save button)
         -------------------------------------------------------- */
      case 'sosmed':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Sosial Media</h3>

            <div className="cartoon-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'social_whatsapp', label: 'WhatsApp', placeholder: '6281234567890' },
                  { key: 'social_instagram', label: 'Instagram', placeholder: '@username' },
                  { key: 'social_tiktok', label: 'TikTok', placeholder: '@username' },
                  { key: 'social_facebook', label: 'Facebook', placeholder: 'URL Facebook' },
                  { key: 'social_youtube', label: 'YouTube', placeholder: 'URL YouTube' },
                  { key: 'social_telegram', label: 'Telegram', placeholder: '@username' },
                ].map((field) => (
                  <div key={field.key}>
                    <Label className="font-bold mb-1 block">{field.label}</Label>
                    <Input placeholder={field.placeholder} value={localSosmed[field.key] || ''}
                      onChange={(e) => setLocalSosmed(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="cartoon-input h-11 font-bold w-full" />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <Button className="cartoon-btn text-white"
                  style={{ background: 'var(--secondary)' }}
                  onClick={() => batchSaveSettings({
                    social_whatsapp: localSosmed['social_whatsapp'] || '',
                    social_instagram: localSosmed['social_instagram'] || '',
                    social_tiktok: localSosmed['social_tiktok'] || '',
                    social_facebook: localSosmed['social_facebook'] || '',
                    social_youtube: localSosmed['social_youtube'] || '',
                    social_telegram: localSosmed['social_telegram'] || '',
                  }, 'Sosial Media')}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-1" /> {saving ? 'Menyimpan...' : 'Simpan Sosmed'}
                </Button>
                {saveMsg && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-bold text-sm"
                    style={{ color: saveMsg.includes('berhasil') ? 'var(--secondary)' : 'var(--destructive)' }}
                  >
                    {saveMsg}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        );

      /* --------------------------------------------------------
         TEMA WEBSITE
         -------------------------------------------------------- */
      case 'tema': {
        const themeCards = [
          {
            slug: 'craig-of-the-creek',
            name: 'Craig Of The Creek',
            swatches: ['#F5EDDC', '#2C3E2D', '#FF8C42', '#6BCB77', '#4FC0D0'],
            effects: ['Daun Berguguran', 'Kunang-Kunang'],
          },
          {
            slug: 'cartoon-network',
            name: 'Cartoon Network',
            swatches: ['#FFFDE7', '#212121', '#FF5722', '#FFC107', '#00BCD4'],
            effects: ['Bouncing', 'Fun Effects'],
          },
          {
            slug: 'adventure-cartoon',
            name: 'Adventure Cartoon',
            swatches: ['#FFF3E0', '#4A3728', '#FF6F00', '#FFB74D', '#26A69A'],
            effects: ['Petualangan', 'Warm Glow'],
          },
          {
            slug: 'forest-cartoon',
            name: 'Forest Cartoon',
            swatches: ['#E8F5E9', '#1B5E20', '#43A047', '#81C784', '#8BC34A'],
            effects: ['Hujan', 'Daun'],
          },
          {
            slug: 'night-adventure',
            name: 'Night Adventure',
            swatches: ['#1A1A2E', '#E0E0E0', '#E94560', '#533483', '#0F3460'],
            effects: ['Petir', 'Bintang'],
          },
        ];

        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Tema Website</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themeCards.map((theme) => {
                const isActive = currentTheme === theme.slug;
                return (
                  <div
                    key={theme.slug}
                    className={`cartoon-card p-6 cursor-pointer transition-all ${isActive ? 'ring-4' : ''}`}
                    style={{ ringColor: isActive ? 'var(--secondary)' : undefined }}
                    onClick={() => switchTheme(theme.slug)}
                  >
                    {isActive && (
                      <Badge className="mb-3 font-bold" style={{ background: 'var(--secondary)', color: 'white', border: '2px solid var(--foreground)' }}>
                        <Check className="w-3 h-3 mr-1" /> AKTIF
                      </Badge>
                    )}
                    <h4 className="cartoon-title text-base mb-3" style={{ color: 'var(--foreground)' }}>{theme.name}</h4>
                    <div className="flex gap-2 mb-3">
                      {theme.swatches.map((color, i) => (
                        <div key={i} className="w-8 h-8 rounded-lg" style={{ background: color, border: '2px solid var(--foreground)' }} />
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {theme.effects.map((effect, i) => (
                        <span key={i} className="cartoon-badge" style={{ background: 'var(--muted)' }}>{effect}</span>
                      ))}
                    </div>
                    <Button
                      onClick={(e) => { e.stopPropagation(); switchTheme(theme.slug); }}
                      className={`cartoon-btn w-full mt-4 text-white font-bold`}
                      style={{ background: isActive ? 'var(--secondary)' : 'var(--primary)' }}
                    >
                      {isActive ? <><Check className="w-4 h-4 mr-1" /> Sedang Aktif</> : 'Ganti ke Tema Ini'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      /* --------------------------------------------------------
         LANDING PAGE SETTING (with Save button)
         -------------------------------------------------------- */
      case 'landing':
        return (
          <div className="space-y-6">
            <h3 className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Landing Page Setting</h3>

            <div className="cartoon-card p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--foreground)' }}>Landing Page</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Tampilkan landing page sebelum store</p>
                  </div>
                  <Switch
                    checked={localLanding['landing_enabled'] === 'true'}
                    onCheckedChange={(checked) => {
                      setLocalLanding(prev => ({ ...prev, landing_enabled: String(checked) }));
                    }}
                  />
                </div>

                <div>
                  <Label className="font-bold mb-1 block">Teks Selamat Datang</Label>
                  <Textarea value={localLanding['landing_welcome'] || ''}
                    onChange={(e) => setLocalLanding(prev => ({ ...prev, landing_welcome: e.target.value }))}
                    className="cartoon-input font-semibold w-full" rows={4}
                    placeholder="Selamat datang di toko kami!" />
                </div>

                <div>
                  <Label className="font-bold mb-1 block">Gaya Background</Label>
                  <Select
                    value={localLanding['landing_bg_style'] || 'default'}
                    onValueChange={(v) => {
                      setLocalLanding(prev => ({ ...prev, landing_bg_style: v }));
                    }}
                  >
                    <SelectTrigger className="cartoon-input h-11 font-bold w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="pattern">Pattern</SelectItem>
                      <SelectItem value="image">Custom Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <Button className="cartoon-btn text-white"
                  style={{ background: 'var(--secondary)' }}
                  onClick={() => batchSaveSettings({
                    landing_enabled: localLanding['landing_enabled'] || 'false',
                    landing_welcome: localLanding['landing_welcome'] || '',
                    landing_bg_style: localLanding['landing_bg_style'] || 'default',
                  }, 'Landing Page')}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-1" /> {saving ? 'Menyimpan...' : 'Simpan Landing Page'}
                </Button>
                {saveMsg && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-bold text-sm"
                    style={{ color: saveMsg.includes('berhasil') ? 'var(--secondary)' : 'var(--destructive)' }}
                  >
                    {saveMsg}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ============================================================
     ADMIN LAYOUT (AUTHENTICATED)
     ============================================================ */

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {adminSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setAdminSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-[260px] shrink-0 h-full">
        {sidebarContent}
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {adminSidebarOpen && (
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 w-[260px] h-full z-50 lg:hidden"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="shrink-0 flex items-center justify-between px-4 lg:px-6 py-3 border-b-2"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden h-9 w-9 p-0"
              onClick={() => setAdminSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="cartoon-title text-base" style={{ color: 'var(--foreground)' }}>
                {getTabTitle(adminTab)}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Admin</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={adminTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
