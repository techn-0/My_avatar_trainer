import { Module } from '@nestjs/common';
import { TierController } from './tier.controller';
import { TierService } from './tier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOut, WorkOutSchema } from 'src/workout/schemas/workout.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { BullModule } from '@nestjs/bull';
import { TierProcessor } from './tier.processor';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: WorkOut.name, schema: WorkOutSchema}
      , {name: User.name, schema: UserSchema}])
      , BullModule.registerQueue({
        name: 'tier-update',
        redis: {
          host: 'localhost',
          port: 6379,
        }
      })
  ],
  controllers: [TierController],
  providers: [TierService,TierProcessor]
})
export class TierModule {}
