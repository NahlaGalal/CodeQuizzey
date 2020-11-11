import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admins";
import {
  addQuiz,
  getQuizzes,
  deleteQuiz,
  getStandings,
  downloadResponses,
  getQuiz
} from "./quiz";
import {
  getAddQuestion,
  getQuestionIndex,
  postAddQuestion,
  deleteQuestion,
} from "./question";
import { addCircle } from "./circle";

declare var process: {
  env: {
    TOKEN_SECRET: string;
  };
};

export const loginAdmin = (req: Request, res: Response) => {
  const { email, password } = req.body;

  Admin.findOne({ email }).then((data) => {
    if (data) {
      bcrypt.compare(password, data.password).then((isMatch) => {
        if (isMatch) {
          const token = jwt.sign({ email }, process.env.TOKEN_SECRET, {
            expiresIn: `${60 * 60 * 24 * 30}s`,
          });
          return Admin.findOneAndUpdate({ email }, { token }).then(() =>
            res.json({
              isFailed: false,
              errors: {},
              data: { token: data.token },
            })
          );
        } else {
          return res.json({
            isFailed: true,
            errors: { password: "Wrong password" },
            data: {},
          });
        }
      });
    } else {
      return res.json({
        isFailed: true,
        errors: { email: "Wrong email" },
        data: {},
      });
    }
  });
};

export const addAdmin = (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  Admin.findOne({ email }).then((data) => {
    if (!data) {
      bcrypt
        .hash(password, 12)
        .then((newPass) => new Admin({ name, email, password: newPass }).save())
        .then(() =>
          res.json({
            isFailed: false,
            errors: {},
            data: { success: true },
          })
        );
    } else {
      res.json({
        isFailed: true,
        errors: { email: "This email is already in use" },
        data: {},
      });
    }
  });
};

export {
  addQuiz,
  getAddQuestion,
  getQuestionIndex,
  getQuizzes,
  postAddQuestion,
  addCircle,
  deleteQuiz,
  deleteQuestion,
  getStandings,
  downloadResponses,
  getQuiz
};
