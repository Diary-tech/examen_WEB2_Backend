import { Request, Response, NextFunction } from "express";
import {
    listExams,
    getExam,
    createExam,
    updateExam,
    deleteExam,
} from "../service/examService";
import { BadRequestError } from "../security/errors";

export const getExams = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const exams = await listExams();
        res.status(200).json(exams);
    } catch (error) {
        next(error);
    }
};

export const getExamById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const examId = Number(req.params.id);

        if (!Number.isInteger(examId)) {
            throw new BadRequestError("Invalid exam id");
        }

        const exam = await getExam(examId);
        res.status(200).json(exam);
    } catch (error) {
        next(error);
    }
};

export const createNewExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.body || typeof req.body !== "object") {
            throw new BadRequestError("Request body is required");
        }

        const {
            courseId,
            title,
            description,
            startsAt,
            endsAt,
        } = req.body;

        if (!Number.isInteger(courseId)) {
            throw new BadRequestError("courseId must be an integer");
        }

        if (typeof title !== "string" || title.trim() === "") {
            throw new BadRequestError("title is required");
        }

        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            throw new BadRequestError("description must be a string");
        }

        if (
            typeof startsAt !== "string" ||
            startsAt.trim() === ""
        ) {
            throw new BadRequestError("startsAt is required");
        }

        if (
            typeof endsAt !== "string" ||
            endsAt.trim() === ""
        ) {
            throw new BadRequestError("endsAt is required");
        }

        const startDate = new Date(startsAt);
        const endDate = new Date(endsAt);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            throw new BadRequestError("Invalid exam dates");
        }

        const exam = await createExam({
            courseId,
            title: title.trim(),
            description,
            startsAt: startDate,
            endsAt: endDate,
        });

        res.status(201).json(exam);
    } catch (error) {
        next(error);
    }
};

export const updateExamById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const examId = Number(req.params.id);

        if (!Number.isInteger(examId)) {
            throw new BadRequestError("Invalid exam id");
        }

        if (!req.body || typeof req.body !== "object") {
            throw new BadRequestError("Request body is required");
        }

        const {
            title,
            description,
            startsAt,
            endsAt,
        } = req.body;

        if (
            title !== undefined &&
            (typeof title !== "string" || title.trim() === "")
        ) {
            throw new BadRequestError(
                "title must be a non-empty string"
            );
        }

        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            throw new BadRequestError(
                "description must be a string"
            );
        }

        if (
            startsAt !== undefined &&
            (typeof startsAt !== "string" || startsAt.trim() === "")
        ) {
            throw new BadRequestError(
                "startsAt must be a valid date"
            );
        }

        if (
            endsAt !== undefined &&
            (typeof endsAt !== "string" || endsAt.trim() === "")
        ) {
            throw new BadRequestError(
                "endsAt must be a valid date"
            );
        }

        const parsedStartsAt =
            startsAt !== undefined
                ? new Date(startsAt)
                : undefined;

        const parsedEndsAt =
            endsAt !== undefined
                ? new Date(endsAt)
                : undefined;

        if (
            parsedStartsAt &&
            Number.isNaN(parsedStartsAt.getTime())
        ) {
            throw new BadRequestError("Invalid startsAt date");
        }

        if (
            parsedEndsAt &&
            Number.isNaN(parsedEndsAt.getTime())
        ) {
            throw new BadRequestError("Invalid endsAt date");
        }

        const exam = await updateExam(examId, {
            title: title?.trim(),
            description,
            startsAt: parsedStartsAt,
            endsAt: parsedEndsAt,
        });

        res.status(200).json(exam);
    } catch (error) {
        next(error);
    }
};

export const deleteExamById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const examId = Number(req.params.id);

        if (!Number.isInteger(examId)) {
            throw new BadRequestError("Invalid exam id");
        }

        await deleteExam(examId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};