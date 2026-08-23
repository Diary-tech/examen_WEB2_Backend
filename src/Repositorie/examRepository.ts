import { pool } from "../config/Database";
import { Exam } from "../model/Exam";

export const ExamRepository = {
    async findAll(): Promise<Exam[]> {
        const result = await pool.query<Exam>(
            "SELECT * FROM exams ORDER BY start_at DESC"
        );
        return result.rows;
    },

    async findById(id: number): Promise<Exam | null> {
        const result = await pool.query<Exam>(
            "SELECT * FROM exams WHERE id = $1",
            [id]
        );
        return result.rows[0] ?? null;
    },

    async create(data: {
        courseId: number;
        title: string;
        description: string | null;
        startAt: Date;
        endAt: Date;
    }): Promise<Exam> {
        const result = await pool.query<Exam>(
            `INSERT INTO exams (course_id, title, description, start_at, end_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [data.courseId, data.title, data.description, data.startAt, data.endAt]
        );
        return result.rows[0];
    },

    async update(
        id: number,
        data: {
            title?: string;
            description?: string | null;
            startAt?: Date;
            endAt?: Date;
        }
    ): Promise<Exam | null> {
        const result = await pool.query<Exam>(
            `UPDATE exams
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           start_at = COALESCE($4, start_at),
           end_at = COALESCE($5, end_at)
       WHERE id = $1
       RETURNING *`,
            [
                id,
                data.title ?? null,
                data.description ?? null,
                data.startAt ?? null,
                data.endAt ?? null,
            ]
        );
        return result.rows[0] ?? null;
    },

    async delete(id: number): Promise<void> {
        await pool.query("DELETE FROM exams WHERE id = $1", [id]);
    },

    async findCurrentlyOpen(): Promise<Exam[]> {
        const result = await pool.query<Exam>(
            `SELECT * FROM exams
       WHERE start_at <= now() AND end_at >= now()
       ORDER BY end_at`
        );
        return result.rows;
    },
};
