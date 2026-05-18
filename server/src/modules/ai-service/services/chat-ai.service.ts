import { Inject, Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { chatPromptTemplate } from '../prompts/chat.prompt';
import { GEMINI_CHAT_MODEL } from '../provider/gemini-chat.provider';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { BaseMessageChunk } from '@langchain/core/messages';
import { AiChatHistoryRepository } from '../repository/ai-chat-history.repository';

export interface ChatSessionData {
  jobId: string;
  history: { role: 'human' | 'ai'; content: string }[];
}

@Injectable()
export class ChatAiService {
  //- giới hạn số lượng tin nhắn lịch sử (ngữ cảnh chat) tối đa sẽ được gửi đến AI (Gemini) để tránh vượt quá giới hạn token và chi phí, đồng thời vẫn giữ được ngữ cảnh đủ cho cuộc hội thoại
  private readonly maxHistoryMessages = 6;

  constructor(
    @Inject(GEMINI_CHAT_MODEL) private readonly llm: BaseChatModel,
    private readonly aiChatHistoryRepository: AiChatHistoryRepository,
  ) {}

  //- tra loi cau hoi theo job hien tai va quan ly lich su qua db, stream ket qua
  async chatStream(
    sessionId: string,
    jobId: string,
    jobContext: string,
    input: string,
  ): Promise<AsyncGenerator<string, void, unknown>> {
    const document = await this.aiChatHistoryRepository.findBySessionId(sessionId);
    
    let sessionData: ChatSessionData = { jobId, history: [] };

    if (document && document.jobId === jobId) {
      sessionData = {
        jobId: document.jobId,
        history: document.history as { role: 'human' | 'ai'; content: string }[],
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
      sessionId,
    );
  }

  //- custom generator de hung tung chunk roi tra ve client, xong het thi luu db
  private async *createInterceptedGenerator(
    originalStream: IterableReadableStream<BaseMessageChunk>,
    sessionData: ChatSessionData,
    input: string,
    sessionId: string,
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

    await this.aiChatHistoryRepository.createOrUpdate(
      sessionId,
      sessionData.jobId,
      sessionData.history,
    );
  }

  //- lay lich su cho frontend khi load lai trang
  async getChatHistory(sessionId: string): Promise<ChatSessionData | null> {
    const data = await this.aiChatHistoryRepository.findBySessionId(sessionId);
    if (!data) return null;
    return {
      jobId: data.jobId,
      history: data.history,
    };
  }
}
