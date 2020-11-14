import { Request, Response } from "express";
import Circle from "../../models/Circles";

export const addCircle = (req: Request, res: Response) => {
  Circle.findOne({ name: req.body.name })
    .then((doc) => {
      if (!doc)
        return new Circle({ name: req.body.name })
          .save()
          .then(() =>
            res.json({
              isFailed: false,
              errors: {},
              data: { success: "Circle added successfully" },
            })
          )
          .catch(() => res.status(500).end());
      return res.json({
        isFailed: true,
        errors: { circle: "This circle is already exists" },
        data: {},
      });
    })
    .catch(() => res.status(500).end());
};
