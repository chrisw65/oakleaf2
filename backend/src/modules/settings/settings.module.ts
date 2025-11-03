import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PlatformSetting } from './settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlatformSetting]),
    ConfigModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
