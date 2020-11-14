import { Request, Response } from "express";
import Question, { IQuestionsDoc } from "../../models/Questions";
import Quiz, { IQuizDoc } from "../../models/Quizzes";
import User from "../../models/Users";
import Excel from "exceljs";
import path from "path";
import Circle from "../../models/Circles";

export const addQuiz = (req: Request, res: Response) => {
  const { name, startDate, endDate, quizId } = req.body;
  if (endDate < startDate) {
    return res.json({
      isFailed: true,
      errors: { endDate: "End date must be after start date" },
      data: {},
    });
  }

  Quiz.find({ startDate: { $lte: endDate, $gte: startDate } })
    .then((doc) => {
      if (
        !(quizId && doc.length && doc[0]._id.toString() === quizId.toString())
      ) {
        if (doc.length) {
          return res.json({
            isFailed: true,
            errors: {
              startDate: "There is a quiz already through this period",
            },
            data: {},
          });
        }
      }

      return Quiz.find({
        endDate: { $gte: startDate },
        startDate: { $lt: startDate },
      })
        .then((doc) => {
          if (
            !(
              quizId &&
              doc.length &&
              doc[0]._id.toString() === quizId.toString()
            )
          ) {
            if (doc.length) {
              return res.json({
                isFailed: true,
                errors: { endDate: "There is a quiz before ending this quiz" },
                data: {},
              });
            }
          }

          if (quizId) {
            return Quiz.findByIdAndUpdate(quizId, {
              name,
              startDate,
              endDate,
            })
              .then(() =>
                res.json({
                  isFailed: false,
                  errors: {},
                  data: { success: "Edit quiz successfully" },
                })
              )
              .catch(() => res.status(500).end());
          }
          return new Quiz({ name, startDate, endDate })
            .save()
            .then(() =>
              res.json({
                isFailed: false,
                errors: {},
                data: { success: "Add quiz successfully" },
              })
            )
            .catch(() => res.status(500).end());
        })
        .catch(() => res.status(500).end());
    })
    .catch(() => res.status(500).end());
};

export const getQuiz = (req: Request, res: Response) => {
  const quizId = req.query.quizId as string;
  let quiz: { name: string; state: string };
  let circles: { name: string; _id: string }[];
  let questions;

  Quiz.findById(quizId)
    .then((doc) => {
      if (!doc) {
        return res.json({
          isFailed: true,
          errors: { quizId: "Quiz isn't available" },
          data: {},
        });
      }

      quiz = {
        name: doc.name,
        state:
          doc.endDate < new Date()
            ? "Previous quiz"
            : doc.startDate > new Date()
            ? "Upcoming quiz"
            : "Current quiz",
      };

      Circle.find({ _id: { $in: doc.circles } })
        .then((doc) => {
          circles = doc;
          return Question.find(
            { quizId },
            "question answerType answers index circleId"
          );
        })
        .then((doc) => {
          questions = doc;
          return res.json({
            isFailed: false,
            errors: {},
            data: { quiz, questions, circles },
          });
        })
        .catch(() => res.status(500).end());
    })
    .catch(() => res.status(500).end());
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

  Quiz.find({ startDate: { $gt: new Date() } }, "name startDate endDate")
    .then((upcomingQuizzes) => {
      data.upcomingQuizzes = upcomingQuizzes;
      return Quiz.findOne(
        {
          startDate: { $lt: new Date() },
          endDate: { $gt: new Date() },
        },
        "name endDate"
      );
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
    })
    .catch(() => res.status(500).end());
};

export const deleteQuiz = (req: Request, res: Response) => {
  const quizId = req.query.quizId as string;

  Quiz.findByIdAndDelete(quizId)
    .then(() => Question.deleteMany({ quizId }))
    .then(() =>
      User.updateMany(
        { "solvedQuestions.quizId": quizId },
        { $pull: { solvedQuestions: { quizId: quizId } } }
      )
    )
    .then(() =>
      res.json({
        isFailed: false,
        errors: {},
        data: { success: "Quiz removed successfully" },
      })
    )
    .catch(() => res.status(500).end());
};

