import { Request, Response, NextFunction } from "express";
import {
    submitAttempt,
    getAttemptResultByExamForStudent,
    getExamResultsSummary,
    listAttemptsForStudent,
} from "../service/AttemptService";
import {
    BadRequestError,
    UnauthorizedError,
} from "../security/Errors";

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

        // Vérifier que answers existe et est bien un tableau
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