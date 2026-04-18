import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { Message, MessageSchema } from '../message/schemas/message.schema';
import { ConversationRepository } from './repository/conversation.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationRepository],
  exports: [ConversationService],
})
export class ConversationModule {}
