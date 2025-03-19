import express from "express"
import { createPost, deletePost, getAllPosts, getPost, updatePost } from "../Controllers/postController.js"
import { expresslimiter } from "../Middleweres/expressRateLimit.js"

export const postRoutes = express()

postRoutes.post('/create-post', expresslimiter(50, 15 * 60 * 1000), createPost)

postRoutes.get('/get-post/:pid', getPost)

postRoutes.get('/get-all-posts', getAllPosts)

postRoutes.put('/update-post', expresslimiter(5, 60 * 60 * 1000), updatePost)

postRoutes.delete('/delete-post/:pid', deletePost)