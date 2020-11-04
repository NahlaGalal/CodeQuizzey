import { Request, Response } from "express";
// import Question from "../../models/Questions";
import Quiz, { IQuizDoc } from "../../models/Quizzes";
// import User from "../../models/Users";

export const addQuiz = (req: Request, res: Response) => {
  const { name, startDate, endDate } = req.body;
  new Quiz({ name, startDate, endDate }).save().then(() =>
    res.json({
      isFailed: false,
      errors: {},
      data: { success: "Add quiz successfully" },
    })
  );
};

export const getQuizzes = (req: Request, res: Response) => {
  let data: {
    upcomingQuizzes: IQuizDoc[] | [];
    currentQuiz: IQuizDoc | null;
    previousQuizzes: IQuizDoc[] | [];
  } = {
    upcomingQuizzes: [],
    currentQuiz: null,
    previousQuizzes: [],
  };

  Quiz.find({ startDate: { $gt: new Date() } })
    .then((upcomingQuizzes) => {
      data.upcomingQuizzes = upcomingQuizzes;
      return Quiz.findOne({
        startDate: { $lt: new Date() },
        endDate: { $gt: new Date() },
      });
    })
    .then((currentQuiz) => {
      data.currentQuiz = currentQuiz;
      return Quiz.find({ endDate: { $lt: new Date() } });
    })
    .then((previousQuizzes) => {
      data.previousQuizzes = previousQuizzes;
      return res.json({
        isFailed: false,
        errors: {},
        data,
      });
    });
};