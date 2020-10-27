import { Request, Response } from "express";
import { endQuiz, getQuestion, submitQuestion } from "./questionsController";
import Circle from "../../models/Circles";
import Users from "../../models/Users";

export const getCircles = (req: Request, res: Response) => {
  Circle.find().then((data) => res.json(data));
};

export const submitGeneral = (req: Request, res: Response) => {
  // var ip =
  //   req.headers["x-forwarded-for"] ||
  //   req.connection.remoteAddress ||
  //   req.socket.remoteAddress;
  // console.log(ip)
  let { name, email, circles } = req.body;
  circles.push("5f90db8465a68c35f49cb3bf");
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
                data: { success: true },
              })
            );
        } else {
          return res.json({
            isFailed: true,
            error: { name: "This name is already exists with different email" },
            data: {},
          });
        }
      });
    } else {
      if (data.name !== name)
        return res.json({
          isFailed: true,
          error: { email: "This email is already exists with different user" },
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
            data: { success: true },
          });
      }
    }
  });
};

export { endQuiz, getQuestion, submitQuestion };
