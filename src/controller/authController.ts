import { Request, Response, NextFunction } from "express";
import { authService } from "../service/authService";
import { BadRequestError } from "../security/errors";
import { toSnakeCaseKeys } from "../security/caseConverter";

export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.body || typeof req.body !== "object") {
            throw new BadRequestError("Request body is required");
        }

        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            email.trim() === ""
        ) {
            throw new BadRequestError("Email is required");
        }

        if (
            typeof password !== "string" ||
            password.length === 0
        ) {
            throw new BadRequestError("Password is required");
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            throw new BadRequestError("Invalid email format");
        }

        const result = await authService.login(
            email.trim(),
            password
        );

        res.status(200).json(toSnakeCaseKeys(result));
    } catch (error) {
        next(error);
    }
};