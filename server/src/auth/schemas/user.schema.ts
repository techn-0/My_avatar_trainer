import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Board } from 'src/boards/schemas/board.schema';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  email: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Board' }] })
  boards: Board[];
}

export const UserSchema = SchemaFactory.createForClass(User);
