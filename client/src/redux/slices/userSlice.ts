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
      // console.log('payload: ',payload)
      state.currentUser = payload;
    },
    logoutUser: (state) => {    // 登出
      localStorage.removeItem('userDetails');
      return {...resetState}
    },
    // updateToken: (state, {payload}: PayloadAction<string>) => {
    //   state.currentUser.accessToken = payload;
    // },
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
// export const { addNewUser, logoutUser, updateUsersList, updateToken } = userSlice.actions;
export const { addNewUser, logoutUser, updateUsersList, } = userSlice.actions;
// export const userSelector = (state: { state: SliceState }) => state;
export default userSlice.reducer;