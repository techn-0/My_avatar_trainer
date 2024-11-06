import { Body, Controller, Param, Query, Post, Get } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';
import { GuestbookDto } from './dto/guestbook.dto';

@Controller('guestbook')
export class GuestbookController {
    constructor (private readonly guestbookService:GuestbookService){};

    // @Get(':ownerId')
    // async getGuestbookData(@Param('ownerId') ownerId:string):Promise<GuestbookDto|null>{
    //         return this.guestbookService.getPage(ownerId);
    // }

    @Post(':ownerId')
    async getGuestbookData(@Param('ownerId')ownerId : string) : Promise<GuestbookDto|null>{    
        return this.guestbookService.getPageOwner(ownerId);
    }


}
