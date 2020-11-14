import { Request, Response } from "express";
import Circle from "../../models/Circles";
import Question from "../../models/Questions";
import Quiz from "../../models/Quizzes";
import User from "../../models/Users";

export const getQuestion = (req: Request, res: Response) => {
  const circleId = req.query.circle as string;
  let index = +(req.query.quNo || "0") as number;
  const userEmail = req.query.email as string;
  const quizId = req.query.quizId as string;
  let solvedQuestions: string[] = [];

  if (!quizId || !userEmail) {
    return res.json({
      isFailed: true,
      errors: { data: "Missing data" },
      data: {},
    });
  }

  User.findOne({ email: userEmail })
    .then((doc) => {
      solvedQuestions =
        doc?.solvedQuestions
          .filter((qu) => qu.quizId == quizId)
          .map((qu) => qu.questionId) || [];
      if (!circleId) {
        return Circle.findOne({ name: "Non-technical" }).then((doc) => {
          return Question.find({
            circleId: doc?._id,
            quizId,
          }).sort({ index: 1 });
        });
      } else
        return Question.find({
          circleId: circleId,
          quizId,
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
    })
    .catch(() => res.status(500).end());
};

export const submitQuestion = (req: Request, res: Response) => {
  let { email, questionId, answer, quizId } = req.body;
  let userId: string = "";
  if (!answer) answer = req.file.path;

  Question.findById(questionId)
    .then((doc) => {
      if (doc)
        return User.findOneAndUpdate(
          { email },
          {
            $push: { solvedQuestions: { questionId, answer, quizId } },
            lastUpate: new Date(),
          }
        )
          .then((doc) => {
            userId = doc?._id;
            return Quiz.findOne({ responses: { $in: doc?._id }, _id: quizId });
          })
          .then((doc) => {
            if (!doc)
              return Quiz.findByIdAndUpdate(quizId, {
                $push: { responses: userId },
              })
                .then(() =>
                  res.json({
                    isFailed: false,
                    error: {},
                    data: { answer },
                  })
                )
                .catch(() => res.status(500).end());
            else
              return res.json({
                isFailed: false,
                error: {},
                data: { answer },
              });
          });

      return res.json({
        isFailed: true,
        error: { question: "No question" },
        data: {},
      });
    })
    .catch(() => res.status(500).end());
};

export const endQuiz = (req: Request, res: Response) => {
  const email = req.query.email as string;
  const circleId = req.query.circle as string;
  const quizId = req.query.quizId as string;
  let solvedQuestions: string[] | undefined;
  let userId: string = "";

  User.findOne({ email })
    .then((doc) => {
      solvedQuestions = doc?.solvedQuestions.map(
        (question) => question.questionId
      );
      return Question.find({ circleId, quizId });
    })
    .then((doc) => {
      const unSolvedQuestions = doc.filter(
        (question) => !solvedQuestions?.includes(question._id)
      );
      const newDoc = unSolvedQuestions.map((question) => ({
        questionId: question._id,
        answer: "",
        quizId,
      }));
      return User.findOneAndUpdate(
        { email },
        { $push: { solvedQuestions: { $each: newDoc } }, lastUpate: new Date() }
      );
    })
    .then((doc) => {
      userId = doc?._id;
      return Quiz.findOne({ responses: { $in: doc?._id }, _id: quizId });
    })
    .then((doc) => {
      if (!doc)
        return Quiz.findByIdAndUpdate(quizId, {
          $push: { responses: userId },
        }).then(() =>
          res.json({
            isFailed: false,
            error: {},
            data: { data: "Quiz ended" },
          })
        );
      else
        return res.json({
          isFailed: false,
          error: {},
          data: { data: "Quiz ended" },
        });
    })
    .catch(() => res.status(500).end());
};
