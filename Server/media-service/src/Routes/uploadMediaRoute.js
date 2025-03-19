import express from'express'
import { uploadMedia } from '../Controllers/mediaController.js'
import { upload } from '../Middleweres/multerMediaMiddleware.js'
import { expresslimiter } from '../Middleweres/expressRateLimit.js'

export const uploaderRoute = express()

uploaderRoute.post('/upload-media', upload, uploadMedia)