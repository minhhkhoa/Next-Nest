import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateConversationPayload,
  CreateMessagePayload,
} from "@/schemasvalidation/chat";
import chatApiRequest from "@/apiRequest/chat";

//--- Lấy danh sách đoạn chat ---
export const useGetConversations = (enabled = true) => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatApiRequest.getConversations(),
    enabled,
  });
};

//--- Lấy chi tiết một đoạn chat ---
export const useGetConversationById = (id: string | null) => {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => chatApiRequest.getConversationById(id as string),
    enabled: !!id,
  });
};

//--- Lấy danh sách tin nhắn của một đoạn chat ---
export const useGetMessages = (
  conversationId: string | null,
  page = 1,
  limit = 50,
) => {
  return useQuery({
    queryKey: ["messages", conversationId, page, limit],
    queryFn: () =>
      chatApiRequest.getMessages(conversationId as string, page, limit),
    enabled: !!conversationId,
  });
};

//--- Gửi tin nhắn mới ---
export const useSendMessageMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateMessagePayload) =>
      chatApiRequest.sendMessage(payload),
  });
};

//--- Tạo đoạn chat mới ---
export const useCreateConversationMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateConversationPayload) =>
      chatApiRequest.createConversation(payload),
  });
};

//- mark as read
export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatApiRequest.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
