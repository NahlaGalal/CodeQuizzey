import { Schema, model, Document, Model } from "mongoose";

interface ICircleSchema {
  name: string;
}

interface ICirlceDoc extends ICircleSchema, Document {}

interface ICircleModel extends Model<ICirlceDoc> {}

const circleSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const Circle: ICircleModel = model<ICirlceDoc, ICircleModel>(
  "circle",
  circleSchema
);

export default Circle;
