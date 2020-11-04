import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare var process: {
  env: {
    TOKEN_SECRET: string;
  };
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(
    token,
    process.env.TOKEN_SECRET,
    (err: any, user: any) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      next(); // pass the execution off to whatever request the client intended
    }
  );
};
