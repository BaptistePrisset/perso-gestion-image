import {IsArray, IsObject, IsOptional, IsString, ValidateIf} from 'class-validator';
import { BlockType } from '../../../enum/lessonBlockType';

export class CreateBlockDTO {

  @IsString()
  type: BlockType;

  @ValidateIf((o) => o.type === BlockType.TEXT || o.type === BlockType.TITLE)
  @IsString()
  @IsOptional()
  content?: string;

  @ValidateIf((o) => o.type === BlockType.CODE)
  @IsString()
  @IsOptional()
  lang?: string;

  @ValidateIf((o) => o.type === BlockType.IMAGE || o.type === BlockType.VIDEO)
  @IsOptional()
  @IsObject()
  src?: object;

  @ValidateIf((o) => o.type === BlockType.IMAGE || o.type === BlockType.VIDEO)
  @IsString()
  @IsOptional()
  alt?: string;

  @ValidateIf((o) => o.type === BlockType.IMAGE || o.type === BlockType.VIDEO)
  @IsString()
  @IsOptional()
  description?: string;

  @ValidateIf((o) => o.type === BlockType.VIDEO)
  @IsObject()
  @IsOptional()
  iframe?: boolean;

  @ValidateIf((o) => o.type === BlockType.MULTIPLE_CHOICE)
  @IsString()
  @IsOptional()
  question?: string;

  @ValidateIf(
    (o) =>
      o.type === BlockType.MULTIPLE_CHOICE ||
      o.type === BlockType.FILL_GAPS ||
      o.type === BlockType.DRAG_AND_MATCH,
  )
  @IsArray()
  @IsOptional()
  choices?: object[];

  @ValidateIf(
    (o) =>
      o.type === BlockType.MULTIPLE_CHOICE ||
      o.type === BlockType.FILL_GAPS ||
      o.type === BlockType.DRAG_AND_MATCH ||
      o.type === BlockType.ORDER_LINES,
  )
  @IsArray()
  @IsOptional()
  success?: object[];

  @IsArray()
  @IsOptional()
  failure?: object[];

  @ValidateIf(
    (o) =>
      o.type === BlockType.MULTIPLE_CHOICE || o.type === BlockType.FILL_GAPS,
  )
  @IsArray()
  @IsOptional()
  answers?: number[];

  @ValidateIf((o) => o.type === BlockType.ORDER_LINES)
  @IsArray()
  @IsOptional()
  lines?: object[][];

  @ValidateIf((o) => o.type === BlockType.ORDER_LINES)
  @IsArray()
  @IsOptional()
  equals?: number[][];
}
