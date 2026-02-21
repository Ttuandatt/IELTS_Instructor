import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private redis: Redis;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379');
  }

  async getHealth() {
    let dbOk = false;
    let redisOk = false;

    // Check Postgres
    try {
      await this.dataSource.query('SELECT 1');
      dbOk = true;
    } catch {
      dbOk = false;
    }

    // Check Redis
    try {
      const pong = await this.redis.ping();
      redisOk = pong === 'PONG';
    } catch {
      redisOk = false;
    }

    const allOk = dbOk && redisOk;

    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbOk ? 'connected' : 'disconnected',
        redis: redisOk ? 'connected' : 'disconnected',
      },
    };
  }
}
