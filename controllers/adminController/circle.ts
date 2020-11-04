import { Request, Response } from "express";
import Circle from "../../models/Circles";

export const addCircle = (req: Request, res: Response) => {
  new Circle({ name: req.body.name }).save().then(() =>
    res.json({
      isFailed: false,
      errors: {},
      data: { success: "Circle added successfully" },
    })
  );
};
