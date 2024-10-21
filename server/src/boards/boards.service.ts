import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardStatus } from './boards-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Board } from './schemas/board.schema';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
@Injectable()
export class BoardsService {
    constructor(
        @InjectModel(Board.name) private boardModel: Model<Board>,
    ){}

    // getAllBoards(): Board[] {
    //     return this.boards;
    // }

    async getAllBoards(): Promise <Board[]>{
        return this.boardModel.find();
    }
    // createBoard(createBoardDto: CreateBoardDto){
    //     const { title, description } = createBoardDto; 
    //     const board: Board = {
    //         id : uuid(),
    //         title,
    //         description,
    //         status : BoardStatus.PUBLIC
    //     }

    //     this.boards.push(board);
    //     return board;
    // }
    async createBoard(createBoardDto: CreateBoardDto, user: User ): Promise<Board>{
        const {title, description} = createBoardDto;

        const board = this.boardModel.create({
            title,
            description,
            status: BoardStatus.PUBLIC,
            user
        });

        return board;
    }
    async getBoardByTitle(title: string): Promise <Board> {
        const found = await this.boardModel.findOne({title});

        if (!found){
            throw new NotFoundException(`해당 제목의 게시물이 없습니다!`);
        }
        return found;
    }
    // getBoardById(id: string): Board{
    //     const found = this.boards.find((board) => board.id === id);
    //     //find(function(board){return board.id === id})
    //     if(!found){
    //         throw new NotFoundException(`찾는 게시물이 없습니다!`);
    //     }
    //     return found;
        
    // }
    async deleteBoard(title: string, user: User): Promise<void> {
        const result = await this.boardModel.deleteOne({title, user});

        if(result.deletedCount === 0){
            throw new NotFoundException(`게시물을 찾을 수 없습니다!`);
        }
    }
    // deleteBoard(id: string): void{
    //     const found = this.getBoardById(id);
    //     this.boards = this.boards.filter((board) => board.id !== found.id);
    // }
    async updateBoardStatus(title: string, status: BoardStatus): Promise<Board>{
        const board = await this.getBoardByTitle(title);

        board.status = status;
        await board.save();

        return board;
    }
    // updateBoardStatus(id: string, status: BoardStatus): Board{
    //     const board = this.getBoardById(id);
    //     board.status = status;
    //     return board;
    // }
}
