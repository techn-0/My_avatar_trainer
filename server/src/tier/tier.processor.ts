import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { TierService } from "./tier.service";

@Processor('tier-update')
export class TierProcessor{
    constructor(private readonly tierService: TierService){}
    
    @Process('tier-update-job')
    async handleTierUpdate(job: Job){
        try{
            await this.tierService.updateAllUserTier();
            job.progress(100);
        } catch (error){
            console.error('티어 업데이트 중 오류 발생:', error);
            throw error;
        }
    }
}