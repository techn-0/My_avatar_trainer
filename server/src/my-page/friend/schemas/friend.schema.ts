import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

// Document Represents a MongoDB document
@Schema()
export class Friend extends Document {
    @Prop({ type:String, ref:'User', required: true})
    userId : string;

    @Prop({ type:String, ref:'User', required: true})
    friendUserId : string;

    @Prop({default:'pending'})
    status : string
}

export const FriendSchema = SchemaFactory.createForClass(Friend);