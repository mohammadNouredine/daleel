import { Resend } from 'resend';
import { passwordResetEmailTemplate } from '../email/templates';

const RESET_PASSWORD_EXPIRES_HOURS = 1;

export async function deliverPasswordResetEmail(params: {
  to: string;
  name: string;
  url: string;
}): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Password reset] to=${params.to} name=${params.name} url=${params.url}`,
    );
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is required to send password reset emails.',
    );
  }

  const from = process.env.EMAIL_FROM ?? 'Daleel <onboarding@resend.dev>';
  const resend = new Resend(apiKey);
  const template = passwordResetEmailTemplate({
    name: params.name,
    url: params.url,
    expiresInHours: RESET_PASSWORD_EXPIRES_HOURS,
  });

  await resend.emails.send({
    from,
    to: params.to,
    subject: template.subject,
    html: template.html,
  });
}
