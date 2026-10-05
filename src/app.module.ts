import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AiModule } from './ai/ai.module.js';
import { ConfigModule } from '@nestjs/config';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

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

@Module({
  imports: [
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
    AiModule,
    ...observeImports,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
