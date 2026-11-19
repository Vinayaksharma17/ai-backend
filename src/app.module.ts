import { BullModule } from '@nestjs/bullmq';
import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { ThrottlerModule } from '@nestjs/throttler';
import { Redis } from 'ioredis';
import { LoggerModule } from 'nestjs-pino';

import { AiModule } from './ai/ai.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const REDIS_CONNECTION = 'REDIS_CONNECTION';

const appKey = process.env.OBSERVE_APP_KEY;
const appSecret = process.env.OBSERVE_APP_SECRET;

const observeImports =
  appKey && appSecret
    ? [
        ObserveModule.forRoot({
          appKey,
          appSecret,
          serviceId: 'ai-backend',
        }),
      ]
    : [];

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          maxRetriesPerRequest: null,
        }),
    },
  ],
  exports: [REDIS_CONNECTION],
})
class RedisConnectionModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CONNECTION) private readonly redis: Redis) {}

  async onApplicationShutdown() {
    await this.redis.quit().catch(() => this.redis.disconnect());
  }
}

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        base: { service: 'ai-backend' },
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
          censor: '[REDACTED]',
        },
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: true,
                },
              },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisConnectionModule,
    BullModule.forRootAsync({
      imports: [RedisConnectionModule],
      inject: [REDIS_CONNECTION],
      useFactory: (connection: Redis) => ({ connection }),
    }),
    AiModule,
    ...observeImports,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
