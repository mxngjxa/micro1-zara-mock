import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LiveKitService } from './livekit.service';
import { LiveKitController } from './livekit.controller';

@Module({
  imports: [ConfigModule],
  providers: [LiveKitService],
  controllers: [LiveKitController],
  exports: [LiveKitService]
})
export class LiveKitModule {}