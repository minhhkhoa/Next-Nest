import { Inject, Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { chatPromptTemplate } from '../prompts/chat.prompt';
import { GEMINI_CHAT_MODEL } from '../provider/gemini-chat.provider';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { RedisService } from 'src/common/redis/redis.service';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { BaseMessageChunk } from '@langchain/core/messages';

export interface ChatSessionData {
  jobId: string;
  history: { role: 'human' | 'ai'; content: string }[];
}

@Injectable()
export class ChatAiService {
  private readonly maxHistoryMessages = 6;
  private readonly CACHE_TTL = 3600000; // 1 hour in ms

  constructor(
    @Inject(GEMINI_CHAT_MODEL) private readonly llm: BaseChatModel,
    private readonly redisService: RedisService,
  ) {}

  private getRedisKey(sessionId: string): string {
    return `ai_chat:${sessionId}`;
  }

  //- tra loi cau hoi theo job hien tai va quan ly lich su qua redis, stream ket qua
  async chatStream(
    sessionId: string,
    jobId: string,
    jobContext: string,
    input: string,
  ): Promise<AsyncGenerator<string, void, unknown>> {
    const redisKey = this.getRedisKey(sessionId);
    let sessionData = await this.redisService.get<ChatSessionData>(redisKey);

    if (!sessionData || sessionData.jobId !== jobId) {
      sessionData = {
        jobId,
        history: [],
      };
    }

    const chatHistory: BaseMessage[] = sessionData.history.map((msg) =>
      msg.role === 'human'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content),
    );

    const messages = await chatPromptTemplate.formatMessages({
      input,
      job_context: jobContext,
      chat_history: chatHistory,
    });

    //- sử dụng stream để trả về kết quả từng phần cho client render UI đẹp hơn
    const stream = await this.llm.stream(messages);
    return this.createInterceptedGenerator(
      stream,
      sessionData,
      input,
      redisKey,
    );
  }

  //- custom generator de hung tung chunk roi tra ve client, xong het thi luu Redis
  private async *createInterceptedGenerator(
    originalStream: IterableReadableStream<BaseMessageChunk>,
    sessionData: ChatSessionData,
    input: string,
    redisKey: string,
  ): AsyncGenerator<string, void, unknown> {
    let fullOutput = '';

    for await (const chunk of originalStream) {
      const text = chunk.content;
      let chunkText = '';
      if (typeof text === 'string') {
        chunkText = text;
      } else if (Array.isArray(text)) {
        chunkText = text
          .filter((t: any) => t.type === 'text')
          .map((t: any) => t.text)
          .join('');
      }

      fullOutput += chunkText;
      if (chunkText) {
        yield chunkText;
      }
    }

    sessionData.history.push(
      { role: 'human', content: input },
      { role: 'ai', content: fullOutput },
    );

    const maxEntries = this.maxHistoryMessages * 2;
    if (sessionData.history.length > maxEntries) {
      sessionData.history = sessionData.history.slice(-maxEntries);
    }

    await this.redisService.set(redisKey, sessionData, this.CACHE_TTL);
  }

  //- lay lich su cho frontend khi load lai trang
  async getChatHistory(sessionId: string): Promise<ChatSessionData | null> {
    const redisKey = this.getRedisKey(sessionId);
    return this.redisService.get<ChatSessionData>(redisKey);
  }
}
