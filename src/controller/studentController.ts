import { Request, Response, NextFunction } from 'express';
import * as studentService from '../service/studentService';
import {BadRequestError} from "../security/errors";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await studentService.listStudents();
    res.status(200).json(students);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, fullName, password } = req.body;
    if (!email || !fullName || !password) {
      return res
          .status(400)
          .json({ message: 'Email, name and password are required' });
    }
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const student = await studentService.createStudent({
      email: email.trim(),
      fullName,
      password,
    });

    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id<=0) {
      throw new BadRequestError("Invalid student id")
    }
    const updated = await studentService.updateStudent(id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const desactivate = async ( req: Request, res: Response, next: NextFunction ) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id<=0) {
      throw new BadRequestError("Invalid student id")
    }
    await studentService.desactivateStudent(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const activate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    await studentService.activateStudent(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError("Invalid student id");
    }
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        message: 'New password is required',
      });
    }

    await studentService.resetPassword(id, newPassword);

    res.status(200).json({
      message: 'Student password reset successfully',
    });
  } catch (err) {
    next(err);
  }
};