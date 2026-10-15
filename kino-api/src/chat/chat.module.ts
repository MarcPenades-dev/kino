import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageSchema } from './schema/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Message', schema: MessageSchema, collection: 'messages' },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
