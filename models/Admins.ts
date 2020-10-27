import { Schema, model, Document, Model } from "mongoose";

interface IAdminSchema {
  name: string;
  password: string;
  email: string;
  token: string;
}

interface IAdminDoc extends IAdminSchema, Document {}

interface IAdminModel extends Model<IAdminDoc> {}

const adminSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
      type: String,
      required: true
  },
  token: String
});

const Admin: IAdminModel = model<IAdminDoc, IAdminModel>("admin", adminSchema);

export default Admin;
