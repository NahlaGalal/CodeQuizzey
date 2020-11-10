import { Request, Response } from "express";
import { endQuiz, getQuestion, submitQuestion } from "./questionsController";
import Circle from "../../models/Circles";
import Users from "../../models/Users";
import Quiz from "../../models/Quizzes";

export const getCircles = (req: Request, res: Response) => {
  Quiz.findOne({
    startDate: { $lt: new Date() },
    endDate: { $gt: new Date() },
  }).then((doc) => {
    if (!doc) {
      return res.json({
        isFailed: true,
        errors: { quizzes: "No available quizzes" },
        data: {},
      });
    }

    return Circle.find({ _id: doc.circles }).then((data) => {
      let circles = [...data];
      const nonTechnicalCircleIndex = circles.findIndex(
        (circle) => circle.name == "Non-technical"
      );
      if (nonTechnicalCircleIndex !== -1)
        circles.splice(nonTechnicalCircleIndex, 1);

      return res.json({
        isFailed: false,
        errors: {},
        data: { circles, quizId: doc._id, quizName: doc.name },
      });
    }
    );
  });
};

export const submitGeneral = (req: Request, res: Response) => {
  // var ip =
  //   req.headers["x-forwarded-for"] ||
  //   req.connection.remoteAddress ||
  //   req.socket.remoteAddress;
  // console.log(ip)
  let { name, email, circles } = req.body;
  Circle.findOne({ name: "Non-technical" }).then((doc) => {
    circles.push(doc?._id);
    Users.findOne({ email }).then((data) => {
      if (!data) {
        Users.findOne({ name }).then((data) => {
          if (!data) {
            new Users({
              name,
              email,
              technicalCircles: circles,
            })
              .save()
              .then(() =>
                res.json({
                  isFailed: false,
                  error: {},
                  data: { nonTech: doc?._id },
                })
              );
          } else {
            return res.json({
              isFailed: true,
              error: {
                name: "This name is already exists with different email",
              },
              data: {},
            });
          }
        });
      } else {
        if (data.name !== name)
          return res.json({
            isFailed: true,
            error: {
              email: "This email is already exists with different user",
            },
            data: {},
          });
        else {
          if (
            JSON.stringify(circles.sort()) !==
            JSON.stringify(data.technicalCircles.sort())
          )
            return res.json({
              isFailed: true,
              error: {
                circle:
                  "Name and email are already exists with different circles",
              },
              data: {},
            });
          else
            return res.json({
              isFailed: false,
              error: {},
              data: { nonTech: doc?._id },
            });
        }
      }
    });
  });
};

export { endQuiz, getQuestion, submitQuestion };
