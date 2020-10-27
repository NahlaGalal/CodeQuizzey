import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admins";

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
          return res.json({
            isFailed: false,
            errors: {},
            data: { token: data.token },
          });
        } else {
          return res.json({
            isFailed: true,
            errors: {password: "Wrong password"},
            data: {}
          })
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
        .then((newPass) => {
          const token = jwt.sign({ email }, process.env.TOKEN_SECRET, {
            expiresIn: `${60 * 60 * 24 * 30}s`,
          });
          return new Admin({ name, email, password: newPass, token }).save();
        })
        .then(() =>
          res.json({
            isFailed: false,
            error: {},
            data: { success: true },
          })
        );
    } else {
      res.json({
        isFailed: true,
        error: { email: "This email is already in use" },
        data: {},
      });
    }
  });
};
