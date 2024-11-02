import { Module } from '@nestjs/common';
import { TierController } from './tier.controller';
import { TierService } from './tier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOut, WorkOutSchema } from 'src/workout/schemas/workout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WorkOut.name, schema: WorkOutSchema}])
  ],
  controllers: [TierController],
  providers: [TierService]
})
export class TierModule {}
