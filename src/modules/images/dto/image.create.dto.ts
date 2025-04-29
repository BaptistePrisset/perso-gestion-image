import { IsNotEmpty, Matches } from 'class-validator';

const linkRegex = /https?:\/\/[^/\s"][^\s"]*\.(jpg|jpeg|png|gif|webp|svg)/gm;

export class CreateImageDto {
  @IsNotEmpty({ message: 'URL must not be empty' })
  @Matches(linkRegex, {
    message: 'URL must be a valid image URL (jpg, jpeg, png, gif, webp, svg)',
  })
  url: string;
}
