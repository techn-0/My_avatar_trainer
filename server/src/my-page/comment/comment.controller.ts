import { Controller, Post, Delete, Patch, Body, Param, Get, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto} from './dto/comment.dto';


@Controller('comment')
export class CommentController {
    constructor(private readonly commentService:CommentService){}
    
    // ownerId의 방명록에 userId가 댓글을 작성하는 코드이다.
    @Post('add')
    async postComment(
        @Body() commentDto: CommentDto)
        {
        return this.commentService.postComment(commentDto);
    }

    // userId가 자신의 댓글을 삭제하는 코드이다.
    @Delete('delete/:commentId')
    async deleteComment(@Param() param:{commentId:string}){
        const {commentId} = param;
        return this.commentService.deleteComment(commentId);
    }
    
    // userId가 자신의 댓글을 수정하는 코드이다.
    @Patch('edit')
    async editComment(@Query()query:{commentId:string, newComment:string}){
        const {commentId, newComment} = query;
        const result = await this.commentService.editComment(commentId, newComment);

        if(result.modifiedCount===1){
            return {message:'Comment modified successfully' }
        }else if(result.matchedCount===1 && result.modifiedCount===0){
            return { message:'Comment found but the content was identical' }
        }else{
            return { message:'No comment to edit'};
        }

    }

    // ownerId가 자기 자신의 방명록에 달린 댓글을 볼 수 있게하는 코드이다.
    @Post(':ownerId')
    async getComments(@Param ('ownerId') ownerId : string ){
        return this.commentService.getComments(ownerId);
    }

}   
    
    // CommentDto
    // @IsString()
    // ownerId:string;

    // @IsString()
    // userId:string;

    // @IsOptional()
    // @IsString()
    // profilePic?:string;

    // @IsString()
    // comment:string;

    // @IsDate()
    // createdAt:Date;

    //CommentDto 예시 참고
    // {
    //     "ownerId": "JAESEOK",
    //     "userId": "JAEWOONG",
    //     "comment":"운동 좀 해라",
    //     "createdAt":"2024-11-04T12:00:00Z",
    //     "profilePic": ""
    // }

    // @Post('addComment/:ownerId')
    // async postComment(
    //     @Param('ownerId') ownerId : string,
    //     @Body() commentDto: CommentDto)
    //     {
    //     const {userId, comment, profilePic} = commentDto;
    //     return this.commentService.postComment(ownerId, userId, comment, profilePic);
    // }