import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message, MessageSchema} from './schema/message.schema';
import { User, UserSchema } from '../../auth/schemas/user.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:Message.name, schema:MessageSchema},
      {name:User.name, schema:UserSchema},
    ])

  ],
  providers: [MessageService],
  controllers: [MessageController],
  exports:[MessageService],
})
export class MessageModule {}
