import type { EmailTemplateResult } from '../interfaces/email-template.interface';

export interface VerificationEmailParams {
  name: string;
  otp: string;
  expiresInMinutes: number;
}

export function verificationEmailTemplate(
  params: VerificationEmailParams,
): EmailTemplateResult {
  const { name, otp, expiresInMinutes } = params;

  return {
    subject: 'Verify your Daleel account',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your Daleel account</title>
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
                Use the verification code below to complete your account registration.
              </p>
              <div style="background:#f4f4f5;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#71717a;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">Verification code</p>
                <p style="margin:0;color:#0f766e;font-size:36px;font-weight:700;letter-spacing:0.25em;font-family:monospace;">${escapeHtml(otp)}</p>
              </div>
              <p style="margin:0 0 8px;color:#52525b;font-size:14px;line-height:1.6;">
                This code expires in <strong>${expiresInMinutes} minutes</strong>.
              </p>
              <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.6;">
                If you did not request this code, you can safely ignore this email.
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
