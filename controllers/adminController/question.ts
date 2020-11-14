import { Request, Response } from "express";
import Quiz from "../../models/Quizzes";
import Circle from "../../models/Circles";
import Question from "../../models/Questions";
import User from "../../models/Users";

interface IAddQuestion {
  question: string;
  answers?: string[];
  answerType: string;
  circleId: string;
  quizId: string;
  index: number;
}

export const getAddQuestion = (req: Request, res: Response) => {
  Circle.find({})
    .then((circles) =>
      res.json({
        isFailed: false,
        error: {},
        data: circles,
      })
    )
    .catch(() => res.status(500).end());
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
        })
          .then(() =>
            res.json({
              isFailed: false,
              errors: {},
              data: { index: 1 },
            })
          )
          .catch(() => res.status(500).end());
      }
      return res.json({
        isFailed: false,
        errors: {},
        data: { index: doc[0].index + 1 },
      });
    })
    .catch(() => res.status(500).end());
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
    )
    .catch(() => res.status(500).end());
};

export const deleteQuestion = (req: Request, res: Response) => {
  const questionId = req.query.questionId as string;

  Question.findById(questionId)
    .then((doc) => {
      if (!doc)
        return res.json({
          isFailed: true,
          errors: { err: "Wrong question id" },
          data: {},
        });

      const circleId = doc.circleId;
      const quizId = doc.quizId;
      return Question.findByIdAndDelete(questionId)
        .then(() =>
          User.updateMany(
            { "solvedQuestions.questionId": questionId },
            { $pull: { solvedQuestions: { questionId } } }
          )
        )
        .then(() =>
          Question.find({ quizId, circleId })
            .then((doc) => {
              if (!doc.length)
                return Quiz.findByIdAndUpdate(quizId, {
                  $pull: { circles: circleId },
                });
            })
            .then(() =>
              res.json({
                isFailed: false,
                errors: {},
                data: { success: "Question removed successfully" },
              })
            )
        )
        .catch(() => res.status(500).end());
    })
    .catch(() => res.status(500).end());
};

export const getEditQuestion = (req: Request, res: Response) => {
  const questionId = req.query.questionId as string;

  Question.findById(questionId)
    .then((question) => {
      if (!question)
        return res.json({
          isFailed: true,
          errors: { question: "No question with this id" },
          data: {},
        });

      return Circle.findById(question.circleId, "name")
        .then((circle) =>
          res.json({
            isFailed: false,
            errors: {},
            data: { question, circle },
          })
        )
        .catch(() => res.status(500).end());
    })
    .catch(() => res.status(500).end());
};

export const postEditQuestion = (req: Request, res: Response) => {
  const { question, answers, answerType, questionId } = req.body;

  Question.findByIdAndUpdate(questionId, {
    question,
    answers,
    answerType,
  })
    .then(() =>
      res.json({
        isFailed: false,
        errors: {},
        data: { success: "Question edited successfully" },
      })
    )
    .catch(() => res.status(500).end());
};
