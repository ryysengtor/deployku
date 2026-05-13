# Task 3 - Payment Fix + QRIS Only

## Task Summary
Fix Cashify payment status sync, make QRIS-only payment, update PaymentView

## Changes Made

### 1. `/src/app/api/payment/status/route.ts`
- Added `mapCashifyStatus()` helper function that properly maps Cashify statuses:
  - PAID/SETTLED/SUCCESS → 'paid'
  - EXPIRED → 'expired'  
  - CANCELLED → 'cancel'
  - Handles uppercase conversion for robustness
- Added `getProductDeliveryInfo()` helper that fetches product delivery info from MongoDB with demo data fallback
- When status changes to 'paid', fetches product delivery info and includes it in API response
- Returns `deliveryInfo` and `statusChanged` fields in response
- Status is checked using `cashifyTransactionId` (not website transactionId)

### 2. `/src/components/store/CheckoutForm.tsx`
- Removed all 6 payment method options (DANA, OVO, GoPay, Bank, Manual)
- Removed `PaymentMethod` type and `PAYMENT_METHODS` array
- Only shows QRIS as payment method with auto-selected highlighted card
- Changed pay button text to "Bayar dengan QRIS" with QrCode icon
- Removed ewallet payment method mapping logic
- Simplified imports (removed Wallet, Smartphone, Building2, FileText)

### 3. `/src/components/store/PaymentView.tsx`
- Removed E-Wallet/Bank/Manual payment instruction sections
- Removed manual upload bukti transfer section
- Only shows QRIS QR code section (always for QRIS-only)
- Changed auto-polling interval from 10s to 5s
- Added `isAutoChecking` state with `StatusCheckIndicator` component showing live animation during auto-checks
- Added "Status dicek otomatis setiap 5 detik" text when idle
- Improved delivery info display: Package icon, larger card, prominent download/drive links
- Added loading spinner for delivery info while fetching
- Simplified payment method display to always show "QRIS" with QrCode icon
- Uses `deliveryInfo` from status API response when available
- Removed Upload import (no longer needed)

## Verification
- ESLint passes clean
- Dev server running on port 3000
