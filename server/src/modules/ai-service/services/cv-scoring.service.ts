import { Inject, Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { cvScoringPromptTemplate } from '../prompts/cv-scoring.prompt';
import { GEMINI_CHAT_MODEL } from '../provider/gemini-chat.provider';
import { z } from 'zod';

const CvScoreSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type CvScoreResult = z.infer<typeof CvScoreSchema>;

@Injectable()
export class CvScoringService {
  constructor(
    @Inject(GEMINI_CHAT_MODEL) private readonly llm: BaseChatModel,
  ) {}

  //- tao prompt cham diem cv va goi llm
  async scoreCv(cvContext: string): Promise<CvScoreResult> {
    const messages = await cvScoringPromptTemplate.formatMessages({
      cv_context: cvContext,
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
  private parseAndValidate(rawText: string): CvScoreResult {
    const parsed = this.safeJsonParse(rawText);
    const result = CvScoreSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    return {
      score: 0,
      strengths: [],
      weaknesses: [],
      suggestions: [],
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
