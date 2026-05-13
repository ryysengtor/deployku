/**
 * Notification System - Telegram Bot + WhatsApp Fonnte
 * Sends real-time notifications for store events
 */

// ─── Telegram Bot ────────────────────────────────────────────────────────────

interface TelegramMessageParams {
  text: string;
  parseMode?: 'Markdown' | 'HTML';
}

export async function sendTelegram({ text, parseMode = 'Markdown' }: TelegramMessageParams): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.TELEGRAM_ADMIN_ID;

  if (!botToken || !adminId) {
    console.warn('⚠️ Telegram credentials not configured');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();

    if (data.ok) {
      console.log('✅ Telegram notification sent');
      return true;
    } else {
      console.error('❌ Telegram API error:', data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Telegram send error:', error);
    return false;
  }
}

// ─── WhatsApp Fonnte ────────────────────────────────────────────────────────

interface WhatsAppMessageParams {
  message: string;
  target?: string;
}

export async function sendWhatsApp({ message, target }: WhatsAppMessageParams): Promise<boolean> {
  const apiKey = process.env.FONNTE_API_KEY;
  const defaultNumber = process.env.FONNTE_ADMIN_NUMBER;

  if (!apiKey || !defaultNumber) {
    console.warn('⚠️ Fonnte credentials not configured');
    return false;
  }

  const recipient = target || defaultNumber;

  try {
    const url = 'https://api.fonnte.com/send';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        target: recipient,
        message,
      }),
    });

    const data = await res.json();

    if (data.status) {
      console.log('✅ WhatsApp notification sent');
      return true;
    } else {
      console.error('❌ Fonnte API error:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    return false;
  }
}

// ─── Combined Notification Helpers ──────────────────────────────────────────

interface TransactionNotificationData {
  transactionId: string;
  productName: string;
  variantLabel?: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
}

/**
 * Send notification when a new transaction is created
 */
export async function notifyNewTransaction(data: TransactionNotificationData): Promise<void> {
  const methodLabels: Record<string, string> = {
    qris: '💳 QRIS',
    ewallet: '📱 E-Wallet',
    dana: '💰 DANA',
    ovo: '💜 OVO',
    gopay: '🟢 GoPay',
    bank: '🏦 Bank Transfer',
    manual: '📋 Manual Transfer',
  };

  const methodLabel = methodLabels[data.paymentMethod] || data.paymentMethod;
  const variantInfo = data.variantLabel ? `\n  ├ Variant: ${data.variantLabel}` : '';
  const formattedAmount = `Rp${data.totalAmount.toLocaleString('id-ID')}`;

  // Telegram message
  const telegramText = [
    '🌲 *CRAIG OF THE CREEK STORE* 🌲',
    '━━━━━━━━━━━━━━━━━━━━━━',
    '🛒 *PESANAN BARU!*',
    '',
    `  ├ ID: \`${data.transactionId}\``,
    `  ├ Produk: *${data.productName}*${variantInfo}`,
    `  ├ Harga: ${formattedAmount}`,
    `  ├ Bayar: ${methodLabel}`,
    `  ├ Nama: ${data.customerName}`,
    `  ├ HP: ${data.customerPhone}`,
    `  └ Status: ⏳ Menunggu Pembayaran`,
    '',
    `⏰ ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
  ].join('\n');

  // WhatsApp message
  const whatsappText = [
    '🌲 *CRAIG OF THE CREEK STORE* 🌲',
    '━━━━━━━━━━━━━━━━━━━━━━',
    '🛒 *PESANAN BARU!*',
    '',
    `ID: ${data.transactionId}`,
    `Produk: ${data.productName}${data.variantLabel ? ` (${data.variantLabel})` : ''}`,
    `Harga: ${formattedAmount}`,
    `Bayar: ${methodLabel}`,
    `Nama: ${data.customerName}`,
    `HP: ${data.customerPhone}`,
    `Status: Menunggu Pembayaran`,
    '',
    `Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
  ].join('\n');

  // Send both notifications in parallel
  await Promise.allSettled([
    sendTelegram({ text: telegramText }),
    sendWhatsApp({ message: whatsappText }),
  ]);
}

/**
 * Send notification when payment is confirmed
 */
