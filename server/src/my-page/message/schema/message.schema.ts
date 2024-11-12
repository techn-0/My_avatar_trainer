import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message extends Document{
    @Prop({ required: true })
    roomName:string;

    @Prop({ required: true , ref:'User'})
    sender: string;

    @Prop({ required: true })    
    content:string;

    @Prop({ default:()=> new Date(Date.now() + 9 * 60 * 60 * 1000 ) })
    timestamp:Date;

    // @Prop({ required:true, ref:'User' })
    // receiver:string;

}

export const MessageSchema = SchemaFactory.createForClass(Message);



