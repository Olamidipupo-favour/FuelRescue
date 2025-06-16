import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      // Retry connection after a delay
      setTimeout(async () => {
        try {
          await this.$connect();
        } catch (retryError) {
          console.error('Failed to reconnect to database:', retryError);
        }
      }, 5000);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Add a method to check connection health
  async checkConnection() {
    try {
      // Use a simple query to check connection
      await this.user.findFirst();
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }
}
