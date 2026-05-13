export async function GET() {
  try {
    return Response.json({
      success: true,
      message: 'Craig Of The Creek Store API',
      version: '1.0.0',
    });
  } catch (error) {
    console.error('Error in API root:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
