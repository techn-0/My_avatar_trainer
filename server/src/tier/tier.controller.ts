import { Controller, Get, Req, UseGuards, Param } from '@nestjs/common';
import { TierService } from './tier.service';
import { AuthGuard } from '@nestjs/passport';
import { userInfo } from 'os';

@Controller('tier')
@UseGuards(AuthGuard('jwt'))

export class TierController {
    constructor(private readonly tierService: TierService){}

    @Get()
    async getTier(@Req() req:any): Promise<{ tier: number}>{
        return await this.tierService.getTier(req.user._id)   
        }
    
    @Get('/:username')
    async getSomeoneTier(@Param('username') username: string): Promise< {tier: number}>{
        return await this.tierService.getSomeoneTier(username)
        }
}