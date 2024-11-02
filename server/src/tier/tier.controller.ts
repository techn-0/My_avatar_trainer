import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TierService } from './tier.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('tier')
@UseGuards(AuthGuard('jwt'))

export class TierController {
    constructor(private readonly tierService: TierService){}

    @Get()
    async getTier(@Req() req:any): Promise<{ tier: any}>{
        return this.tierService.getTier(req.user._id)   
        }
    }
