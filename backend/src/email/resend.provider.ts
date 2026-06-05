import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export const RESEND_CLIENT = Symbol('RESEND_CLIENT');

@Injectable()
export class ResendProvider implements OnModuleInit {
  private client: Resend | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('email.resendApiKey');
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is required. Set it in environment variables to enable email delivery.',
      );
    }
    this.client = new Resend(apiKey);
  }

  getClient(): Resend {
    if (!this.client) {
      throw new Error('Resend client is not initialized');
    }
    return this.client;
  }
}
