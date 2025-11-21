import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY not configured. Email functionality will be disabled.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendBriefEmailParams {
  to: string;
  userName: string;
  briefTopic: string;
  pdfUrl: string;
  briefId: string;
}

/**
 * Sends an email notification when a brief is generated
 */
export async function sendBriefEmail({
  to,
  userName,
  briefTopic,
  pdfUrl,
  briefId,
}: SendBriefEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('❌ Resend not configured. Cannot send email.');
    return { success: false, error: 'Email service not configured' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const briefPageUrl = `${appUrl}/brief/${briefId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Contenov <noreply@contenov.com>',
      to: [to],
      subject: `Your brief for "${briefTopic}" is ready! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Brief is Ready</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #FF1B6B 0%, #FF8B3D 50%, #FFB85F 100%); border-radius: 12px 12px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Your Brief is Ready! 🎉</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 20px; color: #0A2540; font-size: 16px; line-height: 1.6;">
                          Hi ${userName || 'there'},
                        </p>
                        
                        <p style="margin: 0 0 20px; color: #0A2540; font-size: 16px; line-height: 1.6;">
                          Great news! Your content brief for <strong>"${briefTopic}"</strong> has been successfully generated.
                        </p>
                        
                        <p style="margin: 0 0 30px; color: #64748B; font-size: 14px; line-height: 1.6;">
                          You can access your brief in two ways:
                        </p>
                        
                        <!-- CTA Buttons -->
                        <table role="presentation" style="width: 100%; margin: 30px 0;">
                          <tr>
                            <td style="text-align: center; padding: 0 0 15px;">
                              <a href="${pdfUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF1B6B 0%, #FF8B3D 50%, #FFB85F 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(255, 27, 107, 0.3);">
                                📄 Download PDF
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td style="text-align: center;">
                              <a href="${briefPageUrl}" style="display: inline-block; padding: 12px 28px; background-color: #ffffff; color: #FF1B6B; text-decoration: none; border: 2px solid #FF1B6B; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                👁️ View in Dashboard
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 30px 0 0; color: #64748B; font-size: 12px; line-height: 1.6;">
                          The PDF link will remain active for 30 days. You can also access this brief anytime from your dashboard.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #FAFAFA; border-radius: 0 0 12px 12px; border-top: 1px solid #E3E8EF;">
                        <p style="margin: 0 0 10px; color: #64748B; font-size: 12px; text-align: center;">
                          Generated by <strong style="color: #FF1B6B;">Contenov</strong>
                        </p>
                        <p style="margin: 0; color: #94A3B8; font-size: 11px; text-align: center;">
                          If you have any questions, feel free to reach out to our support team.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Unsubscribe / Footer -->
                  <table role="presentation" style="max-width: 600px; margin: 20px auto 0;">
                    <tr>
                      <td style="text-align: center; padding: 20px;">
                        <p style="margin: 0; color: #94A3B8; font-size: 11px;">
                          This is an automated email. You're receiving this because you generated a brief on Contenov.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send email:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

