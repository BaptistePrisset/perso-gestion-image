import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { join } from 'path';
import { Injectable, Logger } from '@nestjs/common';
const sharp = require('sharp');
import { promises as fs } from 'fs';
import { ImagesService } from './images.service';

@Processor('images-compression')
@Injectable()
export class ImagesProcessor extends WorkerHost {
  constructor(private imageService: ImagesService) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    Logger.debug('Processing job: ' + job.id);
    const file = job.data.file;

    const maxWidth: number = 576;
    const maxHeight: number = 1024;
    const quality: number = 70;

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

    await fs.unlink(inputPath);

    const delta = Date.now() - timestamp;

    Logger.debug("Fin de la conversion de l'image : " + delta + 'ms');

    await this.imageService.updateImagePath(job.data.id, outputPath);
    Logger.debug('End job: ' + job.id);
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    Logger.debug('Completed job');
  }
}
