import { rateLimit } from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { redisClient } from './redisRateLimit.js'

export const expresslimiter = (maxRequest, time) =>{
    return rateLimit({
    max: maxRequest,
    windowMs: time,
    message: " Too Many Attempts,Please try after sometime",
    standardHeaders:true,
    legacyHeaders: false,
    // Redis store configuration
	store: new RedisStore({
		sendCommand: (...args) => redisClient.call(...args),
	})
})}

//THIS IS IP BASED LIMITER FOR SENSITIVE ENDPOINTS