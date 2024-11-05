import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Comment extends Document{
    @Prop({type: String, ref:'User', required:true})
    ownerId : string;

    @Prop({type:String, ref:'User', required:true})
    userId: string;

    @Prop({type:String, ref:'User'})
    profilePic?:string;
    
    @Prop({type:String})
    comment:string;
    
    @Prop({ default:Date.now })
    createdAt:Date;
    
    // @Prop({type:String, ref:'User'})
    // tier: string;
}


export const CommentSchema = SchemaFactory.createForClass(Comment);

