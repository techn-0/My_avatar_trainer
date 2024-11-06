import { Module } from '@nestjs/common';
import { TierController } from './tier.controller';
import { TierService } from './tier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOut, WorkOutSchema } from 'src/workout/schemas/workout.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { BullModule } from '@nestjs/bull';
import { TierProcessor } from './tier.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkOut.name, schema: WorkOutSchema},
      { name: User.name, schema: UserSchema}]),
      BullModule.registerQueueAsync({
        name: 'tier-update',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          redis: {
            host: configService.get<string>('redis.host'),  
            port: configService.get<number>('redis.port'),
          },
        }),
        inject: [ConfigService],  // ConfigService를 factory에 주입
      }),
    ],
  controllers: [TierController],
  providers: [TierService,TierProcessor]
})
export class TierModule {}
