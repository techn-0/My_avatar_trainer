import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

import { User, UserSchema } from '../../auth/schemas/user.schema'
import { Comment, CommentSchema } from './schema/comment.schema'
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: User.name, schema:UserSchema},
      {name: Comment.name, schema:CommentSchema}
    ])
  ],
  providers: [CommentService],
  controllers: [CommentController],
  exports:[CommentService],
})
export class CommentModule {}
