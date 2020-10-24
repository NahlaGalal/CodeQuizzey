import { Request, Response } from "express";
import path from "path";
import Question from "../../models/Questions";
import User, { IUserDoc } from "../../models/Users";

export const getQuestion = (req: Request, res: Response) => {
  const circleId = req.query.circle as string;
  let index = +(req.query.quNo || "0") as number;
  const userEmail = req.query.email as string;
  let solvedQuestions: string[] = [];

  User.findOne({ email: userEmail })
    .then((doc) => {
      solvedQuestions = doc?.solvedQuestions.map((qu) => qu.questionId) || [];
      return Question.find({
        circleId: circleId || "5f90db8465a68c35f49cb3bf",
      }).sort({ index: 1 });
    })
    .then((data) => {
      if (!data.length) {
        return res.json({
          isFailed: true,
          errors: { data: "Wrong Circle id" },
          data: {},
        });
      }

      if (index) {
        const resData = data.find((doc) => doc.index === index);
        if (!resData)
          return res.json({
            isFailed: true,
            errors: { data: "Wrong index" },
            data: {},
          });

        const isSolved = solvedQuestions.includes(resData._id);
        if (isSolved)
          return res.json({
            isFailed: true,
            errors: {
              data: `Question ${index} solved`,
              lastQuestion: index === data.length,
            },
            data: {},
          });

        return res.json({
          isFailed: false,
          errors: {},
          data: { question: resData, lastQuestion: index === data.length },
        });
      }

      const Unsolved = data.find((doc) => !solvedQuestions.includes(doc._id));
      if (!Unsolved) {
        return res.json({
          isFailed: true,
          errors: {
            data: `All questions solved`,
          },
          data: {},
        });
      }
      res.json({
        isFailed: false,
        errors: {},
        data: {
          question: Unsolved,
          lastQuestion: Unsolved.index === data.length,
        },
      });
    });
};

export const submitQuestion = (req: Request, res: Response) => {
  let { email, questionId, answer } = req.body;
  if(!answer) answer = req.file.path

  Question.findById(questionId)
    .then((doc):
      | Response<any>
      | IUserDoc
      | PromiseLike<IUserDoc | null>
      | null => {
      if (!doc)
        return res.json({
          isFailed: true,
          error: { question: "No question" },
          data: {},
        });
      return User.findOneAndUpdate(
        { email },
        { $push: { solvedQuestions: { questionId, answer } } }
      );
    })
    .then(() =>
      res.json({
        isFailed: false,
        error: {},
        data: {answer},
      })
    );
};

export const endQuiz = (req: Request, res: Response) => {
  const email = req.query.email as string;
  const circleId = req.query.circle as string;
  let solvedQuestions: string[] | undefined;

  User.findOne({ email })
    .then((doc) => {
      solvedQuestions = doc?.solvedQuestions.map(
        (question) => question.questionId
      );
      return Question.find({ circleId });
    })
    .then((doc) => {
      const unSolvedQuestions = doc.filter(
        (question) => !solvedQuestions?.includes(question._id)
      );
      const newDoc = unSolvedQuestions.map((question) => ({
        questionId: question._id,
        answer: "",
      }));
      return User.findOneAndUpdate(
        { email },
        { $push: { solvedQuestions: { $each: newDoc } } }
      );
    })
    .then(() =>
      res.json({
        isFailed: false,
        errors: {},
        data: { data: "Quiz ended" },
      })
    );
};
