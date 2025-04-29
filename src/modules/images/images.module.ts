import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { Images } from './images.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Images])],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
