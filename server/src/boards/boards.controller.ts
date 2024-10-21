import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardStatus } from './boards-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './schemas/board.schema';
import { AuthGuard } from '@nestjs/passport';

@Controller('boards')
@UseGuards(AuthGuard())
export class BoardsController {
    constructor(private boardsService: BoardsService){}
    
    @Get()
    getAllBoard(): Promise<Board[]>{
        return this.boardsService.getAllBoards();
    }
   
    @Post()
    @UsePipes(ValidationPipe)
    createBoard(@Body() CreateBoardDto: CreateBoardDto, @Req() req): Promise<Board>{
        return this.boardsService.createBoard(CreateBoardDto, req.user);
    }
    
    @Get('/:title')
    getBoardByTitle(@Param('title') title: string) : Promise<Board> {
        return this.boardsService.getBoardByTitle(title);
    }
   
    @Delete('/:title')
    deleteBoard(@Param('title') title: string,@Req() req) : Promise<void> {
        return this.boardsService.deleteBoard(title, req.user);
    }

    @Patch('/:title/status')
    updateBoardStatus(
        @Param('title') title: string,
        @Body('status') status: BoardStatus,
    ): Promise<Board> {
        return this.boardsService.updateBoardStatus(title, status);
    }
}
