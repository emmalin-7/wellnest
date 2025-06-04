import mongoose from 'mongoose';

// user info 
// password will be stored as encrypted 
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  starColor: { type: String, default: '' },
  hasChosenStar: { type: Boolean, default: false }
});

const UserModel = mongoose.model("users", UserSchema)

export default UserModel;