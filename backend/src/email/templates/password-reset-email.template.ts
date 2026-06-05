import type { EmailTemplateResult } from '../interfaces/email-template.interface';

export interface PasswordResetEmailParams {
  name: string;
  url: string;
  expiresInHours: number;
}

export function passwordResetEmailTemplate(
  params: PasswordResetEmailParams,
): EmailTemplateResult {
  const { name, url, expiresInHours } = params;

  return {
    subject: 'Reset your Daleel password',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Daleel password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.02em;">Daleel</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#18181b;font-size:16px;font-weight:600;">Hi ${escapeHtml(name)},</p>
              <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6;">
                We received a request to reset your password. Click the button below to choose a new one.
              </p>
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${escapeHtml(url)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;">Reset password</a>
              </div>
              <p style="margin:0 0 8px;color:#52525b;font-size:14px;line-height:1.6;">
                This link expires in <strong>${expiresInHours} hour${expiresInHours === 1 ? '' : 's'}</strong>.
              </p>
              <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.6;">
                If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;">&copy; Daleel &mdash; Humanitarian crisis management for Lebanon</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
