export async function GET() {
  try {
    return Response.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in health check:', error);
    return Response.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}
