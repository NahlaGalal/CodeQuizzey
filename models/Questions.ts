import { Schema, model, Document, Model } from "mongoose";

type answerType =
  | "Multiple choice"
  | "File"
  | "Short text"
  | "Long text"
  | "One choice";

interface IQuestionsSchema {
  question: string;
  answerType: answerType;
  answers: true;
  circleId: string;
}

interface IQuestionsDoc extends IQuestionsSchema, Document {}

interface IQuestionsModel extends Model<IQuestionsDoc> {}

const questionsSchema: Schema = new Schema({
  question: {
    type: String,
    required: true,
  },
  answerType: {
    type:
      "Multiple choice" ||
      "File" ||
      "Short text" ||
      "Long text" ||
      "One choice",
    required: true,
  },
  answers: {
    type: Object,
    required: true,
  },
  circleId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

const Question: IQuestionsModel = model<IQuestionsDoc, IQuestionsModel>(
  "question",
  questionsSchema
);

export default Question;
