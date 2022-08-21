项目源码参考 URL : https://github.com/albeniskerqeli10/react-social-network-v1

- [Frontend](#frontend)
  - [前端-项目结构:](#前端-项目结构)
  - [Datatype :](#datatype-)
  - [登录注册 module](#登录注册-module)
    - [login / SignUp API](#login--signup-api)
    - [调用 API :](#调用-api-)
  - [Redux](#redux)
  - [React-Query](#react-query)
  - [React.memo 与 useMemo](#reactmemo-与-usememo)
- [Backend](#backend)
- [四种常见的 POST 提交数据方式](#四种常见的-post-提交数据方式)
    - [1. application/x-www-form-urlencoded](#1-applicationx-www-form-urlencoded)
    - [2. multipart/form-data](#2-multipartform-data)
    - [3. application/json](#3-applicationjson)
    - [4. text/xml](#4-textxml)
- [HTTP 状态码](#http-状态码)
  - [成功响应 (`200`–`299`)](#成功响应-200299)
    - [204 No Content](#204-no-content)
  - [](#)
  - [重定向消息 (`300`–`399`)](#重定向消息-300399)
    - [304 Not Modified](#304-not-modified)
  - [客户端错误响应 (`400`–`499`)](#客户端错误响应-400499)
    - [401 Unauthorized](#401-unauthorized)


# 前段 Frontend

## Frontend - 目录结构:

```bash
$ mddir  ( 用来创建目录树)
|-- App.tsx
|-- index.tsx
|-- api  # 向后端请求的 API 接口 
|   |-- PostApi.ts    # 发布推文/评论 
|   |-- UserApi.tsx   # 登录注册
|   |-- base.tsx      # 对 Axios 的拦截器封装
|-- components
|   |-- Feed.tsx      # 首页 Feed 信息流 { AddPost + PostsList  }
|   |-- Form
|   |   |-- AddPost.tsx     # 表单 - 发布推文
|   |   |-- EditProfile.tsx # 表单 - 修改个人信息
|   |-- Navbar
|   |   |-- Navbar.tsx      # 顶部导航栏
|   |-- Popup
|   |   |-- DeleteBox.tsx   # 推文删除 & 删除确认
|   |-- Post
|   |   |-- AddComment.tsx  # 添加评论(这部分代码有 bug
|   |   |-- Comment.tsx    
|   |   |-- CustomPost.tsx  # 所有推文的时间线信息流 
|   |   |-- Post.tsx
|   |   |-- PostIcons.tsx
|   |   |-- PostsList.tsx
|   |-- Search              # 搜索功能不起作用
|   |   |-- Search.tsx
|   |   |-- SearchField.tsx
|   |-- Sidebar            
|   |   |-- LeftSidebar.tsx # 左边栏 {Home/Profile/Message}
|   |   |-- RightSidebar.tsx# 右边栏: Followers 即粉丝信息
|   |   |-- UserList.tsx    # 给 RightSidebar 用的 ;
|-- hooks
|   |-- useAuth.tsx         # return 一个 Redux 对象 ;
|   |-- useSingleUser.tsx
|-- redux
|   |-- store.ts
|   |-- slices
|       |-- userSlice.ts    # currentUser: IUser;
|-- pages   # 页面
|   |-- ChatScreen.tsx      # /messages 页面
|   |-- HomeScreen.tsx      # <LeftSidebar /> <Feed /> <RightSidebar />
|   |-- LoginScreen.tsx
|   |-- ProfileScreen.tsx
|   |-- ProtectedRoute.tsx
|   |-- RegisterScreen.tsx
|   |-- SearchScreen.tsx
|   |-- UserScreen.tsx
|-- shared
|   |-- Avatar.tsx
|   |-- Button.tsx
|   |-- Image.tsx
|   |-- Loader.tsx
|   |-- Modal.tsx
|   |-- SaveIcon.tsx
|   |-- SmallSpinner.tsx
|   |-- SuspenseWrapper.tsx
|-- styles
|   |-- base.css
|   |-- tailwind.css
|-- types
|-- CommentInterfaces.ts
|-- PostInterfaces.ts
|-- UserInterfaces.ts
```







## Datatype : 

- 帖子信息(Post info.)  :  `{ IPost }` 

  - ```js
    export interface IPost {
      _id: string ;
      text: string;
      username: string;
      image?: string;   // 可不填
    ```

- 用户信息 (User info.)  :  `{ IUser }`

  - ```js
    export interface IUser {
      _id: string;
      username: string ;
      ... 
      following: Array<string>;   // 可 follow 多个用户 ; 可被多个用户 follow
      posts: Array<IPost>;        // 可发多个帖子
    }
    ```

- 登录注册信息 : 

  - ```js
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
    ```



## 登录注册 module

```bash
|-- api
|   |-- base.tsx      #  Axios 的 Base API , 里面放一些请求的拦截器 和 对响应的处理 :  
|   |-- UserApi.tsx   # 登录注册
```



`api/Base.tsx : `

```React
export const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL,  // REACT_APP_API_URL=http://localhost:8080
})

export const AxiosAPI = axios.create({})

/* 请求拦截器 - 在发送请求之前做些什么 (这里是对每个请求都加上 Authorization 身份认证)  */
AxiosAPI.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = store.getState().user.currentUser.accessToken;
    config.headers =  {
      Authorization: `Bearer ${token}`,
    }
    return config
  },
  error => {
  });

/* 响应拦截器 - 对响应数据做一些事情
 *  logoutUser() : localStorage.removeItem('userDetails');
 *   - 401 说明身份认证失败, 清除 localStorage 中的 userDetails
 */
AxiosAPI.interceptors.response.use(
  response => response,
  async(error) => {
    if (error?.response?.status === 401) {  // 401 Unauthorized - 身份认证失败
      store.dispatch(logoutUser());
    }
  }
);
```



### login / SignUp API 

` UserApi.tsx : ` 

```React
import { store } from "@redux/store";
import { AxiosResponse } from "axios";
import { AuthProps, IUser } from "../types/UserInterfaces";
import { AxiosAPI, client } from "./base";

/* 注册 & 登录
 * FormData 是一个 JS 内置的表单对象
 * registerUser： 发送用户填写的 data 给服务器进行注册；
 * loginUser： 发送用户填写的 data 给服务器进行登录；
 */
export const registerUser = async (data: IUser | FormData) => {
  return await client.post("/auth", data, {
    headers: {
      "Content-Type": "application/form-data",
    },
  });
};

export const loginUser = async (data: AuthProps) => {
  try {
    const res: AxiosResponse = await client.post("/auth/login", data, {});
    return res.data;  
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(err);
    });
  }
};
```

> 后端详解  ( 见后端详解 )



### 调用 API : 

```bash
|-- pages   # 页面
|   |-- LoginScreen.tsx
|   |-- RegisterScreen.tsx
```



`RegisterScreen.tsx :`

- `FormData` 是 JS 内置的表单数据属性

```tsx
import useAuth from "@hooks/useAuth";
import { registerUser } from "@api/UserApi";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const RegisterScreen: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const currentUser = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string | Blob>("");
  const dispatch = useDispatch();

  const userMutation = useMutation(registerUser, {
    'onSuccess': ({ data }) => {    // 对象参数
      localStorage.setItem("userDetails", JSON.stringify(data));
      dispatch(addNewUser(data as IUser));
    },
  });

  const handleRegister = (data: AuthProps) => {
    if (data.username === "" || data.email === "" || data.password === "") {
      alert("Please fill in required fields");
    } else {
      const formUser: FormData = new FormData();
      formUser.append("username", data.username as string);
      formUser.append("email", data.email);
      if (avatar) {
        formUser.append("avatar", avatar);
      }
      formUser.append("password", data.password);
      userMutation.mutate(formUser);  // 提交注册
    }
  };
  
  // 处理头像图片文件
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      e.preventDefault();
      new Compressor(file, {
        quality: 0.6,   // 0.6 can also be used, but its not recommended to go below.
        // convertTypes:['image/png', 'image/webp', 'images/jpg'],
        success: (compressedResult) => {
          setAvatar(compressedResult);
        },
      });
    }
  };
  
  return (
    <div className="w-full lg:mt-20 flex flex-col items-center justify-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit(handleRegister)}
        encType="multipart/form-data"
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <input
            {...register("username", { required: true })}
            className="shadow appearance-none border border-red rounded text-grey-darker mb-3"
            id="username"
            type="text"
            placeholder="Enter Your Username"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Avatar (optional)
          </label>
          <input
            onChange={handleAvatar}
            className="shadow appearance-none border border-red rounded w-full text-grey-darker mb-3"
            id="file"
            type="file"
            placeholder="Your Avatar "
          />
        </div>

```

<img src="http://imagesoda.oss-cn-beijing.aliyuncs.com/Sodaoo/2022-08-19-133033.png" style="zoom:33%;" />





`LoginScreen.tsx : `

- `react-hook-form` 的使用 ; 

```js
import { useForm } from "react-hook-form";

const LoginScreen: React.FC = () => {
  const currentUser = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const location = useLocation();
  const [customErr, setCustomErr] = useState<string>("");

  const { mutate } = useMutation(loginUser);

  const handleLogin = (data: AuthProps) => {
    if (data.email !== "" || data.password !== "") {
      mutate(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: (data) => {
            dispatch(addNewUser(data as IUser));
            localStorage.setItem("userDetails", JSON.stringify(data));
            setCustomErr("");
          },

          onError: (error) => {},
        }
      );
    }
  };

  // 看看登录没有：没登录的话，就 Navigate 去登录
  return currentUser === null ? (
    <div className="w-full flex flex-col flex-wrap items-center justify-center min-h-[80vh] lg:mt-20">
      <form onSubmit={handleSubmit(handleLogin)}
        <label className="block text-gray-700 text-sm font-bold mb-2"> Email  </label>
        <input
          {...register("email")}     // 丝滑嵌入 <input> 标签中，为啥用 ... ? 需要问问大神。
          className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
          id="username"
          type="email"  // 可能 input 的 type 覆盖了 register 的属性.. 
          placeholder="Your Email"
          required
        />
        {errors.email && (
          <div role="alert">
            <p>Please write a valid email</p>
          </div>
        )}
      </div>

    // 后面 password 同理
```

<img src="http://imagesoda.oss-cn-beijing.aliyuncs.com/Sodaoo/2022-08-19-025731.png" style="zoom:40%;" />





## Redux

```js
|-- redux
|   |-- store.ts
|   |-- slices
|       |-- userSlice.ts    # currentUser: IUser;
```

`userSlice.ts : ` 

```js
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from '../../types/UserInterfaces';

interface SliceState {
  definedUser?: object;
  currentUser: IUser;
  usersList?: Array<IUser>;
}

type ResetState = {
  currentUser: any ;
}

/* userDetails 中存储的内容 ： 
  {_id: "62f864b39a2cd5f0e51bd6e6", 
    username: "so@so.com1", 
    email: "so@so.com1",…}
    accessToken: "...."
    avatar: "https://eA&s"
    email: "so@so.com1"
    username: "so@so.com1"
    _id: "62f864b39a2cd5f0e51bd6e6"
  }*/
const userInfoFromStorage = localStorage.getItem('userDetails')
  ? JSON.parse(localStorage.getItem('userDetails')!)
  : null;

// 初始化为从 localStorage 中获取的 user info. 
const initialState: SliceState = {
  currentUser: userInfoFromStorage,
};

const resetState:ResetState = {  // 重置用户信息
  currentUser: null
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addNewUser: (state, { payload }: PayloadAction<IUser>) => {
      console.log('payload: ',payload)
      state.currentUser = payload;
    },
    logoutUser: (state) => {    // 登出
      localStorage.removeItem('userDetails');
      return {...resetState}
    },
    updateUsersList: (state, {payload}: PayloadAction<IUser[]>) => {
      /* payload 内容： 
      accessToken: "eyJ...R_zDY"
      avatar: "https://encrypt...PEA&s"
      email: "cc@cc.com"
      username: "cc@cc.com"
      _id: "63001cb936e6fe1f5552df72"
      */
      console.log('updateUsersList payload: ',payload)
      state.usersList = payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const { addNewUser, logoutUser, updateUsersList, } = userSlice.actions;
// export const userSelector = (state: { state: SliceState }) => state;
export default userSlice.reducer;
```



`store.ts`

```React
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
```





`LoginScreen.tsx 调用 Redux :`

- `dispatch(addNewUser(data as IUser))` 

```react
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";

const LoginScreen: React.FC  = () => {
  const { mutate } = useMutation(loginUser);
  const handleLogin = (data: AuthProps) => {
    if (data.email !== "" || data.password !== "") {
      mutate(
        {
          email: data.email,
          password: data.password,
        },
        {
          'onSuccess': (data) => {
            dispatch(addNewUser(data as IUser));  // state.currentUser = payload;
            localStorage.setItem("userDetails", JSON.stringify(data));
            setCustomErr("");
          },

          'onError': (error) => {},
        }
      );
    }
  };
```



`RegisterScreen.tsx 调用 Redux :`

- `dispatch(addNewUser(data as IUser)); `   : 在本地设置 localStorage
- `userMutation.mutate(formUser);`  向服务器提交注册

```react
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";

const RegisterScreen: React.FC = () => {
  const dispatch = useDispatch();

  //registerUser 是定义的 '/auth' API, 后续使用 userMutation 提交到服务器 ;
  const userMutation = useMutation(registerUser, {
    'onSuccess': ({ data }) => {
      localStorage.setItem("userDetails", JSON.stringify(data));
      dispatch(addNewUser(data as IUser));  // 在本地设置 localStorage
    },
  });

  useEffect(() => {
    currentUser !== null && navigate("/");
  }, [currentUser, navigate]);

  const handleRegister = (data: AuthProps) => {
    if (data.username === "" || data.email === "" || data.password === "") {
      alert("Please fill in required fields");
    } else {
      const formUser: FormData = new FormData();    // `FormData` 是 JS 内置的表单数据属性
      formUser.append("username", data.username as string);
      formUser.append("email", data.email);
      if (avatar) {
        formUser.append("avatar", avatar);
      }
      formUser.append("password", data.password);
      userMutation.mutate(formUser);  // 向服务器提交注册
    }
  };
```







## React-Query

> React-query 细节内容可参考笔记📒 





## React.memo 与 useMemo

没用到的父级结构参数的变化不要 re-render 子组件, 保证性能优化 ; 





# 后端 Backend

How to Start : 

```bash
# 开启 Mangodb 服务 : MongoDb 启动需要一个目录存放 Database :
$ sudo mongod --dbpath  /usr/local/mongodb/data/db

# 项目启动 :
$ cd ./server
$ yarn 
$ yarn start

# 修改完 tsx 文件后, 需要编译一次生成对应执行的 js 文件: 
$ npm run build
$ yarn start
```



## Backend - 目录结构:

```bash
$ mddir ./
|-- config
|   |-- db.ts      # connect to mongodb
|-- controllers    # 处理数据库 / 对前端返回内容
|   |-- commentController.ts  # 评论
|   |-- postController.ts     # 推文
|   |-- userController.ts     # 用户
|-- middlewares
|   |-- authenticate.ts       # 身份认证
|   |-- cloudinaryConfig.ts   # cloudinary 云存储 config 配置文件
|   |-- upload.ts             # Multer 中间件, 用于上传文件 ; 
|-- models
|   |-- Comment.ts
|   |-- Post.ts
|   |-- User.ts
|-- routes
|   |-- commentRoutes.ts
|   |-- postRoutes.ts
|   |-- userRoutes.ts
|-- utils
|   |-- generateToken.ts     # 生成 AccessToke & RefreshToken
|-- index.ts
```





## 第三方 Middlewares 

### 1. Multer

图片上传我们可以使用 express 官方开发的第三方库：multer

- `destination`   定义文件的存储位置 ; 
- `filename` : 文件上传后的文件名 ; 

```js
import { Request } from 'express';
import multer from 'multer';
import path from 'path';

const storage: multer.StorageEngine = multer.diskStorage({
    destination: (req: Request, file: any, cb: any) => {
        cb(null, 'public/')    // callback
    },
    filename: (req:Request, file:any, cb:any) => {
        let ext = path.extname(file.originalname)  // 文件拓展名 ext
        cb(null, Date.now() + ext);   // 将 ext 再次添加到末尾
    }
})
```



### 2. bcryptjs

用户注册时，如果不对密码做一些加密处理直接明文存储到数据库中，一旦数据库泄露，对用户和公司来说，都是非常严重的问题。



**MD5 :** 

> MD5信息摘要算法可以产生出一个128位（16字节）的散列值（hash value），用于确保信息传输完整一致。
>
> 但是 , 有的网站上提供MD5解密,是因为有大量的存储空间来保存源码和加密后的密码,  解密时就是一个查询的过程 , 这种解密方式，叫做 **字典攻击**



 **加盐 salt : **

> 解决 **字典攻击** 的方式是 **加盐 salt。**
>
> 所谓**加盐**，就是在加密的基础上再加点“佐料”。这个“佐料”是系统随机生成的一个随机值，并且以随机的方式混在加密之后的密码中。
>
> 由于“佐料”是系统随机生成的，相同的原始密码在加入“佐料”之后，都会生成不同的字符串。
>
> 这样就大大的增加了破解的难度。



**bcryptjs** 是 nodejs 中比较出色的一款处理加盐加密的包。

```js
// 引入 bcryptjs
const bcryptjs = require('bcryptjs')
// 原始密码
const password = '123456'
/**
 * 加密处理 - 同步方法
 * bcryptjs.hashSync(data, salt)
 *    - data  要加密的数据
 *    - slat  用于哈希密码的盐。如果指定为数字，则将使用指定的轮数生成盐并将其使用。推荐 10
 */
const hashPassword = bcryptjs.hashSync(password, 10)
/**
 * 输出
 * 注意：每次调用输出都会不一样
 */
console.log(hashPassword) // $2a$10$P8x85FYSpm8xYTLKL/52R.6MhKtCwmiICN2A7tqLDh6rDEsrHtV1W
/**
 * 校验 - 使用同步方法
 * bcryptjs.compareSync(data, encrypted)
 *    - data        要比较的数据, 使用登录时传递过来的密码
 *    - encrypted   要比较的数据, 使用从数据库中查询出来的加密过的密码
 */
const isOk = bcryptjs.compareSync(password, '$2a$10$P8x85FYSpm8xYTLKL/52R.6MhKtCwmiICN2A7tqLDh6rDEsrHtV1W')
console.log(isOk)
```



在本项目中 : 

`models/User.ts : `

```js
import bcrypt from "bcryptjs";

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
}

// 加 salt 保存加密密码到数据库
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model<IUser>("User", UserSchema);
export default User;
```



调用  `user.save()`  即 `UserSchema.pre("save"` : 

```tsx
// Register Route
const registerUser = async ( req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, avatar, password, posts } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) { // if user exists
      res.status(404).json({ message: "User already exists" });
    } else {
      const user = new User({ username, email, password, });
      if(req?.file) {
        const result: any = await streamUpload(req);
        user.avatar = result.secure_url;
      }

      const savedUser = await user.save();

      res.json({
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        avatar: savedUser.avatar,
      });
    }
  }
  catch(err){
    res.status(500).json({message: "Something went wrong"})
  }
};
```



### 3. jsonwebtoken ( jwt )

注意 : 

- `req.user` 是在下面的 next() 里传递给下一个中间件的。
- 也就是说，下一个中间件可以直接使用 `req.user` 来获取用户信息。 

```tsx
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

      // clg(decoded) : { id: '62fd9f3036e6fe1f5552de47', iat: 1660980303, exp: 1660981203 }
      const decoded: any = jwt.verify( token, process.env.ACCESS_TOKEN as Secret );

      /* clg(req.user) : {
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
```



### compression

Gzip 压缩可以大大减小响应主体的大小，从而提高 Web 应用程序的速度。 在您的 Express 应用程序中使用 compression 进行 gzip 压缩。 

```js
import compression from 'compression';

// Other Middlewares
app.use(compression());
```

> 对于生产中的高流量网站，实施压缩的最佳方法是在反向代理级别实施它。 在这种情况下，您不需要使用 compression 中间件。 有关在 Nginx 中启用 [gzip](https://www.zhihu.com/search?q=gzip&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"article"%2C"sourceId"%3A"417443306"}) 压缩的详细信息，请参阅 Nginx 文档中的模块 ngx_http_gzip_module。





-----



> jwt 不懂的话 , 详见 `鉴权.md`  笔记 , 或者直接看下面 : 

用户的信息通过 Token 字符串的形式，保存在客户端浏览器中。服务器通过还原 Token 字符串的形式来认证用户的身份。

![](http://imagesoda.oss-cn-beijing.aliyuncs.com/Sodaoo/2022-07-17-021906.png)

JWT 通常由三部分组成，分别是 Header(头部)、Payload(有效荷载)、Signature(签名)。

三者之间使用点号 .  分隔，格式如下:

```
Header.Payload.Signature
```

- Payload 部分才是真正的用户信息，它是用户信息经过加密之后生成的字符串。 
- Header 和 Signature 是安全性相关的部分，只是为了保证 Token 的安全性。



客户端收到服务器返回的 JWT 之后，通常会将它储存在 **localStorage** 或 sessionStorage 中。

此后，客户端每次与服务器通信，都要带上这个 JWT 的字符串，从而进行身份认证。

推荐的做法是**把** **JWT** **放在** **HTTP** **请求头的** **Authorization** **字段中**，格式如下:

```
Authorization: `Bear ${Token}`
```



## Models

### 1. Post 推文 : 

```tsx
import mongoose, { Schema, Document ,model} from 'mongoose';

export interface IPost extends Document {
  text: string;
  username: string;
  createdAt: Date;
  image:string,
  visibility: string,
  user: string;
  likes?:Array<object>;
}

/*  对于一则推文 :
  1. text 内容必填;
  2. 可以设置可见性;
  3. user ref (外键) 为 user , 标识了发布这个推文的用户;
  4. comments ref, 标识了这个推文对应的评论;
*/
const PostSchema: Schema  = new Schema({
    text: { type: String, required: true },
    username: { type: String, required: true },
    avatar: {type:String ,  required: true},
    createdAt: { type: Date, default: Date.now },
    visibility: {
      type: String,
      enum : ["public", "private"],
      default: "public"
  },
    image: { type: String,  },
    user: { type: Schema.Types.ObjectId, ref: "User", },
    likes:[ { type: Schema.Types.ObjectId, ref: "User", default: 0 } ],
    comments:[ { type: Schema.Types.ObjectId, ref: "Comment" } ],
  },
  { collection: "posts" }
);

const Post = model<IPost>("Post", PostSchema);
export default Post;
```



### 2. User 

```tsx
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
```



## Controllers

`userController.tsx`

```js
import cloudinary from "cloudinary";
import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import streamifier from "streamifier";
import Comment from "../models/Comment";
import Post from "../models/Post";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";

let refreshTokens: Array<object | string> = [];

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    /*
      使用 matchPassword 对比 [前端] 传的 password 和 [数据库] 里的 password
      matchPassword: bcrypt.compare(enteredPassword, this.password);
       - `this.password` is the hashed password in the database, 是 UserSchema 实例的 password。      
     */
    if (user && (await user.matchPassword(password))) { 

      /* generateAccessToken :
          - 将用户的信息加密成 JWT 字符串，响应给客户端
          - secret 密钥 (ACCESS_TOKEN) 是一个自定义的字符串，用于加密  */
      const accessToken = generateAccessToken(user._id);
      // 响应给客户端 /login 的 response ：
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        accessToken,
      });
    }
  }
  catch(err){
    res.status(500).json({message: "Something went wrong"})
  }
};


const registerUser = async ( req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, avatar, password, posts } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {    // if user exists
      res.status(409).json({ message: "User already exists" });
    } else {
      const user = new User({ username, email, password, });
      if(req?.file) {  // req 不一定有 .file 属性， 所以用 ? 防止报错；
        const result: any = await streamUpload(req);   // streamUpload 是 Promise, 上面定义了
        user.avatar = result.secure_url;
      }

      const savedUser = await user.save();
      // console.log("Run user.save()", savedUser);
      const accessToken = generateAccessToken(savedUser._id);
      const refreshToken = generateRefreshToken(savedUser._id);

      /* 将 accessToken 响应给客户端，客户端将 accessToken 存储在 localStorage 中
         之后客户端每次请求都会带上 accessToken, 服务端会验证 accessToken, 确认用户身份, 
         然后响应数据, 或者拒绝请求, 返回 401, 403 等错误码, 以及错误信息 */
      res.json({
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        avatar: savedUser.avatar,
        accessToken,
      });
    }
  }
  catch(err){
    res.status(500).json({message: "Something went wrong"})
  }
};
```



## Routes

`userRoutes.tsx`

```tsx
import { Router } from "express";
import { editUser, followUser, getAllUsers, getUserById, getUserFollowers, loginUser, registerUser, searchUsers, unfollowUser } from "../controllers/userController";
import { authGuard } from "../middlewares/authenticate";
// User Routes
import { upload } from "../middlewares/upload";
const router = Router();

router.post("/login", loginUser);

// 同一个路由 url，请求方法不同 , 对应的处理函数也不同 ;
router
  .route("/")
  //.post(upload.single("avatar"), registerUser)
  .get(authGuard, getAllUsers);

/* router.route("/refresh").post(refreshAuth); */
router.route("/:id").get(getUserById);
router.route("/:id/follow").get(authGuard, followUser);
router.route("/:id/unfollow").get(authGuard, unfollowUser);
router.route("/:id/edit").put(authGuard, upload.single("avatar"), editUser);
router.route("/:id/followers").get(authGuard, getUserFollowers);
router.route('/search/:query').get(searchUsers);

export default router;
```



`postRoutes.tsx`

```tsx
import express from 'express';
import { addPost, deletePost, getPrivatePosts, getPublicPosts, likePost, unlikePost } from '../controllers/postController';
import { authGuard } from "../middlewares/authenticate";
import { upload } from '../middlewares/upload';
const router = express.Router();

// 同一个路由 url，请求方法不同 , 对应的处理函数也不同 ;
router.route('/').get(authGuard,getPublicPosts).post(authGuard, upload.single('image'), addPost)
router.get('/myposts', authGuard, getPrivatePosts);
router.route('/like').post(authGuard, likePost);
router.route('/unlike').post(authGuard, unlikePost);
router.route('/:id').delete(authGuard, deletePost);
export default router;
```



## `index.tsx` 



```js
import cloudinary from "cloudinary";
import compression from 'compression';
import cors from "cors";
import dotenv from 'dotenv';
import express, { Express, Request, Response } from "express";
import helmet from 'helmet';
import morgan from 'morgan';
import connectDb from "./config/db";
import commentRoutes from "./routes/commentRoutes";
import postRoutes from "./routes/postRoutes";
import userRoutes from "./routes/userRoutes";


dotenv.config({
  path:"./.env"
});

// define port
const PORT =  process.env.PORT || 8090;
console.log("Port is : ", process.env.PORT)
console.log("CLOUDINARY_API_SECRET is : ", process.env.CLOUDINARY_API_SECRET)

// initialize express
const app: Express = express();

// initialize helmet to secure express app
app.use(helmet());

//connect to db
connectDb();

// configure cloudinary 

// cloudinary.v2.config({
//   cloud_name: "social-network-101",
//   api_key: "397828424674875",
//   api_secret: "ZRMnO8CC7-SY-kUOXU9sjGRRNNc",
// });

cloudinary.v2.config({
  cloud_name: "dk8z3ef82",
  api_key: "711728519188514",
  api_secret: "KBhbiW3Jak0Bn3gbfy_cfPT2_HE",
});


// initialize cors 处理跨域问题
app.use(cors({ origin: "*", credentials:true, }));


// Other Middlewares
app.use(compression());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send('<h1>Social Network API</h1>');
});
app.use("/posts", postRoutes);
app.use("/auth", userRoutes);
app.use("/comment"  ,commentRoutes);

// initialize server
app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});
```







# 四种常见的 POST 提交数据方式

HTTP 协议是以 ASCII 码传输，建立在 TCP/IP 协议之上的应用层规范。规范把 HTTP 请求分为三个部分：~~状态行~~请求行、请求头、消息主体。类似于下面这样：

```html
<method> <request-URL> <version>
<headers>
<entity-body>
```

协议规定 POST 提交的数据必须放在消息主体（`entity-body`）中，但协议并没有规定数据必须使用什么编码方式。实际上，开发者完全可以自己决定消息主体的格式，只要最后发送的 HTTP 请求满足上面的格式就可以。

但是，数据发送出去，还要服务端解析成功才有意义。一般服务端语言如 php、python 等，以及它们的 framework，都内置了自动解析常见数据格式的功能。

服务端通常是根据`请求头（headers）`中的 `Content-Type` 字段来获知请求中的消息主体是用何种方式编码，再对主体进行解析。

所以 POST 包含了 Content-Type 和消息主体编码方式两部分。



### 1. application/x-www-form-urlencoded

这应该是最常见的 POST 提交数据的方式了。浏览器的原生 `<form>`  表单，如果不设置 `enctype` 属性，那么最终就会以 `application/x-www-form-urlencoded`  方式提交数据 , 类似：

```html
POST /test HTTP/1.1
Host: foo.example
Content-Type: application/x-www-form-urlencoded
Content-Length: 27

field1=value1&field2=value2
```



### 2. multipart/form-data

```html
POST http://www.example.com HTTP/1.1
Content-Type: multipart/form-data; 
boundary=----WebKitFormBoundaryrGKCBY7qhFd3TrwA

------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="text"

title
------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="file"; filename="chrome.png"
Content-Type: image/png

PNG ... content of chrome.png ...
------WebKitFormBoundaryrGKCBY7qhFd3TrwA--
```

这个例子稍微复杂点。首先生成了一个 `boundary(边界)`  用于分割不同的字段，为了避免与正文内容重复，boundary 很长很复杂。

然后 Content-Type 里指明了数据是以 multipart/form-data 来编码，本次请求的 boundary 是什么内容。消息主体里按照字段个数又分为多个结构类似的部分，每部分都是以 `--boundary` 开始，紧接着是内容描述信息，然后是回车，最后是字段具体内容（文本或二进制）。如果传输的是文件，还要包含文件名和文件类型信息。消息主体最后以 `--boundary--` 标示结束。

关于 multipart/form-data 的详细定义，请前往 [rfc1867](http://www.ietf.org/rfc/rfc1867.txt) 查看。

这种方式一般用来上传文件，各大服务端语言对它也有着良好的支持。



### 3. application/json

`application/json`  这个 Content-Type 作为 Header 大家肯定不陌生。实际上，现在越来越多的人把它作为请求头，用来告诉服务端消息主体是序列化后的 JSON 字符串。

由于 JSON 规范的流行，除了低版本 IE 之外的各大浏览器都原生支持 JSON.stringify，服务端语言也都有处理 JSON 的函数，使用 JSON 不会遇上什么麻烦。

JSON 格式支持比键值对复杂得多的结构化数据，这一点也很有用。

```js
POST http://www.example.com HTTP/1.1 
Content-Type: application/json;charset=utf-8

{
  "title":"test",
  "sub":[1,2,3]
}
```



### 4. text/xml

XML-RPC (XML Remote Procedure Call) 是一种使用 HTTP 作为传输协议，XML 作为编码方式的远程调用规范。典型的 XML-RPC 请求是这样的：

```html
POST http://www.example.com HTTP/1.1 
Content-Type: text/xml

<?xml version="1.0"?>
<methodCall>
    <methodName>examples.getStateName</methodName>
    <params>
        <param>
            <value><i4>41</i4></value>
        </param>
    </params>
</methodCall>
```

XML-RPC 协议简单、功能够用，各种语言的实现都有。它的使用也很广泛，如 WordPress 的 [XML-RPC Api](http://codex.wordpress.org/XML-RPC_WordPress_API)，搜索引擎的 [ping 服务](http://help.baidu.com/question?prod_en=master&class=476&id=1000423)等等。JavaScript 中，也有[现成的库](http://plugins.jquery.com/xmlrpc/)支持以这种方式进行数据交互，能很好的支持已有的 XML-RPC 服务。不过，我个人觉得 XML 结构还是过于臃肿，一般场景用 `JSON` 会更灵活方便。



# HTTP 状态码

1. [信息响应](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status#信息响应) (`100`–`199`)
2. [成功响应](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status#成功响应) (`200`–`299`)
3. [重定向消息](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status#重定向消息) (`300`–`399`)
4. [客户端错误响应](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status#客户端错误响应) (`400`–`499`)
5. [服务端错误响应](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status#服务端错误响应) (`500`–`599`)



## [成功响应](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status#成功响应) (`200`–`299`)

### 204 No Content

该请求已经成功了，但是客户端客户不需要离开当前页面。

使用惯例是，在 [`PUT`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/PUT) 请求中进行资源更新，

1. 不需要改变当前展示给用户的页面，那么返回 204 No Content。
2. 如果创建了资源，则返回 [`201`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/201) `Created` 。
3. 如果应将页面更改为新更新的页面，则应改用 [`200`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/200) 。



## 

## [重定向消息](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status#重定向消息) (`300`–`399`)

### 304 Not Modified

**`Not Modified`**  说明无需再次传输请求的内容，也就是说可以使用缓存的内容。

这是用于缓存的目的。它告诉客户端: 响应 Response 还没有被修改，因此客户端可以继续使用相同的缓存版本的响应。



## [客户端错误响应](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status#客户端错误响应) (`400`–`499`)

### 401 Unauthorized

**`401 Unauthorized`**  客户端错误，指的是由于缺乏目标资源要求的身份验证凭证，发送的请求未得到满足。

虽然 HTTP 标准指定了"unauthorized"，但从语义上来说，这个响应意味着"unauthenticated"。也就是说，客户端必须对自身进行身份验证才能获得请求的响应。





# Todo

1. 用户已存在的状态码, 不应该是 404 吧 ..前端也没做适配提示 ; 

