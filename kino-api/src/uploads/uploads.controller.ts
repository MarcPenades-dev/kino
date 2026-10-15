import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/kino/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('pdf')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `pdf-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new Error('Solo se permiten archivos PDF'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    try {
      const url = this.uploadsService.getFileUrl(file);
      return { status: true, url };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Post('foto')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `foto-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFoto(@UploadedFile() file: Express.Multer.File) {
    try {
      const url = this.uploadsService.getFileUrl(file);
      return { status: true, url };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Post('audio')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `audio-${uniqueSuffix}.webm`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.includes('audio')) {
          return cb(new Error('Solo se permiten archivos de audio'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    try {
      const url = this.uploadsService.getFileUrl(file);
      return { status: true, url };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Post('video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `video-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          return cb(new Error('Solo se permiten videos'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    try {
      const url = this.uploadsService.getFileUrl(file);
      return { status: true, url };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }
}
