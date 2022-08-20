import { IComment } from 'types/CommentInterfaces';

// 帖子内容 Info
export interface IPost {
  _id: string ;
  text: string;
  username: string;
  avatar: string;
  visibility?: string;
  image?: string;     // 可不填
  likes?: Array<string>;
  createdAt?: Date;
  comments?: Array<IComment>;
  post?: any;
  user?: any;
}

// 喜爱该帖子
export interface LikeProps {
  message: string;
}
