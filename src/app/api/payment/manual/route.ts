// Manual payment route has been removed.
// This store now only supports QRIS payments via Cashify.
// This endpoint returns 410 Gone to indicate it is no longer available.

export async function POST() {
  return Response.json(
    { success: false, error: 'Manual payment is no longer supported. Please use QRIS.' },
    { status: 410 }
  );
}