export async function notifyPaymentConfirmed(data: TransactionNotificationData): Promise<void> {
  const formattedAmount = `Rp${data.totalAmount.toLocaleString('id-ID')}`;

  // Telegram message
  const telegramText = [
    '🌲 *CRAIG OF THE CREEK STORE* 🌲',
    '━━━━━━━━━━━━━━━━━━━━━━',
    '✅ *PEMBAYARAN DITERIMA!*',
    '',
    `  ├ ID: \`${data.transactionId}\``,
    `  ├ Produk: *${data.productName}*`,
    `  ├ Harga: ${formattedAmount}`,
    `  ├ Nama: ${data.customerName}`,
    `  └ Status: ✅ Lunas`,
    '',
    `⏰ ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
  ].join('\n');

  // WhatsApp message
  const whatsappText = [
    '🌲 *CRAIG OF THE CREEK STORE* 🌲',
    '━━━━━━━━━━━━━━━━━━━━━━',
    '✅ *PEMBAYARAN DITERIMA!*',
    '',
    `ID: ${data.transactionId}`,
    `Produk: ${data.productName}`,
    `Harga: ${formattedAmount}`,
    `Nama: ${data.customerName}`,
    `Status: Lunas`,
    '',
    `Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
  ].join('\n');

  // Also send to customer via WhatsApp
  const customerText = [
    '🌲 *CRAIG OF THE CREEK STORE* 🌲',
    '',
    `✅ Pembayaran kamu sudah dikonfirmasi!`,
    '',
    `Produk: ${data.productName}`,
    `Harga: ${formattedAmount}`,
    `ID: ${data.transactionId}`,
    '',
    'Terima kasih sudah berbelanja! 🎉',
  ].join('\n');

  await Promise.allSettled([
    sendTelegram({ text: telegramText }),
    sendWhatsApp({ message: whatsappText }),
    sendWhatsApp({ message: customerText, target: data.customerPhone }),
  ]);
}

/**
 * Send notification when payment is expired/cancelled
 */
export async function notifyPaymentExpired(data: TransactionNotificationData): Promise<void> {
  const formattedAmount = `Rp${data.totalAmount.toLocaleString('id-ID')}`;

  const telegramText = [
    '🌲 *CRAIG OF THE CREEK STORE* 🌲',
    '━━━━━━━━━━━━━━━━━━━━━━',
    '❌ *PEMBAYARAN EXPIRED*',
    '',
    `  ├ ID: \`${data.transactionId}\``,
    `  ├ Produk: *${data.productName}*`,
    `  ├ Harga: ${formattedAmount}`,
    `  └ Status: ❌ ${data.status === 'expired' ? 'Expired' : 'Dibatalkan'}`,
    '',
    `⏰ ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
  ].join('\n');

  const whatsappText = [
    '🌲 *CRAIG OF THE CREEK STORE* 🌲',
    '',
    `❌ Pembayaran ${data.status === 'expired' ? 'expired' : 'dibatalkan'}`,
    '',
    `ID: ${data.transactionId}`,
    `Produk: ${data.productName}`,
    `Harga: ${formattedAmount}`,
    '',
    `Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
  ].join('\n');

  await Promise.allSettled([
    sendTelegram({ text: telegramText }),
    sendWhatsApp({ message: whatsappText }),
  ]);
}

/**
 * Test notification - send a test message to verify credentials
 */
export async function testNotifications(): Promise<{
  telegram: boolean;
  whatsapp: boolean;
}> {
  const [telegram, whatsapp] = await Promise.allSettled([
    sendTelegram({
      text: [
        '🌲 *CRAIG OF THE CREEK STORE* 🌲',
        '',
        '✅ *Testing Notifikasi Telegram*',
        '',
        'Pesan test dari Craig Of The Creek Digital Store.',
        '',
        `⏰ ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
      ].join('\n'),
    }),
    sendWhatsApp({
      message: [
        '🌲 *CRAIG OF THE CREEK STORE* 🌲',
        '',
        '✅ Testing Notifikasi WhatsApp',
        '',
        'Pesan test dari Craig Of The Creek Digital Store.',
        '',
        `Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
      ].join('\n'),
    }),
  ]);

  return {
    telegram: telegram.status === 'fulfilled' && telegram.value === true,
    whatsapp: whatsapp.status === 'fulfilled' && whatsapp.value === true,
  };
}
