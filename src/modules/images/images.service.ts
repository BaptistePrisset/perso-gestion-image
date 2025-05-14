import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Images } from './images.entity';
import { Repository } from 'typeorm';
import { CreateImageDto } from './dto/images.create.dto';
import axios from 'axios';
import { extname } from 'path';
import { createWriteStream } from 'fs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Images)
    private imagesRepository: Repository<Images>,
    @InjectQueue('images-compression')
    public imagesCompressionQueue: Queue,
  ) {}

  async getAllImages() {
    return this.imagesRepository.find();
  }

  async getImageById(id: number) {
    return this.imagesRepository.findOne({ where: { id } });
  }

  async uploadImageURL(image: CreateImageDto) {
    const filePath = await this.downloadImagefromURL(image.url);

    // Simuler un objet Express.Multer.File pour passer à resizeAndConvertImage
    const file: Express.Multer.File = {
      path: filePath,
      filename: filePath.split('/').pop()!,
      destination: 'uploads',
      originalname: image.url.split('/').pop()!,
      mimetype: '',
      size: 0,
      buffer: Buffer.from(''),
      fieldname: '',
      encoding: '',
      stream: undefined!,
    };

    const newImage = this.imagesRepository.create({ url: filePath });
    const newImageData = await this.imagesRepository.save(newImage);
    const job = await this.imagesCompressionQueue.add('resize-image', {
      file: file,
      id: newImageData.id,
    });
    return newImageData;
  }

  async uploadImage(file: Express.Multer.File) {
    const newImage = this.imagesRepository.create({ url: file.path });
    const newImageData = await this.imagesRepository.save(newImage);
    const job = await this.imagesCompressionQueue.add('resize-image', {
      file: file,
      id: newImageData.id,
    });
    return newImageData;
  }

  private async downloadImagefromURL(url: string) {
    const response = await axios({
      url,
      responseType: 'stream',
    });

    const extension = extname(url);
    const filename = `images-${Date.now()}${extension}`;
    const path = `uploads/${filename}`;

    await new Promise((resolve, reject) => {
      const writer = createWriteStream(path);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(true));
      writer.on('error', reject);
    });

    return path;
  }

  async updateImagePath(id: number, url: string) {
    return this.imagesRepository.update(id, { url });
  }

  // private async resizeAndConvertImage(
  //   file: Express.Multer.File,
  //   maxWidth: number = 576,
  //   maxHeight: number = 1024,
  //   quality: number = 70,
  // ) {
  //   const inputPath = file.path;
  //   const baseName = file.filename.split('.')[0];
  //   const outputFileName = `${baseName}.webp`;
  //   const outputPath = join('uploads', outputFileName);
  //
  //   Logger.debug("Debut de la conversion de l'image");
  //   const timestamp = Date.now();
  //
  //   await sharp(inputPath)
  //     .resize({
  //       width: maxWidth,
  //       height: maxHeight,
  //       fit: 'inside',
  //       withoutEnlargement: true,
  //     })
  //     .webp({ quality })
  //     .toFile(outputPath);
  //
  //   await fs.unlink(inputPath);
  //
  //   const delta = Date.now() - timestamp;
  //
  //   Logger.debug("Fin de la conversion de l'image : " + delta + 'ms');
  //
  //   return { outputPath, delta };
  // }
}
