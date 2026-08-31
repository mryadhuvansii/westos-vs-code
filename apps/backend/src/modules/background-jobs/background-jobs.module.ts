import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BackgroundJobsService } from './background-jobs.service';
import { BackgroundJobsController } from './background-jobs.controller';
import { BullBoardModule } from '@bull-board/nestjs';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }, {
      name: 'analytics',
    }, {
      name: 'media-processing',
    }, {
      name: 'order-processing',
    }, {
      name: 'inventory-sync',
    }, {
      name: 'payment-reconciliation',
    }, {
      name: 'cleanup',
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
    }),
  ],
  controllers: [BackgroundJobsController],
  providers: [BackgroundJobsService],
  exports: [BackgroundJobsService],
})
export class BackgroundJobsModule {}