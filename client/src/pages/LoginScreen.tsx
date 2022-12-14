import { loginUser } from "@api/UserApi";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import { addNewUser } from "@redux/slices/userSlice";
import Button from "@shared/Button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { AuthProps, IUser } from "../types/UserInterfaces";

const LoginScreen: React.FC  = () => {
  const currentUser = useAuth();
  const {
    register,
    handleSubmit,
    // formState: { errors },
    formState: { errors },
  } = useForm({ mode: "all", reValidateMode: "onChange", });  // 每次变化（onChange）都触发验证

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

  // 看看登录没有：没登录的话，就 Navigate 去登录
  return currentUser === null ? (
    <div className="w-full flex flex-col flex-wrap items-center justify-center min-h-[80vh] lg:mt-20">
      <form
        onSubmit={handleSubmit(handleLogin)}
        className="flex  w-[100%] md:w-[300px]  bg-white items-center justify-center  flex-col flex-wrap shadow-md rounded min-h-[300px] px-4 py-10 mb-4"
      >
        <div className="mb-6 w-full flex flex-wrap flex-col items-start justify-center">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            {...register("email")}   // 丝滑嵌入 <input> 标签中，为啥用 ... ? 需要问问大神。
            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
            id="username"
            type="email"  // 可能 input 的 type 覆盖了 register 的属性.. 
            placeholder="Your Email"
            required
          />
          {errors.email && (
            <div
              // className="w-full px-4 flex flex-row flex-1 items-center justify-center  py-4 my-4 leading-normal text-white  bg-red-500 rounded-lg"
              role="alert"
            >
              <p>Please write a valid email</p>
            </div>
          )}
        </div>
        <div className="mb-6 w-full flex flex-wrap flex-col items-start justify-center">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            {...register("password", {
              required: true,
              minLength: 8,
              maxLength: 20,
            })}
            className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3"
            id="password"
            name="password"
            type="password"
            placeholder="Your Password"
            required
          />
          {errors.password && (
            <div
              className="px-4 w-64 text-md  text-center flex flex-row flex-1 items-center justify-center py-2  leading-normal text-white my-4  bg-red-500 rounded-lg"
              role="alert"
            >
              <p> Write a password with minimum 8 characters</p>
            </div>
          )}
        </div>
        {customErr !== "" ? (
          <div
            className="px-4  flex flex-row flex-wrap flex-1 items-center justify-between py-4 mb-4 leading-normal text-white  bg-red-500 rounded-lg"
            role="alert"
          >
            <p>{customErr}</p>
            <i className="cursor-pointer" onClick={(e) => setCustomErr("")}>
              <FaTimes />
            </i>
          </div>
        ) : (
          ""
        )}
        <div className="w-full flex items-center  flex-row flex-wrap justify-center">
          <Button
            type="submit"
            bgColor="bg-deepBlue"
            margin="1"
            size="fluid"
            textColor="white"
            hover="gray-800"
            title="Sign In"
          />
        </div>
      </form>
    </div>
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default LoginScreen;
