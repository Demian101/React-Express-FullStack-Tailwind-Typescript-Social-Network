import jwt, { Secret } from 'jsonwebtoken';

export const generateAccessToken = (id: string) => {
  // 将用户的信息加密成 JWT 字符串，响应给客户端
  // secret 密钥 (ACCESS_TOKEN) 是一个自定义的字符串，用于加密
  return jwt.sign({ id }, process.env.ACCESS_TOKEN as Secret, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN as Secret, {
    expiresIn: '7d',
  });
};
