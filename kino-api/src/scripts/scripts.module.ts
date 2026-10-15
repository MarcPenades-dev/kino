import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';
import { ScriptSchema } from './schema/script.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Script',
        schema: ScriptSchema,
        collection: 'scripts',
      },
    ]),
  ],
  controllers: [ScriptsController],
  providers: [ScriptsService],
  exports: [ScriptsService],
})
export class ScriptsModule {}
