import mongoose, { Schema, Document, model } from "mongoose";
import bcrypt from "bcryptjs";
import Post from './Post';
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  avatar?: string;
  matchPassword: any;
  posts?: Array<object>;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, },
    email: { type: String, required: true, unique: true, },
    password: { type: String, required: true, },
    avatar: { 
      type: String,
      default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdGr3fTJlsjdAEiSCDznslzUJXqeI22hIB20aDOvQsf9Hz93yoOiLaxnlPEA&s",
    },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }  ],
    following: [{ type: Schema.Types.ObjectId, ref: "User" } ],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { collection: "users", timestamps: true }
);

// 比较客户端传过来的密码，和数据库中是否一致
// this.password 即 UserSchema 的实例的 password 字段，即数据库中的 password 字段
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
}

// 加 salt 保存加密密码到数据库
UserSchema.pre("save", async function (next) {
  // console.log("Run UserSchema.pre(save.. this", this);
  // if (!this.isModified('password')) {
  //   next();
  // }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


const User = model<IUser>("User", UserSchema);
export default User;
