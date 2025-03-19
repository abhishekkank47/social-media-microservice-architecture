import {RateLimiterRedis} from 'rate-limiter-flexible'
import Redis from 'ioredis' 

// CREATE CLIENT
export const redisClient = new Redis(process.env.REDIS_URL)

//DDos Protection and rate limiting
export const rateLimiterRedis = new RateLimiterRedis(
    {
        storeClient: redisClient,
        keyPrefix: 'middleware',
        points:10, //req
        duration:1 //sec
    }
)

//This rate limiting is more about blocking bots and malicious scripts rather than actual human activity