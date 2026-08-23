import { Request, Response, NextFunction } from 'express';
import * as studentService from '../Service/StudentService';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const students = await studentService.listStudents();
    res.status(200).json(students);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, fullName, password } = req.body;
    if (!email || !fullName || !password) {
      return res.status(400).json({ message: 'Email, name and password are required' });
    }
    const student = await studentService.createStudent({ email, fullName, password });
    res.status(201).json(student);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const updated = await studentService.updateStudent(id, req.body);
    res.status(200).json(updated);
  } catch (err) { next(err); }
}

export async function desactivate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await studentService.desactivateStudent(id);
    res.status(204).send();
  } catch (err) { next(err); }
}