import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Global configuration of environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // TypeORM configuration (PostgreSQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: configService.getOrThrow<string>('POSTGRES_HOST'),
          port: configService.getOrThrow<number>('POSTGRES_PORT'),
          username: configService.getOrThrow<string>('POSTGRES_USER'),
          password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
          database: configService.getOrThrow<string>('POSTGRES_DB'),
          
          // Automatically loads imported entities into modules
          autoLoadEntities: true, 
          
          // CRITICAL: synchronize must be FALSE in production (manual migrations required)
          synchronize: !isProduction,
          logging: !isProduction,
        };
      },
    }),

    // Functional modules
    ScheduleModule.forRoot(),
    AuthModule,
    FilesModule,
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}