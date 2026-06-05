import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendProvider } from './resend.provider';
import type { SendEmailOptions } from './interfaces/email-template.interface';
import { verificationEmailTemplate, welcomeEmailTemplate } from './templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly resendProvider: ResendProvider,
    private readonly configService: ConfigService,
  ) {}

  async send(options: SendEmailOptions): Promise<void> {
    const from =
      this.configService.get<string>('email.from') ??
      'Daleel <onboarding@resend.dev>';

    const result = await this.resendProvider.getClient().emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (result.error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${result.error.message}`,
      );
      throw new Error(result.error.message);
    }
  }

  async sendVerificationCode(params: {
    to: string;
    name: string;
    otp: string;
    expiresInMinutes: number;
  }): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      this.logger.log(
        `[OTP signup] to=${params.to} name=${params.name} code=${params.otp} expiresIn=${params.expiresInMinutes}m`,
      );
      return;
    }
    const template = verificationEmailTemplate({
      name: params.name,
      otp: params.otp,
      expiresInMinutes: params.expiresInMinutes,
    });

    await this.send({
      to: params.to,
      subject: template.subject,
      html: template.html,
    });
  }

  async sendWelcomeEmail(params: { to: string; name: string }): Promise<void> {
    const template = welcomeEmailTemplate({ name: params.name });

    await this.send({
      to: params.to,
      subject: template.subject,
      html: template.html,
    });
  }
}
