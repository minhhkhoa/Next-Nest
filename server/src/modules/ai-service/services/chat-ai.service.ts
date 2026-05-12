import { Inject, Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { chatPromptTemplate } from '../prompts/chat.prompt';
import { GEMINI_CHAT_MODEL } from '../provider/gemini-chat.provider';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';

@Injectable()
export class ChatAiService {
  private readonly chatHistory: BaseMessage[] = [];
  private readonly maxHistoryMessages = 6;

  private currentJobId: string | null = null;

  constructor(
    @Inject(GEMINI_CHAT_MODEL) private readonly llm: BaseChatModel,
  ) {}

  //- tra loi cau hoi theo job hien tai va quan ly lich su ngan
  async chat(jobId: string, jobContext: string, input: string): Promise<string> {
    if (jobId && jobId !== this.currentJobId) {
      this.chatHistory.length = 0;
      this.currentJobId = jobId;
    }

    const messages = await chatPromptTemplate.formatMessages({
      input,
      job_context: jobContext,
      chat_history: this.chatHistory,
    });

    const response = await this.llm.invoke(messages);
    const output = this.extractTextContent(response);

    this.chatHistory.push(new HumanMessage(input), new AIMessage(output));
    if (this.chatHistory.length > this.maxHistoryMessages) {
      this.chatHistory.splice(0, this.chatHistory.length - this.maxHistoryMessages);
    }

    return output;
  }

  //- lay text tu response cua llm (string hoac danh sach part)
  private extractTextContent(response: any): string {
    if (typeof response?.content === 'string') {
      return response.content;
    }

    if (Array.isArray(response?.content)) {
      const textParts = response.content
        .filter((part: any) => part?.type === 'text' && part?.text)
        .map((part: any) => part.text);

      if (textParts.length > 0) {
        return textParts.join('');
      }
    }

    return 'Xin lỗi, tôi không nhận được nội dung phản hồi phù hợp.';
  }
}
