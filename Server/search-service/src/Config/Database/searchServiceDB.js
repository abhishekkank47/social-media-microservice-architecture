import mongoose from 'mongoose'
import { logger } from '../../Utils/loggerUtil.js'

export const DbConnection = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        logger.info(`DATABASE OF SEARCH SERVICE - CONNECTED`)
    } catch (e) {
        logger.error(`ERROR IN DATABASE CONNECTION - SEARCH SERVICE : ${e}`)
        process.exit(1)
    }
}