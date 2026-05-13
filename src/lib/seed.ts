import connectDB from './mongodb';
import Product from './models/Product';
import Category from './models/Category';
import Banner from './models/Banner';
import Settings from './models/Settings';
import Theme from './models/Theme';
import Voucher from './models/Voucher';
import FlashSale from './models/FlashSale';
import Admin from './models/Admin';
import Log from './models/Log';

const DEMO_CATEGORIES = [
  { name: 'Game Top Up', slug: 'game-topup', icon: '🎮', color: '#FF8C42', sortOrder: 1, isActive: true },
  { name: 'Voucher Digital', slug: 'voucher-digital', icon: '🎫', color: '#6BCB77', sortOrder: 2, isActive: true },
  { name: 'Social Media', slug: 'social-media', icon: '📱', color: '#4FC0D0', sortOrder: 3, isActive: true },
  { name: 'Streaming', slug: 'streaming', icon: '🎬', color: '#FFD93D', sortOrder: 4, isActive: true },
  { name: 'Utilities', slug: 'utilities', icon: '⚡', color: '#FF6B6B', sortOrder: 5, isActive: true },
];

const DEMO_PRODUCTS = [
  {
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
        { label: '344 Diamond', price: 76000, stock: 999 },
        { label: '514 Diamond', price: 114000, stock: 999 },
        { label: '706 Diamond', price: 152000, stock: 999 },
      ]},
    ],
    stock: 999,
    isActive: true,
    isFlashSale: true,
    flashSalePrice: 17000,
    flashSaleEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    sortOrder: 1,
  },
  {
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
    flashSaleEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    sortOrder: 2,
  },
  {
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
  },
  {
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
  },
  {
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
    flashSaleEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    sortOrder: 5,
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
    flashSaleEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    sortOrder: 11,
  },
  {
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
  },
];

const DEMO_SETTINGS = [
  { key: 'site_name', value: 'Craig Of the Creek' },
  { key: 'site_slogan', value: 'Petualangan Digital Dimulai di Sini!' },
  { key: 'site_logo', value: '' },
  { key: 'site_favicon', value: '' },
  { key: 'site_description', value: 'Toko digital Cartoon Network style. Top up game, voucher, dan layanan digital lainnya' },
  { key: 'social_instagram', value: '' },
  { key: 'social_whatsapp', value: '' },
  { key: 'social_telegram', value: '' },
  { key: 'social_youtube', value: '' },
  { key: 'social_tiktok', value: '' },
  { key: 'social_facebook', value: '' },
  { key: 'cashify_license_key', value: '' },
  { key: 'cashify_qr_id', value: '' },
  { key: 'telegram_bot_token', value: '' },
  { key: 'telegram_admin_id', value: '' },
  { key: 'fonnte_api_key', value: '' },
  { key: 'fonnte_admin_number', value: '' },
  { key: 'admin_password', value: 'admin123' },
  { key: 'payment_manual_info', value: 'Silakan transfer ke rekening berikut:\nBank BCA\nNo. Rek: 1234567890\nA.N: Craig Store' },
  { key: 'payment_manual_enabled', value: 'true' },
  { key: 'payment_qris_enabled', value: 'true' },
  { key: 'payment_dana_enabled', value: 'true' },
  { key: 'payment_ovo_enabled', value: 'true' },
  { key: 'payment_gopay_enabled', value: 'true' },
  { key: 'payment_bank_enabled', value: 'true' },
  { key: 'landing_enabled', value: 'true' },
  { key: 'landing_welcome_text', value: 'Selamat datang di Craig Of the Creek Digital Store!' },
];

const DEMO_THEMES = [
  {
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

const DEMO_VOUCHERS = [
  {
    code: 'CREEK10',
    discount: 10,
    discountType: 'percentage',
    minPurchase: 50000,
    maxUses: 100,
    usedCount: 23,
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'CREEK5K',
    discount: 5000,
    discountType: 'fixed',
    minPurchase: 100000,
    maxUses: 50,
    usedCount: 8,
    isActive: true,
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  },
];

const DEMO_BANNERS = [
  {
    title: 'Flash Sale Gaming Week!',
    image: '',
    link: '',
    isActive: true,
    sortOrder: 1,
  },
  {
    title: 'Top Up Murah Setiap Hari',
    image: '',
    link: '',
    isActive: true,
    sortOrder: 2,
  },
];

async function seed() {
  console.log('🌱 Starting database seed...');
  console.log('📦 Connecting to MongoDB Atlas...');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas');

    // Seed categories
    await Category.deleteMany({});
    await Category.insertMany(DEMO_CATEGORIES);
    console.log('✅ Categories seeded (' + DEMO_CATEGORIES.length + ')');

    // Seed products
    await Product.deleteMany({});
    await Product.insertMany(DEMO_PRODUCTS);
    console.log('✅ Products seeded (' + DEMO_PRODUCTS.length + ')');

    // Seed banners
    await Banner.deleteMany({});
    await Banner.insertMany(DEMO_BANNERS);
    console.log('✅ Banners seeded (' + DEMO_BANNERS.length + ')');

    // Seed settings
    await Settings.deleteMany({});
    await Settings.insertMany(DEMO_SETTINGS);
    console.log('✅ Settings seeded (' + DEMO_SETTINGS.length + ')');

    // Seed themes
    await Theme.deleteMany({});
    await Theme.insertMany(DEMO_THEMES);
    console.log('✅ Themes seeded (' + DEMO_THEMES.length + ')');

    // Seed vouchers
    await Voucher.deleteMany({});
    await Voucher.insertMany(DEMO_VOUCHERS);
    console.log('✅ Vouchers seeded (' + DEMO_VOUCHERS.length + ')');

    // Seed flash sale
    await FlashSale.deleteMany({});
    const flashSaleProducts = DEMO_PRODUCTS.filter(p => p.isFlashSale);
    const flashSaleData = flashSaleProducts.map(p => ({
      productId: p.name,
      salePrice: p.flashSalePrice || 0,
      originalPrice: p.variants[0]?.options[0]?.price || 0,
      startTime: new Date(),
      endTime: p.flashSaleEndTime || new Date(Date.now() + 4 * 60 * 60 * 1000),
      isActive: true,
    }));
    await FlashSale.insertMany(flashSaleData);
    console.log('✅ Flash Sale seeded (' + flashSaleData.length + ')');

    // Seed admin
    await Admin.deleteMany({});
    await Admin.create({
      username: 'admin',
      password: 'admin123',
      role: 'superadmin',
      isActive: true,
    });
    console.log('✅ Admin seeded');

    // Seed initial log
    await Log.create({
      level: 'info',
      action: 'database_seed',
      message: 'Database seeded successfully with Craig Of The Creek demo data',
    });
    console.log('✅ Initial log created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log('   - Products: ' + DEMO_PRODUCTS.length);
    console.log('   - Categories: ' + DEMO_CATEGORIES.length);
    console.log('   - Banners: ' + DEMO_BANNERS.length);
    console.log('   - Settings: ' + DEMO_SETTINGS.length);
    console.log('   - Themes: ' + DEMO_THEMES.length);
    console.log('   - Vouchers: ' + DEMO_VOUCHERS.length);
    console.log('   - Flash Sales: ' + flashSaleData.length);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
