import http from "@/lib/http";
import { ApiResponse } from "@/types/apiResponse";
import {
  Conversation,
  ChatMessage,
  CreateMessagePayload,
  CreateConversationPayload,
} from "@/schemasvalidation/chat";

const conversationPrefix = "/conversations";
const messagePrefix = "/messages";

const chatApiRequest = {
  //--- CONVERSATION API ---
  getConversations: () =>
    http.get<ApiResponse<Conversation[]>>(conversationPrefix),

  getConversationById: (id: string) =>
    http.get<ApiResponse<Conversation>>(`${conversationPrefix}/${id}`),

  getUnreadMessagesCount: () =>
    http.get<ApiResponse<{ count: number }>>(`${conversationPrefix}/unread-count`),

  createConversation: (payload: CreateConversationPayload) =>
    http.post<ApiResponse<Conversation>>(conversationPrefix, payload),

  //- mark read
  markAsRead: (id: string) =>
    http.patch<ApiResponse<Conversation>>(`${conversationPrefix}/${id}/read`),

  //--- MESSAGE API ---
  getMessages: (conversationId: string, page: number = 1, limit: number = 50) =>
    http.get<
      ApiResponse<{
        messages: ChatMessage[];
        meta: {
          current: number;
          pageSize: number;
          pages: number;
          total: number;
        };
      }>
    >(`${messagePrefix}/conversation/${conversationId}`, {
      params: { page, limit },
    }),

  sendMessage: (payload: CreateMessagePayload) =>
    http.post<ApiResponse<ChatMessage>>(messagePrefix, payload),
};

export default chatApiRequest;
