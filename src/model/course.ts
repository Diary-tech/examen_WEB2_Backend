export interface Course {
  id: number;
  code: string;
  name: string;
  description: string | null;
  createdAt: Date;
  exam_count?: number;
}

export interface CreateCourseInput {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateCourseInput {
  code?: string;
  name?: string;
  description?: string;
}