import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Comment, CommentSchema} from './schema/comment.schema';
import {CommentDto} from './dto/comment.dto';

@Injectable()
export class CommentService {
    constructor(@InjectModel(Comment.name) private commentModel:Model<Comment>){}

    async postComment(commentDto:CommentDto) : Promise<Comment> {
        const newEntry = new this.commentModel(commentDto)
        return newEntry.save();
    }
     
    async getComments(ownerId:string) : Promise<Comment[]>{
        return this.commentModel.find({ownerId}).sort({createdAt:-1}).exec();
    }

    async deleteComment(commentId){
        const result = await this.commentModel.deleteOne({_id: commentId })

        if( (await result).deletedCount ===1){
            console.log('Delete successfully done');
        }else{
            console.log('No comment found for deletion');
        }
        
        console.log(result);

        return result;

    }

    async editComment(commentId:string, newComment:string){
        const result = await this.commentModel.updateOne(
            {_id:commentId},
            {$set:{comment:newComment}}
        ).exec();
        
        if(result.modifiedCount === 1){
            console.log('Edit succcessfully executed');
        }else if(result.matchedCount ===1 && result.modifiedCount ===0){
            console.log('Comment found, but not edited');
        }else{
            console.log('No comment to edit');
        }

        return result;
    }

}


