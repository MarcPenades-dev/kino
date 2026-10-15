import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {message: 'API is in /api/tfg/kino'};
  }
}
