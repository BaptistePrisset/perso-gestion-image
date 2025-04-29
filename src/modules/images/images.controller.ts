import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/image.create.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import { mimeTypeRegex } from '../../constant/regex';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async getAllImages() {
    return await this.imagesService.getAllImages();
  }

  @Get(':id')
  async getImageById(@Param('id') id: number) {
    return await this.imagesService.getImageById(id);
  }

  @Post()
  async uploadImage(@Body() createImageDTO: CreateImageDto) {
    return await this.imagesService.uploadImageURL(createImageDTO);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('images', multerConfig))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not found');
    }
    if (!file.mimetype.match(mimeTypeRegex)) {
      throw new BadRequestException('Invalid file type');
    }
    return await this.imagesService.uploadImage(file);
  }
}
