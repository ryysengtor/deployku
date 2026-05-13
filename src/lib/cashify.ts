const CASHIFY_BASE_URL = (process.env.CASHIFY_BASE_URL || 'https://cashify.my.id') + '/api';

interface CashifyConfig {
  licenseKey: string;
  qrId: string;
}

function getConfig(): CashifyConfig {
  return {
    licenseKey: process.env.CASHIFY_LICENSE_KEY || '',
    qrId: process.env.CASHIFY_QR_ID || '',
  };
}

interface GenerateQRISParams {
  amount: number;
  useUniqueCode?: boolean;
  packageIds?: string[];
  expiredInMinutes?: number;
}

interface GenerateQRISV2Params extends GenerateQRISParams {
  qrType?: 'dynamic' | 'static';
  paymentMethod?: 'qris' | 'ewallet';
  useQris?: boolean;
}

/**
 * Generate QRIS v1 - Basic QRIS payment
 */
export async function generateQRIS(params: GenerateQRISParams) {
  const config = getConfig();

  console.log('[Cashify] generateQRIS called:', {
    amount: params.amount,
    useUniqueCode: params.useUniqueCode ?? true,
    hasLicenseKey: !!config.licenseKey,
    hasQrId: !!config.qrId,
  });

  const response = await fetch(`${CASHIFY_BASE_URL}/generate/qris`, {
    method: 'POST',
    headers: {
      'x-license-key': config.licenseKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id: config.qrId,
      amount: params.amount,
      useUniqueCode: params.useUniqueCode ?? true,
      packageIds: params.packageIds || ['com.orderkuota.app'],
      expiredInMinutes: params.expiredInMinutes || 15,
    }),
  });

  const data = await response.json();
  console.log('[Cashify] generateQRIS response:', JSON.stringify(data, null, 2));
  return data;
}

/**
 * Generate QRIS v2 - Dynamic/Static QRIS + E-Wallet support
 */
export async function generateQRISV2(params: GenerateQRISV2Params) {
  const config = getConfig();

  const response = await fetch(`${CASHIFY_BASE_URL}/generate/v2/qris`, {
    method: 'POST',
    headers: {
      'x-license-key': config.licenseKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      qr_id: config.qrId,
      amount: params.amount,
      useUniqueCode: params.useUniqueCode ?? true,
      packageIds: params.packageIds || ['com.orderkuota.app'],
      expiredInMinutes: params.expiredInMinutes || 15,
      qrType: params.qrType || 'dynamic',
      paymentMethod: params.paymentMethod || 'qris',
      useQris: params.useQris ?? true,
    }),
  });

  const data = await response.json();
  return data;
}

/**
 * Generate E-Wallet payment (DANA, OVO, GoPay)
 */
export async function generateEWallet(params: GenerateQRISParams) {
  const config = getConfig();

  const response = await fetch(`${CASHIFY_BASE_URL}/generate/v2/qris`, {
    method: 'POST',
    headers: {
      'x-license-key': config.licenseKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      qr_id: config.qrId,
      amount: params.amount,
      useUniqueCode: params.useUniqueCode ?? true,
      packageIds: params.packageIds || ['com.orderkuota.app'],
      expiredInMinutes: params.expiredInMinutes || 15,
      paymentMethod: 'ewallet',
      useQris: false,
    }),
  });

  const data = await response.json();
  return data;
}

/**
 * Check transaction payment status via Cashify
 * Cashify v1 endpoint: POST /api/generate/check-status with body { transactionId }
 *
 * Response may have status in:
 *   - data.status (e.g. "PAID", "SETTLED", "SUCCESS", "EXPIRED", "CANCELLED", "PENDING")
 *   - data.transactionStatus (alternative field some Cashify versions use)
 */
export async function checkTransactionStatus(transactionId: string) {
  const config = getConfig();

  console.log('[Cashify] checkTransactionStatus called:', {
    transactionId,
    hasLicenseKey: !!config.licenseKey,
  });

  try {
    const response = await fetch(`${CASHIFY_BASE_URL}/generate/check-status`, {
      method: 'POST',
      headers: {
        'x-license-key': config.licenseKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ transactionId }),
    });

    const data = await response.json();

    // Log the full Cashify response for debugging
    console.log('[Cashify] checkTransactionStatus FULL response:', JSON.stringify(data, null, 2));

    // Extract the payment status from various possible response structures
    // Structure 1: { status: 200, data: { status: "PAID", ... } }
    // Structure 2: { status: 200, data: { transactionStatus: "PAID", ... } }
    // Structure 3: { status: 200, message: "PAID" }
    const extractedStatus =
      data?.data?.status ||
      data?.data?.transactionStatus ||
      (data?.status === 200 && typeof data?.message === 'string' ? data.message : null) ||
      null;

    console.log('[Cashify] Extracted payment status:', {
      'data.data.status': data?.data?.status,
      'data.data.transactionStatus': data?.data?.transactionStatus,
      'data.message': data?.message,
      'resolvedStatus': extractedStatus,
    });

    return {
      raw: data,
      extractedStatus,
      httpStatus: data?.status || response.status,
    };
  } catch (error) {
    console.error('[Cashify] checkTransactionStatus error:', error);
    return {
      raw: null,
      extractedStatus: null,
      httpStatus: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Cancel a transaction via Cashify
 */
export async function cancelTransaction(transactionId: string) {
  const config = getConfig();

  console.log('[Cashify] cancelTransaction called:', { transactionId });

  try {
    const response = await fetch(`${CASHIFY_BASE_URL}/generate/cancel-status`, {
      method: 'POST',
      headers: {
        'x-license-key': config.licenseKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ transactionId }),
    });

    const data = await response.json();
    console.log('[Cashify] cancelTransaction response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('[Cashify] cancelTransaction error:', error);
    return null;
  }
}

/**
 * List payments from Cashify
 */
export async function listPayments(params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}) {
  const config = getConfig();

  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sort) searchParams.set('sort', params.sort);

  const response = await fetch(`${CASHIFY_BASE_URL}/generate/list?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'x-license-key': config.licenseKey,
    },
  });

  const data = await response.json();
  return data;
}
