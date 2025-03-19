import mongoose from "mongoose";
import { invalidateCachePost } from "../Helper/invalidatePostCache.js";
import { postModel } from "../Models/postSchema.js";
import { logger } from "../Utils/loggerUtil.js";
import { createPostValidator } from "../Utils/validationUtil.js";
import { publishEvent } from "../Config/RabbitMQ/rabbitMQConfig.js";

//CREATE
export const createPost = async (req, res) => {
  try {
    const { error } = createPostValidator(req.body);
    if (error) {
      logger.warn("VALIDATION ERROR : ", error);
      return res.status(400).json({
        success: false,
        message: "VALIDATION ERROR",
      });
    }
    const { content, mediaIds } = req.body;

    const newPost = await postModel.create({
      user: req.user.userID,
      content,
      mediaIds: mediaIds || [],
    });

    //this is for deleting previous posts cache from redis when we create new post
    await invalidateCachePost(req ,newPost._id.toString())

    logger.info("New post is Created", newPost);
    return res.status(201).json({
      success: true,
      message: "New post is Created",
      newPost
    });
  } catch (e) {
    logger.error("Internal Server Error", e);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//GET ALL POST
export const getAllPosts = async (req, res) => {
  try {
    //pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const startIndexPosts = (page - 1) * limit;

    //1. caching and improving performance
    const cashKey = `posts:${page}:${limit}`;
    const cashedPosts = await req.redisClient.get(cashKey); //from middleware
    if (cashedPosts) {
      return res.json(JSON.parse(cashedPosts));
    }
    const posts = await postModel
      .find()
      .sort({ createdAt: -1 })
      .skip(startIndexPosts)
      .limit(limit);
    const postsResult = {
        totalPosts: posts.length,
        curruntPage: page,
        totalPages: Math.ceil(posts.length/limit),
        posts
    }
    //2. saving in Redis Cache
    await req.redisClient.setex(cashKey,300,JSON.stringify(postsResult))
    res.json(postsResult)

  } catch (e) {
    logger.error("Internal Server Error", e);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//GET POST
export const getPost = async (req, res) => {
  try {
    const pid = req.params.pid
    if(!pid || !mongoose.Types.ObjectId.isValid(pid)){
      logger.warn("Post is Unavailable")
      return res.status(400).json(
        {
          success:false,
          message:"Post is Unavailable"
        }
      )
    }

    //cached Post
    const cacheKey = `post:${pid}`
    const cachedPost = await req.redisClient.get(cacheKey)
    if(cachedPost){
      return res.json(JSON.parse(cachedPost))
    }

    const post = await postModel.findById(pid)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    //save to redis cache
    await req.redisClient.setex(cacheKey,3600,JSON.stringify(post))

    return res.status(200).json(
      {
        success:true,
        message:"Post fetched Successfully",
        post
      }
    )

    
  } catch (e) {
    logger.error("Internal Server Error", e);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//UPDATE POST
export const updatePost = async (req, res) => {
  try {
  } catch (e) {
    logger.error("Internal Server Error", e);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//DELETE POST + RABBITMQ EVENT PUBLISTION
export const deletePost = async (req, res) => {
  try {
    const pid = req.params.pid
    if(!pid || !mongoose.Types.ObjectId.isValid(pid)){
      logger.warn('Post is Unavailabel or Already Deleted')
      return res.status(400).json(
        {
          success: false,
          message:"Post is Unavailabel or Already Deleted"
        }
      )
    }

    const post = await postModel.findByIdAndDelete(pid)

    //for publish event by RabbitMQ, when post a deleted, now no more need to store media in cloud by sending message to media service
    await publishEvent('postService-post.deleted',{
      postId : post._id.toString(),
      userId : req.user.userID,
      mediaIds: post.mediaIds
      //these ids helps to find media
    })


    //for delete the cache of this post because its no more necessary
    await invalidateCachePost(req,req.params.pid)

    res.status(200).json(
      {
        success:true,
        message:"Post Is Deleted Successfully",
        post
      }
    )

  } catch (e) {
    logger.error("Internal Server Error", e);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
