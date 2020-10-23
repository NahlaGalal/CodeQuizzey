import { Request, Response } from "express";
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
            errors: { data: `Question ${index} solved`, lastQuestion: index === data.length },
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
          errors: { data: `Question ${data.length - 1} solved`, lastQuestion: true },
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
  const { email, answer, questionId } = req.body;

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
        data: {},
      })
    );
};

export const endQuiz = (req: Request, res: Response) => {};
