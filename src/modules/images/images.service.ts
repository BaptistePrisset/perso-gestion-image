import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Images } from './images.entity';
import { Repository } from 'typeorm';
import { CreateImageDto } from './dto/image.create.dto';
import axios from 'axios';
import { extname, join } from 'path';
import { createWriteStream, promises } from 'fs';
import { Cron, CronExpression } from '@nestjs/schedule';
const sharp = require('sharp');
const fs = require('fs');
const os = require('os-utils');

@Injectable()
export class ImagesService {
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    // This method will be called every 5 minutes
    Logger.debug('Cron job start');
    await this.manageWaitingImages();
  }
  constructor(
    @InjectRepository(Images)
    private imagesRepository: Repository<Images>,
  ) {
    fs.writeFile('waiting-image.json', JSON.stringify([]), (err) => {
      if (err) {
        Logger.error('Error writing to waiting-image.json', err);
      } else {
        Logger.debug('Waiting list initialized');
      }
    });
  }

  async getAllImages() {
    return this.imagesRepository.find();
  }

  async getImageById(id: number) {
    return this.imagesRepository.findOne({ where: { id } });
  }

  async uploadImageURL(image: CreateImageDto) {
    const filePath = await this.downloadImagefromURL(image.url);

    const newImage = this.imagesRepository.create({ url: filePath });
    const newImageData = await this.imagesRepository.save(newImage);
    this.addWaitingImages(newImageData.id, filePath);
    return newImageData;
  }

  async uploadImage(file: Express.Multer.File) {
    const newImage = this.imagesRepository.create({ url: file.path });
    const newImageData = await this.imagesRepository.save(newImage);
    this.addWaitingImages(newImageData.id, file.path);
    return newImageData;
  }

  private async downloadImagefromURL(url: string) {
    const response = await axios({
      url,
      responseType: 'stream',
    });

    const extension = extname(url);
    const filename = `images-${Date.now()}${extension}`;
    const path = `waiting/${filename}`;

    await new Promise((resolve, reject) => {
      const writer = createWriteStream(path);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(true));
      writer.on('error', reject);
    });

    return path;
  }

  private async resizeAndConvertImage(
    file: Express.Multer.File,
    maxWidth: number = 1280,
    maxHeight: number = 720,
    quality: number = 70,
  ) {
    const inputPath = file.path;
    const baseName = file.filename.split('.')[0];
    const outputFileName = `${baseName}.webp`;
    const outputPath = join('uploads', outputFileName);

    Logger.debug("Debut de la conversion de l'image");
    const timestamp = Date.now();

    await sharp(inputPath)
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toFile(outputPath);

    await promises.unlink(inputPath);

    const delta = Date.now() - timestamp;

    Logger.debug("Fin de la conversion de l'image : " + delta + 'ms');

    return outputPath;
  }

  private async updateImagePath(id: number, url: string) {
    return this.imagesRepository.update(id, { url });
  }

  private addWaitingImages(id: number, url: string) {
    fs.readFile('waiting-image.json', 'utf8', (err, data) => {
      if (err) {
        Logger.error('Error reading waiting-image.json', err);
        return;
      }

      let waitingImages = JSON.parse(data || '[]');
      waitingImages = [{ id: id, url: url }, ...waitingImages];

      fs.writeFile(
        'waiting-image.json',
        JSON.stringify(waitingImages),
        (err) => {
          if (err) {
            Logger.error('Error writing to waiting-image.json', err);
          } else {
            Logger.debug('Image added to waiting list');
          }
        },
      );
    });
  }

  private async getCPUCharge(): Promise<number> {
    return new Promise((resolve) => {
      os.cpuUsage((v) => {
        Logger.debug(`CPU charge : ${v * 100}%`);
        resolve(v * 100);
      });
    });
  }

  private async manageWaitingImages() {
    fs.readFile('waiting-image.json', 'utf8', async (err, data) => {
      if (err) {
        Logger.error('Error reading waiting-image.json', err);
        return;
      }

      const waitingImages = JSON.parse(data || '[]');

      while ((await this.getCPUCharge()) < 50) {
        if (waitingImages.length === 0) {
          Logger.debug('No images to process');
          break;
        }
        const image = waitingImages.pop();
        const file: Express.Multer.File = {
          path: image.url,
          filename: image.url.split('/').pop()!,
          destination: 'uploads',
          originalname: image.url.split('/').pop()!,
          mimetype: '',
          size: 0,
          buffer: Buffer.from(''),
          fieldname: '',
          encoding: '',
          stream: undefined!,
        };
        const compressedFile = await this.resizeAndConvertImage(file);
        await this.updateImagePath(image.id, compressedFile);
      }

      fs.writeFile(
        'waiting-image.json',
        JSON.stringify(waitingImages),
        (err) => {
          if (err) {
            Logger.error('Error writing to waiting-image.json', err);
          }
        },
      );
    });
    return true;
  }
}
