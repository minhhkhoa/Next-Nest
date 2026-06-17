import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

//- Đây là provider để sử dụng Gemini Chat API trong toàn bộ ứng dụng thông qua LangchainModule

export const GEMINI_CHAT_MODEL = 'GEMINI_CHAT_MODEL';

export const GeminiChatProvider: Provider = {
  provide: GEMINI_CHAT_MODEL,
  //- khoi tao gemini chat model tu api key trong env
  useFactory: (configService: ConfigService) => {
    const apiKey = configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined.');
    }

    return new ChatGoogleGenerativeAI({
      apiKey,
      model: 'gemini-3.1-flash-lite',
    });
  },
  inject: [ConfigService],
};
