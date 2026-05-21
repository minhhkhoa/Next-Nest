export interface CvScoreResponseType {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface JdMatchResponseType {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  notes: string;
}

export interface AiChatResponseType {
  answer: string;
}
