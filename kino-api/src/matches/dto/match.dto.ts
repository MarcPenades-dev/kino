import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  scriptId: string;
}
