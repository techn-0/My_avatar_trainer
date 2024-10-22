import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

@Schema()
export class WorkOut extends Document {
  @Prop({ required: true })
  exercise: string;

  @Prop()
    duration: string;
    
  @Prop()
  count: number;
  @Prop()
  date: string;
  
  @Prop({ type: Types.ObjectId, ref: 'User',})
  owner : User;


}

export const WorkOutSchema = SchemaFactory.createForClass(WorkOut);
