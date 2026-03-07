export interface SubTopic {
  name: string;
  weight: number | null;
}

export interface Topic {
  name: string;
  weight: number | null;
  subTopics: SubTopic[];
}

export interface ProcessItem {
  name: string;
  weight: number | null;
  topics: Topic[];
}

export interface Cbe {
  id: number;
  name: string;
  thaiName?: string;
  abbreviation?: string;
  updateDate?: string;
}

export interface ApiResponse {
  code: number;
  message: string;
  data: any;
}