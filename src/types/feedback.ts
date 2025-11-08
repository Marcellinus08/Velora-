// src/types/feedback.ts

export type FeedbackType = "bug" | "idea" | "other";
export type FeedbackStatus = "open" | "in-progress" | "resolved" | "closed";

export interface Feedback {
  id: string;
  type: FeedbackType;
  message: string;
  email?: string | null;
  media_path?: string | null;
  media_type?: string | null;
  media_size?: number | null;
  profile_abstract_id?: string | null;
  status: FeedbackStatus;
  admin_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackCreateRequest {
  type: "Bug" | "Idea" | "Other"; // Frontend uses capitalized version
  message: string;
  email?: string;
  ts: string;
}

export interface FeedbackResponse {
  success: boolean;
  feedback?: {
    id: string;
    type: string;
    message: string;
    status: string;
    created_at: string;
  };
  error?: string;
}

export interface FeedbackListResponse {
  success: boolean;
  feedbacks?: Feedback[];
  pagination?: {
    limit: number;
    offset: number;
    count: number;
  };
  error?: string;
}