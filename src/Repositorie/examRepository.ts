import { pool } from "../config/database";
import {
    Exam,
    CreateExamInput,
    UpdateExamInput,
} from "../model/exam";

const EXAM_COLUMNS = `
  id,
  course_id AS "courseId",
  title,
  description,
  start_at AS "startsAt",
  end_at AS "endsAt",
  created_at AS "createdAt"
`;

export const examRepository = {
    async findAll(): Promise<Exam[]> {
        const result = await pool.query<Exam>(
            `
            SELECT ${EXAM_COLUMNS}
            FROM exams
            ORDER BY start_at DESC
            `
        );

        return result.rows;
    },

    async findById(id: number): Promise<Exam | null> {
        const result = await pool.query<Exam>(
            `
            SELECT ${EXAM_COLUMNS}
            FROM exams
            WHERE id = $1
            `,
            [id]
        );

        return result.rows[0] ?? null;
    },

    async create(data: CreateExamInput): Promise<Exam> {
        const result = await pool.query<Exam>(
            `
            INSERT INTO exams
                (course_id, title, description, start_at, end_at)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING ${EXAM_COLUMNS}
            `,
            [
                data.courseId,
                data.title,
                data.description ?? null,
                data.startsAt,
                data.endsAt,
            ]
        );

        return result.rows[0];
    },

    async update(
        id: number,
        data: UpdateExamInput
    ): Promise<Exam | null> {
        const result = await pool.query<Exam>(
            `
            UPDATE exams
            SET
                title = COALESCE($2, title),
                description = COALESCE($3, description),
                start_at = COALESCE($4, start_at),
                end_at = COALESCE($5, end_at)
            WHERE id = $1
            RETURNING ${EXAM_COLUMNS}
            `,
            [
                id,
                data.title ?? null,
                data.description ?? null,
                data.startsAt ?? null,
                data.endsAt ?? null,
            ]
        );

        return result.rows[0] ?? null;
    },

    async delete(id: number): Promise<void> {
        await pool.query(
            "DELETE FROM exams WHERE id = $1",
            [id]
        );
    },

    async countAttemptsForExam(id: number): Promise<number> {
        const result = await pool.query<{ count: number }>(
            `
            SELECT COUNT(*)::int AS count
            FROM attempts
            WHERE exam_id = $1
            `,
            [id]
        );

        return Number(result.rows[0].count);
    },

    async findCurrentlyOpen(): Promise<Exam[]> {
        const result = await pool.query<Exam>(
            `
            SELECT ${EXAM_COLUMNS}
            FROM exams
            WHERE start_at <= NOW()
              AND end_at >= NOW()
            ORDER BY end_at
            `
        );

        return result.rows;
    },
};