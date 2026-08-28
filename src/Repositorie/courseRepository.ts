import { pool } from "../config/database";
import {
    Course,
    CreateCourseInput,
    UpdateCourseInput,
} from "../model/course";

const COURSE_COLUMNS = `
    c.id,
    c.code,
    c.name,
    c.description,
    c.created_at AS "createdAt"
`;

export const courseRepository = {
    async findAll(): Promise<Course[]> {
        const result = await pool.query<Course>(
            `
            SELECT
                ${COURSE_COLUMNS},
                COUNT(e.id)::int AS exam_count
            FROM courses c
            LEFT JOIN exams e
                ON e.course_id = c.id
            GROUP BY
                c.id,
                c.code,
                c.name,
                c.description,
                c.created_at
            ORDER BY c.code
            `
        );

        return result.rows;
    },

    async findById(id: number): Promise<Course | null> {
        const result = await pool.query<Course>(
            `
            SELECT
                ${COURSE_COLUMNS}
            FROM courses c
            WHERE c.id = $1
            `,
            [id]
        );

        return result.rows[0] ?? null;
    },

    async findByCode(code: string): Promise<Course | null> {
        const result = await pool.query<Course>(
            `
            SELECT
                ${COURSE_COLUMNS}
            FROM courses c
            WHERE c.code = $1
            `,
            [code]
        );

        return result.rows[0] ?? null;
    },

    async create(data: CreateCourseInput): Promise<Course> {
        const result = await pool.query<Course>(
            `
            INSERT INTO courses
                (code, name, description)
            VALUES
                ($1, $2, $3)
            RETURNING
                id,
                code,
                name,
                description,
                created_at AS "createdAt"
            `,
            [
                data.code,
                data.name,
                data.description ?? null,
            ]
        );

        return result.rows[0];
    },

    async update(
        id: number,
        data: UpdateCourseInput
    ): Promise<Course | null> {
        const result = await pool.query<Course>(
            `
            UPDATE courses
            SET
                code = COALESCE($2, code),
                name = COALESCE($3, name),
                description = COALESCE($4, description)
            WHERE id = $1
            RETURNING
                id,
                code,
                name,
                description,
                created_at AS "createdAt"
            `,
            [
                id,
                data.code ?? null,
                data.name ?? null,
                data.description ?? null,
            ]
        );

        return result.rows[0] ?? null;
    },

    async delete(id: number): Promise<void> {
        await pool.query(
            "DELETE FROM courses WHERE id = $1",
            [id]
        );
    },

    async countExamsForCourse(id: number): Promise<number> {
        const result = await pool.query<{ count: number }>(
            `
            SELECT COUNT(*)::int AS count
            FROM exams
            WHERE course_id = $1
            `,
            [id]
        );

        return Number(result.rows[0].count);
    },
};