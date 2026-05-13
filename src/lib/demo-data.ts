// Demo data for when MongoDB is not connected
// Note: No React imports here - this is used in API routes too

export const DEMO_PRODUCTS = [
  {
    _id: 'demo-1',
    name: 'Mobile Legends - Diamond',
    description: 'Top up Diamond Mobile Legends cepat & aman! Proses otomatis 24 jam.',
    image: '',
    price: 0,
    category: 'game-topup',
    deliveryType: 'auto',
    variants: [
      { name: 'Jumlah Diamond', options: [
        { label: '86 Diamond', price: 19000, stock: 999 },
        { label: '172 Diamond', price: 38000, stock: 999 },
        { label: '257 Diamond', price: 57000, stock: 999 },
        { label: '514 Diamond', price: 114000, stock: 999 },
        { label: '706 Diamond', price: 152000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: true,
    flashSalePrice: 17000,
    flashSaleEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-2',
    name: 'Free Fire - Diamond',
    description: 'Top up Diamond Free Fire termurah! Langsung masuk akun.',
    image: '',
    price: 0,
    category: 'game-topup',
    deliveryType: 'auto',
    variants: [
      { name: 'Jumlah Diamond', options: [
        { label: '100 Diamond', price: 15000, stock: 999 },
        { label: '310 Diamond', price: 46000, stock: 999 },
        { label: '520 Diamond', price: 76000, stock: 999 },
        { label: '1060 Diamond', price: 152000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: true,
    flashSalePrice: 13500,
    flashSaleEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-3',
    name: 'Genshin Impact - Genesis Crystal',
    description: 'Top up Genesis Crystal Genshin Impact! Resmi dan aman.',
    image: '',
    price: 0,
    category: 'game-topup',
    deliveryType: 'auto',
    variants: [
      { name: 'Jumlah Crystal', options: [
        { label: '60 Crystal', price: 16000, stock: 999 },
        { label: '300 Crystal', price: 79000, stock: 999 },
        { label: '980 Crystal', price: 249000, stock: 999 },
        { label: '1980 Crystal', price: 479000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: false,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-4',
    name: 'PUBG Mobile - UC',
    description: 'Top up UC PUBG Mobile tercepat! Proses instan.',
    image: '',
    price: 0,
    category: 'game-topup',
    deliveryType: 'auto',
    variants: [
      { name: 'Jumlah UC', options: [
        { label: '60 UC', price: 15000, stock: 999 },
        { label: '325 UC', price: 75000, stock: 999 },
        { label: '660 UC', price: 150000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: false,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-5',
    name: 'Google Play Gift Card',
    description: 'Voucher Google Play untuk pembelian app & game favorit!',
    image: '',
    price: 0,
    category: 'voucher-digital',
    deliveryType: 'link',
    variants: [
      { name: 'Nominal', options: [
        { label: 'Rp 15.000', price: 17000, stock: 999 },
        { label: 'Rp 30.000', price: 33000, stock: 999 },
        { label: 'Rp 50.000', price: 54000, stock: 999 },
        { label: 'Rp 100.000', price: 105000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: true,
    flashSalePrice: 15500,
    flashSaleEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    sortOrder: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-6',
    name: 'Spotify Premium',
    description: 'Langganan Spotify Premium tanpa ribet! Nikmati musik tanpa iklan.',
    image: '',
    price: 0,
    category: 'streaming',
    deliveryType: 'link',
    variants: [
      { name: 'Durasi', options: [
        { label: '1 Bulan', price: 55000, stock: 999 },
        { label: '3 Bulan', price: 155000, stock: 999 },
        { label: '6 Bulan', price: 299000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: false,
    sortOrder: 6,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-7',
    name: 'Netflix Premium',
    description: 'Akses Netflix Premium penuh fitur! Streaming tanpa batas.',
    image: '',
    price: 0,
    category: 'streaming',
    deliveryType: 'link',
    variants: [
      { name: 'Paket', options: [
        { label: '1 Bulan Mobile', price: 55000, stock: 999 },
        { label: '1 Bulan Standard', price: 120000, stock: 999 },
        { label: '1 Bulan Premium', price: 186000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: false,
    sortOrder: 7,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-8',
    name: 'Instagram Followers',
    description: 'Tingkatkan followers Instagram kamu! Aman dan berkualitas.',
    image: '',
    price: 0,
    category: 'social-media',
    deliveryType: 'auto',
    variants: [
      { name: 'Jumlah', options: [
        { label: '100 Followers', price: 25000, stock: 999 },
        { label: '500 Followers', price: 95000, stock: 999 },
        { label: '1000 Followers', price: 175000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: false,
    sortOrder: 8,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-9',
    name: 'Token Listrik PLN',
    description: 'Beli token listrik PLN cepat & mudah! 24 jam nonstop.',
    image: '',
    price: 0,
    category: 'utilities',
    deliveryType: 'auto',
    variants: [
      { name: 'Nominal', options: [
        { label: 'Rp 20.000', price: 21500, stock: 999 },
        { label: 'Rp 50.000', price: 51500, stock: 999 },
        { label: 'Rp 100.000', price: 101500, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: false,
    sortOrder: 9,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-10',
    name: 'Honor of Kings - Token',
    description: 'Top up Token Honor of Kings! Promo spesial tersedia.',
    image: '',
    price: 0,
    category: 'game-topup',
    deliveryType: 'auto',
    variants: [
      { name: 'Jumlah Token', options: [
        { label: '50 Token', price: 15000, stock: 999 },
        { label: '100 Token', price: 29000, stock: 999 },
        { label: '500 Token', price: 139000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: false,
    sortOrder: 10,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-11',
    name: 'YouTube Premium',
    description: 'Nikmati YouTube tanpa iklan! Download video untuk offline.',
    image: '',
    price: 0,
    category: 'streaming',
    deliveryType: 'link',
    variants: [
      { name: 'Durasi', options: [
        { label: '1 Bulan', price: 55000, stock: 999 },
        { label: '3 Bulan', price: 155000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: true,
    flashSalePrice: 49000,
    flashSaleEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    sortOrder: 11,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-12',
    name: 'TikTok Coins',
    description: 'Beli TikTok Coins untuk gift ke creator favorit!',
    image: '',
    price: 0,
    category: 'social-media',
    deliveryType: 'auto',
    variants: [
      { name: 'Jumlah Coins', options: [
        { label: '100 Coins', price: 16000, stock: 999 },
        { label: '500 Coins', price: 78000, stock: 999 },
        { label: '1000 Coins', price: 155000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: false,
    sortOrder: 12,
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_CATEGORIES = [
  { _id: 'cat-1', name: 'Game Top Up', slug: 'game-topup', icon: '🎮', color: '#FF8C42', sortOrder: 1, isActive: true },
  { _id: 'cat-2', name: 'Voucher Digital', slug: 'voucher-digital', icon: '🎫', color: '#6BCB77', sortOrder: 2, isActive: true },
  { _id: 'cat-3', name: 'Social Media', slug: 'social-media', icon: '📱', color: '#4FC0D0', sortOrder: 3, isActive: true },
  { _id: 'cat-4', name: 'Streaming', slug: 'streaming', icon: '🎬', color: '#FFD93D', sortOrder: 4, isActive: true },
  { _id: 'cat-5', name: 'Utilities', slug: 'utilities', icon: '⚡', color: '#FF6B6B', sortOrder: 5, isActive: true },
];

export const DEMO_BANNERS = [
  {
    _id: 'banner-1',
    title: 'Flash Sale Gaming Week!',
    image: '',
    link: '',
    isActive: true,
    sortOrder: 1,
  },
  {
    _id: 'banner-2',
    title: 'Top Up Murah Setiap Hari',
    image: '',
    link: '',
    isActive: true,
    sortOrder: 2,
  },
];

export const DEMO_THEMES = [
  {
    _id: 'theme-1',
    name: 'Craig Of The Creek',
    slug: 'craig-of-the-creek',
    description: 'Tema utama Craig Of The Creek dengan hutan dan petualangan',
    isActive: true,
    icon: '🌲',
    colors: {
      primary: '#FF8C42',
      secondary: '#6BCB77',
      accent: '#4FC0D0',
      background: '#F5EDDC',
      card: '#FFFFFF',
      text: '#2C3E2D',
      border: '#3D5A3E',
    },
    font: 'system-ui',
    effects: { rain: false, thunder: false, sun: false, particles: false, leaves: true, fireflies: false, clouds: true },
  },
  {
    _id: 'theme-2',
    name: 'Cartoon Network',
    slug: 'cartoon-network',
    description: 'Tema klasik Cartoon Network dengan warna cerah',
    isActive: false,
    icon: '📺',
    colors: {
      primary: '#FF5722',
      secondary: '#FFC107',
      accent: '#00BCD4',
      background: '#FFFDE7',
      card: '#FFFFFF',
      text: '#212121',
      border: '#212121',
    },
    font: 'system-ui',
    effects: { rain: false, thunder: false, sun: false, particles: false, leaves: false, fireflies: false, clouds: true },
  },
  {
    _id: 'theme-3',
    name: 'Adventure Cartoon',
    slug: 'adventure-cartoon',
    description: 'Tema petualangan dengan warna hangat dan cerah',
    isActive: false,
    icon: '🗺️',
    colors: {
      primary: '#FF6F00',
      secondary: '#FFB74D',
      accent: '#26A69A',
      background: '#FFF3E0',
      card: '#FFFFFF',
      text: '#4A3728',
      border: '#5D4037',
    },
    font: 'system-ui',
    effects: { rain: false, thunder: false, sun: true, particles: false, leaves: false, fireflies: false, clouds: true },
  },
  {
    _id: 'theme-4',
    name: 'Forest Cartoon',
    slug: 'forest-cartoon',
    description: 'Tema hutan dengan nuansa hijau dan kunang-kunang',
    isActive: false,
    icon: '🌳',
    colors: {
      primary: '#43A047',
      secondary: '#81C784',
      accent: '#8BC34A',
      background: '#E8F5E9',
      card: '#FFFFFF',
      text: '#1B5E20',
      border: '#2E7D32',
    },
    font: 'system-ui',
    effects: { rain: false, thunder: false, sun: false, particles: false, leaves: true, fireflies: true, clouds: false },
  },
  {
    _id: 'theme-5',
    name: 'Night Adventure',
    slug: 'night-adventure',
    description: 'Tema malam petualangan dengan bintang dan kunang-kunang',
    isActive: false,
    icon: '🌙',
    colors: {
      primary: '#E94560',
      secondary: '#533483',
      accent: '#4FC0D0',
      background: '#1A1A2E',
      card: '#16213E',
      text: '#E0E0E0',
      border: '#533483',
    },
    font: 'system-ui',
    effects: { rain: false, thunder: false, sun: false, particles: false, leaves: false, fireflies: true, clouds: false },
  },
];

export const DEMO_SETTINGS: Record<string, string> = {
  site_name: 'Craig Of the Creek',
  site_slogan: 'Petualangan Digital Dimulai di Sini!',
  site_logo: '',
  site_favicon: '',
  site_description: 'Toko digital Cartoon Network style. Top up game, voucher, dan layanan digital lainnya',
  social_instagram: '',
  social_whatsapp: '',
  social_telegram: '',
  social_youtube: '',
  social_tiktok: '',
  social_facebook: '',
  cashify_license_key: '',
  cashify_qr_id: '',
  telegram_bot_token: '',
  telegram_admin_id: '',
  fonnte_api_key: '',
  fonnte_admin_number: '',
  admin_password: 'admin123',
  payment_manual_info: 'Silakan transfer ke rekening berikut:\nBank BCA\nNo. Rek: 1234567890\nA.N: Craig Store',
  payment_manual_enabled: 'true',
  payment_qris_enabled: 'true',
  payment_dana_enabled: 'true',
  payment_ovo_enabled: 'true',
  payment_gopay_enabled: 'true',
  payment_bank_enabled: 'true',
  landing_enabled: 'true',
  landing_welcome_text: 'Selamat datang di Craig Of the Creek Digital Store!',
  banner_slide_delay: '4000',
};

// In-memory transaction store for demo
let demoTransactions: any[] = [];

export function addDemoTransaction(transaction: any) {
  demoTransactions.push(transaction);
  return transaction;
}

export function getDemoTransactions() {
  return demoTransactions;
}

export function findDemoTransaction(transactionId: string) {
  return demoTransactions.find(t => t.transactionId === transactionId);
}

export function updateDemoTransaction(transactionId: string, updates: any) {
  const idx = demoTransactions.findIndex(t => t.transactionId === transactionId);
  if (idx >= 0) {
    demoTransactions[idx] = { ...demoTransactions[idx], ...updates };
    return demoTransactions[idx];
  }
  return null;
}
