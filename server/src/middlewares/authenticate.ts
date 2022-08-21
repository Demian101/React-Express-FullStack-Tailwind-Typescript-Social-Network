import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import User from "../models/User";

const authGuard = async ( req: Request, res: Response, next: NextFunction ) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token: string = req.headers.authorization.split(" ")[1];   // 'Bearer xxxxxxxx'

      // decoded: { id: '62fd9f3036e6fe1f5552de47', iat: 1660980303, exp: 1660981203 }
      const decoded: any = jwt.verify( token, process.env.ACCESS_TOKEN as Secret );

      /* req.user: {
          _id: new ObjectId("62fd9f3036e6fe1f5552de47"),
          username: 'aa@aa.com',
          email: 'aa@aa.com',
          ...
          __v: 1  } 
       */

      // select("-password"): 表示排除掉 password 字段，不放到 req.user 里。
      // req.user 是在下面的 next() 里传递给下一个中间件的。
      // 也就是说，下一个中间件可以直接使用 req.user 来获取用户信息。
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) { 
      (error); // 401 Unauthorized Error
      res.status(401).json({message: "Token failed ,you are not authorized"});
    }
  }
  else{
    res.status(401).json({message: "Token failed, no token provided"})
  }
};

export { authGuard };