import { Request, Response, NextFunction } from "express";
import {
    submitAttempt,
    getAttemptResultByExamForStudent,
    getExamResultsSummary,
    listAttemptsForStudent,
    listAvailableExams,
    getAvailableExam,
} from "../service/attemptService";
import {
    BadRequestError,
    UnauthorizedError,
} from "../security/errors";

export const getMyExams = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const exams = await listAvailableExams(req.user.id);

        res.status(200).json(exams);
    } catch (error) {
        next(error);
    }
};

export const getMyExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const examId = Number(req.params.id);

        if (!Number.isInteger(examId)) {
            throw new BadRequestError("Invalid exam id");
        }

        const exam = await getAvailableExam(
            examId,
            req.user.id
        );

        res.status(200).json(exam);
    } catch (error) {
        next(error);
    }
};

export const submitExam = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const examId = Number(req.params.id);

        if (!Number.isInteger(examId)) {
            throw new BadRequestError("Invalid exam id");
        }

        if (!Array.isArray(req.body?.answers)) {
            throw new BadRequestError(
                "answers must be an array"
            );
        }

        const result = await submitAttempt(
            examId,
            req.user.id,
            req.body
        );

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const getMyExamResult = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const examId = Number(req.params.id);

        if (!Number.isInteger(examId)) {
            throw new BadRequestError("Invalid exam id");
        }

        const result =
            await getAttemptResultByExamForStudent(
                examId,
                req.user.id
            );

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getExamResults = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const examId = Number(req.params.id);

        if (!Number.isInteger(examId)) {
            throw new BadRequestError("Invalid exam id");
        }

        const result =
            await getExamResultsSummary(examId);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getMyResults = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }

        const results =
            await listAttemptsForStudent(req.user.id);

        res.status(200).json(results);
    } catch (error) {
        next(error);
    }
};