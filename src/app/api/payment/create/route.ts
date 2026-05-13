import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Transaction from '@/lib/models/Transaction';
import { generateQRIS } from '@/lib/cashify';
import { DEMO_PRODUCTS, addDemoTransaction } from '@/lib/demo-data';
import { randomUUID } from 'crypto';

async function sendNotifications(data: {
  transactionId: string;
  productName: string;
  variantLabel?: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: string;
}) {
  const methodLabels: Record<string, string> = {
    qris: '💳 QRIS',
  };
  const formattedAmount = `Rp${data.totalAmount.toLocaleString('id-ID')}`;
  const variant = data.variantLabel ? ` (${data.variantLabel})` : '';
  const method = methodLabels[data.paymentMethod] || '💳 QRIS';
  const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  // Telegram
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.TELEGRAM_ADMIN_ID;
  if (botToken && adminId) {
    const text = `🌲 *CRAIG OF THE CREEK STORE* 🌲\n━━━━━━━━━━━━━━━━━━━━━━\n🛒 *PESANAN BARU!*\n\n  ├ ID: \`${data.transactionId}\`\n  ├ Produk: *${data.productName}*${variant}\n  ├ Harga: ${formattedAmount}\n  ├ Bayar: ${method}\n  ├ Nama: ${data.customerName}\n  ├ HP: ${data.customerPhone}\n  └ Status: ⏳ Menunggu Pembayaran\n\n⏰ ${time} WIB`;
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminId, text, parse_mode: 'Markdown', disable_web_page_preview: true }),
    }).catch(() => {});
  }

  // WhatsApp Fonnte
  const fonnteKey = process.env.FONNTE_API_KEY;
  const fonnteNumber = process.env.FONNTE_ADMIN_NUMBER;
  if (fonnteKey && fonnteNumber) {
    const msg = `🌲 *CRAIG OF THE CREEK STORE* 🌲\n━━━━━━━━━━━━━━━━━━━━━━\n🛒 *PESANAN BARU!*\n\nID: ${data.transactionId}\nProduk: ${data.productName}${variant}\nHarga: ${formattedAmount}\nBayar: ${method}\nNama: ${data.customerName}\nHP: ${data.customerPhone}\nStatus: Menunggu Pembayaran\n\nWaktu: ${time} WIB`;
    fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': fonnteKey, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ target: fonnteNumber, message: msg }),
    }).catch(() => {});
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { productId, variantLabel, amount, customerName, customerPhone } = body;

    // QRIS only
    const paymentMethod = 'qris';

    if (!productId || !amount || !customerName || !customerPhone) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch product
    let product: any = await Product.findById(productId);
    if (!product) product = DEMO_PRODUCTS.find(p => p._id === productId);
    if (!product) {
      return Response.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Determine amount
    let variantName = '';
    let finalAmount = amount;
    if (variantLabel && product.variants?.length > 0) {
      for (const variant of product.variants) {
        const option = variant.options.find((opt: { label: string }) => opt.label === variantLabel);
        if (option) { variantName = variant.name; finalAmount = option.price; break; }
      }
    } else if (product.isFlashSale && product.flashSalePrice) {
      finalAmount = product.flashSalePrice;
    } else {
      finalAmount = product.price || amount;
    }

    let transactionId = '';
    let qrString = '';
    let totalAmount = finalAmount;
    let uniqueNominal = 0;

    // Use Cashify QRIS v1 - the Cashify transactionId IS our primary transactionId
    const hasCashifyKey = !!process.env.CASHIFY_LICENSE_KEY;

    if (hasCashifyKey) {
      console.log('[Payment Create] Creating Cashify QRIS payment for amount:', finalAmount);
      const cashifyData = await generateQRIS({
        amount: finalAmount,
        useUniqueCode: true,
        packageIds: ['com.orderkuota.app'],
        expiredInMinutes: 15,
      });

      if (cashifyData?.status === 200 && cashifyData?.data) {
        // *** USE CASHIFY transactionId AS OUR PRIMARY ID ***
        // This is the real ID from Cashify that can be used to check status
        transactionId = cashifyData.data.transactionId || cashifyData.data.transaction_id || '';
        qrString = cashifyData.data.qr_string || cashifyData.data.qrString || '';
        totalAmount = cashifyData.data.totalAmount || cashifyData.data.total_amount || finalAmount;
        uniqueNominal = cashifyData.data.uniqueNominal || cashifyData.data.unique_nominal || 0;

        console.log('[Payment Create] Cashify QRIS created successfully:', {
          transactionId,
          totalAmount,
          uniqueNominal,
          hasQrString: !!qrString,
        });
      } else {
        console.error('[Payment Create] Cashify API returned non-success:', JSON.stringify(cashifyData));
        // Fallback to mock QRIS with UUID-style ID
        transactionId = `MOCK-${randomUUID()}`;
        uniqueNominal = Math.floor(Math.random() * 900) + 100;
        totalAmount = finalAmount + uniqueNominal;
        qrString = `MOCK_QR_${transactionId}_${totalAmount}`;
        console.log('[Payment Create] Using fallback mock QRIS');
      }
    } else {
      // No Cashify key configured - use mock for demo with UUID-style ID
      console.log('[Payment Create] No CASHIFY_LICENSE_KEY, using mock QRIS');
      transactionId = `DEMO-${randomUUID()}`;
      uniqueNominal = Math.floor(Math.random() * 900) + 100;
      totalAmount = finalAmount + uniqueNominal;
      qrString = `MOCK_QR_${transactionId}_${totalAmount}`;
    }

    // Ensure we have a transactionId
    if (!transactionId) {
      transactionId = `FALLBACK-${randomUUID()}`;
    }

    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save transaction - transactionId is now the Cashify real ID
    try {
      await Transaction.create({
        transactionId, productName: product.name, variantName,
        variantLabel: variantLabel || '', customerName, customerPhone,
        amount: finalAmount, totalAmount, uniqueNominal, paymentMethod,
        status: 'pending', qrString,
        cashifyTransactionId: transactionId, // Same as transactionId now
        productId: productId.toString(), expiredAt,
      });
      console.log('[Payment Create] Transaction saved to DB:', { transactionId });
    } catch (dbError) {
      console.warn('[Payment Create] DB save failed, using demo data:', dbError);
      addDemoTransaction({
        transactionId, productName: product.name, variantName,
        variantLabel: variantLabel || '', customerName, customerPhone,
        amount: finalAmount, totalAmount, uniqueNominal, paymentMethod,
        status: 'pending', qrString,
        cashifyTransactionId: transactionId,
        productId: productId.toString(), expiredAt: expiredAt.toISOString(),
        createdAt: new Date().toISOString(),
      });
    }

    // Send notifications (fire and forget)
    sendNotifications({
      transactionId, productName: product.name,
      variantLabel: variantLabel || undefined,
      customerName, customerPhone, totalAmount, paymentMethod,
    });

    return Response.json({
      success: true,
      data: {
        transactionId, productName: product.name, variantName,
        variantLabel: variantLabel || '', amount: finalAmount,
        totalAmount, uniqueNominal, paymentMethod, status: 'pending',
        qrString, cashifyTransactionId: transactionId, expiredAt: expiredAt.toISOString(),
        isMock: !hasCashifyKey,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return Response.json({ success: false, error: 'Failed to create payment' }, { status: 500 });
  }
}
