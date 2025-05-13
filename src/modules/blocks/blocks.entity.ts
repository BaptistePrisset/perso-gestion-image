import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BlockType } from '../../enum/lessonBlockType';

@Entity()
export class Blocks {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  type: BlockType;

  @Column({ type: 'varchar' , nullable: true })
  content?: string;

  @Column({ type: 'varchar' , nullable: true })
  lang?: string;

  @Column({ type: 'varchar' , nullable: true })
  src?: string;

  @Column({ type: 'varchar' , nullable: true })
  alt?: string;

  @Column({ type: 'varchar' , nullable: true })
  description?: string;

  @Column({ type: 'varchar' , nullable: true })
  iframe?: boolean;

  @Column({ type: 'varchar' , nullable: true })
  question?: string;

  @Column({ type: 'varchar' , nullable: true })
  choices?: object[];

  @Column({ type: 'varchar' , nullable: true })
  success?: object[];

  @Column({ type: 'varchar' , nullable: true })
  failure?: object[];

  @Column({ type: 'varchar' , nullable: true })
  answers?: object[];

  @Column({ type: 'varchar' , nullable: true })
  lines?: object[][];

  @Column({ type: 'varchar' , nullable: true })
  equals?: number[][];
}
