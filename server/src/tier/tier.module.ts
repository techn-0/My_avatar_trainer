import { Module } from '@nestjs/common';
import { TierController } from './tier.controller';
import { TierService } from './tier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOut, WorkOutSchema } from 'src/workout/schemas/workout.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WorkOut.name, schema: WorkOutSchema}
      , {name: User.name, schema: UserSchema}])
  ],
  controllers: [TierController],
  providers: [TierService]
})
export class TierModule {}
