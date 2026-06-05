export interface EmailTemplateResult {
  subject: string;
  html: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}
