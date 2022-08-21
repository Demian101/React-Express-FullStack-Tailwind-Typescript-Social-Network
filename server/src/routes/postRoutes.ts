// Post Routes

import express from 'express';
import { addPost, deletePost, getPrivatePosts, getPublicPosts, likePost, unlikePost } from '../controllers/postController';
import { authGuard } from "../middlewares/authenticate";
import { upload } from '../middlewares/upload';
const router = express.Router();

// 同一个路由 url，请求方法不同 , 对应的处理函数也不同 ;
router.route('/')
    .get(authGuard,getPublicPosts)
    .post(authGuard, upload.single('image'), addPost)
router.get('/myposts', authGuard, getPrivatePosts);
router.route('/like').post(authGuard, likePost);
router.route('/unlike').post(authGuard, unlikePost);
router.route('/:id').delete(authGuard, deletePost);
export default router;