import { IPost } from 'types/PostInterfaces';

export interface IUser {
  _id: string;
  username: string ;
  email: string;
  avatar: string ;
  password: string;
  accessToken: string;
  followers: Array<string>;   // 可 follow 多个用户 ;
  following: Array<string>;   // 可被多个用户 follow
  posts: Array<IPost>;        // 可发多个帖子
}

// 登录注册信息
export interface LoginProps   {
  email: string;
  password: string;
}

export interface AuthProps {
  username?: string;
  password: string;
  email: string;
}