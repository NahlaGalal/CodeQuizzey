import { Request, Response, NextFunction } from "express";
import { endQuiz, getQuestions, submitQuestion } from "./questionsController";
import Circle from "../../models/Circles";
import Questions from "../../models/Questions";

export const getCircles = (req: Request, res: Response, next: NextFunction) => {
  var ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;
  console.log(ip)
  Circle.find().then((data) => res.json(data));
};

export const submitGeneral = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export { endQuiz, getQuestions, submitQuestion };
