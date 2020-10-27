import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: any, user: any) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      next(); // pass the execution off to whatever request the client intended
    }
  );
};
