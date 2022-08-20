import { store } from "@redux/store";
import { AxiosResponse } from "axios";
import { AuthProps, IUser } from "../types/UserInterfaces";
import { AxiosAPI, client } from "./base";

export const fetchUsers = async () => {
  try {
    console.log("fetchUsers process.env.REACT_APP_API_URL", process.env.REACT_APP_API_URL);
    const res: AxiosResponse = await AxiosAPI.get(
      `${process.env.REACT_APP_API_URL}/auth/`
    );
    return res;
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(err);
    });
  }
};

export const fetchFollowers = async ({
  queryKey,
}: {
  queryKey: Array<string>;
}) => {
  try {
    const [_, id] = queryKey;
    const res = await AxiosAPI.get(
      `${process.env.REACT_APP_API_URL}/auth/${id}/followers`
    );
    return res.data;
  } catch (err) {}
};

export const fetchSingleUser = async ({
  queryKey,
}: {
  queryKey: Array<string>;
}) => {
  const [_, id] = queryKey;
  try {
    const res: AxiosResponse = await client.get(`/auth/${id}`);
    return res.data;
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(err);
    });
  }
};

export const followUser = async ({ queryKey }: { queryKey: Array<string> }) => {
  const [_, id] = queryKey;
  try {
    const res = await AxiosAPI.get(
      `${process.env.REACT_APP_API_URL}/auth/${id}/follow`
    );

    return res.data;
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(err);
      alert(err);
    });
  }
};

export const unfollowUser = async ({
  queryKey,
}: {
  queryKey: Array<string>;
}) => {
  const [_, id] = queryKey;
  try {
    const res = await AxiosAPI.get(
      `${process.env.REACT_APP_API_URL}/auth/${id}/unfollow`
    );

    return res.data;
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(err);
      alert(err);
    });
  }
};

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

export const searchUsers = async ({
  queryKey,
}: {
  queryKey: Array<string>;
}) => {
  const [query] = queryKey;

  try {
    const res: AxiosResponse = await client.get(`/auth/search/${query}`);
    return res;
  } catch (err) {}
};

export const editUser = async (data: IUser) => {
  const userID = store.getState().user.currentUser._id;
  try {
    const res = await AxiosAPI.put(
      `${process.env.REACT_APP_API_URL}/auth/${userID}/edit`,
      data,
      {
        headers: {
          "Content-Type": "application/form-data",
        },
      }
    );
    return res.data;
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(err);
    });
  }
};