export const getStandings = (req: Request, res: Response) => {
  const quizId = req.query.quizId as string;
  let questions: IQuestionsDoc[];
  let circles: { _id: string; name: string }[];
  let quizName: string | undefined;
  let quizState: string | undefined;

  Quiz.findById(quizId)
    .then((quiz) => {
      quizName = quiz?.name;
      if (quiz?.endDate && quiz.endDate < new Date())
        quizState = "Previous quiz";
      else if (quiz?.startDate && quiz.startDate > new Date())
        quizState = "Upcoming quiz";
      else quizState = "Current quiz";

      Question.find({ quizId })
        .then((qus) => {
          questions = qus;
          return Circle.find({ _id: { $in: qus.map((q) => q.circleId) } });
        })
        .then((c) => {
          circles = c;
          return User.find(
            { "solvedQuestions.quizId": quizId },
            "name email solvedQuestions"
          );
        })
        .then((doc) => {
          interface IUsers {
            _id: string;
            name: string;
            email: string;
            solvedQuestions: {
              questionId: string;
              answer: string;
              quizId: string;
              circle: string | undefined;
              questionDetails: IQuestionsDoc | undefined;
            }[];
          }

          let users: IUsers[] = [];

          doc.map((user) => {
            let solvedQuestions: {
              questionId: string;
              answer: string;
              quizId: string;
              circle: string | undefined;
              questionDetails: IQuestionsDoc | undefined;
            }[] = [];

            user.solvedQuestions.map((qu) => {
              const questionDetails = questions.find(
                (question) =>
                  question._id.toString() === qu.questionId.toString()
              );

              const circle = circles.find(
                (c) => c._id.toString() === questionDetails?.circleId.toString()
              )?.name;

              solvedQuestions.push({
                questionId: qu.questionId,
                answer: qu.answer,
                quizId: qu.quizId,
                circle,
                questionDetails,
              });
            });

            users.push({
              _id: user._id,
              name: user.name,
              email: user.email,
              solvedQuestions,
            });
          });

          return res.json({
            isFailed: false,
            errors: {},
            data: {
              responses: users,
              quiz: { name: quizName, state: quizState },
            },
          });
        })
        .catch(() => res.status(500).end());
    })
    .catch(() => res.status(500).end());
};

export const downloadResponses = (req: Request, res: Response) => {
  const quizId = req.query.quizId as string;
  const wb = new Excel.Workbook();
  let circles: { name: string; _id: string }[] = [];
  let questions: {
    question: string;
    circleId: string;
    index: number;
    _id: string;
  }[] = [];

  Quiz.findById(quizId)
    .then((doc) => {
      if (!doc) {
        return res.json({
          isFailed: true,
          error: { quiz: "No quiz with this id" },
          data: {},
        });
      }

      let column = 3,
        secondRow = ["", ""],
        circlesIds = doc.circles;
      const sheet = wb.addWorksheet(doc.name, {
        pageSetup: { horizontalCentered: true },
      });
      sheet.views = [
        {
          state: "frozen",
          ySplit: 2,
        },
      ];

      sheet.getCell(1, 1).value = "Name";
      sheet.getCell(1, 2).value = "Email";

      Question.find({ quizId }, "question circleId index")
        .then((doc) => {
          questions = doc;
          return Circle.find({ _id: { $in: circlesIds } }, "name");
        })
        .then((doc) => {
          circles = [...doc];

          circles.forEach((circle) => {
            const circleQuestions = questions.filter(
              (qu) => qu.circleId.toString() == circle._id.toString()
            );
            circleQuestions.forEach((qu, i) => {
              sheet.getColumn(column + i).key = qu._id.toString();
              secondRow.push(qu.question);
            });
            sheet.mergeCells(1, column, 1, circleQuestions.length + column - 1);
            sheet.getCell(1, column).value = circle.name;
            column += circleQuestions.length;
          });
          sheet.getCell(1, column).value = "Lastupdate";
          sheet.addRow(secondRow);

          // Add styles
          sheet.getRows(1, 2).forEach((row) => {
            row.font = {
              color: { argb: "00FFFFFF" },
              size: 12,
              bold: true,
            };
            row.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFC0504D" },
            };
          });

          return User.find(
            { "solvedQuestions.quizId": quizId },
            "name email solvedQuestions lastUpate"
          ).then((doc) => {
            doc.forEach((user) => {
              let row = [user.name, user.email];
              user.solvedQuestions.forEach((qu) => {
                const column = sheet.getColumn(qu.questionId.toString())
                  ?.number;
                row[column - 1] = qu.answer;
              });
              row[column - 1] = user.lastUpate?.toString() || "";

              sheet.addRow(row);
            });
          });
        })
        .then(() => wb.xlsx.writeFile("./public/file.xlsx"))
        .then(() =>
          res.download(path.join(__dirname, "../../public/file.xlsx"))
        )
        .catch(() => res.status(500).end());
    })
    .catch(() => res.status(500).end());
};

export const getEditQuiz = (req: Request, res: Response) => {
  const quizId = req.query.quizId as string;

  Quiz.findById(quizId, "name startDate endDate")
    .then((quiz) =>
      res.json({
        isFailed: false,
        errors: {},
        data: quiz,
      })
    )
    .catch(() => res.status(500).end());
};
