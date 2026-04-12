import { z } from "zod";
import { ActionBy } from "./NewsCategory";

export const chatMessageTypeEnum = z.enum([
  "TEXT",
  "IMAGE",
  "JOB_REFERENCE",
  "CV_SYSTEM",
  "CV_LINK",
]);
export const senderTypeEnum = z.enum(["CANDIDATE", "RECRUITER"]);

export const chatMessageMetadataSchema = z
  .object({
    imageUrl: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    cvId: z.string().optional(),
    cvName: z.string().optional(),
    link: z.string().optional(),
    fileName: z.string().optional(),
    mimeType: z.string().optional(),
    fileSize: z.number().optional(),
    fileExt: z.string().optional(),
    templateID: z.string().optional(),
    templateId: z.string().optional(),
    resumeContent: z.any().optional(),
    isDefault: z.boolean().optional(),
    previewImage: z.string().optional(),
    updatedAt: z.string().optional(),
    jobId: z.string().optional(),
    jobImage: z.string().optional(),
    jobTitle: z.string().optional(),
    jobSlug: z.string().optional(),
    salary: z.string().optional(),
    thumbnail: z.string().optional(),
  })
  .optional();

//- Schema cho một tin nhắn
export const ChatMessageSchema = z.object({
  _id: z.string(),
  conversationId: z.string(),
  senderId: ActionBy,
  senderType: senderTypeEnum,
  type: chatMessageTypeEnum,
  content: z.string().optional(),
  metadata: chatMessageMetadataSchema,
  isRead: z.boolean().default(false),
  readAt: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

//- Schema cho một phòng chat (Conversation)
export const ConversationSchema = z.object({
  _id: z.string(),
  candidateId: ActionBy,
  companyId: z.object({
    _id: z.string(),
    name: z.string(),
    logo: z.string().optional(),
  }),
  assignedRecruiterId: z
    .object({
      _id: z.string(),
      name: z.string(),
      avatar: z.string().optional(),
    })
    .optional(),
  lastMessage: z.string(),
  lastMessageAt: z.string(),
  unreadCandidate: z.number().default(0),
  unreadCompany: z.number().default(0),
  jobReferenceId: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "BLOCKED"]).default("ACTIVE"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

//- Schema Validation khi tạo mới tin nhắn
export const CreateMessagePayloadSchema = z
  .object({
    conversationId: z.string().min(1, "Thiếu ID phòng chat"),
    type: chatMessageTypeEnum,
    content: z.string().optional(),
    metadata: z.any().optional(),
  })
  .refine(
    (data) => {
      // Ràng buộc: Nếu là tin nhắn TEXT thì bắt buộc phải có content
      if (
        data.type === "TEXT" &&
        (!data.content || data.content.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Nội dung tin nhắn không được để trống",
      path: ["content"],
    },
  );

export type CreateMessagePayload = z.infer<typeof CreateMessagePayloadSchema>;

//- Schema Validation khi tạo mới cuộc hội thoại
export const CreateConversationPayloadSchema = z.object({
  companyId: z.string().optional(),
  candidateId: z.string().optional(),
  jobId: z.string().optional(),
  // jobReferenceId: z.string().optional(),
});

export type CreateConversationPayload = z.infer<
  typeof CreateConversationPayloadSchema
>;