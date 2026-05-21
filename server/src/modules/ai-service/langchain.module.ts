import { Module } from '@nestjs/common';
import { GeminiChatProvider } from './provider/gemini-chat.provider';

@Module({
  providers: [GeminiChatProvider],
  exports: [GeminiChatProvider],
})
export class LangchainModule {}
