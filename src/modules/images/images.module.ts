import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesProcessor } from './images.processor';
import { ImagesController } from './images.controller';
import { Images } from './images.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Images]),
    BullModule.registerQueue({
      name: 'images-compression',
    }),
  ],
  controllers: [ImagesController],
  providers: [ImagesService, ImagesProcessor],
  exports: [ImagesService],
})
export class ImagesModule {}
