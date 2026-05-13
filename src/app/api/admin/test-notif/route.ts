import { testNotifications } from '@/lib/notifications';

export async function POST() {
  try {
    const result = await testNotifications();

    return Response.json({
      success: true,
      data: {
        telegram: result.telegram ? '✅ Sent' : '❌ Failed',
        whatsapp: result.whatsapp ? '✅ Sent' : '❌ Failed',
        telegramConfigured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_ID),
        whatsappConfigured: !!(process.env.FONNTE_API_KEY && process.env.FONNTE_ADMIN_NUMBER),
      },
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return Response.json(
      { success: false, error: 'Failed to send test notifications' },
      { status: 500 }
    );
  }
}
