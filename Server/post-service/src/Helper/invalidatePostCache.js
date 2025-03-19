 
export const invalidateCachePost = async(req,reqID)=>{

    //this is for delete cache by id
    const cacheKey =`post:${reqID}`
    await req.redisClient.del(cacheKey)
    //this is for delete cache by id

    const keys = await req.redisClient.keys("posts:*")
    if(keys.length>0){
        await req.redisClient.del(keys)
    }
}


//this will delete all previouse cache presents because due to new post is created now we need to update existing cache for that we removed it, and new one will create after user hits get request once again for 1st time