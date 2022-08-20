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


# Frontend

## 前端-项目结构:

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





# Backend

How to Start : 

```bash
# 开启 Mangodb 服务
$ 

$ cd ./server
$ yarn 
```





找机会整理到别的地方 : 







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

