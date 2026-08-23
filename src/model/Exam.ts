export interface Exam {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
}

export interface CreateExamInput {
  courseId: number;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
}

export interface UpdateExamInput {
  title?: string;
  description?: string;
  startsAt?: Date;
  endsAt?: Date;
}