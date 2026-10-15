import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchSchema } from './schema/match.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Match',
        schema: MatchSchema,
        collection: 'matches',
      },
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
