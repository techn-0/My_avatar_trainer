import { Module } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';
import { GuestbookController } from './guestbook.controller';

import { User, UserSchema } from '../../auth/schemas/user.schema';
// import { Guestbook, GuestbookSchema } from './schema/guestbook.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([
        // {name:Guestbook.name, schema:GuestbookSchema},
        {name:User.name, schema:UserSchema}
    ])
  ],
  providers: [GuestbookService],
  controllers: [GuestbookController],
  exports:[GuestbookService],
})
export class GuestbookModule {}
