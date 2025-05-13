import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Blocks} from "./blocks.entity";
import {ImagesModule} from "../images/images.module";

@Module({
  controllers: [BlocksController],
  imports: [TypeOrmModule.forFeature([Blocks]), ImagesModule],
  providers: [BlocksService],
})
export class BlocksModule {}
