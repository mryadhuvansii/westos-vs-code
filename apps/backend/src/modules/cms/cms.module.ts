import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';
import { CmsPage } from './entities/cms-page.entity';
import { CmsBlock } from './entities/cms-block.entity';
import { CmsSlot } from './entities/cms-slot.entity';
import { MediaAsset } from './entities/media-asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CmsPage,
      CmsBlock,
      CmsSlot,
      MediaAsset,
    ]),
  ],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService, TypeOrmModule],
})
export class CmsModule {}