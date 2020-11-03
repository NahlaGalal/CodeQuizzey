import { Schema, model, Document, Model } from "mongoose";

interface IQuizSchema {
    name: string;
    startDate: Date;
    endDate: Date;
    circles: string[];
    numResponses: number;
    topMember?: string;
    topCircle?: string;
}

export interface IQuizDoc extends IQuizSchema, Document {}

interface IQuizModel extends Model<IQuizDoc> {}

const quizSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    circles: {
        type: [Schema.Types.ObjectId],
        default: []
    },
    topMember: String,
    numCircles: Number,
    numResponses: {
        type: Number,
        default: 0
    }
});

const Quiz: IQuizModel = model<IQuizDoc, IQuizModel>("quiz", quizSchema);

export default Quiz;
