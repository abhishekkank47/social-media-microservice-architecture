import mongoose from 'mongoose'
import { logger } from '../../Utils/loggerUtil.js'

export const DbConnection = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        logger.info(`DATABASE OF POST SERVICE - CONNECTED`)
    } catch (e) {
        logger.error(`ERROR IN DATABASE CONNECTION - POST SERVICE : ${e}`)
        process.exit(1)
    }
}