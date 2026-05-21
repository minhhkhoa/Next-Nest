import { Inject, Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { jdMatchPromptTemplate } from '../prompts/jd-match.prompt';
import { GEMINI_CHAT_MODEL } from '../provider/gemini-chat.provider';
import { z } from 'zod';

const JdMatchSchema = z.object({
  match_score: z.number().min(0).max(100),
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  notes: z.string(),
});

export type JdMatchResult = z.infer<typeof JdMatchSchema>;

@Injectable()
export class JdMatchingService {
  constructor(
    @Inject(GEMINI_CHAT_MODEL) private readonly llm: BaseChatModel,
  ) {}

  //- tao prompt so khop cv va jd, sau do goi llm
  async matchCvToJob(
    cvContext: string,
    jobContext: string,
  ): Promise<JdMatchResult> {
    const messages = await jdMatchPromptTemplate.formatMessages({
      cv_context: cvContext,
      job_context: jobContext,
    });

    const response = await this.llm.invoke(messages);

    const rawText = this.extractTextContent(response);
    return this.parseAndValidate(rawText);
  }

  //- lay json text tu response cua llm
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

    return '{}';
  }

  //- parse json va validate bang zod
  private parseAndValidate(rawText: string): JdMatchResult {
    const parsed = this.safeJsonParse(rawText);
    const result = JdMatchSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    return {
      match_score: 0,
      matched_skills: [],
      missing_skills: [],
      notes: '',
    };
  }

  //- uu tien parse nguyen van, neu fail thi thu cat doan json
  private safeJsonParse(rawText: string): unknown {
    try {
      return JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match?.[0]) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }

      return null;
    }
  }
}
