import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';

export const chatPromptTemplate = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `Bạn là trợ lý tư vấn việc làm. Trả lời ngắn gọn, rõ ràng, đúng trọng tâm.

    Bối cảnh công việc hiện tại:
    {job_context}

    Nếu thiếu dữ liệu, hãy hỏi lại người dùng.`,
  ),
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
]);
