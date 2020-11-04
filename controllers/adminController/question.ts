import { Request, Response } from "express";
import Quiz from "../../models/Quizzes";
import Circle from "../../models/Circles";
import Question from "../../models/Questions";

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
      console.log(circleId, quizId)
      if (!doc.length) {
        return Quiz.findByIdAndUpdate(quizId, { $push: { circles: circleId } }).then(
          () =>
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
  let data;

  if (answers)
    data = { circleId, question, answers, answerType, quizId, index };
  else data = { circleId, question, answerType, quizId, index };
  new Question(data).save().then(() =>
    res.json({
      isFailed: false,
      errors: {},
      data: { success: "Question added successfully" },
    })
  );
};
