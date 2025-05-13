import {Injectable, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blocks } from './blocks.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Blocks)
    private blocksRepository: Repository<Blocks>,
  ) {}

  async getAllBlocks() {
    return this.blocksRepository.find();
  }

  getBlockById(id: number) {
    return this.blocksRepository.findOne({ where: { id } });
  }

  createBlock(blockData: any) {
    Logger.debug('Creating block with data: ', blockData);
    const block = this.blocksRepository.create(blockData);
    return this.blocksRepository.save(block);
  }
}
