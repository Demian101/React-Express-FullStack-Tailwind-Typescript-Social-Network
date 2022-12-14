import { CommentsDataProps } from 'types/CommentInterfaces';
import { IPost } from '../types/PostInterfaces';
import { AxiosAPI } from "./base";

//  Post Requests for client-side
console.log("dasasd",`${process.env.REACT_APP_API_URL}/posts`)
export async function fetchPosts() {
  try{
    const response =  await AxiosAPI.get(`${process.env.REACT_APP_API_URL}/posts`,);
    return response.data as IPost[];
  }
  catch(err) {  
      new Promise((resolve,reject) => {
      return Promise.reject(err); 
    })
  }
}

export async function addPost(data:IPost[])  {
  return await AxiosAPI.post(`${process.env.REACT_APP_API_URL}/posts`, data , {
    headers:{
      'Content-Type':'multipart/form-data',
    }
  })
}

export async function deletePost(id:string ) {
  try {
    const res = await AxiosAPI.delete(`${process.env.REACT_APP_API_URL}/posts/${id}` , {
    })
    return res
  }
  catch(err){
    return new Promise((resolve, reject) => {
      Promise.reject(err)
    })
  }
}


export async function likePost (id:string ) {
  try {
    await AxiosAPI.post(`${process.env.REACT_APP_API_URL}/posts/like` , {id:id})
  }
  catch(err) {
    return Promise.reject(err)    
  }
}
  
export async function unlikePost(id:string )  {  
  try {
    await AxiosAPI.post(`${process.env.REACT_APP_API_URL}/posts/unlike` , {id: id })
    }
    catch(err) {
      return Promise.reject(err)      
    }
}

export async function addComment(data:CommentsDataProps){
  try{
    console.log("addComment data",data)
    await AxiosAPI.post(`${process.env.REACT_APP_API_URL}/comment` , data); 
  }
  catch(err){
    return new Promise((resolve, reject) => {
      reject(err)
    })
  }
} 

export async function fetchComments({queryKey}:{queryKey:Array<string | number>}) {
  try{
    const [id] = queryKey;
    const res = await AxiosAPI.get(`${process.env.REACT_APP_API_URL}/comment/${id}`)
    return res.data
  }
  catch(err){
    return new Promise((resolve, reject) => {
      reject(err)
    })
  }
} 

export async function deleteComment(id:string ) {
  try {
    const res = await AxiosAPI.delete(`${process.env.REACT_APP_API_URL}/comment/${id}/delete` , {
    })
    return res
  }
  catch(err){
    return new Promise((resolve, reject) => {
      Promise.reject(err)
    })
  }
}