import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  starColor: { type: String, default: '' },
  hasChosenStar: { type: Boolean, default: false }
});

const UserModel = mongoose.model("users", UserSchema)

export default UserModel;