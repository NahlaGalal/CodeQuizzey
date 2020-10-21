import { Schema, model, Document, Model } from "mongoose";

interface IUserSchema {
  name: string;
  email: string;
  technicalCircles: string[];
}

interface IUserDoc extends IUserSchema, Document {}

interface IUserModel extends Model<IUserDoc> {}

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  technicalCircles: {
    type: [Schema.Types.ObjectId] || [
      Schema.Types.ObjectId,
      Schema.Types.ObjectId,
    ],
    required: true,
  },
});

const User: IUserModel = model<IUserDoc, IUserModel>("user", userSchema);

export default User;
