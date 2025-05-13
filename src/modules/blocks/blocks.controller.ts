import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from '../images/images.service';
import {multerConfig} from "../../config/multer.config";

@Controller('blocks')
export class BlocksController {
  constructor(
    private readonly blocksService: BlocksService,
    private readonly imagesService: ImagesService,
  ) {}

  @Get()
  async getAllBlocks() {
    return await this.blocksService.getAllBlocks();
  }

  @Get(':id')
  async getBlock(@Param('id') id: number) {
    return await this.blocksService.getBlockById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('src', multerConfig))
  async createBlock(
    @UploadedFile() file: Express.Multer.File,
    @Body() createBlockDTO: any,
  ) {
    if (!file) {
      throw new BadRequestException('File not found');
    } else {
      Logger.debug('file', file);
      const image = await this.imagesService.uploadImage(file);
      if (!image) {
        throw new BadRequestException('Image upload failed');
      }
      createBlockDTO.src = { src: (await image.filePath).url };
      Logger.debug('Creating block with data: ', image);
      return this.blocksService.createBlock(createBlockDTO, file);
    }
  }
}
