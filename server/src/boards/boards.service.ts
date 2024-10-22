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

    async getAllBoards(): Promise <Board[]>{
        return this.boardModel.find();
    }

    async createBoard(createBoardDto: CreateBoardDto, user: User ): Promise<Board>{
        const {title, description} = createBoardDto;

        const board = this.boardModel.create({
            title,
            description,
            status: BoardStatus.PUBLIC,
            id : user
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
  
    async deleteBoard(title: string, user: User): Promise<void> {
        const result = await this.boardModel.deleteOne({title, user});

        if(result.deletedCount === 0){
            throw new NotFoundException(`게시물을 찾을 수 없습니다!`);
        }
    }
   
    async updateBoardStatus(title: string, status: BoardStatus): Promise<Board>{
        const board = await this.getBoardByTitle(title);

        board.status = status;
        await board.save();

        return board;
    }
}
