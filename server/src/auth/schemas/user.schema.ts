
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class User extends Document { 
  @Prop({ required : true, unique: true})
  username : string;

  @Prop({ required: true })
  password: string;
  
  @Prop()
  email: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
