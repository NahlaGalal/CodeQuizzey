import { Schema, model, Document, Model } from "mongoose";

type answerType =
  | "Multiple choice"
  | "File"
  | "Short text"
  | "Long text"
  | "One choice"
  | "Code";

interface IQuestionsSchema {
  question: string;
  answerType: answerType;
  answers?: string[];
  circleId: string;
  index: number;
  quizId: string;
}

export interface IQuestionsDoc extends IQuestionsSchema, Document {}

interface IQuestionsModel extends Model<IQuestionsDoc> {}

const questionsSchema: Schema = new Schema({
  question: {
    type: String,
    required: true,
  },
  answerType: {
    type: String,
    enum: [
      "Multiple choice",
      "File",
      "Short text",
      "Long text",
      "One choice",
      "Code",
    ],
    required: true,
  },
  answers: [String],
  circleId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  quizId: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

const Question: IQuestionsModel = model<IQuestionsDoc, IQuestionsModel>(
  "question",
  questionsSchema
);

export default Question;
