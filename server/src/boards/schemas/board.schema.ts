import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BoardStatus } from "../boards-status.enum";
import { Document, Types } from "mongoose";
import { User } from "src/auth/schemas/user.schema";

@Schema()
export class Board extends Document {
    @Prop({ required : true})
    title: string;

    @Prop({ required : true})
    description: string;

    @Prop({ required : true})
    status : BoardStatus

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    id: User;
}

export const BoardSchema = SchemaFactory.createForClass(Board);