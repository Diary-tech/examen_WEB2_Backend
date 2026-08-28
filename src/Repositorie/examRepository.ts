import { pool } from "../config/database";
import {
    Exam,
    ExamWithCourse,
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
const EXAM_LIST_COLUMNS = `
    e.id,
    e.course_id AS "courseId",
    e.title,
    e.description,
    e.start_at AS "startsAt",
    e.end_at AS "endsAt",
    e.created_at AS "createdAt",

    COUNT(DISTINCT q.id)::int AS question_count,
    COUNT(DISTINCT a.id)::int AS attempt_count
`;
export const examRepository = {
    async findAll(): Promise<Exam[]> {
        const result = await pool.query<Exam>(`
        SELECT ${EXAM_LIST_COLUMNS}
        FROM exams e

        LEFT JOIN questions q
            ON q.exam_id = e.id

        LEFT JOIN attempts a
            ON a.exam_id = e.id

        GROUP BY
            e.id,
            e.course_id,
            e.title,
            e.description,
            e.start_at,
            e.end_at,
            e.created_at

        ORDER BY e.start_at DESC
    `);

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
    async findByIdWithCourse(
        id: number
    ): Promise<ExamWithCourse | null> {

        const result = await pool.query<ExamWithCourse>(
            `
        SELECT
            e.id,
            e.course_id AS "courseId",
            e.title,
            e.description,
            e.start_at AS "startsAt",
            e.end_at AS "endsAt",
            e.created_at AS "createdAt",

            json_build_object(
                'id', c.id,
                'code', c.code,
                'name', c.name
            ) AS course

        FROM exams e

        INNER JOIN courses c
            ON c.id = e.course_id

        WHERE e.id = $1
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