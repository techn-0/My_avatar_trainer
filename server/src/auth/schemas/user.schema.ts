
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class User extends Document { 
  @Prop({ required : true, unique: true})
  username: string;

  @Prop()
  password: string;

  @Prop()
  email: string;

  @Prop()
  social:string;

}
export const UserSchema = SchemaFactory.createForClass(User);
