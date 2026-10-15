import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  getFileUrl(file: Express.Multer.File): string {
    return `http://localhost:3000/uploads/${file.filename}`;
  }
}
