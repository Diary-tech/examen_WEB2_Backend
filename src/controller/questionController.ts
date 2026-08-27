import { Request, Response, NextFunction } from "express";
import {
    listQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
} from "../service/questionService";
import { BadRequestError } from "../security/errors";

export const getQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const examId = Number(req.params.id);

        if (!Number.isInteger(examId)) {
            throw new BadRequestError("Invalid exam id");
        }

        const questions = await listQuestions(examId);

        res.status(200).json(questions);
    } catch (error) {
        next(error);
    }
};

export const getQuestionById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const questionId = Number(req.params.id);

        if (!Number.isInteger(questionId)) {
            throw new BadRequestError("Invalid question id");
        }

        const question = await getQuestion(questionId);

        res.status(200).json(question);
    } catch (error) {
        next(error);
    }
};

export const createQuestionForExam = async (
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
            throw new BadRequestError(
                "Request body is required"
            );
        }

        if (
            typeof req.body.statement !== "string" ||
            req.body.statement.trim() === ""
        ) {
            throw new BadRequestError(
                "statement is required"
            );
        }

        if (
            typeof req.body.points !== "number" ||
            req.body.points <= 0
        ) {
            throw new BadRequestError(
                "points must be a positive number"
            );
        }

        if (!Array.isArray(req.body.choices)) {
            throw new BadRequestError(
                "choices must be an array"
            );
        }

        const question = await createQuestion(
            examId,
            req.body
        );

        res.status(201).json(question);
    } catch (error) {
        next(error);
    }
};

export const updateQuestionById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const questionId = Number(req.params.id);

        if (!Number.isInteger(questionId)) {
            throw new BadRequestError(
                "Invalid question id"
            );
        }

        if (!req.body || typeof req.body !== "object") {
            throw new BadRequestError(
                "Request body is required"
            );
        }

        if (
            req.body.statement !== undefined &&
            (typeof req.body.statement !== "string" ||
                req.body.statement.trim() === "")
        ) {
            throw new BadRequestError(
                "statement must be a non-empty string"
            );
        }

        if (
            req.body.points !== undefined &&
            (typeof req.body.points !== "number" ||
                req.body.points <= 0)
        ) {
            throw new BadRequestError(
                "points must be a positive number"
            );
        }

        if (
            req.body.choices !== undefined &&
            !Array.isArray(req.body.choices)
        ) {
            throw new BadRequestError(
                "choices must be an array"
            );
        }

        const question = await updateQuestion(
            questionId,
            req.body
        );

        res.status(200).json(question);
    } catch (error) {
        next(error);
    }
};

export const deleteQuestionById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const questionId = Number(req.params.id);

        if (!Number.isInteger(questionId)) {
            throw new BadRequestError(
                "Invalid question id"
            );
        }

        await deleteQuestion(questionId);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};