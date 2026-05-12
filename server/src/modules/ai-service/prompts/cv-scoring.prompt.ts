import { ChatPromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

export const cvScoringPromptTemplate = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `Bạn là chuyên viên HR. Hãy chấm điểm CV theo thang 0-100.
      Trả về JSON hợp lệ theo cấu trúc:
        {
          "score": 0,
          "strengths": ["..."],
          "weaknesses": ["..."],
          "suggestions": ["..."]
        }
      Chỉ trả về JSON, không thêm giải thích ngoài JSON.`,
  ),
  ['human', 'Nội dung CV:\n{cv_context}'],
]);
