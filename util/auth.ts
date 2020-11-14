import { Request, Response, NextFunction } from "express";
import Admin from "../models/Admins";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.json({
      isFailed: "true",
      errors: {},
      data: { admin: "Unautherized" },
    });

  Admin.findOne({ token }).then((doc) => {
    if (doc && token === doc.token) next();
    else return res.status(401).end()
  });
};
