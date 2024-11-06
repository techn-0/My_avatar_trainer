import { Controller, Get, Req, UseGuards, Param, Post } from '@nestjs/common';
import { TierService } from './tier.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('tier')
@UseGuards(AuthGuard('jwt'))

export class TierController {
    constructor(private readonly tierService: TierService){}

    @Post()
    async getTier(@Req() req:any): Promise<{ tier: number}>{
        return await this.tierService.getTier(req.user._id)   
        }
    
    @Post('/update')
        async addUpdateTierWork(): Promise<void>{
            await this.tierService.addUpdateTierWork()
        }
    
    @Post('/:username')
        async getSomeoneTier(@Param('username') username: string): Promise< {tier: number, percentile: number}>{
            return await this.tierService.getSomeoneTier(username)
        }  
}
