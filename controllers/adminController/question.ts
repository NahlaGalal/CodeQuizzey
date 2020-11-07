import { Request, Response } from "express";
import Quiz from "../../models/Quizzes";
import Circle from "../../models/Circles";
import Question from "../../models/Questions";
import User from "../../models/Users";

interface IAddQuestion {
  circleId: string;
  question: string;
  answers?: string[];
  answerType: string;
  quizId: string;
  index: number;
}

export const getAddQuestion = (req: Request, res: Response) => {
  Circle.find({}).then((circles) =>
    res.json({
      isFailed: false,
      error: {},
      data: circles,
    })
  );
};

export const getQuestionIndex = (req: Request, res: Response) => {
  const quizId = req.query.quizId as string;
  const circleId = req.query.circleId as string;

  Question.find({ quizId, circleId })
    .sort({ index: -1 })
    .then((doc) => {
      console.log(circleId, quizId);
      if (!doc.length) {
        return Quiz.findByIdAndUpdate(quizId, {
          $push: { circles: circleId },
        }).then(() =>
          res.json({
            isFailed: false,
            errors: {},
            data: { index: 1 },
          })
        );
      }
      return res.json({
        isFailed: false,
        errors: {},
        data: { index: doc[0].index + 1 },
      });
    });
};

export const postAddQuestion = (req: Request, res: Response) => {
  const { circleId, question, answers, answerType, quizId, index } = req.body;
  let data: IAddQuestion;

  if (answers)
    data = { circleId, question, answers, answerType, quizId, index };
  else data = { circleId, question, answerType, quizId, index };

  Quiz.findOne({ _id: quizId, circles: { $in: circleId } })
    .then((doc) => {
      if (!doc)
        return Quiz.findByIdAndUpdate(quizId, { $push: { circles: circleId } });
    })
    .then(() => new Question(data).save())
    .then(() =>
      res.json({
        isFailed: false,
        errors: {},
        data: { success: "Question added successfully" },
      })
    );
};

export const deleteQuestion = (req: Request, res: Response) => {
  const questionId = req.query.questionId as string;

  Question.findById(questionId)
    .then((doc) =>
      Quiz.findOne({
        _id: doc?.quizId,
        startDate: { $lt: new Date() },
        endDate: { $gt: new Date() },
      })
    )
    .then((doc) => {
      if (!doc)
        return res.json({
          isFailed: true,
          errors: { err: "Wrong id in the current quiz" },
          data: {},
        });
      return Question.findByIdAndDelete(questionId)
        .then(() =>
          User.updateMany(
            { "solvedQuestions.questionId": questionId },
            { $pull: { solvedQuestions: { questionId: questionId } } }
          )
        )
        .then(() =>
          res.json({
            isFailed: false,
            errors: {},
            data: { success: "Question removed successfully" },
          })
        );
    });
};
