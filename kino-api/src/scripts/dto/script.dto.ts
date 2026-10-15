import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScriptDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  genero: string;

  @IsString()
  @IsNotEmpty()
  sinopsis: string;

  @IsString()
  @IsNotEmpty()
  pdfUrl: string;

  @IsOptional()
  edadMin?: number;

  @IsOptional()
  edadMax?: number;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @IsString()
  imagenUrl?: string;

  @IsString()
  contacto?: string;
}
